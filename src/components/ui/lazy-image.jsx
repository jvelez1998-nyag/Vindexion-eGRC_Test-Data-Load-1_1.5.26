import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

export default function LazyImage({ 
  src, 
  alt, 
  className, 
  aspectRatio = "16/9",
  placeholderColor = "bg-slate-800",
  ...props 
}) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef(null);

  useEffect(() => {
    if (!imgRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "50px" }
    );

    observer.observe(imgRef.current);

    return () => {
      if (imgRef.current) observer.unobserve(imgRef.current);
    };
  }, []);

  return (
    <div
      ref={imgRef}
      className={cn("relative overflow-hidden", className)}
      style={{ aspectRatio }}
    >
      {/* Placeholder shimmer */}
      <div
        className={cn(
          "absolute inset-0 transition-opacity duration-300",
          placeholderColor,
          isLoaded ? "opacity-0" : "opacity-100"
        )}
      >
        <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      </div>

      {/* Actual image */}
      {isInView && (
        <img
          src={src}
          alt={alt}
          className={cn(
            "w-full h-full object-cover transition-opacity duration-300",
            isLoaded ? "opacity-100" : "opacity-0"
          )}
          onLoad={() => setIsLoaded(true)}
          loading="lazy"
          {...props}
        />
      )}
    </div>
  );
}