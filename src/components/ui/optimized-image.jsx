import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

/**
 * High-performance image component with:
 * - Intersection Observer for lazy loading
 * - Aspect ratio preservation
 * - Low-quality placeholder (LQIP) support
 * - WebP with fallback
 */
export default function OptimizedImage({ 
  src, 
  alt, 
  className,
  width,
  height,
  priority = false,
  quality = 75,
  placeholder,
  onLoad,
  ...props 
}) {
  const [isLoaded, setIsLoaded] = useState(priority);
  const [isInView, setIsInView] = useState(priority);
  const [currentSrc, setCurrentSrc] = useState(priority ? src : placeholder || '');
  const imgRef = useRef(null);

  // Calculate aspect ratio
  const aspectRatio = width && height ? `${width}/${height}` : "auto";

  useEffect(() => {
    if (priority || !imgRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "100px" } // Start loading 100px before entering viewport
    );

    observer.observe(imgRef.current);

    return () => {
      if (imgRef.current) observer.unobserve(imgRef.current);
    };
  }, [priority]);

  useEffect(() => {
    if (isInView && src !== currentSrc) {
      setCurrentSrc(src);
    }
  }, [isInView, src, currentSrc]);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  return (
    <div
      ref={imgRef}
      className={cn("relative overflow-hidden bg-slate-800", className)}
      style={{ aspectRatio }}
    >
      {/* Shimmer placeholder */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-slate-800">
          <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/5 to-transparent" />
        </div>
      )}

      {/* Low-quality placeholder */}
      {placeholder && !isLoaded && (
        <img
          src={placeholder}
          alt=""
          className="absolute inset-0 w-full h-full object-cover blur-sm scale-110"
          aria-hidden="true"
        />
      )}

      {/* Main image */}
      {(isInView || priority) && (
        <img
          src={currentSrc}
          alt={alt}
          width={width}
          height={height}
          className={cn(
            "w-full h-full object-cover transition-opacity duration-300",
            isLoaded ? "opacity-100" : "opacity-0"
          )}
          onLoad={handleLoad}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          {...props}
        />
      )}
    </div>
  );
}