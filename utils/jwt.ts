import * as jwt from "jsonwebtoken"
import { JwtPayload } from "../../types/auth";

const JWT_SECRET = process.env.JWT_SECRET! as jwt.Secret;
const JWT_EXPIRE_IN = process.env.JWT_EXPIRE_IN || 60*60*24*7;

if(!JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined in environment variables")
}

export function generateToken(payload: Omit<JwtPayload, "iat"|"exp">): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRE_IN
  })
}

export function verifyToken(token: string): JwtPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload
    return decoded;
  } catch(error) {
    console.error("JWT verification failed: ", error )
    return null;
  }
}

export function extractTokenFromHeader(authHeader: string | null): string | null {
  if(!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }
  return authHeader.substring(7)
}