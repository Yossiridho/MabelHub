import mongoose, { Schema, type InferSchemaType } from "mongoose";

export const USER_ROLES = ["SUPERADMIN", "ADMIN", "LEADER", "SALES"] as const;
export type UserRole = (typeof USER_ROLES)[number];

const UserSchema = new Schema(
  {
    fullName: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
      index: true,
    },
    username: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
      index: true,
    },
    passwordHash: { type: String, required: true },
    role: { type: String, required: true, enum: USER_ROLES, index: true },

    // opsional (rekomendasi):
    isActive: { type: Boolean, default: true },
    lastLoginAt: { type: Date, default: null },
  },
  { timestamps: true },
);

// jangan pernah kirim hash ke client
UserSchema.set("toJSON", {
  transform(_doc, ret) {
    const { passwordHash, ...rest } = ret;
    return rest;
  },
});

export type UserDoc = InferSchemaType<typeof UserSchema>;

export default mongoose.models.User || mongoose.model("User", UserSchema);
