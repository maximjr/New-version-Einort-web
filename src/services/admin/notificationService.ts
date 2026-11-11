export interface SystemAlert {
  id: string;
  type: "info" | "warning" | "error" | "success";
  message: string;
  timestamp: Date;
}

export const notificationService = {
  /**
   * Translates Firebase and network codes into premium executive state notices.
   */
  mapSyncError(errorString: string): string {
    const errorStringLower = errorString.toLowerCase();
    if (
      errorStringLower.includes("permission-denied") ||
      errorStringLower.includes("permission_denied") ||
      errorStringLower.includes("insufficient permissions")
    ) {
      return "Firestore Security Rules denied access. Please deploy your customized firestore.rules to your Firebase project.";
    }
    if (errorStringLower.includes("offline") || errorStringLower.includes("is offline")) {
      return "Realtime ledger sync interrupted. Using secure static fallback.";
    }
    return "Realtime connection restoring. Realtime replication degraded.";
  }
};
