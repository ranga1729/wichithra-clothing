"use client"

import { SidebarIcon, UserStar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useSidebar } from "@/components/ui/sidebar"
import { ThemeToggler } from "../../providers/theme/theme-toggler"
import Logout from "@/components/custom/general/logout-button/logout-button"
import AdminIndicator from "./admin-indicator"
import { JwtPayload } from "@/types/auth-types"
import { usePathname } from "next/navigation"
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import React from "react"
import { useBreadcrumbStore } from "@/lib/zustand-stores/use-breadcrum-store"

interface Props {
  user : JwtPayload | null;
}

export function AdminHeader(props: Props) {
  const { toggleSidebar } = useSidebar()
  const dynamicLabel = useBreadcrumbStore((state) => state.dynamicLabel)

  const pathname = usePathname()
  const pathSegments = pathname.split("/").filter((segment) => segment !== "" && segment !== "admin")

  return (
    <header className="bg-background dark:bg-neutral-800 dark:border-b-neutral-600 sticky top-0 z-50 flex w-full items-center border-b">
      <div className="flex h-(--header-height) w-full items-center justify-between gap-2 px-4">
        
        <div className="flex flex-row gap-4 h-full items-center justify-start">
          <Button
            className="h-8 w-8 dark:border dark:border-neutral-700 dark:hover:bg-neutral-700"
            variant="outline"
            size="icon"
            onClick={toggleSidebar}
          >
            <SidebarIcon/>
          </Button>
          <Separator orientation="vertical" className="h-full bg-neutral-300 dark:bg-neutral-600" />
        
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbPage> <span className="flex flex-row gap-2 items-center"><UserStar height={17} width={17}/> Admin</span> </BreadcrumbPage>
              <BreadcrumbSeparator />
              {pathSegments.map((segment, index) => {
                const isLast = index === pathSegments.length - 1
                const formattedName = isLast && dynamicLabel
                  ? dynamicLabel
                  : segment.charAt(0).toUpperCase() + segment.slice(1)

                return (
                  <React.Fragment key={segment}>
                    <BreadcrumbItem>
                      {isLast ? (
                        <BreadcrumbPage>{formattedName}</BreadcrumbPage>
                      ) : (
                        <span className="text-muted-foreground text-sm">{formattedName}</span>
                      )}
                    </BreadcrumbItem>
                    {!isLast && <BreadcrumbSeparator />}
                  </React.Fragment>
                )
              })}
            </BreadcrumbList>
          </Breadcrumb>

        </div>

        <div className="flex flex-row gap-4 h-full items-center justify-start">
          <Separator orientation="vertical" className="h-full bg-neutral-300 dark:bg-neutral-600" />
          <ThemeToggler />
          <AdminIndicator user={props.user} />
          <Logout />
        </div>
    
      </div>
    </header>
  )
}
