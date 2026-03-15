"use server";

import prisma from "@/app/lib/db";
import bcrypt from "bcryptjs";
import { auth } from "@/app/lib/auth";

export async function changePasswordAction(newPassword: string) {
  const session = await auth();
  const userId = (session?.user as any)?.id;

  if (!userId) {
    return { error: "לא מחובר למערכת" };
  }

  if (newPassword.length < 8) {
    return { error: "הסיסמה חייבת להכיל לפחות 8 תווים" };
  }

  const hashed = await bcrypt.hash(newPassword, 12);

  await prisma.user.update({
    where: { id: userId },
    data: {
      password: hashed,
      mustChangePassword: false,
    },
  });

  return { success: true };
}
