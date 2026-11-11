import React from "react";

export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
}

export type ProjectStatus =
  | "pending"
  | "discovery"
  | "planning"
  | "ui_ux"
  | "development"
  | "testing"
  | "review"
  | "revision"
  | "deployment"
  | "completed"
  | "cancelled";

export interface Project {
  id: string; // Document ID (corresponds to docRef.id)
  projectId: string; // Mirror ID for validation
  userId: string; // Authenticated user UID (or 'anonymous' if guest)
  email: string;
  clientName: string;
  company?: string;
  industry?: string;
  projectType: string;
  selectedFeatures?: string[];
  requirements: string;
  budget?: string;
  timeline?: string;
  urgency?: string;
  leadScore?: number;
  complexityScore?: number;
  status: ProjectStatus;
  createdAt: any; // Firestore serverTimestamp or toDate object
  updatedAt?: any;
  assignedAdminId?: string;
  notes?: string;
}

export interface OrchestratorResult<T> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}
