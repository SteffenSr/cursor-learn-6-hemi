import type { Page } from "@playwright/test";

// ── Mock response payloads ──────────────────────────────────────────

export const MOCK_LOGIN_RESPONSE = {
  twoFactorRequired: true,
  challengeId: "mock-challenge-id-123",
  delivery: { delivered: true },
  user: { id: "user-1", email: "test@clinic.com" },
};

export const MOCK_VERIFY_RESPONSE = {
  token: "mock-jwt-token-abc",
  user: { id: "user-1", email: "test@clinic.com" },
};

export const MOCK_PATIENTS = [
  {
    id: "p1",
    mrn: "HMI-0001",
    name: "Anna Larsen",
    age: 42,
    sex: "female",
    primaryConcern: "migraine",
    hcp: { id: "h1", name: "Dr. Berg", role: "Neurologist", clinic: "Oslo Headache Center" },
    careTeam: [
      { id: "h1", name: "Dr. Berg", role: "Neurologist", clinic: "Oslo Headache Center" },
      { id: "h2", name: "Kari Nurse", role: "Nurse", clinic: "Oslo Headache Center" },
    ],
    careTeamSummary: { size: 2, roles: ["Neurologist", "Nurse"] },
    lastContactAt: new Date(Date.now() - 3 * 86_400_000).toISOString(),
    status: {
      attentionLevel: "high",
      attentionReasons: ["worsening_headache_frequency", "medication_overuse_risk"],
      riskScore: 92,
      adherencePct: 45,
      nextRecommendedAction: "Neurologist review of preventive medication within 48h",
      updatedAt: new Date().toISOString(),
    },
    coordination: {
      hasActiveCrossDisciplinaryPlan: false,
      lastTeamReviewAt: null,
      handoffRisk: "high",
      pendingTasksByRole: [{ role: "Neurologist", count: 2, description: "Medication review" }],
    },
    recentObservations: [],
  },
  {
    id: "p2",
    mrn: "HMI-0002",
    name: "Erik Hansen",
    age: 55,
    sex: "male",
    primaryConcern: "whiplash",
    hcp: { id: "h3", name: "Dr. Vik", role: "Physiotherapist", clinic: "Bergen Rehab" },
    careTeam: [
      { id: "h3", name: "Dr. Vik", role: "Physiotherapist", clinic: "Bergen Rehab" },
    ],
    careTeamSummary: { size: 1, roles: ["Physiotherapist"] },
    lastContactAt: new Date(Date.now() - 10 * 86_400_000).toISOString(),
    status: {
      attentionLevel: "high",
      attentionReasons: ["missed_physiotherapy_followups", "neck_pain_limiting_rehab"],
      riskScore: 85,
      adherencePct: 60,
      nextRecommendedAction: "Pain coach to address fear-avoidance and pacing",
      updatedAt: new Date().toISOString(),
    },
    coordination: {
      hasActiveCrossDisciplinaryPlan: true,
      lastTeamReviewAt: new Date(Date.now() - 14 * 86_400_000).toISOString(),
      handoffRisk: "medium",
      pendingTasksByRole: [{ role: "Physiotherapist", count: 1 }],
    },
    recentObservations: [],
  },
  {
    id: "p3",
    mrn: "HMI-0003",
    name: "Maja Olsen",
    age: 30,
    sex: "female",
    primaryConcern: "concussion",
    hcp: { id: "h4", name: "Dr. Aasen", role: "Neuropsychologist", clinic: "Tromsø Neuro" },
    careTeam: [],
    careTeamSummary: { size: 1, roles: ["Neuropsychologist"] },
    lastContactAt: new Date(Date.now() - 5 * 86_400_000).toISOString(),
    status: {
      attentionLevel: "medium",
      attentionReasons: ["cognitive_fatigue_plateau"],
      riskScore: 58,
      adherencePct: 78,
      nextRecommendedAction: "Neuropsychological reassessment in 2 weeks",
      updatedAt: new Date().toISOString(),
    },
    coordination: {
      hasActiveCrossDisciplinaryPlan: true,
      lastTeamReviewAt: new Date(Date.now() - 7 * 86_400_000).toISOString(),
      handoffRisk: "low",
      pendingTasksByRole: [],
    },
    recentObservations: [],
  },
  {
    id: "p4",
    mrn: "HMI-0004",
    name: "Jonas Berg",
    age: 28,
    sex: "male",
    primaryConcern: "migraine",
    hcp: { id: "h5", name: "Dr. Sund", role: "Nurse", clinic: "Oslo Headache Center" },
    careTeam: [],
    careTeamSummary: { size: 1, roles: ["Nurse"] },
    lastContactAt: new Date(Date.now() - 2 * 86_400_000).toISOString(),
    status: {
      attentionLevel: "medium",
      attentionReasons: ["sleep_disturbance_affecting_recovery"],
      riskScore: 44,
      adherencePct: 82,
      nextRecommendedAction: "Nurse check-in for sleep hygiene review",
      updatedAt: new Date().toISOString(),
    },
    coordination: {
      hasActiveCrossDisciplinaryPlan: true,
      lastTeamReviewAt: new Date(Date.now() - 3 * 86_400_000).toISOString(),
      handoffRisk: "medium",
      pendingTasksByRole: [],
    },
    recentObservations: [],
  },
  {
    id: "p5",
    mrn: "HMI-0005",
    name: "Sofie Dahl",
    age: 65,
    sex: "female",
    primaryConcern: "headache",
    hcp: { id: "h6", name: "Dr. Lund", role: "CareCoordinator", clinic: "Stavanger Care" },
    careTeam: [],
    careTeamSummary: { size: 1, roles: ["CareCoordinator"] },
    lastContactAt: new Date(Date.now() - 1 * 86_400_000).toISOString(),
    status: {
      attentionLevel: "low",
      attentionReasons: [],
      riskScore: 18,
      adherencePct: 95,
      nextRecommendedAction: "Routine follow-up in 4 weeks",
      updatedAt: new Date().toISOString(),
    },
    coordination: {
      hasActiveCrossDisciplinaryPlan: true,
      lastTeamReviewAt: new Date(Date.now() - 2 * 86_400_000).toISOString(),
      handoffRisk: "low",
      pendingTasksByRole: [],
    },
    recentObservations: [],
  },
  {
    id: "p6",
    mrn: "HMI-0006",
    name: "Oskar Nilsen",
    age: 38,
    sex: "male",
    primaryConcern: "headache",
    hcp: { id: "h7", name: "Dr. Pettersen", role: "PainCoach", clinic: "Stavanger Care" },
    careTeam: [],
    careTeamSummary: { size: 1, roles: ["PainCoach"] },
    lastContactAt: null,
    status: {
      attentionLevel: "low",
      attentionReasons: [],
      riskScore: 12,
      adherencePct: null,
      nextRecommendedAction: "Initial onboarding call",
      updatedAt: new Date().toISOString(),
    },
    coordination: {
      hasActiveCrossDisciplinaryPlan: false,
      lastTeamReviewAt: null,
      handoffRisk: "low",
      pendingTasksByRole: [],
    },
    recentObservations: [],
  },
];

