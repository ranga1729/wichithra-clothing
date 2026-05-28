// lib/auth-guard.ts
import { cookies } from "next/headers";
import { UserRole } from "@/types/auth-types";
import { en } from "@/lib/i18n/en";
import { verifyToken } from "./jwt";

export async function requireAuth() {
  const token = (await cookies()).get(en.token_name)?.value;
  if (!token) throw new Error("Unauthorized: not logged in");

  const payload = verifyToken(token);
  if (!payload) throw new Error("Unauthorized: invalid or expired token");

  return payload; // return payload so the action can use it
}

export async function requireRole(...roles: UserRole[]) {
  const payload = await requireAuth();

  if (!roles.includes(payload.role as UserRole)) {
    throw new Error("Forbidden: insufficient permissions");
  }

  return payload;
} 