import { useState, useTransition } from "react";
import { Button } from "../../../ui/button";
import { useRouter } from "next/navigation";
import { logoutAction } from "./action";
import toast from "react-hot-toast";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface Props {
  redirectTo?: string;
}

export default function Logout() {
  const [open, setOpen] = useState<boolean>(false);
  const [isPending, startTransition] = useTransition()
  const router = useRouter();

  const handleLogout = () => {
    startTransition(async () => {
      const result = await logoutAction();

      if(result.success) {
        toast.success(result.message);
        setOpen(false);
        router.push('/login');
      } else {
        toast.error(result.message)
      }
    })
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button
          variant="default"
        >
          Logout
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="dark:bg-neutral-800">
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure you want to logout?</AlertDialogTitle>
          <AlertDialogDescription>
            You will need to login again to access your account.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel 
            disabled={isPending}
            className="bg-neutral-500 hover:bg-neutral-600 text-neutral-900 hover:text-neutral-100 dark:bg-neutral-500 dark:hover:bg-neutral-600 dark:text-neutral-900 dark:hover:text-neutral-100"
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleLogout}
            disabled={isPending}
            className="bg-red-500 hover:bg-red-600 text-neutral-900 hover:text-neutral-100 dark:bg-red-500 dark:hover:bg-red-600 dark:text-neutral-900 dark:hover:text-neutral-100"
          >
            {isPending ? 'Logging out...' : 'Confirm'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}