"use client";

import { useEffect, useState } from "react";
import { getPatient, ApiError } from "@/lib/api";
import type { Patient } from "@/lib/types";

function formatConcern(concern: string): string {
  return concern.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

interface Props {
  patientId: string;
  token: string;
  onClose: () => void;
}

export default function PatientDetail({ patientId, token, onClose }: Props) {
  const [patient, setPatient] = useState<Patient | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    getPatient(token, patientId)
      .then((p) => {
        if (!cancelled) setPatient(p as Patient);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(
            err instanceof ApiError ? err.message : "Failed to load patient"
          );
        }
      });
    return () => {
      cancelled = true;
    };
  }, [token, patientId]);

  return (
    <div className="patient-detail-overlay" onClick={onClose}>
      <div
        className="patient-detail-panel"
        onClick={(e) => e.stopPropagation()}
      >
        <button className="btn-close" onClick={onClose}>
          ×
        </button>

        {error && <div className="error-msg">{error}</div>}

        {!patient && !error && (
          <div className="loading-state">
            <div className="loading-spinner" />
            <p>Loading patient…</p>
          </div>
        )}

        {patient && (
          <>
            <h2>
              {patient.name}{" "}
              <span className={`badge badge-${patient.status.attentionLevel}`}>
                {patient.status.attentionLevel}
              </span>
            </h2>

            <div className="detail-section">
              <h3>Demographics</h3>
              <p>
                {patient.age}y {patient.sex} · MRN {patient.mrn} ·{" "}
                {formatConcern(patient.primaryConcern)}
              </p>
            </div>

            <div className="detail-section">
              <h3>Status</h3>
              <p>
                <strong>Risk score:</strong> {patient.status.riskScore}/100
              </p>
              {patient.status.adherencePct !== null && (
                <p>
                  <strong>Adherence:</strong> {patient.status.adherencePct}%
                </p>
              )}
              <p>
                <strong>Attention reasons:</strong>{" "}
                {patient.status.attentionReasons.join(", ")}
              </p>
              <p>
                <strong>Next recommended action:</strong>{" "}
                {patient.status.nextRecommendedAction}
              </p>
            </div>

            <div className="detail-section">
              <h3>Coordination</h3>
              <p>
                Cross-disciplinary plan:{" "}
                {patient.coordination.hasActiveCrossDisciplinaryPlan
                  ? "Active"
                  : "None"}
              </p>
              <p>Handoff risk: {patient.coordination.handoffRisk}</p>
              {patient.coordination.lastTeamReviewAt && (
                <p>
                  Last team review:{" "}
                  {new Date(
                    patient.coordination.lastTeamReviewAt
                  ).toLocaleDateString()}
                </p>
              )}
              {patient.coordination.pendingTasksByRole?.length > 0 && (
                <div>
                  <strong>Pending tasks:</strong>
                  <ul style={{ marginLeft: "1rem", marginTop: "0.25rem" }}>
                    {patient.coordination.pendingTasksByRole.map((t) => (
                      <li key={t.role} style={{ fontSize: "0.8125rem" }}>
                        {t.role}: {t.count}
                        {t.description ? ` — ${t.description}` : ""}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {patient.careTeam && patient.careTeam.length > 0 && (
              <div className="detail-section">
                <h3>Care Team</h3>
                <div className="care-team-row">
                  {patient.careTeam.map((hcp) => (
                    <span key={hcp.id} className="role-chip">
                      {hcp.role}: {hcp.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {patient.observations && patient.observations.length > 0 && (
              <div className="detail-section">
                <h3>Recent Observations</h3>
                {patient.observations.slice(0, 10).map((obs, i) => (
                  <div key={i} className="observation-item">
                    {Object.entries(obs)
                      .filter(([k]) => k !== "id")
                      .map(([k, v]) => (
                        <span key={k} style={{ marginRight: "0.75rem" }}>
                          <strong>{k}:</strong>{" "}
                          {typeof v === "object" ? JSON.stringify(v) : String(v)}
                        </span>
                      ))}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
