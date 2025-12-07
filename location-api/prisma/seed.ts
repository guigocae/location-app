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
  const allPermissions = await prisma.permission.findMany();

  if (!masterRole) throw new Error('MASTER role not found after upsert.');

  // Associa permissões ao MASTER sem upsert composto
  for (const perm of allPermissions) {
    const exists = await prisma.rolePermission.findFirst({
      where: { roleId: masterRole.id, permissionId: perm.id },
    });
    if (!exists) {
      await prisma.rolePermission.create({
        data: { roleId: masterRole.id, permissionId: perm.id },
      });
    }
  }

  // Associa permissões ao ADMIN
  const adminRole = await prisma.role.findUnique({ where: { name: 'ADMIN' } });
  const adminPermission = await prisma.permission.findUnique({ where: { name: 'create_rental' } });

  if (!adminRole) throw new Error('ADMIN role not found after upsert.');
  if (!adminPermission) throw new Error('ADMIN permission not found after upsert.');

  await prisma.rolePermission.create({
    data: { roleId: adminRole.id, permissionId: adminPermission.id },
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
      enabled: true,
    },
  });

  // Associa user -> role (evita duplicata)
  const userRoleExists = await prisma.userRole.findFirst({
    where: { userId: masterUser.id, roleId: masterRole.id },
  });

  if (!userRoleExists) {
    await prisma.userRole.create({
      data: { userId: masterUser.id, roleId: masterRole.id },
    });
  }

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