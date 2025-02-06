const { PrismaClient, TenantType } = require('@prisma/client')
const { hash } = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  // Ana tenant oluştur
  const mainTenant = await prisma.tenant.upsert({
    where: { domain: 'localhost' },
    update: {},
    create: {
      name: 'Ana Bayi',
      domain: 'localhost',
      title: 'Ana Bayi Yönetim Paneli',
      tenantType: TenantType.HOST,
      credit: 1000
    },
  })

  // Test tenant oluştur
  const testTenant = await prisma.tenant.upsert({
    where: { domain: 'test.localhost' },
    update: {},
    create: {
      name: 'Test Bayi',
      domain: 'test.localhost',
      title: 'Test Bayi Paneli',
      tenantType: TenantType.CUSTOMER,
      credit: 100
    },
  })

  // Ana tenant için admin kullanıcı
  const adminPassword = await hash('admin123', 10)
  await prisma.user.upsert({
    where: { email: 'admin@localhost' },
    update: {},
    create: {
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@localhost',
      username: 'admin',
      password: adminPassword,
      tenantId: mainTenant.id,
    },
  })

  // Test tenant için test kullanıcı
  const testPassword = await hash('test123', 10)
  await prisma.user.upsert({
    where: { email: 'test@test.localhost' },
    update: {},
    create: {
      firstName: 'Test',
      lastName: 'User',
      email: 'test@test.localhost',
      username: 'testuser',
      password: testPassword,
      tenantId: testTenant.id,
    },
  })

  console.log('Seed tamamlandı! 🌱')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  }) 