'use server'

import { en } from "@/lib/i18n/en";
import { prisma } from "@/lib/prisma";
import { LoginForm, loginSchema } from "@/schemas/authSchemas";
import { ApiResponse, AuthResponse } from "@/types/auth-types";
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
        message: en.messages.invalid_email_or_password,
      }
    }

    const isPasswordValid = await comparePassword(formData.password, user.passwordHash);

    if(!isPasswordValid) {
      return {
        success: false,
        message: en.messages.invalid_email_or_password,
      }
    }

    const token = generateToken({
      userId: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role.name,
    });

    (await cookies()).set(en.common.token_name, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/"
    });

    return {
      success: true,
      message: en.messages.loggin_successful,
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
        message: en.messages.validation_failed,
        error: error.issues[0].message || en.messages.validation_failed
      };
    }
    
    return {
      success: false,
      message: en.messages.something_went_wrong,
      error: en.messages.internal_server_error
    };
  }
}