import type { Metadata } from "next";
import Image from "next/image";
import logo from "../../../public/logo/KOA_logo_black.png"

export const metadata: Metadata = {
  title: "About | KOA Clothing",
  description:
    "KOA means warrior in Hawaiian. Learn the story behind the brand — built for men who move with purpose.",
};

const values = [
  {
    label: "Crafted for movement",
    body: "Every cut, weight, and stitch is chosen for men who don't sit still. Whether it's the gym, the street, or in between — KOA moves with you.",
  },
  {
    label: "No noise",
    body: "We don't chase trends. We build pieces that carry themselves — clean lines, honest materials, nothing extra.",
  },
  {
    label: "Built in Sri Lanka",
    body: "Designed and produced close to home, by people who take the craft seriously. Local roots, global standard.",
  },
  {
    label: "Direct to you",
    body: "No middlemen, no markups. We sell directly so every piece stays accessible and every relationship stays real.",
  },
];

const timeline = [
  {
    year: "2019",
    event: "The workshop",
    detail:
      "Kalindu starts a small-scale garment manufacturing operation, accepting custom orders by word of mouth.",
  },
  {
    year: "2022",
    event: "Custom printing takes off",
    detail:
      "A T-shirt printing venture for university clubs and corporates grows rapidly, proving the demand for a distinct brand.",
  },
  {
    year: "2024",
    event: "KOA is born",
    detail:
      "The decision to launch a standalone menswear and activewear brand — a clean-slate digital-first operation, completely separate from the manufacturing side.",
  },
  {
    year: "2025",
    event: "The platform",
    detail:
      "KOA Clothing launches its e-commerce platform, bringing the full catalog online with direct-to-consumer ordering.",
  },
];

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">

      {/* ── HERO ── */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="max-w-7xl mx-auto px-6 md:px-12 pt-20 pb-24 md:pt-28 md:pb-32">
          <div className="grid md:grid-cols-[1fr_auto] gap-12 items-end">
            <div>
              {/* Eyebrow */}
              <p
                className="text-xs tracking-[0.25em] uppercase text-muted-foreground mb-6 font-medium"
                style={{ fontFamily: "var(--font-mono, monospace)" }}
              >
                KOA — Hawaiian · /ˈkoʊ.ɑː/ · Warrior
              </p>

              {/* Headline */}
              <h1
                className="font-bold leading-[0.88] tracking-tight text-foreground"
                style={{ fontSize: "clamp(3.5rem, 10vw, 8rem)" }}
              >
                Dressed
                <br />
                for the{" "}
                <span
                  style={{
                    color: "#C9A96E",
                    fontStyle: "italic",
                  }}
                >
                  battle.
                </span>
              </h1>
            </div>

            {/* Large decorative K */}
            <div
              aria-hidden="true"
              className="hidden md:block select-none leading-none font-black text-border"
              style={{
                fontSize: "clamp(8rem, 18vw, 18rem)",
                lineHeight: 1,
                letterSpacing: "-0.05em",
                opacity: 0.5,
              }}
            >
              <Image src={logo} alt={"Logo"}></Image>
            </div>
          </div>

          {/* Sub-headline */}
          <div className="mt-10 max-w-xl">
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
              KOA is a Sri Lankan menswear and activewear brand. We make
              clothing for men who move with intention — built clean, worn hard,
              built to last.
            </p>
          </div>
        </div>
      </section>

      {/* ── BRAND STATEMENT ── */}
      <section className="border-b border-border">
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-20 md:py-28">
          <div className="grid md:grid-cols-[1fr_2fr] gap-16 items-start">
            {/* Left label column */}
            <div className="md:sticky md:top-24">
              <p
                className="text-xs tracking-[0.2em] uppercase text-muted-foreground font-medium"
                style={{ fontFamily: "var(--font-mono, monospace)" }}
              >
                The origin
              </p>
            </div>

            {/* Right content column */}
            <div className="space-y-8">
              <p className="text-2xl md:text-3xl font-medium leading-snug text-foreground">
                The name comes from the Hawaiian word for warrior. We chose it
                deliberately.
              </p>
              <div className="space-y-5 text-muted-foreground text-base md:text-lg leading-relaxed">
                <p>
                  KOA started as a small garment manufacturing operation in Sri
                  Lanka. Custom T-shirt printing for university clubs and
                  corporate teams. Word of mouth. Real relationships. No
                  website, no ads — just quality that travelled.
                </p>
                <p>
                  What grew out of that was a clear signal: there was demand for
                  something more. A brand. A distinct identity built around
                  menswear and activewear that didn&apos;t compromise on
                  material or cut.
                </p>
                <p>
                  KOA Clothing is the result. A standalone brand, built from the
                  ground up, digital-first, direct-to-consumer. Everything that
                  the word{" "}
                  <em className="font-medium text-foreground not-italic">
                    warrior
                  </em>{" "}
                  implies — resilience, purpose, a refusal to be generic.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── VALUES GRID ── */}
      <section className="border-b border-border">
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-20 md:py-28">
          {/* Section header */}
          <div className="mb-16 flex items-baseline gap-6">
            <p
              className="text-xs tracking-[0.2em] uppercase text-muted-foreground font-medium shrink-0"
              style={{ fontFamily: "var(--font-mono, monospace)" }}
            >
              What we stand for
            </p>
            <div
              className="h-px bg-border flex-1"
              aria-hidden="true"
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-x-12 gap-y-12">
            {values.map((v, i) => (
              <div key={v.label} className="group">
                <div className="flex items-start gap-5">
                  {/* Index number */}
                  <span
                    className="text-xs font-medium tabular-nums shrink-0 mt-1"
                    style={{
                      color: "#C9A96E",
                      fontFamily: "var(--font-mono, monospace)",
                    }}
                  >
                    0{i + 1}
                  </span>
                  <div className="space-y-3">
                    <h3 className="text-base font-semibold text-foreground">
                      {v.label}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {v.body}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TIMELINE ── */}
      <section className="border-b border-border">
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-20 md:py-28">
          <div className="grid md:grid-cols-[1fr_2fr] gap-16 items-start">
            {/* Left label */}
            <div className="md:sticky md:top-24">
              <p
                className="text-xs tracking-[0.2em] uppercase text-muted-foreground font-medium"
                style={{ fontFamily: "var(--font-mono, monospace)" }}
              >
                The timeline
              </p>
            </div>

            {/* Timeline entries */}
            <div className="relative">
              {/* Vertical line */}
              <div
                className="absolute left-13 top-2 bottom-2 w-px bg-border hidden sm:block"
                aria-hidden="true"
              />

              <div className="space-y-12">
                {timeline.map((entry) => (
                  <div key={entry.year} className="relative flex gap-8 items-start">
                    {/* Year pill */}
                    <div
                      className="shrink-0 w-22 text-right"
                      style={{
                        fontFamily: "var(--font-mono, monospace)",
                        fontSize: "0.75rem",
                        fontWeight: 600,
                        color: "#C9A96E",
                        paddingTop: "0.2rem",
                      }}
                    >
                      {entry.year}
                    </div>

                    {/* Dot */}
                    <div
                      className="relative shrink-0 w-3 h-3 rounded-full border-2 bg-background z-10 mt-1"
                      style={{ borderColor: "#C9A96E" }}
                      aria-hidden="true"
                    />

                    {/* Content */}
                    <div className="space-y-2 pb-2">
                      <p className="font-semibold text-foreground text-sm">
                        {entry.event}
                      </p>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {entry.detail}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOUNDER / PEOPLE SECTION ── */}
      <section className="border-b border-border">
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-20 md:py-28">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            {/* Text */}
            <div className="space-y-6">
              <p
                className="text-xs tracking-[0.2em] uppercase text-muted-foreground font-medium"
                style={{ fontFamily: "var(--font-mono, monospace)" }}
              >
                The founder
              </p>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground leading-snug">
                Kalindu Dilranga
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  Kalindu built his first garment operation from referrals and
                  handshakes. No marketing budget, no investors — just a
                  consistent product that people kept coming back for.
                </p>
                <p>
                  KOA Clothing is his next move: taking everything he learned
                  from years in the manufacturing floor and building a brand
                  that doesn&apos;t compromise. One that earns the name warrior.
                </p>
              </div>
            </div>

            {/* Abstract identity block — replaces a placeholder image */}
            <div className="flex justify-center md:justify-end">
              <div
                className="relative w-64 h-80 rounded-2xl overflow-hidden flex items-end"
                style={{ background: "hsl(var(--muted))" }}
              >
                {/* Big decorative letter */}
                <span
                  aria-hidden="true"
                  className="absolute top-4 right-4 font-black leading-none select-none"
                  style={{
                    fontSize: "10rem",
                    color: "#C9A96E",
                    opacity: 0.15,
                    lineHeight: 1,
                  }}
                >
                  K
                </span>
                {/* Name plate */}
                <div
                  className="w-full px-5 py-4 z-10"
                  style={{ background: "rgba(0,0,0,0.55)" }}
                >
                  <p className="text-white font-semibold text-sm">
                    Kalindu Dilranga
                  </p>
                  <p
                    className="text-xs mt-0.5"
                    style={{ color: "#C9A96E" }}
                  >
                    Founder, KOA Clothing
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CLOSING CTA ── */}
      <section>
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-24 md:py-36 text-center">
          <p
            className="text-xs tracking-[0.25em] uppercase text-muted-foreground font-medium mb-8"
            style={{ fontFamily: "var(--font-mono, monospace)" }}
          >
            Ready to wear KOA?
          </p>
          <h2
            className="font-bold text-foreground leading-tight mb-10"
            style={{ fontSize: "clamp(2rem, 6vw, 4.5rem)" }}
          >
            The collection is live.
            <br />
            <span style={{ color: "#C9A96E" }}>Start shopping.</span>
          </h2>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/search"
              className="inline-flex items-center justify-center gap-2 rounded-md px-8 py-3.5 text-sm font-semibold transition-colors"
              style={{
                background: "#C9A96E",
                color: "#1a1008",
              }}
            >
              Browse the collection
            </a>  
          </div>
        </div>
      </section>
    </main>
  );
}