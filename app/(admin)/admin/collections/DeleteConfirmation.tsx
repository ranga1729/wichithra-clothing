import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { en } from "@/lib/i18n/en";
import { Trash2 } from "lucide-react";

interface Props {
  deleteMutate : () => void;
  isProcessing: boolean;

}

export default function DeleteConfitmationModal(props: Props) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon-xs"
          disabled={props.isProcessing}
          className="text-muted-foreground hover:text-destructive"
        >
          <Trash2 className="size-3.5" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{en.confirm_delete_collection}</AlertDialogTitle>
          <AlertDialogDescription>
            {en.confirm_delete_collection_description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{en.cancel}</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => props.deleteMutate()}
            className="bg-destructive text-white hover:bg-destructive/90"
          >
            {en.delete}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}