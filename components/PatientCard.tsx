"use client";

import type { Patient } from "@/lib/types";

function riskColor(score: number): string {
  if (score >= 70) return "var(--danger)";
  if (score >= 40) return "var(--warning)";
  return "var(--success)";
}

function formatConcern(concern: string): string {
  return concern.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function timeAgo(dateStr: string | null): string {
  if (!dateStr) return "No contact";
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86_400_000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 30) return `${days}d ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

interface Props {
  patient: Patient;
  onClick?: () => void;
}

export default function PatientCard({ patient, onClick }: Props) {
  const { status, coordination } = patient;

  const pendingRoles = coordination.pendingTasksByRole?.filter(
    (t) => t.count > 0
  );

  return (
    <div
      className="patient-card"
      onClick={onClick}
      style={{ cursor: onClick ? "pointer" : undefined }}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") onClick();
            }
          : undefined
      }
    >
      <div className="patient-card-header">
        <div>
          <span className="patient-name">{patient.name}</span>
          <div className="patient-meta">
            {patient.age}y {patient.sex} · MRN {patient.mrn} ·{" "}
            {formatConcern(patient.primaryConcern)} · Last contact:{" "}
            {timeAgo(patient.lastContactAt)}
          </div>
        </div>
        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <span className={`badge badge-${status.attentionLevel}`}>
            {status.attentionLevel}
          </span>
          <div className="risk-score" style={{ marginTop: 4 }}>
            <div className="risk-bar">
              <div
                className="risk-bar-fill"
                style={{
                  width: `${status.riskScore}%`,
                  background: riskColor(status.riskScore),
                }}
              />
            </div>
            <span style={{ color: riskColor(status.riskScore) }}>
              {status.riskScore}
            </span>
          </div>
        </div>
      </div>

      {status.attentionReasons.length > 0 && (
        <ul className="reasons-list">
          {status.attentionReasons.map((reason, i) => (
            <li key={i} className="reason-tag">
              {reason}
            </li>
          ))}
        </ul>
      )}

      <div className="next-action">
        <span className="next-action-label">Next step →</span>
        <span>{status.nextRecommendedAction}</span>
      </div>

      {(pendingRoles?.length > 0 ||
        coordination.handoffRisk !== "low") && (
        <div className="care-team-row">
          {pendingRoles?.map((task) => (
            <span key={task.role} className="role-chip has-pending">
              {task.role}: {task.count} pending
            </span>
          ))}
          {coordination.handoffRisk !== "low" && (
            <span
              className={`role-chip ${
                coordination.handoffRisk === "high" ? "has-pending" : ""
              }`}
            >
              Handoff risk: {coordination.handoffRisk}
            </span>
          )}
        </div>
      )}

      {!coordination.hasActiveCrossDisciplinaryPlan && (
        <div className="coordination-flag">
          ⚠ No active cross-disciplinary plan
        </div>
      )}
    </div>
  );
}
