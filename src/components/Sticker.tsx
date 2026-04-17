import Image from "next/image";

interface StickerProps {
  src: string;
  alt: string;
  rotation: number;
  className?: string;
}

export function Sticker({ src, alt, rotation, className }: StickerProps) {
  return (
    <div
      className={`absolute pointer-events-auto ${className ?? ""}`}
      style={{ transform: `rotate(${rotation}deg)` }}
    >
      <div className="sticker-wrap relative w-full h-full cursor-pointer">
        <Image
          src={src}
          alt={alt}
          fill
          className="object-contain"
          style={{
            filter: "drop-shadow(0px 10px 30px rgba(0,0,0,0.5))",
          }}
        />
      </div>
    </div>
  );
}
