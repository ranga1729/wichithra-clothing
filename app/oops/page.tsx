"use client";

import { Item, ItemGroup } from "@/components/ui/item";
import { useTheme } from "next-themes";
import Image from "next/image";
import oops_light from "@/public/images/oops-light.png"
import oops_dark from "@/public/images/oops-dark.png"
import { useRouter, useSearchParams } from "next/navigation";
import { ThemeToggler } from "@/components/providers/theme/theme-toggler";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function OOPS() {
  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const searchParams = useSearchParams();
  const errorCode = searchParams.get('error');
  const router = useRouter();

  useEffect(() => {
    setMounted(true)
  }, [])

  let errorMessage;

  switch (errorCode) {
    case 'noaccess':
      errorMessage = 'You do not have permission to view this page';
      break;
    case 'notfound':
      errorMessage = 'The requested resource could not be found';
      break;
    default:
      errorMessage = `An unexpected error occurred`;
      break;
  }

  const handleGoBack = () => {
    router.back()
  }

  return (
    <div className="min-h-svh dark:bg-neutral-950 flex flex-col items-center justify-center">
      <ItemGroup className="flex flex-col items-center justify-center gap-5 md:w-2/4">
        <Item className="flex flex-col items-center justify-center">
          <ThemeToggler />
          <Item className="flex flex-col items-center justify-center p-0 gap-0">
            {mounted && (
              <Image 
                src={theme === "light" ? oops_light : oops_dark} 
                alt={"Oops!"} 
                height={300} 
              />
            )}
            <p className="text-2xl text-neutral-600 font-semibold"> {errorMessage} ! </p>
          </Item>
        </Item>
        <Item className="flex flex-row items-center justify-center">
          <Button size={"lg"} className="w-50" onClick={handleGoBack}>Back</Button>
          <Link href={"/"}> <Button size={"lg"} className="w-50">Home</Button> </Link>
        </Item>
      </ItemGroup>
    </div>
  )
}