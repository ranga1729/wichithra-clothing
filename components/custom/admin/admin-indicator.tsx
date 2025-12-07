import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Shield } from "lucide-react";

export default function() {

  const user = {
    name: "admin-name",
    email: "admin@example.com",
    avatar: "/avatars/shadcn.jpg",
  }

  return (
    <div className="flex flex-row gap-1 p-1 border rounded-sm">
      <Avatar className="h-8 w-8 rounded-lg items-center justify-center">
        <Shield color="green" size={25}/>
      </Avatar>
      <div className="grid flex-1 text-left text-sm leading-tight">
        <span className="truncate font-medium">{user.name}</span>
        <span className="truncate text-xs">{user.email}</span>
      </div>
    </div>
  )
}