import {
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
  getDoc,
  getDocs,
  deleteDoc,
  setDoc,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp,
  increment,
  where
} from "firebase/firestore";
import { db } from "../../lib/firebase";
import { handleFirestoreError, OperationType } from "./diagnosticsHelper";

export interface Conversation {
  id: string;
  clientId: string;
  adminId: string;
  participants: string[];
  lastMessage?: string;
  lastMessageTime?: any;
  unreadCount?: Record<string, number>;
  status: string;
  priority: string;
  createdAt: any;
  updatedAt: any;
  projectId?: string;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  text: string;
  attachments?: any[];
  type: string;
  read: boolean;
  timestamp: any;
  status: string;
}

export const messageService = {
  /**
   * Translates or returns existing or generates a new conversation between Client and Admin.
   */
  async getOrCreateConversation(
    clientId: string,
    adminId: string,
    projectId?: string
  ): Promise<string> {
    if (!db) throw new Error("Database not connected");
    
    // Distinct conversation ID for Client <-> Admin relation
    const conversationId = `${clientId}_${adminId}`;
    const docRef = doc(db, "conversations", conversationId);
    
    try {
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        return conversationId;
      }
      
      const newConv: Omit<Conversation, "id"> = {
        clientId,
        adminId,
        participants: [clientId, adminId],
        status: "active",
        priority: "none",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        unreadCount: {
          [clientId]: 0,
          [adminId]: 0
        }
      };
      if (projectId) {
        newConv.projectId = projectId;
      }
      
      await setDoc(docRef, newConv);
      return conversationId;
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `conversations/${conversationId}`);
    }
  },

  subscribeConversationsForClient(
    clientId: string,
    onUpdate: (conversations: Conversation[]) => void,
    onError: (error: any) => void
  ) {
    if (!db) {
      onUpdate([]);
      return () => {};
    }

    const q = query(
      collection(db, "conversations"),
      where("participants", "array-contains", clientId),
      orderBy("updatedAt", "desc"),
      limit(50)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        try {
          const data = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as Conversation[];
          onUpdate(data);
        } catch (e) {
          console.error("Safely caught snapshot processing error", e);
        }
      },
      (error) => {
        try {
          handleFirestoreError(error, OperationType.LIST, "conversations");
        } catch (formattedErr) {
          onError(formattedErr);
        }
      }
    );

    return () => {
      unsubscribe();
    };
  },

  subscribeConversationsForAdmin(
    onUpdate: (conversations: Conversation[]) => void,
    onError: (error: any) => void
  ) {
    if (!db) {
      onUpdate([]);
      return () => {};
    }

    const q = query(
      collection(db, "conversations"),
      orderBy("updatedAt", "desc"),
      limit(100)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        try {
          const data = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as Conversation[];
          onUpdate(data);
        } catch (e) {
          console.error("Safely caught admin snapshot processing error", e);
        }
      },
      (error) => {
        try {
          handleFirestoreError(error, OperationType.LIST, "conversations");
        } catch (formattedErr) {
          onError(formattedErr);
        }
      }
    );

    return () => {
      unsubscribe();
    };
  },

  subscribeMessages(
    conversationId: string,
    onUpdate: (messages: Message[]) => void,
    onError: (error: any) => void
  ) {
    if (!db) {
      onUpdate([]);
      return () => {};
    }

    const q = query(
      collection(db, "conversations", conversationId, "messages"),
      orderBy("timestamp", "desc"),
      limit(200)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        try {
          const data = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as Message[];
          onUpdate(data.reverse());
        } catch (e) {
          console.error("Safely caught messages snapshot processing error", e);
        }
      },
      (error) => {
        try {
          handleFirestoreError(error, OperationType.LIST, `conversations/${conversationId}/messages`);
        } catch (formattedErr) {
          onError(formattedErr);
        }
      }
    );

    return () => {
      unsubscribe();
    };
  },

  async sendMessage(
    conversationId: string,
    senderId: string,
    receiverId: string,
    text: string,
    type: string = "text",
    attachments: any[] = []
  ): Promise<void> {
    if (!db) return;

    const messagesCol = collection(db, "conversations", conversationId, "messages");
    const conversationRef = doc(db, "conversations", conversationId);

    const messageData = {
      senderId,
      receiverId,
      text,
      type,
      attachments,
      read: false,
      timestamp: serverTimestamp(),
      status: "sent"
    };

    try {
      await addDoc(messagesCol, messageData);
      await updateDoc(conversationRef, {
        lastMessage: text,
        lastMessageTime: serverTimestamp(),
        updatedAt: serverTimestamp(),
        [`unreadCount.${receiverId}`]: increment(1)
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `conversations/${conversationId}/messages`);
    }
  },

  async markAsRead(conversationId: string, userId: string): Promise<void> {
    if (!db) return;
    const conversationRef = doc(db, "conversations", conversationId);
    try {
      await updateDoc(conversationRef, {
        [`unreadCount.${userId}`]: 0
      });
    } catch (error) {
      console.warn("Failed marking conversation as read:", error);
    }
  },

  async updateConversationPriority(conversationId: string, priority: string): Promise<void> {
    if (!db) return;
    const conversationRef = doc(db, "conversations", conversationId);
    try {
      await updateDoc(conversationRef, {
        priority,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `conversations/${conversationId}`);
    }
  },

  async updateConversationStatus(conversationId: string, status: string): Promise<void> {
    if (!db) return;
    const conversationRef = doc(db, "conversations", conversationId);
    try {
      await updateDoc(conversationRef, {
        status,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `conversations/${conversationId}`);
    }
  },

  async getSuperAdminUid(): Promise<string> {
    if (!db) return "super_admin";
    try {
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("role", "==", "super_admin"), limit(1));
      const snap = await getDocs(q);
      if (!snap.empty) {
        return snap.docs[0].id;
      }
      const qAdmin = query(usersRef, where("role", "==", "admin"), limit(1));
      const snapAdmin = await getDocs(qAdmin);
      if (!snapAdmin.empty) {
        return snapAdmin.docs[0].id;
      }
    } catch (err) {
      console.warn("Failed fetching super admin UID from database:", err);
    }
    return "super_admin";
  },

  async migrateLegacyConversation(clientId: string, superAdminId: string): Promise<void> {
    if (!db || !superAdminId || superAdminId === "super_admin") return;
    const legacyId = `${clientId}_super_admin`;
    const newId = `${clientId}_${superAdminId}`;
    
    try {
      const legacyRef = doc(db, "conversations", legacyId);
      const legacySnap = await getDoc(legacyRef);
      if (!legacySnap.exists()) {
        return;
      }
      
      const newRef = doc(db, "conversations", newId);
      const newSnap = await getDoc(newRef);
      
      if (!newSnap.exists()) {
        const legacyData = legacySnap.data() as Conversation;
        
        const newConvData: Conversation = {
          ...legacyData,
          id: newId,
          clientId: clientId,
          adminId: superAdminId,
          participants: [clientId, superAdminId],
          unreadCount: {
            [clientId]: legacyData.unreadCount?.[clientId] || 0,
            [superAdminId]: legacyData.unreadCount?.["super_admin"] || legacyData.unreadCount?.[superAdminId] || 0
          },
          updatedAt: serverTimestamp()
        };
        
        await setDoc(newRef, newConvData);
        
        const legacyMessagesCol = collection(db, "conversations", legacyId, "messages");
        const newMessagesCol = collection(db, "conversations", newId, "messages");
        
        const messagesQuery = query(legacyMessagesCol, orderBy("timestamp", "asc"), limit(500));
        const messagesSnap = await getDocs(messagesQuery);
        
        for (const messageDoc of messagesSnap.docs) {
          const mData = messageDoc.data();
          const senderId = mData.senderId === "super_admin" ? superAdminId : mData.senderId;
          const receiverId = mData.receiverId === "super_admin" ? superAdminId : mData.receiverId;
          
          await setDoc(doc(newMessagesCol, messageDoc.id), {
            ...mData,
            senderId,
            receiverId
          });
        }
        
        for (const messageDoc of messagesSnap.docs) {
          await deleteDoc(doc(legacyMessagesCol, messageDoc.id));
        }
        await deleteDoc(legacyRef);
        console.log(`[Migration] Legacy conversation migrated successfully from ${legacyId} to ${newId}`);
      }
    } catch (err) {
      console.warn("[Migration] Failed migrating legacy conversation:", err);
    }
  },

  subscribePresence(userId: string, onUpdate: (data: any) => void) {
    if (!db) return () => {};
    const docRef = doc(db, "presence", userId);
    const unsubscribe = onSnapshot(
      docRef,
      (snap) => {
        try {
          if (snap.exists()) {
            onUpdate(snap.data());
          } else {
            onUpdate(null);
          }
        } catch (e) {
          console.error("Safely caught presence processing error", e);
        }
      },
      (error) => {
        console.warn("Failed to subscribe to presence:", error);
      }
    );
    return () => {
      unsubscribe();
    };
  },

  async setPresence(userId: string, isOnline: boolean, role: string) {
    if (!db) return;
    const docRef = doc(db, "presence", userId);
    try {
      await setDoc(docRef, {
        isOnline,
        role,
        lastSeen: serverTimestamp()
      }, { merge: true });
    } catch (error) {
      console.warn("Failed to set presence:", error);
    }
  }
};
