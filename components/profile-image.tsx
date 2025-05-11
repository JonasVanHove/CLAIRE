import Image from "next/image"

interface ProfileImageProps {
  src: string
  alt: string
  className?: string
}

export function ProfileImage({ src, alt, className = "" }: ProfileImageProps) {
  return (
    <div className={`relative overflow-hidden rounded-full ${className}`}>
      <Image src={src || "/images/default.png"} alt={alt} width={80} height={80} className="object-cover" />
    </div>
  )
}
