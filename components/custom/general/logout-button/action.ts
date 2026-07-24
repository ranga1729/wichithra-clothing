'use server'

import { en } from "@/lib/i18n/en";
import { cookies } from "next/headers";
import { getUserFromCookie } from "@/lib/get-cookie";
import { ApiResponse, JwtPayload } from "@/types/auth-types";

const TOKEN_NAME = process.env.TOKEN_NAME!;

export async function getCurrentUser(): Promise<ApiResponse<JwtPayload>> {
  try {
    const user = await getUserFromCookie();

    if (!user) {
      return { success: false, error: en.unauthorized_not_logged_in };
    }

    return {
      success: true,
      data: {
        userId: user.userId,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
      },
    };
  } catch (error) {
    console.error(error);
    return { success: false, error: en.something_went_wrong };
  }
}

export async function logoutAction() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete(TOKEN_NAME);

    return {
      success: true,
      message: en.logged_out_successfully
    }
  } catch(error) {
    return {
      success: false,
      message: en.logout_failed
    }
  }
}