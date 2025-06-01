import Image from "next/image"

interface ProfileImageProps {
  src: string
  alt: string
  className?: string
}

export function ProfileImage({ src, alt, className = "" }: ProfileImageProps) {
  const imageSrc = src && src.trim() !== "" ? src : "/images/default.png";

  return (
    <div className={`relative overflow-hidden rounded-full ${className}`}>
      <Image
        src={imageSrc}
        alt={alt}
        width={80}
        height={80}
        className="object-cover"
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          if (target.src !== window.location.origin + "/images/default.png") {
            target.src = "/images/default.png";
          }
        }}
      />
    </div>
  );
}
