import bcrypt from "bcryptjs"

const SALT_ROUNDS = 12;

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(SALT_ROUNDS);
  const hashedPassword = await bcrypt.hash(password, salt);
  return hashedPassword;
}

export async function comparePassword(
  plainPassword: string,
  hashedPassword: string
) : Promise<boolean> {
  return await bcrypt.compare(plainPassword, hashedPassword);
}