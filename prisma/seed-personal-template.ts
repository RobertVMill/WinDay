import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // First create a test user if it doesn't exist
  const user = await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      email: 'test@example.com',
      name: 'Test User',
      password: '$2a$10$K8GpywXx6E5G/x2ZY.HNkO6gL2QnGI9TY32Py1mF7MCRyIWBpTmOy' // password123
    },
  })

  // Create personal template
  const template = await prisma.template.create({
    data: {
      name: 'Personal Daily Journal',
      description: 'My personal daily journal template',
      content: '',
      isPublic: false,
      userId: user.id,
      fields: {
        create: [
          {
            name: 'gratitude',
            label: 'What are you grateful for today?',
            type: 'textarea',
            required: true,
            order: 0,
            default: '',
            placeholder: 'Express your gratitude...'
          },
          {
            name: 'goals',
            label: 'What are your goals for today?',
            type: 'textarea',
            required: true,
            order: 1,
            default: '',
            placeholder: 'List your goals...'
          },
          {
            name: 'reflection',
            label: 'Daily Reflection',
            type: 'textarea',
            required: false,
            order: 2,
            default: '',
            placeholder: 'Reflect on your day...'
          }
        ]
      }
    },
  })

  console.log('Created template:', template)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
