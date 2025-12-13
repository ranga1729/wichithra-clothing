import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { JwtPayload } from "@/types/auth-types";
import { Shield } from "lucide-react";

interface Props {
  user : JwtPayload | null;
}

export default function AdminIndicator(props: Props) {

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
        <span className="truncate font-medium">{props.user?.firstName}</span>
        <span className="truncate text-xs">{props.user?.email}</span>
      </div>
    </div>
  )
}