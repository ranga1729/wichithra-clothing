'use server'

import { en } from "@/lib/i18n/en";
import { cookies } from "next/headers";

const TOKEN_NAME = process.env.TOKEN_NAME!;

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