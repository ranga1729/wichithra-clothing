import BlurText from '@/components/BlurText'
import ShinyText from '@/components/ShinyText';
import TextType from '@/components/TextType';
import EmblaCarousel from '../slider/EmblaCarousel';
import { EmblaOptionsType } from 'embla-carousel';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function KoaHero() {
  const OPTIONS: EmblaOptionsType = {axis: 'x', loop: true, direction: 'ltr', skipSnaps: true, align: 'center', containScroll:false}
  const SLIDES = [
    '/hero/hero-1.jpg',
    '/hero/hero-2.jpg',
    '/hero/hero-3.jpg',
    '/hero/hero-4.jpg',
    '/hero/hero-5.jpg',
    '/hero/hero-6.jpg',
  ]

  return (
    <section className="relative h-screen overflow-hidden w-full">
      <EmblaCarousel slides={SLIDES} options={OPTIONS} />
      
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50" />
      
      {/* Content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
        <div className='flex flex-row gap-3 items-baseline justify-center flex-wrap'>
          <BlurText
            text="Be"
            delay={200}
            animateBy="words"
            direction="top"
            className="text-5xl md:text-7xl font-bold text-white mb-4 max-w-2xl"
          />
          <ShinyText
            text="KOA"
            speed={2}
            delay={0}
            color="#b5b5b5"
            shineColor="#ffffff"
            spread={120}
            direction="left"
            yoyo={false}
            pauseOnHover={false}
            disabled={false}
            className='text-7xl md:text-9xl font-bold text-white mb-4 max-w-2xl'
          />
          <BlurText
            text="(/kō-ə/)"
            delay={200}
            animateBy="words"
            direction="top"
            className="text-xl md:text-3xl font-bold text-white/80 mb-4 max-w-2xl"
          />
        </div>
        <div className='flex flex-row gap-3 flex-wrap justify-center'>
          <p className='text-2xl md:text-4xl font-mono text-white mb-4 max-w-2xl'>Be </p>
          <TextType 
            text={["Brave.", "Bold.", "Warrior."]}
            typingSpeed={75}
            pauseDuration={1500}
            showCursor
            cursorCharacter="|"
            deletingSpeed={50}
            cursorBlinkDuration={0.5}
            className='text-2xl md:text-4xl font-mono text-white mb-4 max-w-2xl'
          />
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mt-6">
          <Button asChild size="lg" className="px-8 py-6 text-base font-semibold rounded-lg">
            <Link href="/search">
              Shop Now
            </Link>
          </Button>
          <Button asChild variant="secondary" size="lg" className="px-8 py-6 text-base font-semibold rounded-lg bg-white text-black hover:bg-white/90">
            <Link href="/collections">
              View Collections
            </Link>
          </Button>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  )
}
