export interface Hcp {
  id: string;
  name: string;
  role:
    | "Neurologist"
    | "Nurse"
    | "CareCoordinator"
    | "Physiotherapist"
    | "Neuropsychologist"
    | "PainCoach";
  clinic: string;
}

export interface PatientStatus {
  attentionLevel: "high" | "medium" | "low";
  attentionReasons: string[];
  riskScore: number;
  adherencePct: number | null;
  nextRecommendedAction: string;
  updatedAt: string;
}

export interface PendingTask {
  role: string;
  count: number;
  description?: string;
}

export interface PatientCoordination {
  hasActiveCrossDisciplinaryPlan: boolean;
  lastTeamReviewAt: string | null;
  handoffRisk: "low" | "medium" | "high";
  pendingTasksByRole: PendingTask[];
}

export interface Patient {
  id: string;
  mrn: string;
  name: string;
  age: number;
  sex: "male" | "female" | "other";
  primaryConcern:
    | "headache"
    | "migraine"
    | "concussion"
    | "whiplash"
    | "mixed_headache_disorder";
  hcp: Hcp;
  careTeam?: Hcp[];
  careTeamSummary?: {
    size: number;
    roles: string[];
  };
  lastContactAt: string | null;
  status: PatientStatus;
  coordination: PatientCoordination;
  recentObservations?: Record<string, unknown>[];
  observations?: Record<string, unknown>[];
}

export interface PatientsResponse {
  data: Patient[];
  meta: {
    page: number;
    limit: number;
    total: number;
  };
}

export interface TwoFactorStartResponse {
  twoFactorRequired: boolean;
  challengeId: string;
  delivery: Record<string, unknown>;
  user: {
    id: string;
    email: string;
  };
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
  };
}

export interface GetPatientsParams {
  page?: number;
  limit?: number;
  attentionLevel?: "high" | "medium" | "low";
  concern?: string;
  sort?: string;
  hcpRole?: string;
}
