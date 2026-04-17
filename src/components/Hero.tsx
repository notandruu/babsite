import { ArrowIcon } from "./ArrowIcon";
import { Sticker } from "./Sticker";

export function Hero() {
  return (
    <section
      data-hero
      className="relative mx-[48px] mt-[27px] overflow-hidden"
      style={{
        background:
          "linear-gradient(180deg, rgba(254,203,51,0.3) 0%, rgba(152,121,31,0.06) 100%)",
      }}
    >
      <div className="relative z-10 flex flex-col justify-end min-h-[380px] sm:min-h-[520px] lg:min-h-[720px] p-5 sm:p-[30px]">
        {/* Text content */}
        <div className="max-w-[993px]">
          <p className="font-sans text-sm sm:text-xl tracking-[-1px] text-white mb-2.5">
            BLOCKCHAIN AT BERKELEY
          </p>
          <h1 className="font-serif text-[36px] sm:text-[56px] md:text-[72px] lg:text-[96px] text-white tracking-[-1.5px] sm:tracking-[-3px] lg:tracking-[-4.8px] leading-none">
            Berkeley&apos;s Hub for Blockchain Innovation
          </h1>
        </div>

        {/* CTA buttons */}
        <div className="flex mt-6 sm:mt-10">
          <button className="bg-gold border border-border h-12 sm:h-14 lg:h-16 flex items-center gap-2 sm:gap-4 px-3 sm:px-5 lg:px-6 cursor-pointer hover:bg-yellow-400 transition-colors">
            <span className="font-sans text-xs sm:text-sm lg:text-base tracking-[-0.8px] text-surface whitespace-nowrap">
              APPLY NOW
            </span>
            <ArrowIcon dark />
          </button>
          <button className="bg-surface border border-border h-12 sm:h-14 lg:h-16 flex items-center gap-2 sm:gap-4 px-3 sm:px-5 lg:px-6 cursor-pointer hover:bg-zinc-900 transition-colors">
            <span className="font-sans text-xs sm:text-sm lg:text-base tracking-[-0.8px] text-white whitespace-nowrap">
              LEARN MORE
            </span>
            <ArrowIcon />
          </button>
        </div>
      </div>

      {/* Stickers — shown on md+ (768px+) */}
      <div className="hidden md:block pointer-events-none">
        {/* Sticker 1 — tower, center-right upper */}
        <Sticker
          src="/assets/sticker1-obj.png"
          alt="Berkeley tower"
          rotation={-5.78}
          className="left-[58%] lg:left-[55%] top-[8%] w-[20%] lg:w-[18%] aspect-[265/305] z-20"
        />

        {/* Sticker 3 — ethereum cube, top-right */}
        <Sticker
          src="/assets/sticker3-obj.png"
          alt="Blockchain symbol"
          rotation={20.81}
          className="left-[78%] lg:left-[76%] top-[3%] w-[18%] lg:w-[16%] aspect-square z-20"
        />

        {/* Sticker 2 — golden BaB logo, bottom-right */}
        <Sticker
          src="/assets/sticker2-obj.png"
          alt="Blockchain at Berkeley"
          rotation={16.33}
          className="left-[72%] lg:left-[73%] top-[45%] w-[22%] lg:w-[20%] aspect-[275/261] z-20"
        />
      </div>
    </section>
  );
}
