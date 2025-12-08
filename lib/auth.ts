import { JwtPayload, UserRole } from "@/types/auth";
import { jwtDecode } from "jwt-decode";
import jwt from "jsonwebtoken"
import { prisma } from "./prisma";

const JWT_SECRET = process.env.JWT_SECRET!;

export function decodeToken(token: string): JwtPayload|null {
  try {
    const decoded = jwtDecode<JwtPayload>(token)

    // Check if token is expired
    if (decoded.exp && decoded.exp * 1000 < Date.now()) {
      return null;
    }

    return decoded;
  } catch(error) {
    return null;
  }
}

export function verifyToken(token: string) : JwtPayload|null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    return decoded;
  } catch(error) {
    return null;
  }
}

export function hasRequiredRole(userRole: UserRole, requiredRoles: UserRole[]): boolean {
  return requiredRoles.includes(userRole);
}

export async function getUserFromDatabase(email: string) {
  const user = await prisma.user.findUnique({
    where: { email: email},
    select: {
       id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: {
          select: {
            id: true,
            name: true,
          }
        },
    }
  })
  return user;
}