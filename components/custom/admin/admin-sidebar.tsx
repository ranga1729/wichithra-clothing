"use client"

import * as React from "react"
import {
  ChartNoAxesCombined,
  ListCollapse,
  ListOrdered,
  Shirt,
  SquaresExclude,
  UserRound,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
// import { NavProjects } from "@/components/nav-projects"
// import { NavSecondary } from "@/components/nav-secondary"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import Image from "next/image"
import logo from "@/public/images/logo.png"

const data = {
  navMain: [
    {
      title: "Analytics",
      url: "/admin/analytics",
      icon: ChartNoAxesCombined,
      isActive: true,
    },
    {
      title: "Orders",
      url: "/admin/orders/new",
      icon: ListOrdered,
      isActive: true,
      items: [
        {
          title: "New orders",
          url: "/admin/orders/new",
        },
        {
          title: "Ongoing order",
          url: "/admin/orders/ongoing",
        },
        {
          title: "Completed order",
          url: "/admin/orders/completed",
        },
        {
          title: "Cancelled order",
          url: "/admin/orders/cancelled",
        },
      ]
    },
    {
      title: "Products",
      url: "/admin/products",
      icon: Shirt,
      isActive: true,
    },
    {
      title: "Inventory",
      url: "/admin/inventory",
      icon: SquaresExclude,
      isActive: true,
    },
    {
      title: "Facets",
      url: "/admin/facets/categories",
      icon: ListCollapse,
      isActive: true,
      items: [
        {
          title: "Categories",
          url: "/admin/facets/categories",
        },
        {
          title: "Designs",
          url: "/admin/facets/designs",
        },
        {
          title: "Colors",
          url: "/admin/facets/colors",
        },
      ],
    },
    {
      title: "Customers",
      url: "/admin/customers",
      icon: UserRound,
      isActive: true,
    },
  ],

  // navSecondary: [
  //   {
  //     title: "Support",
  //     url: "#",
  //     icon: LifeBuoy,
  //   },
  //   {
  //     title: "Feedback",
  //     url: "#",
  //     icon: Send,
  //   },
  // ],

  // projects: [
  //   {
  //     name: "Design Engineering",
  //     url: "#",
  //     icon: Frame,
  //   },
  //   {
  //     name: "Sales & Marketing",
  //     url: "#",
  //     icon: PieChart,
  //   },
  //   {
  //     name: "Travel",
  //     url: "#",
  //     icon: Map,
  //   },
  // ],
}

export function AdminSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar
      className="top-(--header-height) h-[calc(100svh-var(--header-height))]! dark:border-neutral-700 border-neutral-300"
      {...props}
    >
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild className="bg-neutral-200 hover:bg-neutral-200 dark:bg-neutral-800">
              <a href="#">
                <div className="text-sidebar-primary-foreground flex aspect-square size-10 items-center justify-center rounded-lg">
                  <Image src={logo} alt={"Wichithra logo"} sizes="10" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">Wichithra-Clothing</span>
                  <span className="truncate text-xs">Admin-Dashboard</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <NavMain items={data.navMain} />
        {/* <NavProjects projects={data.projects} /> */}
        {/* <NavSecondary items={data.navSecondary} className="mt-auto" /> */}
      </SidebarContent>
    </Sidebar>
  )
}
