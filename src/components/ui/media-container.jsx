import { cn } from "@/lib/utils";

export default function MediaContainer({ 
  children, 
  aspectRatio = "16/9",
  className 
}) {
  return (
    <div
      className={cn("relative overflow-hidden", className)}
      style={{ aspectRatio }}
    >
      {children}
    </div>
  );
}

export function VideoContainer({ src, poster, aspectRatio = "16/9", className, ...props }) {
  return (
    <MediaContainer aspectRatio={aspectRatio} className={className}>
      <video
        src={src}
        poster={poster}
        className="absolute inset-0 w-full h-full object-cover"
        loading="lazy"
        {...props}
      />
    </MediaContainer>
  );
}

export function IframeContainer({ src, title, aspectRatio = "16/9", className, ...props }) {
  return (
    <MediaContainer aspectRatio={aspectRatio} className={className}>
      <iframe
        src={src}
        title={title}
        className="absolute inset-0 w-full h-full"
        loading="lazy"
        {...props}
      />
    </MediaContainer>
  );
}