import { collection, query, orderBy, limit, onSnapshot } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { handleFirestoreError, OperationType } from "./diagnosticsHelper";

export interface ClientActivity {
  id: string;
  actionTitle?: string;
  description?: string;
  clientEmail?: string;
  timestamp?: any;
}

export const activityService = {
  /**
   * Subscribes to the live client activity stream.
   */
  subscribeActivities(
    onUpdate: (activities: ClientActivity[]) => void,
    onError: (error: any) => void
  ) {
    if (!db) {
      onUpdate([]);
      return () => {};
    }

    const activityQuery = query(
      collection(db, "clientActivity"),
      orderBy("timestamp", "desc"),
      limit(50)
    );

    const unsubscribe = onSnapshot(
      activityQuery,
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as ClientActivity[];
        onUpdate(data);
      },
      (error) => {
        try {
          handleFirestoreError(error, OperationType.LIST, "clientActivity");
        } catch (formattedErr) {
          onError(formattedErr);
        }
      }
    );

    return unsubscribe;
  }
};
