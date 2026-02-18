import { ObjectId } from "mongodb";

export async function getParams<T>(ctx: { params: T | Promise<T> }) {
  return await Promise.resolve(ctx.params);
}

export function toObjectId(id: string) {
  if (!ObjectId.isValid(id)) return null;
  return new ObjectId(id);
}

export function normStr(v: any) {
  return String(v ?? "").trim();
}

export function normLower(v: any) {
  return String(v ?? "")
    .trim()
    .toLowerCase();
}
