import { Schema, model, models } from "mongoose";

const VisitActivitySchema = new Schema(
  {
    id: { type: Number, index: true },          // id dari excel
    user_id: { type: Number, index: true },     // user_id dari excel
    nama_sales: { type: String, index: true },  // "Nama Sales" excel

    visit_date: { type: Date, index: true },
    city: { type: String, index: true },
    klpd: { type: String },
    institusi_kerja: { type: String },

    satuan_kerja: { type: String, index: true },

    pic_name: { type: String },
    pic_phone: { type: String },
    pic_position: { type: String },
    pic_role: { type: String },

    status_visit: { type: String, index: true }, // Visited / Not Visited / Stay Office
    status_ring: { type: String, index: true },  // RING 1..4

    descriptions: { type: String },
    status_market: { type: String },
    tindak_lanjut: { type: String },
    kegiatan_status: { type: String },
    no_visit_per_month: { type: Number },

    created_at: { type: Date },
    reschedule_date: { type: Date },
    visit_image: { type: String },
  },
  { timestamps: true }
);

export const VisitActivity =
  models.VisitActivity || model("VisitActivity", VisitActivitySchema, "VisitActivity");

