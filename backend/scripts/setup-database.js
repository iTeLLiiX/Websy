#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function setupDatabase() {
  console.log('🚀 Setting up database...')

  try {
    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 10)
    
    const adminUser = await prisma.user.upsert({
      where: { email: 'admin@websitbuilder.ai' },
      update: {},
      create: {
        email: 'admin@websitbuilder.ai',
        name: 'Admin User',
        password: hashedPassword,
        emailVerified: true,
      },
    })

    console.log('✅ Admin user created:', adminUser.email)

    // Create demo user
    const demoPassword = await bcrypt.hash('demo123', 10)
    
    const demoUser = await prisma.user.upsert({
      where: { email: 'demo@websitbuilder.ai' },
      update: {},
      create: {
        email: 'demo@websitbuilder.ai',
        name: 'Demo User',
        password: demoPassword,
        emailVerified: true,
      },
    })

    console.log('✅ Demo user created:', demoUser.email)

    // Create restaurant templates
    const restaurantTemplates = [
      {
        id: 'modern-bistro',
        name: 'Modern Bistro',
        description: 'Elegantes und modernes Design für gehobene Restaurants und Bistros',
        category: 'restaurant',
        thumbnail: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=500&h=300&fit=crop',
        preview: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=600&fit=crop',
        isPremium: false,
        features: ['Speisekarte', 'Reservierung', 'Foto-Galerie', 'Kontakt'],
        tags: ['modern', 'elegant', 'fine-dining', 'bistro'],
        pages: [
          {
            name: 'Homepage',
            slug: '/',
            isHomePage: true,
            sections: [
              {
                type: 'hero',
                content: {
                  title: 'Willkommen in unserem Restaurant',
                  subtitle: 'Kulinarische Genüsse in entspannter Atmosphäre',
                  backgroundImage: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&h=600&fit=crop'
                },
                settings: {},
                order: 0
              },
              {
                type: 'menu-preview',
                content: {
                  title: 'Unsere Spezialitäten',
                  items: [
                    { name: 'Hausgemachte Pasta', price: '€12.50', description: 'Mit frischen Kräutern und Parmesan' },
                    { name: 'Gegrillter Lachs', price: '€18.90', description: 'Mit mediterranem Gemüse' },
                    { name: 'Tiramisu', price: '€6.50', description: 'Hausgemacht nach traditionellem Rezept' }
                  ]
                },
                settings: {},
                order: 1
              }
            ]
          },
          {
            name: 'Speisekarte',
            slug: '/speisekarte',
            isHomePage: false,
            sections: [
              {
                type: 'menu-full',
                content: {
                  categories: [
                    {
                      name: 'Vorspeisen',
                      items: [
                        { name: 'Caprese Salat', price: '€8.90', description: 'Mozzarella, Tomaten, Basilikum' },
                        { name: 'Bruschetta', price: '€7.50', description: 'Gebratenes Brot mit Tomaten' }
                      ]
                    },
                    {
                      name: 'Hauptgerichte',
                      items: [
                        { name: 'Spaghetti Carbonara', price: '€13.90', description: 'Mit Speck und Sahnesoße' },
                        { name: 'Osso Buco', price: '€22.50', description: 'Geschmorte Kalbshaxe mit Risotto' }
                      ]
                    }
                  ]
                },
                settings: {},
                order: 0
              }
            ]
          }
        ]
      },
      {
        id: 'casual-dining',
        name: 'Casual Dining',
        description: 'Entspanntes Design für gemütliche Restaurants und Cafés',
        category: 'restaurant',
        thumbnail: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=500&h=300&fit=crop',
        preview: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&h=600&fit=crop',
        isPremium: false,
        features: ['Speisekarte', 'Kontakt', 'Öffnungszeiten'],
        tags: ['casual', 'gemütlich', 'café', 'restaurant'],
        pages: []
      },
      {
        id: 'fine-dining',
        name: 'Fine Dining',
        description: 'Luxuriöses Design für gehobene Restaurants',
        category: 'restaurant',
        thumbnail: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=500&h=300&fit=crop',
        preview: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&h=600&fit=crop',
        isPremium: true,
        features: ['Speisekarte', 'Reservierung', 'Foto-Galerie', 'Kontakt', 'Weinkarte'],
        tags: ['luxus', 'gehoben', 'fine-dining', 'elegant'],
        pages: []
      }
    ]

    for (const templateData of restaurantTemplates) {
      const { pages, ...templateInfo } = templateData
      
      const template = await prisma.template.upsert({
        where: { id: templateData.id },
        update: {},
        create: templateInfo,
      })

      console.log(`✅ Template created: ${template.name}`)

      // Create pages for template
      for (const pageData of pages) {
        const { sections, ...pageInfo } = pageData
        
        const page = await prisma.page.create({
          data: {
            ...pageInfo,
            templateId: template.id,
            order: 0,
            isPublished: true,
          },
        })

        // Create sections for page
        for (const sectionData of sections) {
          await prisma.section.create({
            data: {
              ...sectionData,
              pageId: page.id,
            },
          })
        }
      }
    }

    // Create demo website
    const demoWebsite = await prisma.website.create({
      data: {
        name: 'Demo Restaurant',
        domain: 'demo-restaurant.websitbuilder.ai',
        subdomain: 'demo-restaurant',
        status: 'published',
        publishedAt: new Date(),
        userId: demoUser.id,
        templateId: 'modern-bistro',
        pages: {
          create: [
            {
              name: 'Homepage',
              slug: '/',
              isHomePage: true,
              order: 0,
              isPublished: true,
              sections: {
                create: [
                  {
                    type: 'hero',
                    content: {
                      title: 'Willkommen im Demo Restaurant',
                      subtitle: 'Kulinarische Genüsse in entspannter Atmosphäre',
                      backgroundImage: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&h=600&fit=crop'
                    },
                    settings: {},
                    order: 0
                  }
                ]
              }
            }
          ]
        },
        settings: {
          create: {
            theme: {
              primaryColor: '#2563eb',
              secondaryColor: '#10b981',
              accentColor: '#f59e0b',
              fontFamily: 'Inter',
              borderRadius: 'medium',
              spacing: 'normal',
              headerStyle: 'standard',
              footerStyle: 'standard',
            },
            seo: {
              title: 'Demo Restaurant',
              description: 'Professionelle Website für Demo Restaurant',
              keywords: ['restaurant', 'demo', 'website'],
              robots: 'index',
            },
            integrations: {},
            aiSettings: {
              voiceEnabled: true,
              autoBranding: true,
              contentGeneration: true,
              imageOptimization: true,
            },
          }
        }
      },
    })

    console.log('✅ Demo website created:', demoWebsite.name)

    // Create subscription for demo user
    await prisma.subscription.create({
      data: {
        userId: demoUser.id,
        planId: 'pro',
        status: 'active',
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        cancelAtPeriodEnd: false,
      },
    })

    console.log('✅ Demo subscription created')

    console.log('🎉 Database setup completed successfully!')
    console.log('\n📋 Demo Credentials:')
    console.log('Admin: admin@websitbuilder.ai / admin123')
    console.log('Demo: demo@websitbuilder.ai / demo123')
    console.log('\n🌐 Demo Website: https://demo-restaurant.websitbuilder.ai')

  } catch (error) {
    console.error('❌ Database setup failed:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

setupDatabase()
