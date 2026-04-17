import Image from "next/image";

export function Logo({ className }: { className?: string }) {
  return (
    <div className={`relative w-[39px] h-[36px] ${className ?? ""}`}>
      <Image src="/assets/logo-v1.svg" alt="" width={14} height={8} className="absolute top-0 left-[10.6px]" />
      <Image src="/assets/logo-v1.svg" alt="" width={14} height={8} className="absolute top-[18.5px] left-0" />
      <Image src="/assets/logo-v5.svg" alt="" width={14} height={8} className="absolute top-[27.6px] left-[25.5px]" />
      <Image src="/assets/logo-v4.svg" alt="" width={14} height={8} className="absolute top-[27.6px] left-[21.4px] rotate-180 -scale-y-100" />
      <Image src="/assets/logo-v8.svg" alt="" width={14} height={8} className="absolute top-[27px] left-[5px] rotate-180" />
      <Image src="/assets/logo-v9.svg" alt="" width={10} height={17} className="absolute top-[18.9px] left-[9.8px]" />
      <Image src="/assets/logo-s1.svg" alt="" width={13} height={8} className="absolute top-[18.9px] left-[21.5px]" />
      <Image src="/assets/logo-s2.svg" alt="" width={13} height={8} className="absolute top-[8.75px] left-[11.1px] -scale-y-100" />
      <Image src="/assets/logo-s3.svg" alt="" width={12} height={8} className="absolute top-[8.75px] left-[16px]" />
    </div>
  );
}
