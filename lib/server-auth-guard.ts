import { cookies } from "next/headers";
import { UserRole } from "@/types/auth-types";
import { en } from "@/lib/i18n/en";
import { verifyToken } from "./jwt";

export class AuthError extends Error {
  constructor(message: string = en.forbidden_insufficient_permissions) {
    super(message);
    this.name = "AuthError";
  }
}

export async function requireAuth(customMessage?: string) {
  const token = (await cookies()).get(en.token_name)?.value;
  if (!token) throw new AuthError(customMessage ?? en.unauthorized_not_logged_in);

  const payload = verifyToken(token);
  if (!payload) throw new AuthError(customMessage ?? en.unauthorized_invalid_token);

  return payload;
}

export async function requireRole(roles: UserRole[], customMessage?: string) {
  const payload = await requireAuth(customMessage);

  if (!roles.includes(payload.role as UserRole)) {
    throw new AuthError(customMessage ?? en.forbidden_insufficient_permissions);
  }

  return payload;
} 