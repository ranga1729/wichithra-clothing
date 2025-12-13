import { cookies } from 'next/headers';
import { jwtDecode } from 'jwt-decode';
import { JwtPayload } from '@/types/auth-types';

export async function getUserFromCookie(): Promise<JwtPayload | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('wichithra-token')?.value;

    if (!token) {
      return null;
    }

    const decoded = jwtDecode<JwtPayload>(token);
    
    if (decoded.exp && decoded.exp * 1000 < Date.now()) {
      return null;
    }

    return decoded;
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
}