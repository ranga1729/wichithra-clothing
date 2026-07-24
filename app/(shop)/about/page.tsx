import type { Metadata } from "next";
import Image from "next/image";
import logo from "../../../public/logo/KOA_logo_black.png"
import owner from "@/public/Kalindu/kalindu-2.jpg"
import Breadcrumbs from "@/components/custom/shop/breadcrumbs";
import { Button } from "@/components/ui/button";
import Link from "next/link";

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
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="pt-8">
          <Breadcrumbs items={[{ label: 'About Us' }]} />
        </div>

        {/* ── HERO ── */}
        <section className="pb-16 md:pb-24">
          <div className="grid md:grid-cols-[1fr_auto] gap-12 items-end">
            <div>
              <p className="text-xs tracking-[0.2em] uppercase text-muted-foreground mb-4 font-medium">
                KOA — Hawaiian · /ˈkoʊ.ɑː/ · Warrior
              </p>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight tracking-tight text-foreground mb-6">
                Dressed
                <br />
                for the{" "}
                <span className="text-primary">
                  battle.
                </span>
              </h1>
            </div>

            {/* Decorative logo */}
            <div
              aria-hidden="true"
              className="hidden md:block select-none leading-none opacity-10"
            >
              <Image src={logo} alt="" width={200} height={200} className="object-contain" />
            </div>
          </div>

          <div className="mt-6 max-w-xl">
            <p className="text-lg text-muted-foreground leading-relaxed">
              KOA is a Sri Lankan menswear and activewear brand. We make
              clothing for men who move with intention — built clean, worn hard,
              built to last.
            </p>
          </div>
        </section>
      </div>

      {/* ── BRAND STATEMENT ── */}
      <section className="border-y border-border bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-16 md:py-24">
          <div className="grid md:grid-cols-[1fr_2fr] gap-12 items-start">
            <div className="md:sticky md:top-24">
              <p className="text-xs tracking-[0.2em] uppercase text-muted-foreground font-medium">
                The origin
              </p>
            </div>

            <div className="space-y-6">
              <p className="text-xl md:text-2xl font-medium leading-snug text-foreground">
                The name comes from the Hawaiian word for warrior. We chose it
                deliberately.
              </p>
              <div className="space-y-4 text-muted-foreground text-base leading-relaxed">
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
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-16 md:py-24">
          <div className="mb-12 flex items-baseline gap-6">
            <p className="text-xs tracking-[0.2em] uppercase text-muted-foreground font-medium shrink-0">
              What we stand for
            </p>
            <div className="h-px bg-border flex-1" aria-hidden="true" />
          </div>

          <div className="grid sm:grid-cols-2 gap-x-12 gap-y-10">
            {values.map((v, i) => (
              <div key={v.label} className="group">
                <div className="flex items-start gap-5">
                  <span className="text-xs font-medium tabular-nums shrink-0 mt-1 text-primary">
                    0{i + 1}
                  </span>
                  <div className="space-y-2">
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
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-16 md:py-24">
          <div className="grid md:grid-cols-[1fr_2fr] gap-12 items-start">
            <div className="md:sticky md:top-24">
              <p className="text-xs tracking-[0.2em] uppercase text-muted-foreground font-medium">
                The timeline
              </p>
            </div>

            <div className="relative">
              <div
                className="absolute left-13 top-2 bottom-2 w-px bg-border hidden sm:block"
                aria-hidden="true"
              />

              <div className="space-y-10">
                {timeline.map((entry) => (
                  <div key={entry.year} className="relative flex gap-8 items-start">
                    <div className="shrink-0 w-22 text-right text-xs font-semibold text-primary tabular-nums pt-0.5">
                      {entry.year}
                    </div>

                    <div
                      className="relative shrink-0 w-3 h-3 rounded-full border-2 border-primary bg-background z-10 mt-1"
                      aria-hidden="true"
                    />

                    <div className="space-y-1 pb-2">
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

      {/* ── FOUNDER SECTION ── */}
      <section className="border-b border-border">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-16 md:py-24">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-5">
              <p className="text-xs tracking-[0.2em] uppercase text-muted-foreground font-medium">
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

            <div className="flex justify-center md:justify-end">
              <div className="relative w-64 h-80 rounded-2xl overflow-hidden flex items-end bg-muted">
                <div className="w-full z-10">
                  <Image src={owner} alt="Mr. Kalindu Dilranga" />
                  <div className="bg-foreground/80 backdrop-blur-sm px-4 py-4">
                    <p className="text-white font-semibold text-sm text-center">
                      Kalindu Dilranga
                    </p>
                    <p className="text-xs mt-0.5 text-center text-primary-foreground/80">
                      Founder, KOA Clothing
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CLOSING CTA ── */}
      <section>
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-20 md:py-28 text-center">
          <p className="text-xs tracking-[0.25em] uppercase text-muted-foreground font-medium mb-6">
            Ready to wear KOA?
          </p>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground leading-tight mb-8">
            The collection is live.
            <br />
            <span className="text-primary">Start shopping.</span>
          </h2>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="px-8">
              <Link href="/search">
                Browse the collection
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}
