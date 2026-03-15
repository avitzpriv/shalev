import prisma from "./db";

export async function getConfig(key: string, defaultValue: string): Promise<string[]> {
  const config = await prisma.configItem.findUnique({ where: { key } });
  if (!config) return defaultValue.split(',').map((s: string) => s.trim());
  return config.value.split(',').map((s: string) => s.trim());
}
