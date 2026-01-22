import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../lib/password";

const prisma = new PrismaClient();

async function main() {
  const email = process.env.SEED_ADMIN_EMAIL || "admin@drs-cup.com";
  const password = process.env.SEED_ADMIN_PASSWORD || "ChangeMe123!";

  const existingAdmin = await prisma.adminUser.findUnique({
    where: { email },
  });

  if (existingAdmin) {
    console.log(`Admin user with email ${email} already exists.`);
    return;
  }

  const passwordHash = await hashPassword(password);

  const admin = await prisma.adminUser.create({
    data: {
      email,
      passwordHash,
    },
  });

  console.log(`Created admin user: ${admin.email}`);
  console.log(`Default password: ${password}`);
  console.log("Please change the password after first login.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
