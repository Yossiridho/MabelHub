import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET() {
  const client = await clientPromise;
  const db = client.db("MabelHub");

  // ✅ pastikan nama collection benar
  const col = db.collection("VisitActivity");

  // helper normalisasi status agar "Stay Office" == "STAY_OFFICE" == "stay office"
  const normalize = (s: any) =>
    (typeof s === "string" ? s : "")
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "_"); // spasi -> underscore

  // Ambil beberapa distinct dulu untuk coverage (lebih simpel & akurat)
  const [salesDistinct, satkerDistinct, cityDistinct] = await Promise.all([
    col.distinct("nama_sales"),
    col.distinct("satuan_kerja"),
    // sesuaikan: kalau field city kamu namanya "city" pakai ini,
    // kalau "kota_kab" ganti jadi "kota_kab"
    col.distinct("city"),
  ]);

  // AGGREGATE utama untuk status + ring
  const agg = await col
    .aggregate([
      {
        $project: {
          status_visit: 1,
          status_ring: 1,
        },
      },
      {
        $group: {
          _id: null,
          totalVisits: { $sum: 1 },

          // visited: banyak data pakai "visited" / "visit" / "sudah_visit"
          visited: {
            $sum: {
              $cond: [
                {
                  $in: [
                    {
                      $toLower: {
                        $replaceAll: {
                          input: { $trim: { input: "$status_visit" } },
                          find: " ",
                          replacement: "_",
                        },
                      },
                    },
                    ["visited", "visit", "sudah_visit"],
                  ],
                },
                1,
                0,
              ],
            },
          },

          stayOffice: {
            $sum: {
              $cond: [
                {
                  $in: [
                    {
                      $toLower: {
                        $replaceAll: {
                          input: { $trim: { input: "$status_visit" } },
                          find: " ",
                          replacement: "_",
                        },
                      },
                    },
                    ["stay_office", "stayoffice"],
                  ],
                },
                1,
                0,
              ],
            },
          },

          notVisited: {
            $sum: {
              $cond: [
                {
                  $in: [
                    {
                      $toLower: {
                        $replaceAll: {
                          input: { $trim: { input: "$status_visit" } },
                          find: " ",
                          replacement: "_",
                        },
                      },
                    },
                    ["not_visited", "notvisit", "belum_visit", "belum_visited"],
                  ],
                },
                1,
                0,
              ],
            },
          },

          ring1: {
            $sum: { $cond: [{ $eq: ["$status_ring", "RING 1"] }, 1, 0] },
          },
          ring2: {
            $sum: { $cond: [{ $eq: ["$status_ring", "RING 2"] }, 1, 0] },
          },
          ring3: {
            $sum: { $cond: [{ $eq: ["$status_ring", "RING 3"] }, 1, 0] },
          },
          ring4: {
            $sum: { $cond: [{ $eq: ["$status_ring", "RING 4"] }, 1, 0] },
          },
        },
      },
      {
        $project: {
          _id: 0,
          totalVisits: 1,
          visited: 1,
          stayOffice: 1,
          notVisited: 1,
          ring1: 1,
          ring2: 1,
          ring3: 1,
          ring4: 1,
        },
      },
    ])
    .toArray();

  const base = agg[0] || {
    totalVisits: 0,
    visited: 0,
    stayOffice: 0,
    notVisited: 0,
    ring1: 0,
    ring2: 0,
    ring3: 0,
    ring4: 0,
  };

  // filter distinct biar ga ngitung null/"" (sering bikin angka ngaco)
  const clean = (arr: any[]) =>
    arr
      .filter((x) => typeof x === "string" && x.trim().length > 0)
      .map((x) => x.trim());

  const salesCount = new Set(clean(salesDistinct)).size;
  const satkerCount = new Set(clean(satkerDistinct)).size;
  const cityCount = new Set(clean(cityDistinct)).size;

  return NextResponse.json({
    totalVisits: base.totalVisits,
    visited: base.visited,
    stayOffice: base.stayOffice,
    notVisited: base.notVisited,

    salesCount,
    satkerCount,
    cityCount,

    ring: {
      ring1: base.ring1,
      ring2: base.ring2,
      ring3: base.ring3,
      ring4: base.ring4,
    },
  });
}
