"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

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
  role: "SUPERADMIN" | "ADMIN" | "LEADER" | "SALES";
  teamId?: string | null;
};

function displayName(u: UserLite) {
  return (u.fullName || "").trim() || (u.username || "").trim() || u._id;
}

function pickArrayData(json: any) {
  // kompatibel untuk { data: [...] } atau legacy { teams/users: [...] }
  if (Array.isArray(json?.data)) return json.data;
  if (Array.isArray(json?.teams)) return json.teams;
  if (Array.isArray(json?.users)) return json.users;
  if (Array.isArray(json)) return json;
  return [];
}

export default function TeamsPage() {
  const router = useRouter();
  const { user, loading: sessionLoading } = useSession();

  const [teams, setTeams] = useState<TeamDoc[]>([]);
  const [users, setUsers] = useState<UserLite[]>([]);
  const [loading, setLoading] = useState(false);

  // create form
  const [name, setName] = useState("");
  const [leaderId, setLeaderId] = useState("");
  const [memberIds, setMemberIds] = useState<string[]>([]);
  const [creating, setCreating] = useState(false);
  const [err, setErr] = useState("");

  // Guard SUPERADMIN
  useEffect(() => {
    if (sessionLoading) return;
    if (!user) return void router.replace("/");
    if (user.role !== "SUPERADMIN") return void router.replace("/dashboard");
  }, [sessionLoading, user, router]);

  const leaders = useMemo(
    () => users.filter((u) => u.role === "LEADER"),
    [users],
  );
  const sales = useMemo(() => users.filter((u) => u.role === "SALES"), [users]);

  async function loadAll() {
    if (!user || user.role !== "SUPERADMIN") return;

    setLoading(true);
    setErr("");

    try {
      const [tRes, uRes] = await Promise.all([
        fetch("/api/teams", { cache: "no-store" }),
        fetch("/api/users", { cache: "no-store" }),
      ]);

      const tJson = await tRes.json().catch(() => ({}));
      const uJson = await uRes.json().catch(() => ({}));

      if (!tRes.ok) {
        setErr(tJson?.error || "Gagal load teams");
        setTeams([]);
        return;
      }
      if (!uRes.ok) {
        setErr(uJson?.error || "Gagal load users");
        setUsers([]);
        return;
      }

      const tArr = pickArrayData(tJson);
      const uArr = pickArrayData(uJson);

      setTeams(
        tArr.map((t: any) => ({
          _id: String(t._id),
          name: String(t.name || ""),
          leaderId: String(t.leaderId || ""),
          leaderName: t.leaderName ? String(t.leaderName) : undefined,
          memberIds: Array.isArray(t.memberIds) ? t.memberIds.map(String) : [],
        })),
      );

      setUsers(
        uArr.map((u: any) => ({
          _id: String(u._id),
          fullName: u.fullName ? String(u.fullName) : "",
          username: u.username ? String(u.username) : "",
          role: String(u.role || "") as any,
          teamId: u.teamId ? String(u.teamId) : null,
        })),
      );
    } catch (e: any) {
      setErr(e?.message || "Gagal load data");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (sessionLoading) return;
    if (!user || user.role !== "SUPERADMIN") return;
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionLoading, user?.role]);

  function toggleMember(id: string) {
    setMemberIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  async function createTeam() {
    if (!user || user.role !== "SUPERADMIN") return;

    setErr("");
    const nm = name.trim();
    if (!nm) return setErr("Nama team wajib diisi");
    if (!leaderId) return setErr("Leader wajib dipilih");

    setCreating(true);
    try {
      const res = await fetch("/api/teams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: nm, leaderId, memberIds }),
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErr(json?.error || "Gagal membuat team");
        return;
      }

      setName("");
      setLeaderId("");
      setMemberIds([]);
      await loadAll();
    } catch (e: any) {
      setErr(e?.message || "Gagal membuat team");
    } finally {
      setCreating(false);
    }
  }

  if (sessionLoading) return null;
  if (!user || user.role !== "SUPERADMIN") return null;

  return (
    <div className="min-h-screen bg-blue-50">
      <div className="flex">
        <Sidebar />

        <div className="flex-1 p-6 h-screen overflow-y-auto">
          <div className="px-3 pt-2 pb-2">
            <h1 className="text-2xl font-extrabold pl-4 text-black">TEAMS</h1>
            <div className="mt-2 text-sm text-neutral-600">
              Kelola Teams by (SUPERADMIN)
            </div>
          </div>

          {err ? (
            <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {err}
            </div>
          ) : null}

          <div className="mt-6 bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
            <h2 className="text-lg font-semibold">Buat Team Baru</h2>

            <div className="px-5 py-5">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <div className="text-xs font-semibold text-gray-700">
                    Nama Team
                  </div>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="mt-2 h-11 w-full rounded-full bg-white px-5 text-sm outline-none ring-1 ring-black/10 focus:ring-2 focus:ring-black/20"
                    placeholder="contoh: Team Jakarta"
                  />
                </div>

                <div>
                  <div className="text-xs font-semibold text-gray-700">
                    Leader
                  </div>
                  <select
                    value={leaderId}
                    onChange={(e) => setLeaderId(e.target.value)}
                    className="mt-2 h-11 w-full rounded-full bg-white px-5 text-sm outline-none ring-1 ring-black/10 focus:ring-2 focus:ring-black/20"
                  >
                    <option value="">-- pilih leader --</option>
                    {leaders.map((u) => (
                      <option key={u._id} value={u._id}>
                        {displayName(u)} ({u.username})
                        {u.teamId ? " • sudah punya team" : ""}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-4">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-semibold text-gray-700">
                    Members (Sales)
                  </div>
                  <div className="text-xs text-gray-600">
                    Selected: <b>{memberIds.length}</b>
                  </div>
                </div>

                <div className="mt-2 grid grid-cols-1 gap-2 md:grid-cols-2">
                  {sales.map((u) => {
                    const checked = memberIds.includes(u._id);
                    return (
                      <label
                        key={u._id}
                        className="flex cursor-pointer items-center gap-3 rounded-2xl bg-white px-4 py-3 shadow-sm ring-1 ring-black/10 hover:bg-gray-50"
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleMember(u._id)}
                          className="h-4 w-4"
                        />
                        <div className="min-w-0">
                          <div className="truncate text-sm font-semibold">
                            {displayName(u)}
                          </div>
                          <div className="truncate text-xs text-gray-600">
                            {u.username} {u.teamId ? "• sudah ada team" : ""}
                          </div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="mt-5 flex items-center justify-end gap-3">
                <button
                  onClick={() => {
                    setName("");
                    setLeaderId("");
                    setMemberIds([]);
                    setErr("");
                  }}
                  className="h-10 rounded-xl border border-gray-400 px-4 text-sm font-semibold hover:bg-gray-100"
                  disabled={creating}
                >
                  Reset
                </button>

                <button
                  onClick={createTeam}
                  className="h-10 rounded-xl bg-black px-4 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60"
                  disabled={creating}
                >
                  {creating ? "Membuat..." : "Create Team"}
                </button>
              </div>
            </div>
          </div>

          <div className="px-5 pt-8">
            <h2 className="text-2xl font-semibold">DAFTAR TEAM</h2>
          </div>

          <div className="mt-6 bg-white rounded-2xl border border-gray-200 shadow-sm">
            <div className="overflow-x-auto px-5 py-4">
              <table className="w-full text-left text-md">
                <thead className="bg-white font-semibold text-black">
                  <tr>
                    <th className="px-5 py-3">Nama</th>
                    <th className="px-5 py-3">Leader</th>
                    <th className="px-5 py-3">Jumlah Sales</th>
                    <th className="px-5 py-3">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {teams.map((t) => (
                    <tr key={t._id} className="border-t border-gray-200">
                      <td className="px-5 py-3">{t.name}</td>
                      <td className="px-5 py-3">
                        {t.leaderName || t.leaderId}
                      </td>
                      <td className="px-5 py-3">
                        {(t.memberIds || []).length}
                      </td>
                      <td className="px-5 py-3">
                        <Link
                          className="rounded-lg border border-gray-400 px-3 py-1 text-sm font-semibold hover:bg-gray-100"
                          href={`/teams/${encodeURIComponent(t._id)}`}
                        >
                          EDIT
                        </Link>
                      </td>
                    </tr>
                  ))}

                  {!loading && teams.length === 0 ? (
                    <tr>
                      <td
                        className="px-5 py-6 text-sm text-gray-500"
                        colSpan={4}
                      >
                        Belum ada team.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
