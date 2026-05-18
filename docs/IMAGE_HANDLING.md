# Image Handling Guide for Library Management System

## Overview
This guide explains how to configure image handling when adding items to your library catalog, particularly when copying image URLs from Google or other sources.

## Configuration Options

### Option 1: Allow All External Images (Recommended for Development)
To allow images from ANY external URL, uncomment the first configuration in `next.config.ts`:

```typescript
const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      },
    ],
  },
};
```

**Pros:**
- Works with any image URL immediately
- No need to update config when adding new image sources
- Perfect for development and internal use

**Cons:**
- Less secure (allows images from any domain)
- Should be reviewed before production deployment

### Option 2: Specific Domains Only (Current Configuration)
The current configuration allows images only from pre-approved domains. This is more secure but requires updating the config when new domains are needed.

## Common Image Sources

### Google Images
When copying images from Google, you might encounter these domains:
- `encrypted-tbn0.gstatic.com`
- `encrypted-tbn1.gstatic.com`
- `encrypted-tbn2.gstatic.com`
- `encrypted-tbn3.gstatic.com`
- `books.google.com`
- `*.googleusercontent.com`

### Best Practice: Use Direct Image URLs
Instead of copying the Google proxy URL, try to:
1. Click on the image in Google Images
2. Visit the source website
3. Right-click the image and copy the direct image URL

This often provides a more stable and higher-quality image URL.

## Using the SafeImage Component

For better error handling, you can use the `SafeImage` component instead of the regular Next.js Image component:

```tsx
import SafeImage from '@/components/ui/safe-image'

<SafeImage
  src={item.imageUrl || ''}
  alt={item.title}
  fill
  className="object-cover"
  sizes="(max-width: 768px) 100vw, 50vw"
  fallbackSrc="/images/default-book-cover.jpg"
/>
```

This component will automatically fall back to a default image if the provided URL fails to load.

## Troubleshooting

### Image Not Displaying
1. Check if the domain is in the allowed list in `next.config.ts`
2. Verify the image URL is accessible (test in browser)
3. Check browser console for specific error messages
4. Consider using Option 1 configuration during development

### After Updating Configuration
After modifying `next.config.ts`, you need to:
1. Stop the development server (Ctrl+C)
2. Run `npm run dev` again
3. The new configuration will take effect

## Security Considerations

For production deployments:
1. Review all allowed domains
2. Consider implementing image upload to your own CDN
3. Validate image URLs on the server side
4. Implement proper Content Security Policy headers
