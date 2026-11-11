import React, { createContext, useContext, useEffect, useState } from "react";
import type { User } from "firebase/auth";
import { logger } from "../lib/logger";

export interface UserData {
  uid: string;
  email: string;
  fullName: string;
  role: "client" | "admin" | "super_admin";
  accountType: string;
  permissions: string[];
  isAdmin: boolean;
  createdAt: any;
  lastLogin?: any;
}

interface AuthContextType {
  user: User | null;
  userData: UserData | null;
  loading: boolean;
  isFirebaseConfigured: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userData: null,
  loading: true,
  isFirebaseConfigured: true,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribeAuth: (() => void) | null = null;
    let unsubscribeDoc: (() => void) | null = null;
    let isMounted = true;
    let authTimeout: NodeJS.Timeout | null = null;

    const safeClearAuthTimeout = () => {
      if (authTimeout) {
        clearTimeout(authTimeout);
        authTimeout = null;
      }
    };

    const safeSetAuthTimeout = (callback: () => void, delay: number) => {
      safeClearAuthTimeout();
      if (isMounted) {
        authTimeout = setTimeout(() => {
          if (isMounted) {
            callback();
          }
        }, delay);
      }
    };

    const globalLoadingFailsafe = setTimeout(() => {
      if (isMounted) {
        console.warn("[AuthProvider] Global failsafe timeout reached.");
        setLoading(false);
      }
    }, 15000);

    // Dynamically import Firebase to split bundle
    import("../lib/firebase")
      .then(({ auth, db }) => {
        if (!isMounted) return;
        if (!auth || !db) {
          console.warn("[AuthProvider] Firebase auth or db not found.");
          setLoading(false);
          return;
        }

        Promise.all([
          import("firebase/auth"),
          import("firebase/firestore"),
        ]).then(
          ([
            { onAuthStateChanged },
            { doc, getDoc, onSnapshot, setDoc, serverTimestamp },
          ]) => {
            if (!isMounted) return;

            logger.debug("[AuthProvider] Calling onAuthStateChanged.");
            unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
              if (!isMounted) return;
              safeClearAuthTimeout();

              if (currentUser) {
                logger.debug("[AuthProvider] User session active");
                setUser(currentUser);
                setLoading(true);

                safeSetAuthTimeout(() => {
                  logger.warn("[AuthProvider] User data fetch timeout.");
                  setLoading(false);
                }, 10000);

                try {
                  const docRef = doc(db, "users", currentUser.uid);

                  getDoc(docRef)
                    .then((docSnap) => {
                      if (docSnap.exists() && isMounted) {
                        setDoc(
                          docRef,
                          { lastLogin: serverTimestamp() },
                          { merge: true },
                        ).catch((err) => {
                           logger.error("[AuthProvider] Failed to set lastLogin:", err);
                        });
                      }
                    })
                    .catch((err) => {
                       logger.error("[AuthProvider] getDoc failed:", err);
                    });

                  if (unsubscribeDoc) {
                    unsubscribeDoc();
                  }

                  logger.debug("[AuthProvider] Subscribing to user profile doc");
                  unsubscribeDoc = onSnapshot(
                    docRef,
                    (docSnap) => {
                      if (!isMounted) return;
                      safeClearAuthTimeout();
                      clearTimeout(globalLoadingFailsafe);

                      if (docSnap.exists()) {
                        logger.debug("[AuthProvider] User profile doc synced");
                        const data = docSnap.data();
                        setUserData({
                          uid: docSnap.id,
                          email: currentUser.email || "",
                          fullName:
                            currentUser.displayName || data?.fullName || "User",
                          role: data?.role || "client",
                          accountType: data?.accountType || "enterprise",
                          permissions: data?.permissions || [
                            "read_own_profile",
                            "read_own_projects",
                          ],
                          isAdmin:
                            data?.role === "admin" ||
                            data?.role === "super_admin" ||
                            !!data?.isAdmin,
                          createdAt: data?.createdAt,
                          lastLogin: data?.lastLogin,
                        } as UserData);
                        setLoading(false);
                      } else {
                        logger.debug("[AuthProvider] User doc initializing");
                        const creationTime = currentUser.metadata.creationTime;
                        const isNewlyCreated =
                          creationTime &&
                          Date.now() - new Date(creationTime).getTime() < 15000;

                        if (isNewlyCreated) {
                          setUserData(null);
                          safeSetAuthTimeout(() => {
                            setLoading(false);
                          }, 10000);
                        } else {
                          setUserData(null);
                          setLoading(false);
                        }
                      }
                    },
                    (error) => {
                      console.error("[AuthProvider] Profile sync error:", error);
                      if (isMounted) {
                        safeClearAuthTimeout();
                        clearTimeout(globalLoadingFailsafe);
                        setUserData(null);
                        setLoading(false);
                      }
                    },
                  );
                } catch (error) {
                  console.error("[AuthProvider] Failed in onAuthStateChanged block:", error);
                  if (isMounted) {
                    setLoading(false);
                  }
                }
              } else {
                logger.debug("[AuthProvider] User not logged in, clearing state.");
                clearTimeout(globalLoadingFailsafe);
                safeClearAuthTimeout();
                setUser(null);
                setUserData(null);
                setLoading(false);

                if (unsubscribeDoc) {
                  unsubscribeDoc();
                  unsubscribeDoc = null;
                }
              }
            });
          },
        ).catch(err => {
            logger.error("[AuthProvider] Failed to dynamically import firebase auth/firestore", err);
            if (isMounted) setLoading(false);
        });
      })
      .catch((err) => {
        logger.warn("[AuthProvider] Failed to load Firebase", err);
        if (isMounted) setLoading(false);
      });

    return () => {
      logger.debug("[AuthProvider] Unmounting AuthProvider cleanup.");
      isMounted = false;
      safeClearAuthTimeout();
      clearTimeout(globalLoadingFailsafe);
      if (unsubscribeAuth) unsubscribeAuth();
      if (unsubscribeDoc) unsubscribeDoc();
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, userData, loading, isFirebaseConfigured: true }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  return useContext(AuthContext);
}
