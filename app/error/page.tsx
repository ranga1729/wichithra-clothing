"use client";

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Home, SkipBack } from "lucide-react"
import "./cross-text.css"

export default function NotFound() {
  return (
    <div className="min-h-svh">
      <div className="min-h-screen text-white flex items-center justify-center p-4 overflow-hidden">
      <div className="text-center space-y-5 max-w-2xl mx-auto">

        <div className="relative">
          <h1 className="text-9xl md:text-[12rem] font-black glitch-text select-none text-red-500">404</h1>
          <h1 className="absolute inset-0 text-9xl md:text-[12rem] font-black glitch-text-shadow select-none text-neutral-700">
            404
          </h1>
          <h1 className="absolute inset-0 text-9xl md:text-[12rem] font-black glitch-text-shadow-2 select-none text-neutral-800">
            404
          </h1>
        </div>

        <div className="space-y-4">
          <p className="text-xl md:text-2xl text-neutral-700">Something went wrong!</p>
        </div>

        <div className="flex flex-row gap-4 justify-center items-center border">
          <Button onClick={() => window.history.back()} className="hover:bg-neutral-950">
            <SkipBack/> Back
          </Button>
          <Button asChild className="hover:bg-neutral-950 bg-neutral-900 text-neutral-100">
            <Link href="/" className="flex items-center gap-2">
              <Home className="w-4 h-4 transition-transform group-hover:scale-110 hover:bg-neutral-950 bg-neutral-900 text-neutral-100" />
              Home
            </Link>
          </Button>
        </div>

      </div>
    </div>
    </div>
  )
}
