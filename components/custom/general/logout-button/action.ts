'use server'

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const TOKEN_NAME = process.env.TOKEN_NAME!;

interface Props {
  redirectUrl?: string;
}

export async function logoutAction() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete(TOKEN_NAME);

    return {
      success: true,
      message: "Logged out successfully"
    }
  } catch(error) {
    return {
      success: false,
      message: "Logout failed"
    }
  }
}