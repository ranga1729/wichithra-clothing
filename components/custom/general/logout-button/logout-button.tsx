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
import { useMutation } from "@tanstack/react-query";
import { en } from "@/lib/i18n/en";

interface Props {
  redirectTo?: string;
}

export default function Logout() {
  const [open, setOpen] = useState<boolean>(false);
  const router = useRouter();

  const {mutate: logout, isPending} = useMutation({
    mutationFn: () => logoutAction(),
    onSuccess: (result) => {
      if (result.success && result.message) {
        toast.success(result.message || en.logged_out_successfully);
        router.push("/auth/login");
      } else {
        toast.error(result.message || en.logout_failed);
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || en.logout_failed);
    }
  });

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button 
          className="
            bg-red-700
            text-neutral-100
            hover:bg-red-800
          ">
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
            className="bg-neutral-500 hover:bg-neutral-600 text-neutral-100 dark:bg-neutral-500 dark:hover:bg-neutral-600 dark:text-neutral-100"
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction 
            onClick={() => logout()}
            disabled={isPending}
            className="bg-red-700 hover:bg-red-800 text-neutral-100 dark:bg-red-700 dark:hover:bg-red-800 dark:text-neutral-100"
          >
            {isPending ? 'Logging out...' : 'Confirm'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}