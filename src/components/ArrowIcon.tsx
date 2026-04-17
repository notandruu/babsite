import Image from "next/image";

export function ArrowIcon({ dark }: { dark?: boolean }) {
  return (
    <Image
      src={dark ? "/assets/arrow-dark.svg" : "/assets/arrow-light.svg"}
      alt=""
      width={24}
      height={24}
      className="shrink-0"
    />
  );
}
