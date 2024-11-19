import { PrismaClient } from '@prisma/client'

const prismaClientSingleton = () => {
  return new PrismaClient({
    log: ['error'],
    datasources: {
      db: {
        url: process.env.DIRECT_URL
      }
    }
  })
}

type GlobalWithPrisma = typeof globalThis & {
  prisma?: ReturnType<typeof prismaClientSingleton>
}

const globalWithPrisma = globalThis as GlobalWithPrisma

export const prisma = globalWithPrisma.prisma ?? prismaClientSingleton()

if (process.env.NODE_ENV !== 'production') globalWithPrisma.prisma = prisma
