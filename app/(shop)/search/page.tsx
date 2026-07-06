'use client'

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function Search() {
  
  return (
    <div className="flex flex-col items-center h-100 mt-20 gap-5">
      
      {/* welcome texxt */}
      <p className="text-4xl font-bold text-robo">What's on your mind ?</p>
    
      {/* search bar and search button */}
      <div className="flex flex-row items-center justify-center gap-2">
        <Input
          type="text" 
          placeholder="anything in your mind" 
          name="q" 
          autoComplete="off" 
          id="search" 
          className="border h-10 w-lg placeholder:text-neutral-500" 
        />
        <Button className="">
          Search
        </Button>
      </div>
    </div>
  )
}