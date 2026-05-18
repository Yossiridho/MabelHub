"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";


import { useSession } from "@/components/session/SessionProvider";
import ConfirmModal from "@/components/modals/ConfirmModal";

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
  const [confirmSave, setConfirmSave] = useState(false);

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

    if (toRemove.length > 0) {
      setConfirmSave(true);
      return;
    }

    await handleConfirmSave();
  }

  async function handleConfirmSave() {
    if (!team) return;
    if (!user || user.role !== "SUPERADMIN") return;

    // ✅ hitung memberIds final agar kompatibel dengan API PUT kamu
    const current = Array.isArray(team.memberIds)
      ? team.memberIds.map(String)
      : [];
    const removeSet = new Set(toRemove.map(String));
    const addSet = new Set(toAdd.map(String));

    // start dari current, buang yang remove
    let next = current.filter((id) => !removeSet.has(id));

    // tambahkan add yang belum ada
    for (const id of addSet) {
      if (!next.includes(id)) next.push(id);
    }

    // jaga-jaga: jangan pernah memasukkan leader
    next = next.filter((id) => id && id !== team.leaderId);

    setSaving(true);
    try {
      const res = await fetch(
        `/api/teams/${encodeURIComponent(team._id)}/members`,
        {
          method: "PUT", // ✅ pakai PUT (sesuai API kamu)
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ memberIds: next }), // ✅ sesuai API
        },
      );

      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErr(json?.error || "Gagal menyimpan perubahan members");
        return;
      }

      setInfo("Berhasil update members.");
      setConfirmSave(false);
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
        

        <div className="flex-1 p-6">
          <div className="px-3 pt-2 pb-2">
            <div>
              <div className="flex items-center gap-3">
                <Link
                  href="/teams"
                  className="rounded-full bg-white border border-gray-200 px-3 py-1.5 hover:bg-gray-50"
                >
                  ←
                </Link>
                <h1 className="text-2xl font-extrabold">Team Detail</h1>
              </div>
              <p className="mt-1 text-sm text-gray-500">{teamId}</p>
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
            <div className="mt-6 rounded-2xl border border-gray-200 p-6 text-sm text-gray-600">
              {loading ? "Memuat..." : "Team tidak ditemukan."}
            </div>
          ) : (
            <>
              <div className="mt-6 rounded-2xl bg-white border border-gray-200 p-6 shadow-sm">
                <div className="text-xs font-semibold text-gray-500">
                  Nama Team
                </div>
                <div className="mt-1 text-xl font-semibold">{team.name}</div>

                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
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

              {/* Members (current) */}
              <div className="mt-6 rounded-2xl bg-white border border-gray-200 shadow-sm">
                <div className="border-b border-gray-200 px-5 py-4">
                  <h2 className="text-lg font-semibold">Members Saat Ini</h2>
                  <p className="text-xs text-gray-500">
                    Daftar member sales yang sudah masuk team.
                  </p>
                </div>

                <div className="divide-y divide-gray-100">
                  {membersResolved.map((m) => (
                    <div key={m._id} className="px-5 py-3">
                      <div className="text-sm font-medium">
                        {displayName(m)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {m._id} • {m.role}
                      </div>
                    </div>
                  ))}

                  {membersResolved.length === 0 ? (
                    <div className="px-5 py-6 text-sm text-gray-500">
                      Belum ada member.
                    </div>
                  ) : null}
                </div>
              </div>

              {/* Edit panel */}
              <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
                {/* Add */}
                <div className="rounded-2xl border bg-white border-gray-200 p-5 shadow-sm">
                  <h3 className="text-base font-semibold">
                    Tambah Sales ke Team
                  </h3>
                  <p className="mt-1 text-xs text-gray-500">
                    Menampilkan sales yang belum punya team (teamId kosong) dan
                    belum jadi member.
                  </p>

                  <div className="mt-3 max-h-80 overflow-auto rounded-xl border border-gray-200">
                    {addCandidates.map((u) => {
                      const checked = toAdd.includes(u._id);
                      return (
                        <label
                          key={u._id}
                          className="flex cursor-pointer items-center gap-3 px-4 py-2 hover:bg-gray-50"
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggle(toAdd, setToAdd, u._id)}
                            className="h-4 w-4"
                          />
                          <div className="min-w-0">
                            <div className="truncate text-sm font-medium">
                              {displayName(u)}
                            </div>
                            <div className="truncate text-xs text-gray-500">
                              {u.username}
                            </div>
                          </div>
                        </label>
                      );
                    })}

                    {addCandidates.length === 0 ? (
                      <div className="px-4 py-6 text-sm text-gray-600">
                        Tidak ada kandidat untuk ditambahkan.
                      </div>
                    ) : null}
                  </div>
                </div>

                {/* Remove */}
                <div className="rounded-2xl border bg-white border-gray-200 p-5 shadow-sm">
                  <h3 className="text-base font-semibold">
                    Hapus Sales dari Team
                  </h3>
                  <p className="mt-1 text-xs text-gray-500">
                    Pilih member yang mau dikeluarkan dari team.
                  </p>

                  <div className="mt-3 max-h-80 overflow-auto rounded-xl border border-gray-200">
                    {membersResolved.map((u) => {
                      const checked = toRemove.includes(u._id);
                      return (
                        <label
                          key={u._id}
                          className="flex cursor-pointer items-center gap-3 px-4 py-2 hover:bg-gray-50"
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() =>
                              toggle(toRemove, setToRemove, u._id)
                            }
                            className="h-4 w-4"
                          />
                          <div className="min-w-0">
                            <div className="truncate text-sm font-medium">
                              {displayName(u)}
                            </div>
                            <div className="truncate text-xs text-gray-500">
                              {u.username}
                            </div>
                          </div>
                        </label>
                      );
                    })}

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
                <button
                  onClick={saveMembers}
                  disabled={
                    saving || (toAdd.length === 0 && toRemove.length === 0)
                  }
                  className="h-10 rounded-full bg-blue-600 px-6 text-sm font-extrabold text-white shadow hover:bg-blue-700 disabled:opacity-60"
                >
                  {saving ? "MENYIMPAN..." : "SIMPAN PERUBAHAN"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <ConfirmModal
        open={confirmSave}
        loading={saving}
        title="Konfirmasi Perubahan Tim"
        message="Apakah Anda yakin ingin menghapus Sales ini dari Tim?"
        confirmText="SIMPAN"
        onConfirm={handleConfirmSave}
        onCancel={() => setConfirmSave(false)}
      />
    </div>
  );
}
