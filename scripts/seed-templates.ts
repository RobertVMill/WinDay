const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

const initialTemplates = {
  Workday: `STANDARD WORKING DAY
- 5am [WJG] Wake Jump Grateful (Get grateful, get excited)
- 5-5:05am [SD] Stretch Deep (Find depth, find energy)
- 5:05-5:30 TEM Third-Eye Meditate (Find clarity, find calm)
- 5:30-6:30 WCW (Find pain, attack pain)
- 6:30-6:40 WT Wash Thorough (Hygeine hygeine)
- 6:40-6:50 DB Dress Best (Find comfort, find confidence)
- 6:50-7 IW Inspiring Walk (Find pace, focus)
- 7-9am Coding Course (Keep your fingers moving)
- 9am-1pm Data analysis (Hangout with the data)
- 1pm-1:30pm Long Walk (Get your blood moving)
- 1:30-3pm Read about the AI industry
- 3-5pm Coding (Keep your fingers moving)
- 5pm-6pm Long Walk (Get your blood moving)
- 6-7 World-Class Dinner (Go slow, make it pretty)
- 7-8:20pm Coding (Keep your fingers moving)
- 8:20-8:30pm Nidra (Exhale exhale)
- 8:30-8:40pm CSW Change Stretch Wash
- 8:40-8:50pm Read til sleepy
- 8:50-9:00pm TW Three Wins
- 9:00pm Sleep Deep (Ease into it)`,
  'Reading Day': `READING DAY
- 5am [WJG] Wake Jump Grateful
- 5-5:05am [SD] Stretch Deep
- 5:05-5:30 TEM Third-Eye Meditate
- 5:30-6:30 WCW
- 6:30-6:40 WT Wash Thorough
- 6:40-6:50 DB Dress Best
- 6:50-7 IW Inspiring Walk
- 7am to 2pm Read
- 2pm to 3pm long walk
- 3pm to 6pm Read
- 6-7 World-Class Dinner
- 7-8:20pm Coding Leisure
- 8:20-8:30pm Nidra
- 8:30-8:40pm CSW Change Stretch Wash
- 8:40-8:50pm Read til sleepy
- 8:50-9:00pm TW Three Wins
- 9:00pm Sleep Deep`,
  'Chill Day': `CHILL DAY
- Sleep in a little
- Enjoy a leisurely breakfast
- Light exercise or yoga
- Read or pursue hobbies
- Connect with friends or family
- Mindful relaxation
- Early and restful sleep`,
  'Vacation Day': `VACATION DAY
- Wake naturally
- Explore new places
- Try local cuisine
- Take lots of photos
- Meet new people
- Relax and unwind
- Journal about experiences`
}

async function main() {
  console.log('Start seeding templates...')
  
  for (const [name, content] of Object.entries(initialTemplates)) {
    const template = await prisma.template.upsert({
      where: { name },
      update: { content },
      create: { name, content },
    })
    console.log(`Upserted template: ${template.name}`)
  }
  
  console.log('Seeding completed.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
