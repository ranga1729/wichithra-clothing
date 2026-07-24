"use client"

import { useTheme } from "next-themes"
import Image from "next/image"
import oops_light from "@/public/images/oops-light.png"
import oops_dark from "@/public/images/oops-dark.png"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useEffect, useState } from "react"
import { AlertTriangle, Home, ArrowLeft } from "lucide-react"

export default function OOPS() {
  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const searchParams = useSearchParams()
  const errorCode = searchParams.get("error")
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
  }, [])

  let errorMessage: string
  let errorCodeDisplay: string

  switch (errorCode) {
    case "noaccess":
      errorMessage = "Access Denied"
      errorCodeDisplay = "403"
      break
    case "notfound":
      errorMessage = "Page Not Found"
      errorCodeDisplay = "404"
      break
    default:
      errorMessage = "Something Went Wrong"
      errorCodeDisplay = "500"
      break
  }

  const handleGoBack = () => {
    router.back()
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-muted/30 px-4">
      <div className="w-full max-w-lg space-y-8 text-center">
        {/* Large Error Code */}
        <div className="relative">
          <span className="text-[120px] md:text-[160px] font-black text-muted/40 leading-none select-none">
            {errorCodeDisplay}
          </span>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex items-center justify-center w-20 h-20 rounded-full bg-destructive/10">
              <AlertTriangle className="w-10 h-10 text-destructive" />
            </div>
          </div>
        </div>

        {/* Error Illustration */}
        {mounted && (
          <div className="flex justify-center -mt-4">
            <Image
              src={theme === "light" ? oops_light : oops_dark}
              alt="Error illustration"
              height={180}
              className="object-contain"
              priority
            />
          </div>
        )}

        {/* Error Content */}
        <div className="space-y-3">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
            {errorMessage}
          </h1>
          <p className="text-muted-foreground max-w-md mx-auto leading-relaxed">
            {errorCode === "noaccess"
              ? "You don't have permission to access this page. Contact support if you believe this is a mistake."
              : errorCode === "notfound"
                ? "The page you're looking for doesn't exist or has been moved."
                : "We hit a snag while loading this page. Try again or head back to safety."}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <Button
            variant="outline"
            size="lg"
            onClick={handleGoBack}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </Button>
          <Button size="lg" asChild className="gap-2">
            <Link href="/">
              <Home className="w-4 h-4" />
              Back to Home
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}