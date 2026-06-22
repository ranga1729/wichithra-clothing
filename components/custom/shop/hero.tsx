import BlurText from '@/components/BlurText'
import ShinyText from '@/components/ShinyText';
import TextType from '@/components/TextType';
import EmblaCarousel from '../slider/EmblaCarousel';
import { EmblaOptionsType } from 'embla-carousel';

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
      <div className="absolute inset-0 bg-black/40" />
      
      {/* Content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
        <div className='flex flex-row gap-3 items-baseline justify-center'>
          <BlurText
            text="Be"
            delay={200}
            animateBy="words"
            direction="top"
            className="text-7xl font-bold text-white mb-4 max-w-2xl"
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
            className='text-9xl font-bold text-white mb-4 max-w-2xl'
          />
          <BlurText
            text="(/kō-ə/)"
            delay={200}
            animateBy="words"
            direction="top"
            className="text-3xl font-bold text-white mb-4 max-w-2xl"
          />
        </div>
        <div className='flex flex-row gap-3'>
          <p className='text-4xl font-mono text-white mb-4 max-w-2xl'>Be </p>
          <TextType 
            text={["Brave.", "Bold.", "Warrior."]}
            typingSpeed={75}
            pauseDuration={1500}
            showCursor
            cursorCharacter="|"
            deletingSpeed={50}
            // variableSpeedEnabled={false}
            // variableSpeedMin={60}
            // variableSpeedMax={120}
            cursorBlinkDuration={0.5}
            className='text-4xl font-mono text-white mb-4 max-w-2xl'
          />
        </div>
        
        {/* <div className="flex flex-col sm:flex-row gap-4">
          <Link
            href="/shop"
            className="px-8 py-3 bg-[#3D79BE] text-white font-semibold rounded-lg hover:bg-[#2D5FA3] transition"
          >
            Shop Now
          </Link>
          <Link
            href="/collections"
            className="px-8 py-3 bg-white text-[#101010] font-semibold rounded-lg hover:bg-[#F3F4F6] transition"
          >
            View Collections
          </Link>
        </div> */}
      </div>
    </section>
  )
}
