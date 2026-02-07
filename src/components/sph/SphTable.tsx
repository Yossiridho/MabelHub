"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import type { SphDoc } from "@/lib/sph/types";

import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

function badgeForAdminStatus(s: SphDoc["adminStatus"]) {
  const label =
    s === "masuk"
      ? "Masuk"
      : s === "proses"
        ? "Proses"
        : s === "done"
          ? "Done"
          : s === "hold"
            ? "Hold"
            : "Cancel";
  return <Badge>{label}</Badge>;
}

type Props = {
  data: SphDoc[];
  enableClaim?: boolean;
  currentAdminId?: string;
};

export default function SphTable({
  data,
  enableClaim = false,
  currentAdminId,
}: Props) {
  const [q, setQ] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [claimingCode, setClaimingCode] = useState<string | null>(null);

  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();
    if (!qq) return data;
    return data.filter((x) => {
      return (
        x.code.toLowerCase().includes(qq) ||
        x.title.toLowerCase().includes(qq) ||
        x.createdBy.name.toLowerCase().includes(qq)
      );
    });
  }, [data, q]);

  async function onClaim(code: string) {
    if (!currentAdminId) {
      setError("AdminId tidak ditemukan. Pastikan kamu login sebagai ADMIN.");
      return;
    }

    setError(null);
    setClaimingCode(code);

    try {
      const res = await fetch("/api/mock/sph/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, adminId: currentAdminId }),
      });

      if (!res.ok) {
        const j = await res.json().catch(() => null);
        throw new Error(j?.message || "Gagal claim SPH");
      }

      // refresh data server component (page) supaya list antrian ikut update
      startTransition(() => router.refresh());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Terjadi kesalahan");
    } finally {
      setClaimingCode(null);
    }
  }

  return (
    <div className="space-y-3">
      {error ? (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div className="flex items-center gap-2">
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Cari kode / judul / pembuat..."
          className="max-w-md"
        />
        <div className="text-sm text-muted-foreground">
          {filtered.length} item
        </div>
      </div>

      <div className="rounded-lg border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Kode</TableHead>
              <TableHead>Judul</TableHead>
              <TableHead>Pembuat</TableHead>
              <TableHead>Team</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Claim</TableHead>
              {enableClaim ? (
                <TableHead className="text-right">Aksi</TableHead>
              ) : null}
            </TableRow>
          </TableHeader>

          <TableBody>
            {filtered.map((x) => {
              const isClaimed = Boolean(x.claimedByAdminId);
              const isThisRowClaiming = claimingCode === x.code;

              return (
                <TableRow key={x.code}>
                  <TableCell className="font-medium">
                    <Link
                      className="underline"
                      href={`/sph/${encodeURIComponent(x.code)}`}
                    >
                      {x.code}
                    </Link>
                  </TableCell>

                  <TableCell>{x.title}</TableCell>
                  <TableCell>{x.createdBy.name}</TableCell>
                  <TableCell>{x.teamId}</TableCell>
                  <TableCell>{badgeForAdminStatus(x.adminStatus)}</TableCell>

                  <TableCell>
                    {x.claimedByAdminId ? (
                      <span className="text-sm text-muted-foreground">
                        {x.claimedByAdminId}
                      </span>
                    ) : (
                      <span className="text-sm text-muted-foreground">—</span>
                    )}
                  </TableCell>

                  {enableClaim ? (
                    <TableCell className="text-right">
                      {isClaimed ? (
                        <span className="text-sm text-muted-foreground">—</span>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={isPending || isThisRowClaiming}
                          onClick={() => onClaim(x.code)}
                        >
                          {isThisRowClaiming ? "Claiming..." : "Claim"}
                        </Button>
                      )}
                    </TableCell>
                  ) : null}
                </TableRow>
              );
            })}

            {filtered.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={enableClaim ? 7 : 6}
                  className="py-10 text-center text-muted-foreground"
                >
                  Tidak ada data
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
