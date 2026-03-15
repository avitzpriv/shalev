"use server";

import { signIn } from "@/app/lib/auth";
import prisma from "@/app/lib/db";
import bcrypt from "bcryptjs";
import { AuthError } from "next-auth";

export async function loginAction(formData: any) {
  const { email, password } = formData;

  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user || !user.password) {
      return { error: "אימייל או סיסמה שגויים" };
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return { error: "אימייל או סיסמה שגויים" };
    }

    if (user.twoFactorEnabled) {
      // Generate code
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      await prisma.user.update({
        where: { id: user.id },
        data: {
          twoFactorCode: code,
          twoFactorExpires: expires,
        },
      });

      // MOCK: Send SMS
      console.log(`[SMS MOCK] To: ${user.phoneNumber || user.email}, Code: ${code}`);
      
      return { twoFactor: true, email };
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    return { success: true };
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "שגיאת התחברות" };
    }
    throw error;
  }
}

export async function verify2FAAction(email: string, code: string, password: any) {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user || !user.twoFactorCode || !user.twoFactorExpires) {
      return { error: "קוד לא בתוקף" };
    }

    if (new Date() > user.twoFactorExpires) {
      return { error: "הקוד פג תוקף" };
    }

    if (user.twoFactorCode !== code) {
      return { error: "קוד שגוי" };
    }

    // Clear code and update lastLoginAt
    await prisma.user.update({
      where: { id: user.id },
      data: {
        twoFactorCode: null,
        twoFactorExpires: null,
        lastLoginAt: new Date(),
      },
    });

    await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    return { success: true };
  } catch (error) {
    return { error: "שגיאת אימות" };
  }
}
