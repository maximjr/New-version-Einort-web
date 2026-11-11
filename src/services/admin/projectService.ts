import { collection, query, orderBy, limit, onSnapshot, getDocs } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { handleFirestoreError, OperationType } from "./diagnosticsHelper";
import { Project, ProjectStatus } from "../../types";
import { ProjectOrchestrator } from "../../features/services/projectOrchestrator";

export const projectService = {
  /**
   * Subscribes to the real-time project stream with graceful degradation.
   */
  subscribeProjects(
    onUpdate: (projects: Project[]) => void,
    onError: (error: any) => void
  ) {
    if (!db) {
      onUpdate([]);
      return () => {};
    }

    const projectsQuery = query(
      collection(db, "projects"),
      orderBy("createdAt", "desc"),
      limit(100)
    );

    const unsubscribe = onSnapshot(
      projectsQuery,
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Project[];
        onUpdate(data);
      },
      (error) => {
        try {
          handleFirestoreError(error, OperationType.LIST, "projects");
        } catch (formattedErr) {
          onError(formattedErr);
        }

        // Graceful static fallback
        getDocs(projectsQuery)
          .then((snapshot) => {
            const data = snapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            })) as Project[];
            onUpdate(data);
          })
          .catch(() => {});
      }
    );

    return unsubscribe;
  },

  /**
   * Faciliates upgrading progress via orchestrator transitions.
   */
  async updateStatus(projectId: string, newStatus: ProjectStatus) {
    return await ProjectOrchestrator.changeProjectStatus(projectId, newStatus);
  },

  /**
   * Updates general fields of the project ledger.
   */
  async updateProject(projectId: string, updateData: Partial<Project>) {
    return await ProjectOrchestrator.updateProject(projectId, updateData);
  },

  /**
   * Assigns a project to a managing administrator.
   */
  async assignProject(projectId: string, adminId: string) {
    return await ProjectOrchestrator.assignProject(projectId, adminId);
  },

  /**
   * Deletes a project from the system registry.
   */
  async deleteProject(projectId: string) {
    return await ProjectOrchestrator.deleteProject(projectId);
  }
};
