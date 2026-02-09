import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../lib/password";

const prisma = new PrismaClient();

const SEED_DRIVERS = [
  { fullName: "Alex Rivera" },
  { fullName: "Jordan Chen" },
  { fullName: "Sam Williams" },
  { fullName: "Casey Moore" },
  { fullName: "Riley Davis" },
  { fullName: "Morgan Taylor" },
  { fullName: "Jamie Lee" },
  { fullName: "Quinn Adams" },
];

const SEED_TRACKS = [
  { name: "KartWorld Main", lengthMeters: 800, location: "Downtown" },
  { name: "Speedway North", lengthMeters: 650, location: "Industrial Park" },
  { name: "Thunder Alley", lengthMeters: 720, location: null },
];

async function main() {
  const email = process.env.SEED_ADMIN_EMAIL || "admin@drs.com";
  const password = process.env.SEED_ADMIN_PASSWORD || "admin123";

  const existingAdmin = await prisma.adminUser.findUnique({
    where: { email },
  });

  if (!existingAdmin) {
    const passwordHash = await hashPassword(password);
    const admin = await prisma.adminUser.create({
      data: { email, passwordHash },
    });
    console.log(`Created admin user: ${admin.email}`);
    console.log(`Default password: ${password}`);
    console.log("Please change the password after first login.");
  } else {
    console.log(`Admin user with email ${email} already exists.`);
  }

  const driverCount = await prisma.driver.count();
  if (driverCount === 0) {
    await prisma.driver.createMany({
      data: SEED_DRIVERS,
    });
    console.log(`Created ${SEED_DRIVERS.length} drivers.`);
  } else {
    console.log(`Drivers already exist (${driverCount}). Skipping driver seed.`);
  }

  const trackCount = await prisma.track.count();
  if (trackCount === 0) {
    await prisma.track.createMany({
      data: SEED_TRACKS,
    });
    console.log(`Created ${SEED_TRACKS.length} tracks.`);
  } else {
    console.log(`Tracks already exist (${trackCount}). Skipping track seed.`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
