import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { getUserFromCookie } from "@/lib/get-cookie"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import MyDetailsTab from "./tabs/MyDetailsTab"
import OrderHistoryTab from "./tabs/OrderHistoryTab"
import PaymentHistoryTab from "./tabs/PaymentHistoryTab"
import Breadcrumbs from "@/components/custom/shop/breadcrumbs"

export const metadata: Metadata = {
  title: "My Dashboard | KOA Clothing",
}

interface Props {
  params: Promise<{ userId: string }>
  searchParams: Promise<{ tab?: string }>
}

export default async function UserDashboardPage({ params, searchParams }: Props) {
  const { userId } = await params
  const { tab } = await searchParams

  const user = await getUserFromCookie()
  if (!user) redirect("/auth/login")
  if (user.userId !== userId) redirect("/")

  const defaultTab = tab === "orders" ? "orders" : tab === "payments" ? "payments" : "details"

  return (
    <main className="max-w-5xl mx-auto px-4 md:px-8 py-8">
      <Breadcrumbs items={[{ label: 'My Dashboard' }]} />
      <h1 className="text-2xl font-bold text-foreground mb-8">My Dashboard</h1>
      <Tabs defaultValue={defaultTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="details">My Details</TabsTrigger>
          <TabsTrigger value="orders">Order History</TabsTrigger>
          <TabsTrigger value="payments">Payment History</TabsTrigger>
        </TabsList>

        <TabsContent value="details">
          <MyDetailsTab userId={userId} />
        </TabsContent>

        <TabsContent value="orders">
          <OrderHistoryTab userId={userId} />
        </TabsContent>

        <TabsContent value="payments">
          <PaymentHistoryTab userId={userId} />
        </TabsContent>
      </Tabs>
    </main>
  )
}
