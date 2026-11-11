import { collection, query, orderBy, limit, onSnapshot, getDocs } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { handleFirestoreError, OperationType } from "./diagnosticsHelper";

export interface ClientUser {
  id: string;
  name?: string;
  fullName?: string;
  displayName?: string;
  email?: string;
  accountType?: string;
  role?: string;
  createdAt?: any;
}

export const clientService = {
  /**
   * Subscribes to registered clients user base with fallback handling.
   */
  subscribeClients(
    onUpdate: (clients: ClientUser[]) => void,
    onError: (error: any) => void
  ) {
    if (!db) {
      onUpdate([]);
      return () => {};
    }

    const usersQuery = query(
      collection(db, "users"),
      orderBy("createdAt", "desc"),
      limit(100)
    );

    const unsubscribe = onSnapshot(
      usersQuery,
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as ClientUser[];
        onUpdate(data);
      },
      (error) => {
        try {
          handleFirestoreError(error, OperationType.LIST, "users");
        } catch (formattedErr) {
          onError(formattedErr);
        }

        // Graceful static fallback
        getDocs(usersQuery)
          .then((snapshot) => {
            const data = snapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            })) as ClientUser[];
            onUpdate(data);
          })
          .catch(() => {});
      }
    );

    return unsubscribe;
  }
};
