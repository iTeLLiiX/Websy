import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seeding...')

  // Create restaurant templates
  const templates = [
    {
      id: 'modern-bistro',
      name: 'Modern Bistro',
      description: 'Elegantes und modernes Design für gehobene Restaurants und Bistros',
      category: 'restaurant',
      thumbnail: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=500&h=300&fit=crop',
      preview: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=600&fit=crop',
      isPremium: false,
      features: JSON.stringify(['Speisekarte', 'Reservierung', 'Foto-Galerie', 'Kontakt']),
      tags: JSON.stringify(['modern', 'elegant', 'fine-dining', 'bistro']),
      pages: {
        create: [
          {
            name: 'Homepage',
            slug: '/',
            isHomePage: true,
            isPublished: true,
            order: 0,
            sections: {
              create: [
                {
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
            }
          },
          {
            name: 'Speisekarte',
            slug: '/speisekarte',
            isHomePage: false,
            isPublished: true,
            order: 1,
            sections: {
              create: [
                {
                  type: 'menu-full',
                  content: JSON.stringify({
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
                  }),
                  settings: JSON.stringify({
                    backgroundColor: '#ffffff',
                    textColor: '#333333'
                  }),
                  order: 0
                }
              ]
            }
          }
        ]
      }
    },
    {
      id: 'traditional-gastronomy',
      name: 'Traditionelle Gastronomie',
      description: 'Klassisches Design für traditionelle deutsche Gaststätten und Gasthäuser',
      category: 'restaurant',
      thumbnail: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=500&h=300&fit=crop',
      preview: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=800&h=600&fit=crop',
      isPremium: false,
      features: JSON.stringify(['Speisekarte', 'Öffnungszeiten', 'Galerie', 'Kontakt']),
      tags: JSON.stringify(['traditional', 'german', 'gasthaus', 'beer']),
      pages: {
        create: []
      }
    },
    {
      id: 'cozy-cafe',
      name: 'Gemütliches Café',
      description: 'Warmes und einladendes Design für Cafés und Kaffeeröstereien',
      category: 'cafe',
      thumbnail: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=500&h=300&fit=crop',
      preview: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800&h=600&fit=crop',
      isPremium: false,
      features: JSON.stringify(['Kaffeekarte', 'Kuchen', 'Events', 'Reservierung']),
      tags: JSON.stringify(['cozy', 'cafe', 'coffee', 'cake']),
      pages: {
        create: []
      }
    },
    {
      id: 'fast-food',
      name: 'Fast-Food Restaurant',
      description: 'Dynamisches Design für Fast-Food Restaurants und Imbisse',
      category: 'fast-food',
      thumbnail: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=500&h=300&fit=crop',
      preview: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=800&h=600&fit=crop',
      isPremium: false,
      features: JSON.stringify(['Speisekarte', 'Lieferung', 'QR-Menü', 'Öffnungszeiten']),
      tags: JSON.stringify(['fast-food', 'delivery', 'quick', 'modern']),
      pages: {
        create: []
      }
    },
    {
      id: 'fine-dining',
      name: 'Fine Dining',
      description: 'Luxuriöses Design für Sterne-Restaurants und gehobene Küche',
      category: 'fine-dining',
      thumbnail: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=500&h=300&fit=crop',
      preview: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=600&fit=crop',
      isPremium: true,
      features: JSON.stringify(['Tasting Menu', 'Weinkarte', 'Reservierung', 'Events']),
      tags: JSON.stringify(['luxury', 'fine-dining', 'wine', 'exclusive']),
      pages: {
        create: []
      }
    }
  ]

  // Create templates
  for (const templateData of templates) {
    const { pages, ...templateInfo } = templateData
    
    const template = await prisma.template.upsert({
      where: { id: templateInfo.id },
      update: templateInfo,
      create: templateInfo,
    })

    console.log(`✅ Created template: ${template.name}`)
  }

  console.log('🎉 Database seeding completed!')
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
