'use client'

import Image from 'next/image'
import { useState, useEffect } from 'react'

interface SafeImageProps {
  src: string | null | undefined
  alt: string
  fallbackSrc?: string
  className?: string
  sizes?: string
  fill?: boolean
  width?: number
  height?: number
  priority?: boolean
}

export default function SafeImage({
  src,
  alt,
  fallbackSrc = 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60',
  className = '',
  sizes,
  fill,
  width,
  height,
  priority = false,
}: SafeImageProps) {
  const [imgSrc, setImgSrc] = useState(src || fallbackSrc)
  const [hasError, setHasError] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  
  // Check if it's a data URL
  const isDataUrl = imgSrc?.startsWith('data:image')
  
  useEffect(() => {
    if (src && src !== imgSrc && !hasError) {
      setImgSrc(src)
      setIsLoading(true)
      setHasError(false)
    }
  }, [src, imgSrc, hasError])

  const handleError = () => {
    if (!hasError) {
      setHasError(true)
      setImgSrc(fallbackSrc)
      setIsLoading(false)
    }
  }

  const handleLoad = () => {
    setIsLoading(false)
  }

  // For data URLs, use regular img tag with better styling
  if (isDataUrl) {
    return (
      <div className={`relative ${className}`}>
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            <div className="animate-pulse">
              <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
            </div>
          </div>
        )}
        <img
          src={imgSrc || fallbackSrc}
          alt={alt}
          className={`${className} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
          style={fill ? { 
            objectFit: 'cover', 
            width: '100%', 
            height: '100%',
            position: fill ? 'absolute' : 'relative',
            top: 0,
            left: 0
          } : { width, height }}
          onError={handleError}
          onLoad={handleLoad}
        />
      </div>
    )
  }

  return (
    <div className={`relative ${fill ? 'w-full h-full' : ''}`}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg z-10">
          <div className="animate-pulse">
            <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
          </div>
        </div>
      )}
      <Image
        src={imgSrc || fallbackSrc}
        alt={alt}
        className={`${className} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300 rounded-lg`}
        sizes={sizes}
        fill={fill}
        width={width}
        height={height}
        onError={handleError}
        onLoad={handleLoad}
        priority={priority}
        unoptimized={hasError}
        style={{
          objectFit: 'cover'
        }}
      />
    </div>
  )
}
