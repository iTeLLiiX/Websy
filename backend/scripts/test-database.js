#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testDatabase() {
  console.log('🧪 Testing database connection and data...')

  try {
    // Test database connection
    await prisma.$connect()
    console.log('✅ Database connection successful')

    // Test user queries
    const userCount = await prisma.user.count()
    console.log(`✅ Users in database: ${userCount}`)

    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        emailVerified: true,
        createdAt: true,
      },
      take: 5,
    })

    console.log('✅ Sample users:')
    users.forEach(user => {
      console.log(`  - ${user.name} (${user.email}) - ${user.emailVerified ? 'Verified' : 'Unverified'}`)
    })

    // Test template queries
    const templateCount = await prisma.template.count()
    console.log(`✅ Templates in database: ${templateCount}`)

    const templates = await prisma.template.findMany({
      select: {
        id: true,
        name: true,
        category: true,
        isPremium: true,
        _count: {
          select: {
            pages: true,
          },
        },
      },
      take: 5,
    })

    console.log('✅ Sample templates:')
    templates.forEach(template => {
      console.log(`  - ${template.name} (${template.category}) - ${template.pages} pages - ${template.isPremium ? 'Premium' : 'Free'}`)
    })

    // Test website queries
    const websiteCount = await prisma.website.count()
    console.log(`✅ Websites in database: ${websiteCount}`)

    const websites = await prisma.website.findMany({
      select: {
        id: true,
        name: true,
        domain: true,
        status: true,
        _count: {
          select: {
            pages: true,
          },
        },
      },
      take: 5,
    })

    console.log('✅ Sample websites:')
    websites.forEach(website => {
      console.log(`  - ${website.name} (${website.domain}) - ${website.status} - ${website.pages} pages`)
    })

    // Test page queries
    const pageCount = await prisma.page.count()
    console.log(`✅ Pages in database: ${pageCount}`)

    // Test section queries
    const sectionCount = await prisma.section.count()
    console.log(`✅ Sections in database: ${sectionCount}`)

    // Test subscription queries
    const subscriptionCount = await prisma.subscription.count()
    console.log(`✅ Subscriptions in database: ${subscriptionCount}`)

    const subscriptions = await prisma.subscription.findMany({
      select: {
        id: true,
        planId: true,
        status: true,
        currentPeriodStart: true,
        currentPeriodEnd: true,
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      take: 3,
    })

    console.log('✅ Sample subscriptions:')
    subscriptions.forEach(sub => {
      console.log(`  - ${sub.user.name} - ${sub.planId} - ${sub.status}`)
    })

    // Test analytics queries
    const analyticsCount = await prisma.analytics.count()
    console.log(`✅ Analytics records in database: ${analyticsCount}`)

    // Test file queries
    const fileCount = await prisma.file.count()
    console.log(`✅ Files in database: ${fileCount}`)

    // Test payment queries
    const paymentCount = await prisma.payment.count()
    console.log(`✅ Payments in database: ${paymentCount}`)

    // Test complex queries
    console.log('\n🔍 Testing complex queries...')

    // Get websites with their templates and page counts
    const websitesWithDetails = await prisma.website.findMany({
      include: {
        template: {
          select: {
            name: true,
            category: true,
          },
        },
        pages: {
          select: {
            id: true,
            name: true,
            slug: true,
            isHomePage: true,
            _count: {
              select: {
                sections: true,
              },
            },
          },
        },
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      take: 3,
    })

    console.log('✅ Websites with details:')
    websitesWithDetails.forEach(website => {
      console.log(`  - ${website.name} by ${website.user.name}`)
      console.log(`    Template: ${website.template.name} (${website.template.category})`)
      console.log(`    Pages: ${website.pages.length}`)
      website.pages.forEach(page => {
        console.log(`      - ${page.name} (${page.slug}) - ${page.sections} sections`)
      })
    })

    // Test analytics aggregation
    const analyticsStats = await prisma.analytics.groupBy({
      by: ['event'],
      _count: {
        event: true,
      },
    })

    console.log('✅ Analytics event distribution:')
    analyticsStats.forEach(stat => {
      console.log(`  - ${stat.event}: ${stat._count.event} events`)
    })

    // Test subscription status distribution
    const subscriptionStats = await prisma.subscription.groupBy({
      by: ['status'],
      _count: {
        status: true,
      },
    })

    console.log('✅ Subscription status distribution:')
    subscriptionStats.forEach(stat => {
      console.log(`  - ${stat.status}: ${stat._count.status} subscriptions`)
    })

    console.log('\n🎉 All database tests passed successfully!')
    console.log('\n📊 Database Summary:')
    console.log(`  - Users: ${userCount}`)
    console.log(`  - Templates: ${templateCount}`)
    console.log(`  - Websites: ${websiteCount}`)
    console.log(`  - Pages: ${pageCount}`)
    console.log(`  - Sections: ${sectionCount}`)
    console.log(`  - Subscriptions: ${subscriptionCount}`)
    console.log(`  - Analytics: ${analyticsCount}`)
    console.log(`  - Files: ${fileCount}`)
    console.log(`  - Payments: ${paymentCount}`)

  } catch (error) {
    console.error('❌ Database test failed:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

testDatabase()
