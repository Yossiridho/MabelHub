"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import Sidebar from "@/components/sidebar/sidebar";
import type { Role } from "@/lib/menu";

type TeamDoc = {
  _id: string;
  name: string;
  leaderId: string;
  leaderName?: string;
  memberIds: string[];
};

type UserLite = {
  _id: string;
  fullName?: string;
  username?: string;
  role: string;
};

function displayName(u: UserLite) {
  const a = (u.fullName || "").trim();
  const b = (u.username || "").trim();
  return a || b || u._id;
}

export default function TeamDetailPage() {
  const role: Role = "SUPERADMIN";
  const params = useParams<{ teamId: string }>();
  const teamId = decodeURIComponent(params.teamId);

  const [team, setTeam] = useState<TeamDoc | null>(null);
  const [users, setUsers] = useState<UserLite[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const usersById = useMemo(() => {
    const m = new Map<string, UserLite>();
    users.forEach((u) => m.set(u._id, u));
    return m;
  }, [users]);

  async function load() {
    setLoading(true);
    setErr("");
    try {
      const [tRes, uRes] = await Promise.all([
        fetch(`/api/teams/${encodeURIComponent(teamId)}`, {
          cache: "no-store",
        }),
        fetch("/api/users", { cache: "no-store" }),
      ]);

      const tJson = await tRes.json().catch(() => ({}));
      const uJson = await uRes.json().catch(() => ({}));

      if (!tRes.ok) {
        setErr(tJson?.error || "Gagal load team");
        return;
      }

      const t = tJson?.team ?? tJson; // antisipasi bentuk response
      setTeam({
        _id: String(t._id),
        name: String(t.name || ""),
        leaderId: String(t.leaderId || ""),
        leaderName: t.leaderName ? String(t.leaderName) : undefined,
        memberIds: Array.isArray(t.memberIds) ? t.memberIds.map(String) : [],
      });

      const uArr = Array.isArray(uJson?.users)
        ? uJson.users
        : Array.isArray(uJson)
          ? uJson
          : [];
      setUsers(
        uArr.map((u: any) => ({
          _id: String(u._id),
          fullName: u.fullName ? String(u.fullName) : "",
          username: u.username ? String(u.username) : "",
          role: u.role ? String(u.role) : "",
        })),
      );
    } catch (e: any) {
      setErr(e?.message || "Gagal load");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [teamId]);

  const leader = team ? usersById.get(team.leaderId) : null;
  const members = team
    ? team.memberIds.map(
        (id) =>
          usersById.get(id) || {
            _id: id,
            role: "?",
            fullName: "",
            username: "",
          },
      )
    : [];

  return (
    <div className="min-h-screen bg-white">
      <Sidebar role={role} />

      <div className="mx-auto max-w-5xl px-4 py-6 lg:pl-72">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <Link
                href="/superadmin/teams"
                className="rounded-xl border border-gray-200 px-3 py-1.5 text-xs hover:bg-gray-50"
              >
                ← Back
              </Link>
              <h1 className="text-2xl font-semibold">Team Detail</h1>
            </div>
            <p className="mt-1 text-sm text-gray-500">{teamId}</p>
          </div>

          <button
            onClick={load}
            className="h-10 rounded-xl border border-gray-200 px-4 text-sm hover:bg-gray-50"
            disabled={loading}
          >
            {loading ? "Loading..." : "Refresh"}
          </button>
        </div>

        {err ? (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {err}
          </div>
        ) : null}

        {!team ? (
          <div className="mt-6 rounded-2xl border border-gray-200 p-6 text-sm text-gray-600">
            {loading ? "Memuat..." : "Team tidak ditemukan."}
          </div>
        ) : (
          <>
            <div className="mt-6 rounded-2xl border border-gray-200 p-6 shadow-sm">
              <div className="text-xs font-semibold text-gray-500">
                Nama Team
              </div>
              <div className="mt-1 text-xl font-semibold">{team.name}</div>

              <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="rounded-xl border border-gray-200 p-4">
                  <div className="text-xs font-semibold text-gray-500">
                    Leader
                  </div>
                  <div className="mt-1 text-sm font-medium">
                    {leader
                      ? `${displayName(leader)} (${leader.role})`
                      : team.leaderName || team.leaderId}
                  </div>
                </div>

                <div className="rounded-xl border border-gray-200 p-4">
                  <div className="text-xs font-semibold text-gray-500">
                    Jumlah Sales
                  </div>
                  <div className="mt-1 text-sm font-medium">
                    {team.memberIds.length}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-gray-200 shadow-sm">
              <div className="border-b border-gray-200 px-5 py-4">
                <h2 className="text-lg font-semibold">Members</h2>
                <p className="text-xs text-gray-500">
                  Read-only (sementara). Bisa ditambah fitur edit setelah
                  endpoint-nya dipastikan.
                </p>
              </div>

              <div className="divide-y divide-gray-100">
                {members.map((m) => (
                  <div key={m._id} className="px-5 py-3">
                    <div className="text-sm font-medium">{displayName(m)}</div>
                    <div className="text-xs text-gray-500">
                      {m._id} • {m.role}
                    </div>
                  </div>
                ))}

                {members.length === 0 ? (
                  <div className="px-5 py-6 text-sm text-gray-500">
                    Belum ada member.
                  </div>
                ) : null}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
