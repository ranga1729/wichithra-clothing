import { SidebarTrigger } from "../ui/sidebar";

export default function AdminHeader() {
  return (
    <header className="w-full flex flex-row justify-start items-center h-10 pl-1 gap-1 border bg-neutral-100 border-neutral-200">
      <SidebarTrigger />
      <h1>Header</h1>
    </header>
  )
}