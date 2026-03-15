"use server";

import prisma from "@/app/lib/db";
import { auth } from "@/app/lib/auth";
import { revalidatePath } from "next/cache";

export async function saveDashboardColumns(columns: string[]) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      dashboardColumns: columns.join(',')
    }
  });

  revalidatePath("/dashboard");
}
