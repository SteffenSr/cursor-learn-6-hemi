"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { getPatients, ApiError } from "@/lib/api";
import type { Patient, GetPatientsParams } from "@/lib/types";
import PatientCard from "@/components/PatientCard";
import PatientDetail from "@/components/PatientDetail";

const ATTENTION_ORDER: Record<string, number> = { high: 0, medium: 1, low: 2 };

function groupByAttention(patients: Patient[]) {
  const sorted = [...patients].sort((a, b) => {
    const levelDiff =
      (ATTENTION_ORDER[a.status.attentionLevel] ?? 3) -
      (ATTENTION_ORDER[b.status.attentionLevel] ?? 3);
    if (levelDiff !== 0) return levelDiff;
    return b.status.riskScore - a.status.riskScore;
  });

  const groups: { level: string; patients: Patient[] }[] = [];
  for (const p of sorted) {
    const last = groups[groups.length - 1];
    if (last && last.level === p.status.attentionLevel) {
      last.patients.push(p);
    } else {
      groups.push({ level: p.status.attentionLevel, patients: [p] });
    }
  }
  return groups;
}

export default function OverviewPage() {
  const { token, user, isAuthenticated, logout } = useAuth();
  const router = useRouter();

  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const [filterConcern, setFilterConcern] = useState("");
  const [filterLevel, setFilterLevel] = useState("");

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated, router]);

  const fetchPatients = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError("");
    try {
      const params: GetPatientsParams = {
        limit: 100,
        sort: "-riskScore",
      };
      const res = await getPatients(token, params);
      setPatients(res.data);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Failed to load patients"
      );
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  const filtered = useMemo(() => {
    let list = patients;
    if (filterConcern) {
      list = list.filter((p) => p.primaryConcern === filterConcern);
    }
    if (filterLevel) {
      list = list.filter((p) => p.status.attentionLevel === filterLevel);
    }
    return list;
  }, [patients, filterConcern, filterLevel]);

  const groups = useMemo(() => groupByAttention(filtered), [filtered]);

  const concerns = useMemo(() => {
    const set = new Set(patients.map((p) => p.primaryConcern));
    return Array.from(set).sort();
  }, [patients]);

  const sectionLabel: Record<string, string> = {
    high: "Needs Immediate Attention",
    medium: "Monitor Closely",
    low: "Stable",
  };

  if (!isAuthenticated) return null;

  return (
    <>
      <header className="overview-header">
        <h1>Patient Overview</h1>
        <div className="user-info">
          <span>{user?.email}</span>
          <button
            className="btn btn-secondary"
            onClick={() => {
              logout();
              router.replace("/login");
            }}
          >
            Sign out
          </button>
        </div>
      </header>

      <div className="overview-container">
        <div className="filters-bar">
          <select
            value={filterLevel}
            onChange={(e) => setFilterLevel(e.target.value)}
            aria-label="Filter by attention level"
          >
            <option value="">All attention levels</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          <select
            value={filterConcern}
            onChange={(e) => setFilterConcern(e.target.value)}
            aria-label="Filter by condition"
          >
            <option value="">All conditions</option>
            {concerns.map((c) => (
              <option key={c} value={c}>
                {c.replace(/_/g, " ").replace(/\b\w/g, (ch) => ch.toUpperCase())}
              </option>
            ))}
          </select>

          {patients.length > 0 && (
            <span style={{ fontSize: "0.8125rem", color: "var(--muted)", alignSelf: "center" }}>
              Showing {filtered.length} of {patients.length} patients
            </span>
          )}
        </div>

        {loading && (
          <div className="loading-state">
            <div className="loading-spinner" />
            <p>Loading patients…</p>
          </div>
        )}

        {error && (
          <div>
            <div className="error-msg">{error}</div>
            <button className="btn btn-primary" onClick={fetchPatients}>
              Retry
            </button>
          </div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div className="empty-state">
            <p>No patients found matching the current filters.</p>
          </div>
        )}

        {groups.map((group) => (
          <div key={group.level}>
            <div className="section-heading">
              <span className={`badge badge-${group.level}`}>
                {group.level}
              </span>
              <h2>
                {sectionLabel[group.level] ?? group.level} ({group.patients.length})
              </h2>
            </div>

            {group.patients.map((patient) => (
              <PatientCard
                key={patient.id}
                patient={patient}
                onClick={() => setSelectedId(patient.id)}
              />
            ))}
          </div>
        ))}
      </div>

      {selectedId && token && (
        <PatientDetail
          patientId={selectedId}
          token={token}
          onClose={() => setSelectedId(null)}
        />
      )}
    </>
  );
}
