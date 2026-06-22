import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Field, FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search } from "lucide-react";

interface Props {
  open: boolean,
  setIsSearchOpen: (test:boolean) => void,
}

export default function SearchDialog(props: Props) {
  return (
    <Dialog open={props.open} onOpenChange={props.setIsSearchOpen}>
      <form>
        <DialogContent className="sm:max-w-sm bg-neutral-100/70" showCloseButton={false}>
          <FieldGroup className="flex flex-row gap-2">
            <Field>
              <Input id="search" name="search" />
            </Field>
            <Button className="bg-koa-black"> <Search /> </Button>
          </FieldGroup>
        </DialogContent>
      </form>
    </Dialog>
  )
}