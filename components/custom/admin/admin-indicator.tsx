import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { JwtPayload } from "@/types/auth-types";
import { Shield } from "lucide-react";

interface Props {
  user : JwtPayload | null;
}

export default function AdminIndicator(props: Props) {

  return (
    <div className="flex flex-row gap-1 pr-3 pl-2 py-1 border rounded-sm dark:border dark:border-neutral-700">
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