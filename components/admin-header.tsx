"use client"

import { SidebarIcon } from "lucide-react"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useSidebar } from "@/components/ui/sidebar"
import { ThemeToggler } from "./theme/theme-toggler"

export function AdminHeader() {
  const { toggleSidebar } = useSidebar()

  return (
    <header className="bg-background dark:bg-neutral-800 sticky top-0 z-50 flex w-full items-center border-b">
      <div className="flex h-(--header-height) w-full items-center justify-between gap-2 px-4">
        
        <div className="flex flex-row gap-4 h-full items-center justify-start">
          <Button
            className="h-8 w-8"
            variant="outline"
            size="icon"
            onClick={toggleSidebar}
          >
            <SidebarIcon />
          </Button>
          <Separator orientation="vertical" className="h-full bg-neutral-300 dark:bg-neutral-600" />
        </div>
        
        {/* <Breadcrumb className="hidden sm:block">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="#">
                Building Your Application
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Data Fetching</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb> */}

        <div className="flex flex-row gap-4 h-full items-center justify-start">
          <Separator orientation="vertical" className="h-full bg-neutral-300 dark:bg-neutral-600" />
          <ThemeToggler />
        </div>
    
      </div>
    </header>
  )
}
