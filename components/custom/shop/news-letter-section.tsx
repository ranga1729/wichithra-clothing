import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function NewsletterSection() {
  return (
    <section className="py-20 px-4 w-full bg-foreground text-background">
      <div className="max-w-2xl mx-auto text-center">
        <p className="text-xs tracking-[0.2em] uppercase text-background/60 mb-3 font-medium">
          Stay in the loop
        </p>
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          Join the KOA Community
        </h2>
        <p className="text-background/70 mb-8">
          Get early access to new drops, exclusive deals, and warrior-approved style guides.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
          <Input 
            type="email" 
            placeholder="Enter your email" 
            className="bg-background/10 border-background/20 text-background placeholder:text-background/40 h-12"
          />
          <Button size="lg" className="h-12 px-8 shrink-0">
            Subscribe
          </Button>
        </div>
      </div>
    </section>
  )
}