"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

import Sidebar from "@/components/sidebar/sidebar";
import { useSession } from "@/components/session/SessionProvider";

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
  teamId?: string | null;
};

function displayName(u: UserLite) {
  const a = (u.fullName || "").trim();
  const b = (u.username || "").trim();
  return a || b || u._id;
}

function pickTeam(json: any) {
  return json?.team ?? json?.data ?? json;
}

function pickUsers(json: any) {
  if (Array.isArray(json?.data)) return json.data;
  if (Array.isArray(json?.users)) return json.users;
  if (Array.isArray(json)) return json;
  return [];
}

export default function TeamDetailPage() {
  const router = useRouter();
  const params = useParams<{ teamId: string }>();
  const teamId = decodeURIComponent(params.teamId);

  const { user, loading: sessionLoading } = useSession();

  const [team, setTeam] = useState<TeamDoc | null>(null);
  const [users, setUsers] = useState<UserLite[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const [info, setInfo] = useState("");

  const [toAdd, setToAdd] = useState<string[]>([]);
  const [toRemove, setToRemove] = useState<string[]>([]);

  const usersById = useMemo(() => {
    const m = new Map<string, UserLite>();
    users.forEach((u) => m.set(u._id, u));
    return m;
  }, [users]);

  // Guard SUPERADMIN
  useEffect(() => {
    if (sessionLoading) return;
    if (!user) return void router.replace("/");
    if (user.role !== "SUPERADMIN") return void router.replace("/dashboard");
  }, [sessionLoading, user, router]);

  async function load() {
    if (!user || user.role !== "SUPERADMIN") return;

    setLoading(true);
    setErr("");
    setInfo("");

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
        setTeam(null);
        return;
      }

      const t = pickTeam(tJson);
      const nextTeam: TeamDoc = {
        _id: String(t._id),
        name: String(t.name || ""),
        leaderId: String(t.leaderId || ""),
        leaderName: t.leaderName ? String(t.leaderName) : undefined,
        memberIds: Array.isArray(t.memberIds) ? t.memberIds.map(String) : [],
      };
      setTeam(nextTeam);

      const uArr = pickUsers(uJson);
      setUsers(
        uArr.map((u: any) => ({
          _id: String(u._id),
          fullName: u.fullName ? String(u.fullName) : "",
          username: u.username ? String(u.username) : "",
          role: u.role ? String(u.role) : "",
          teamId: u.teamId ? String(u.teamId) : null,
        })),
      );

      setToAdd([]);
      setToRemove([]);
    } catch (e: any) {
      setErr(e?.message || "Gagal load");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (sessionLoading) return;
    if (!user || user.role !== "SUPERADMIN") return;
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionLoading, user?.role, teamId]);

  const leader = team ? usersById.get(team.leaderId) : null;

  const membersResolved: UserLite[] = team
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

  const addCandidates = useMemo(() => {
    if (!team) return [];
    const memberSet = new Set(team.memberIds);
    return users
      .filter((u) => u.role === "SALES")
      .filter((u) => !memberSet.has(u._id))
      .filter((u) => !u.teamId);
  }, [users, team]);

  function toggle(arr: string[], setArr: (v: string[]) => void, id: string) {
    setArr(arr.includes(id) ? arr.filter((x) => x !== id) : [...arr, id]);
  }

  async function saveMembers() {
    if (!team) return;
    if (!user || user.role !== "SUPERADMIN") return;

    setErr("");
    setInfo("");

    if (!toAdd.length && !toRemove.length) {
      setInfo("Tidak ada perubahan.");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(
        `/api/teams/${encodeURIComponent(team._id)}/members`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ add: toAdd, remove: toRemove }),
        },
      );

      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErr(json?.error || "Gagal menyimpan perubahan members");
        return;
      }

      setInfo("Berhasil update members.");
      await load();
    } catch (e: any) {
      setErr(e?.message || "Gagal menyimpan");
    } finally {
      setSaving(false);
    }
  }

  if (sessionLoading) return null;
  if (!user || user.role !== "SUPERADMIN") return null;

  return (
    <div className="min-h-screen bg-blue-50">
      <div className="flex">
        <Sidebar />

        <div className="flex-1 h-screen overflow-y-auto p-6">
          <main className="w-full max-w-none">
            {/* Header gaya Plan Activity */}
            <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-3">
                <Link
                  href="/teams"
                  className="inline-flex h-10 items-center rounded-full bg-white px-6 text-xs font-extrabold shadow ring-1 ring-black/10 hover:bg-gray-50"
                >
                  ← BACK
                </Link>
                <h2 className="text-2xl font-extrabold tracking-wide text-black">
                  TEAM DETAIL
                </h2>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={load}
                  className="h-10 rounded-full bg-white px-6 text-sm font-extrabold shadow ring-1 ring-black/10 hover:bg-gray-50 disabled:opacity-60"
                  disabled={loading}
                >
                  {loading ? "LOADING..." : "REFRESH"}
                </button>

                <button
                  onClick={saveMembers}
                  className="h-10 rounded-full bg-black px-6 text-sm font-extrabold text-white shadow hover:opacity-90 disabled:opacity-60"
                  disabled={saving || (!toAdd.length && !toRemove.length)}
                >
                  {saving ? "SAVING..." : "SAVE"}
                </button>
              </div>
            </div>

            {err ? (
              <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {err}
              </div>
            ) : null}
            {info ? (
              <div className="mb-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                {info}
              </div>
            ) : null}

            {!team ? (
              <div className="w-full overflow-hidden rounded-2xl bg-white p-6 shadow-sm ring-1 ring-blue-100">
                {loading ? "Memuat..." : "Team tidak ditemukan."}
              </div>
            ) : (
              <>
                {/* Summary card */}
                <div className="mb-6 w-full overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-blue-100">
                  <div className="bg-blue-200 px-5 py-4">
                    <div className="text-lg font-extrabold text-black">
                      INFO TEAM
                    </div>
                    <div className="text-sm text-black/70">{team._id}</div>
                  </div>

                  <div className="px-5 py-5">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                      <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/10">
                        <div className="text-xs font-semibold text-gray-700">
                          Nama Team
                        </div>
                        <div className="mt-2 text-lg font-extrabold">
                          {team.name}
                        </div>
                      </div>

                      <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/10">
                        <div className="text-xs font-semibold text-gray-700">
                          Leader
                        </div>
                        <div className="mt-2 text-sm font-semibold">
                          {leader
                            ? `${displayName(leader)} (${leader.role})`
                            : team.leaderName || team.leaderId}
                        </div>
                        <div className="mt-1 text-xs text-gray-600">
                          {team.leaderId}
                        </div>
                      </div>

                      <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/10">
                        <div className="text-xs font-semibold text-gray-700">
                          Jumlah Sales
                        </div>
                        <div className="mt-2 text-2xl font-extrabold">
                          {team.memberIds.length}
                        </div>
                        <div className="mt-1 text-xs text-gray-600">
                          Add: {toAdd.length} • Remove: {toRemove.length}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Members list */}
                <div className="mb-6 w-full overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-blue-100">
                  <div className="bg-blue-200 px-5 py-4">
                    <div className="text-lg font-extrabold text-black">
                      MEMBERS
                    </div>
                    <div className="text-sm text-black/70">
                      Daftar sales yang ada di team.
                    </div>
                  </div>

                  <div className="divide-y divide-black/10">
                    {membersResolved.map((m) => (
                      <div key={m._id} className="px-5 py-3 hover:bg-gray-50">
                        <div className="text-sm font-semibold text-black">
                          {displayName(m)}
                        </div>
                        <div className="text-xs text-gray-600">
                          {m.username || "-"} • {m._id} • {m.role}
                        </div>
                      </div>
                    ))}
                    {membersResolved.length === 0 ? (
                      <div className="px-5 py-6 text-sm text-gray-600">
                        Belum ada member.
                      </div>
                    ) : null}
                  </div>
                </div>

                {/* Edit members */}
                <div className="w-full overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-blue-100">
                  <div className="bg-blue-200 px-5 py-4">
                    <div className="text-lg font-extrabold text-black">
                      EDIT MEMBERS
                    </div>
                    <div className="text-sm text-black/70">
                      Kandidat Add hanya sales yang belum punya team.
                    </div>
                  </div>

                  <div className="px-5 py-5">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      {/* Add */}
                      <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/10">
                        <div className="flex items-center justify-between">
                          <div className="text-sm font-extrabold">
                            ADD SALES
                          </div>
                          <div className="text-xs text-gray-600">
                            Dipilih: {toAdd.length}
                          </div>
                        </div>

                        <div className="mt-3 max-h-80 overflow-auto rounded-2xl ring-1 ring-black/10">
                          {addCandidates.map((u) => (
                            <label
                              key={u._id}
                              className="flex cursor-pointer items-center gap-3 px-4 py-2 hover:bg-gray-50"
                            >
                              <input
                                type="checkbox"
                                checked={toAdd.includes(u._id)}
                                onChange={() => toggle(toAdd, setToAdd, u._id)}
                                className="h-4 w-4"
                              />
                              <div className="min-w-0">
                                <div className="truncate text-sm font-semibold">
                                  {displayName(u)}
                                </div>
                                <div className="truncate text-xs text-gray-600">
                                  {u.username}
                                </div>
                              </div>
                            </label>
                          ))}

                          {addCandidates.length === 0 ? (
                            <div className="px-4 py-6 text-sm text-gray-600">
                              Tidak ada kandidat untuk ditambahkan.
                            </div>
                          ) : null}
                        </div>
                      </div>

                      {/* Remove */}
                      <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/10">
                        <div className="flex items-center justify-between">
                          <div className="text-sm font-extrabold">
                            REMOVE SALES
                          </div>
                          <div className="text-xs text-gray-600">
                            Dipilih: {toRemove.length}
                          </div>
                        </div>

                        <div className="mt-3 max-h-80 overflow-auto rounded-2xl ring-1 ring-black/10">
                          {membersResolved.map((u) => (
                            <label
                              key={u._id}
                              className="flex cursor-pointer items-center gap-3 px-4 py-2 hover:bg-gray-50"
                            >
                              <input
                                type="checkbox"
                                checked={toRemove.includes(u._id)}
                                onChange={() =>
                                  toggle(toRemove, setToRemove, u._id)
                                }
                                className="h-4 w-4"
                              />
                              <div className="min-w-0">
                                <div className="truncate text-sm font-semibold">
                                  {displayName(u)}
                                </div>
                                <div className="truncate text-xs text-gray-600">
                                  {u.username}
                                </div>
                              </div>
                            </label>
                          ))}

                          {membersResolved.length === 0 ? (
                            <div className="px-4 py-6 text-sm text-gray-600">
                              Tidak ada member untuk dihapus.
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 flex justify-end gap-2">
                      <button
                        onClick={() => {
                          setToAdd([]);
                          setToRemove([]);
                          setErr("");
                          setInfo("");
                        }}
                        className="h-10 rounded-full bg-white px-6 text-sm font-extrabold shadow ring-1 ring-black/10 hover:bg-gray-50 disabled:opacity-60"
                        disabled={saving}
                      >
                        RESET
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
