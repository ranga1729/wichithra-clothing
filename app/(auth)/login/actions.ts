'use server'

import { prisma } from "@/lib/prisma";
import { LoginForm, loginSchema } from "@/schemas/authSchemas";
import { ApiResponse, AuthResponse } from "@/types/auth";
import { generateToken } from "@/utils/jwt";
import { comparePassword } from "@/utils/passwordHashing";
import { cookies } from "next/headers";
import { ZodError } from "zod";

export async function loginUser(formData: LoginForm) : Promise<ApiResponse<AuthResponse>> {
  try {
    const validatedData = loginSchema.parse(formData);
    const user = await prisma.user.findUnique({
      where: { email: validatedData.email},
      select: {
        id: true,
        email: true,
        passwordHash: true,
        firstName: true,
        lastName: true,
        role: true,
      }
    })

    if(!user) {
      return {
        success: false,
        message: "Invalid email or password",
        error: "INVALID_CREDENTIALS"
      }
    }

    const isPasswordValid = await comparePassword(formData.password, user.passwordHash);

    if(!isPasswordValid) {
      return {
        success: false,
        message: "Invalid email or password",
        error: "INVALID_CREDENTIALS",
      }
    }

    const token = generateToken({
      userId: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role.name,
    });

    (await cookies()).set("wichithra-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/"
    });

    return {
      success: true,
      message: "Logging successful",
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
        },
        token
      }
    };

  } catch(error) {
    if (error instanceof ZodError) {
      return {
        success: false,
        message: "Validation Failed",
        error: error.issues[0].message || "Invalid input data"
      };
    }
    
    return {
      success: false,
      message: "An error occurred during registration",
      error: "INTERNAL_SERVER_ERROR"
    };
  }
}