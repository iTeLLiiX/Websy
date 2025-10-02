const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function setupTestData() {
  console.log('🧪 Setting up test data...')

  try {
    // Create test user
    const testUser = await prisma.user.upsert({
      where: { email: 'demo@websy.de' },
      update: {},
      create: {
        email: 'demo@websy.de',
        name: 'Demo User',
        password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
        emailVerified: true
      }
    })

    console.log('✅ Test user created:', testUser.email)

    // Create test subscription (Free)
    const subscription = await prisma.subscription.upsert({
      where: { userId: testUser.id },
      update: {},
      create: {
        userId: testUser.id,
        plan: 'FREE',
        status: 'ACTIVE',
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        cancelAtPeriodEnd: false
      }
    })

    console.log('✅ Free subscription created')

    // Create test website
    const website = await prisma.website.create({
      data: {
        userId: testUser.id,
        name: 'Mein Restaurant',
        status: 'draft',
        templateId: 'modern-bistro'
      }
    })

    console.log('✅ Test website created:', website.name)

    // Create test pages
    const pages = [
      {
        websiteId: website.id,
        name: 'Homepage',
        slug: '/',
        isHomePage: true,
        isPublished: true,
        order: 0
      },
      {
        websiteId: website.id,
        name: 'Speisekarte',
        slug: '/speisekarte',
        isHomePage: false,
        isPublished: true,
        order: 1
      },
      {
        websiteId: website.id,
        name: 'Kontakt',
        slug: '/kontakt',
        isHomePage: false,
        isPublished: true,
        order: 2
      }
    ]

    for (const pageData of pages) {
      await prisma.page.create({
        data: pageData
      })
    }

    console.log('✅ Test pages created')

    // Create test sections
    const homepage = await prisma.page.findFirst({
      where: { websiteId: website.id, isHomePage: true }
    })

    if (homepage) {
      const sections = [
        {
          pageId: homepage.id,
          type: 'hero',
          content: JSON.stringify({
            title: 'Willkommen in unserem Restaurant',
            subtitle: 'Kulinarische Genüsse in entspannter Atmosphäre',
            backgroundImage: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&h=600&fit=crop',
            ctaText: 'Jetzt reservieren',
            ctaLink: '/reservierung'
          }),
          settings: JSON.stringify({
            backgroundColor: '#ffffff',
            textColor: '#333333',
            buttonColor: '#2563eb'
          }),
          order: 0
        },
        {
          pageId: homepage.id,
          type: 'menu-preview',
          content: JSON.stringify({
            title: 'Unsere Spezialitäten',
            items: [
              { name: 'Hausgemachte Pasta', price: '€12.50', description: 'Mit frischen Kräutern und Parmesan' },
              { name: 'Gegrillter Lachs', price: '€18.90', description: 'Mit mediterranen Gemüse' },
              { name: 'Tiramisu', price: '€6.50', description: 'Hausgemacht nach traditionellem Rezept' }
            ]
          }),
          settings: JSON.stringify({
            backgroundColor: '#f8fafc',
            textColor: '#333333'
          }),
          order: 1
        }
      ]

      for (const sectionData of sections) {
        await prisma.section.create({
          data: sectionData
        })
      }

      console.log('✅ Test sections created')
    }

    console.log('🎉 Test data setup completed!')
    console.log('📧 Demo Login: demo@websy.de')
    console.log('🔑 Demo Password: password')

  } catch (error) {
    console.error('❌ Error setting up test data:', error)
  } finally {
    await prisma.$disconnect()
  }
}

setupTestData()
