const stats = [
  { value: "10+", label: "STARTUPS FOUNDED" },
  { value: "50+", label: "CONSULTING PROJECTS" },
  { value: "20+", label: "PARTNERS WORLDWIDE" },
  { value: "200k+", label: "EDX STUDENTS" },
];

export function Stats() {
  return (
    <section className="mx-[48px] mt-[27px]">
      <div className="grid grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="flex flex-col py-3 lg:py-0 px-5">
            <p className="font-serif text-[clamp(36px,5vw,56px)] text-white leading-none">
              {s.value}
            </p>
            <p className="font-sans text-[10px] text-white mt-1">
              {s.label}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
