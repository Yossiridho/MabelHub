import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import { VisitActivity } from "@/models/VisitActivity";

export async function GET() {
  await dbConnect();
  
  // 1) total + per status_visit
  const statusAgg = await VisitActivity.aggregate([
    {
      $group: {
        _id: null,
        totalVisits: { $sum: 1 },
        stayOffice: {
          $sum: { $cond: [{ $eq: ["$status_visit", "Stay Office"] }, 1, 0] },
        },
        notVisited: {
          $sum: { $cond: [{ $eq: ["$status_visit", "Not Visited"] }, 1, 0] },
        },
      },
    },
    { $project: { _id: 0, totalVisits: 1, stayOffice: 1, notVisited: 1 } },
  ]);

  // 2) Market coverage: unique sales, satker, city
  const coverageAgg = await VisitActivity.aggregate([
    {
      $group: {
        _id: null,
        sales: { $addToSet: "$nama_sales" },
        satkers: { $addToSet: "$satuan_kerja" },
        cities: { $addToSet: "$city" },
      },
    },
    {
      $project: {
        _id: 0,
        salesCount: {
          $size: {
            $filter: {
              input: "$sales",
              as: "s",
              cond: { $and: [{ $ne: ["$$s", null] }, { $ne: ["$$s", ""] }] },
            },
          },
        },
        satkerCount: {
          $size: {
            $filter: {
              input: "$satkers",
              as: "s",
              cond: { $and: [{ $ne: ["$$s", null] }, { $ne: ["$$s", ""] }] },
            },
          },
        },
        cityCount: {
          $size: {
            $filter: {
              input: "$cities",
              as: "c",
              cond: { $and: [{ $ne: ["$$c", null] }, { $ne: ["$$c", ""] }] },
            },
          },
        },
      },
    },
  ]);

  // 3) Ring distribution dari status_ring (string "RING 1" dst)
  const ringAgg = await VisitActivity.aggregate([
    {
      $match: {
        status_ring: { $in: ["RING 1", "RING 2", "RING 3", "RING 4"] },
      },
    },
    { $group: { _id: "$status_ring", count: { $sum: 1 } } },
  ]);

  const status = statusAgg[0] ?? {
    totalVisits: 0,
    stayOffice: 0,
    notVisited: 0,
  };
  const coverage = coverageAgg[0] ?? {
    salesCount: 0,
    satkerCount: 0,
    cityCount: 0,
  };

  const ring = { ring1: 0, ring2: 0, ring3: 0, ring4: 0 };
  for (const r of ringAgg) {
    if (r._id === "RING 1") ring.ring1 = r.count;
    if (r._id === "RING 2") ring.ring2 = r.count;
    if (r._id === "RING 3") ring.ring3 = r.count;
    if (r._id === "RING 4") ring.ring4 = r.count;
  }

  return NextResponse.json({ ...status, ...coverage, ring });
}
