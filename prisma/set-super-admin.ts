import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const superAdminCount = await prisma.adminUser.count({
    where: { role: "SUPER_ADMIN" },
  });

  if (superAdminCount > 0) {
    console.log("Super Admin already exists. Nothing to do.");
    return;
  }

  const oldest = await prisma.adminUser.findFirst({
    orderBy: { createdAt: "asc" },
  });

  if (!oldest) {
    console.log("No admin users found. Run the full seed first.");
    return;
  }

  await prisma.adminUser.update({
    where: { id: oldest.id },
    data: { role: "SUPER_ADMIN" },
  });

  console.log(`Set ${oldest.email} as SUPER_ADMIN`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
