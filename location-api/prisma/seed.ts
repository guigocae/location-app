import "dotenv/config"
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from '../generated/prisma/client';

const connectionString = `${process.env.DATABASE_URL}`;
const adapter = new PrismaPg({ connectionString })
const prisma = new PrismaClient({ adapter });

async function main() {
 console.log('🌱 Seeding RBAC...');

  const rolesData = [
    { name: 'MASTER', desc: 'Full access to everything' },
    { name: 'ADMIN', desc: 'High-level management' },
    { name: 'USER', desc: 'Standard user' },
  ];

  const permsData = [
    { name: 'create_rental', desc: 'Can create rentals' },
    { name: 'manage_user', desc: 'Can manage users' },
    { name: 'rental_condition', desc: "Can see rental's conditions" },
  ];

  // upsert roles
  for (const r of rolesData) {
    await prisma.role.upsert({
      where: { name: r.name },
      update: {},
      create: r,
    });
  }

  // upsert permissions
  for (const p of permsData) {
    await prisma.permission.upsert({
      where: { name: p.name },
      update: {},
      create: p,
    });
  }

  const masterRole = await prisma.role.findUnique({ where: { name: 'MASTER' } });
  const adminRole = await prisma.role.findUnique({ where: { name: 'ADMIN' } });

  if (!masterRole) throw new Error('MASTER role not found after upsert.');
  if (!adminRole) throw new Error('ADMIN role not found after upsert.');
  
  const allPermissions = await prisma.permission.findMany();

  // Associa todas as permissões ao MASTER
  await prisma.rolePermission.createMany({
    data: allPermissions.map(perm => ({
      roleId: masterRole.id,
      permissionId: perm.id,
    })),
    skipDuplicates: true,
  });

  // Associa permissões ao ADMIN
  const adminPerms = await prisma.permission.findMany({
    where: { name: { in: ['create_rental', 'rental_condition'] } },
  });

  await prisma.rolePermission.createMany({
    data: adminPerms.map(p => ({
      roleId: adminRole.id,
      permissionId: p.id,
    })),
    skipDuplicates: true,
  });

  // Cria master user com clerkId vindo da env
  const masterClerkId = process.env.MASTER_CLERK_ID;
  if (!masterClerkId) {
    console.warn('⚠️  MASTER_CLERK_ID não definido. Pulei criação do usuário master.');
    return;
  }

  const masterUser = await prisma.user.upsert({
    where: { clerkId: masterClerkId },
    update: {},
    create: {
      clerkId: masterClerkId,
      roleId: masterRole.id,
      enabled: true,
    },
  });

  console.log('🌱 Seed finalizado!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });