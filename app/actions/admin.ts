"use server";

import prisma from "@/app/lib/db";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { auth } from "@/app/lib/auth";

async function ensureAdmin() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }
}

export async function createUser(formData: FormData) {
  await ensureAdmin();
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const role = formData.get("role") as any;
  const phoneNumber = formData.get("phoneNumber") as string;
  const twoFactorEnabled = formData.get("twoFactorEnabled") === "on";

  const hashedPassword = await bcrypt.hash(password, 10);

  await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      role,
      phoneNumber,
      twoFactorEnabled,
    },
  });

  revalidatePath("/admin");
}

export async function deleteUser(userId: string) {
  await ensureAdmin();
  
  // Prevent deleting oneself
  const session = await auth();
  if (session?.user?.id === userId) {
    throw new Error("Cannot delete your own account");
  }

  await prisma.user.delete({
    where: { id: userId },
  });

  revalidatePath("/admin");
}

export async function updateUserRole(userId: string, role: any) {
  await ensureAdmin();
  await prisma.user.update({
    where: { id: userId },
    data: { role },
  });
  revalidatePath("/admin");
}

export async function resetPassword(userId: string, newPassword: any) {
  await ensureAdmin();
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({
    where: { id: userId },
    data: { password: hashedPassword },
  });
  revalidatePath("/admin");
}
