import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export default function Collections() {
  return (
    <div className="container mx-auto px-4 py-16 md:py-24 flex items-center justify-center min-h-[60vh]">
      <Card className="w-full max-w-2xl text-center shadow-lg border-border/40">
        <CardHeader>
          <CardTitle className="text-4xl md:text-5xl font-bold tracking-tight">
            Collections
          </CardTitle>
          <CardDescription className="text-lg text-muted-foreground mt-2">
            Curated sets of similar products, coming soon.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-muted-foreground">
            We're putting together exciting collections of our best apparel. 
            Check back soon to discover handpicked styles.
          </p>
          <div className="pt-4">
            <Button asChild size="lg">
              <Link href="/">Back to Shop</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}