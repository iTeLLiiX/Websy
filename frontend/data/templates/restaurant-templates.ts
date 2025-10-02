export const restaurantTemplates = [
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
            }
          },
          {
            type: 'menu-preview',
            content: {
              title: 'Unsere Spezialitäten',
              items: [
                { name: 'Hausgemachte Pasta', price: '€12.50', description: 'Mit frischen Kräutern und Parmesan' },
                { name: 'Gegrillter Lachs', price: '€18.90', description: 'Mit mediterranen Gemüse' },
                { name: 'Tiramisu', price: '€6.50', description: 'Hausgemacht nach traditionellem Rezept' }
              ]
            }
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
            }
          }
        ]
      }
    ]
  },
  {
    id: 'traditional-gastronomy',
    name: 'Traditionelle Gastronomie',
    description: 'Klassisches Design für traditionelle deutsche Gaststätten und Gasthäuser',
    category: 'restaurant',
    thumbnail: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=500&h=300&fit=crop',
    preview: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=800&h=600&fit=crop',
    isPremium: false,
    features: ['Speisekarte', 'Öffnungszeiten', 'Galerie', 'Kontakt'],
    tags: ['traditional', 'german', 'gasthaus', 'beer'],
    pages: []
  },
  {
    id: 'cozy-cafe',
    name: 'Gemütliches Café',
    description: 'Warmes und einladendes Design für Cafés und Kaffeeröstereien',
    category: 'cafe',
    thumbnail: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=500&h=300&fit=crop',
    preview: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800&h=600&fit=crop',
    isPremium: false,
    features: ['Kaffeekarte', 'Kuchen', 'Events', 'Reservierung'],
    tags: ['cozy', 'cafe', 'coffee', 'cake'],
    pages: []
  },
  {
    id: 'fast-food',
    name: 'Fast-Food Restaurant',
    description: 'Dynamisches Design für Fast-Food Restaurants und Imbisse',
    category: 'fast-food',
    thumbnail: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=500&h=300&fit=crop',
    preview: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=800&h=600&fit=crop',
    isPremium: false,
    features: ['Speisekarte', 'Lieferung', 'QR-Menü', 'Öffnungszeiten'],
    tags: ['fast-food', 'delivery', 'quick', 'modern'],
    pages: []
  },
  {
    id: 'fine-dining',
    name: 'Fine Dining',
    description: 'Luxuriöses Design für Sterne-Restaurants und gehobene Küche',
    category: 'fine-dining',
    thumbnail: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=500&h=300&fit=crop',
    preview: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=600&fit=crop',
    isPremium: true,
    features: ['Tasting Menu', 'Weinkarte', 'Reservierung', 'Events'],
    tags: ['luxury', 'fine-dining', 'wine', 'exclusive'],
    pages: []
  }
]