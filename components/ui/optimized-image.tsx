import Image from 'next/image'
import { useState } from 'react'

interface OptimizedImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
  priority?: boolean
  fill?: boolean
  sizes?: string
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  className,
  priority = false,
  fill = false,
  sizes,
}: OptimizedImageProps) {
  const [error, setError] = useState(false)

  // Fallback image if loading fails
  if (error) {
    return (
      <div
        className={`bg-muted flex items-center justify-center ${className || ''}`}
        style={width && height ? { width: `${width}px`, height: `${height}px` } : undefined}
      >
        <span className="text-muted-foreground text-xs">Image unavailable</span>
      </div>
    )
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={fill ? undefined : width}
      height={fill ? undefined : height}
      fill={fill}
      className={className}
      priority={priority}
      sizes={sizes}
      quality={85}
      loading={priority ? 'eager' : 'lazy'}
      onError={() => setError(true)}
      placeholder="blur"
      blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mN8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=="
    />
  )
}
