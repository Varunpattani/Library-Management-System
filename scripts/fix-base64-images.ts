const { PrismaClient } = require('../src/generated/prisma')

const prisma = new PrismaClient()

async function fixBase64Images() {
  console.log('Looking for items with base64 image URLs...')
  
  // Find all items where imageUrl starts with 'data:image'
  const itemsWithBase64 = await prisma.item.findMany({
    where: {
      imageUrl: {
        startsWith: 'data:image'
      }
    }
  })
  
  console.log(`Found ${itemsWithBase64.length} items with base64 images`)
  
  for (const item of itemsWithBase64) {
    console.log(`Fixing item: ${item.title} (ID: ${item.itemId})`)
    
    // You can either set to null or use a placeholder image
    // Option 1: Set to null (will use default fallback)
    await prisma.item.update({
      where: { itemId: item.itemId },
      data: { 
        imageUrl: null 
      }
    })
    
    // Option 2: Use a specific placeholder based on item type
    // const placeholderUrl = getPlaceholderUrl(item.itemType)
    // await prisma.item.update({
    //   where: { itemId: item.itemId },
    //   data: { imageUrl: placeholderUrl }
    // })
    
    console.log(`  ✓ Fixed`)
  }
  
  console.log('Done!')
}

// Helper function for Option 2
function getPlaceholderUrl(itemType: string): string {
  const placeholders: Record<string, string> = {
    BOOK: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60',
    JOURNAL: 'https://images.unsplash.com/photo-1495020689067-958852a7765e?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60',
    DVD: 'https://images.unsplash.com/photo-1512149177596-f817c7ef5d4c?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60',
    CD: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60',
    MAGAZINE: 'https://images.unsplash.com/photo-1521295121783-8a321d551282?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60',
    MULTIMEDIA: 'https://images.unsplash.com/photo-1502674252220-1347484a8c9b?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60',
    EBOOK: 'https://images.unsplash.com/photo-1550399105-c4db5fb85c18?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60',
    AUDIOBOOK: 'https://images.unsplash.com/photo-1619985632461-f33748ef8f3e?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60'
  }
  return placeholders[itemType] || placeholders.BOOK
}

fixBase64Images()
  .catch((e) => {
    console.error('Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
