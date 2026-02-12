import mongoose, { Schema, type InferSchemaType } from "mongoose";

const EProcRequestSchema = new Schema(
  {
    requestId: { type: String, required: true, unique: true, index: true },

    requestor: { type: String, required: true },
    pemohon: { type: String, required: true },
    lokasi: { type: String, required: true },
    segmen: { type: String, required: true },

    deadlineUsulan: { type: Date, required: true },
    tanggalSubmit: { type: Date, required: true },
    catatan: { type: String, default: "" },

    // claim / take
    takenByAdminId: { type: String, default: null, index: true },
    takenByAdminName: { type: String, default: null },
    takenAt: { type: Date, default: null },
  },
  { timestamps: true },
);

export type EProcRequestDoc = InferSchemaType<typeof EProcRequestSchema>;

export default mongoose.models.EProcRequest ||
  mongoose.model("EProcRequest", EProcRequestSchema);