export const MOCK_PATIENTS_RESPONSE = {
  data: MOCK_PATIENTS,
  meta: { page: 1, limit: 100, total: MOCK_PATIENTS.length },
};

export const MOCK_PATIENT_DETAIL = {
  ...MOCK_PATIENTS[0],
  observations: [
    { type: "pain_diary", severity: 8, date: new Date(Date.now() - 86_400_000).toISOString() },
    { type: "medication_log", taken: true, date: new Date(Date.now() - 2 * 86_400_000).toISOString() },
  ],
};

// ── Route interception helpers ──────────────────────────────────────

export async function mockLoginRoute(page: Page) {
  await page.route("**/api/proxy/auth/login", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(MOCK_LOGIN_RESPONSE),
    })
  );
}

export async function mockVerifyRoute(page: Page) {
  await page.route("**/api/proxy/auth/verify", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(MOCK_VERIFY_RESPONSE),
    })
  );
}

export async function mockPatientsRoute(page: Page) {
  await page.route("**/api/proxy/patients?*", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(MOCK_PATIENTS_RESPONSE),
    })
  );
}

export async function mockPatientDetailRoute(page: Page) {
  await page.route("**/api/proxy/patients/*", (route) => {
    const url = route.request().url();
    if (url.includes("?")) return route.fallback();
    return route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(MOCK_PATIENT_DETAIL),
    });
  });
}

export async function mockAllRoutes(page: Page) {
  await mockLoginRoute(page);
  await mockVerifyRoute(page);
  await mockPatientsRoute(page);
  await mockPatientDetailRoute(page);
}

export async function seedAuth(page: Page) {
  await page.addInitScript(() => {
    sessionStorage.setItem(
      "hemi_auth",
      JSON.stringify({
        token: "mock-jwt-token-abc",
        user: { id: "user-1", email: "test@clinic.com" },
      })
    );
  });
}
