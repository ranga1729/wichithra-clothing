import { getSizes } from "@/app/(admin)/admin/sizes/action";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Size } from "@/generated/prisma/client";
import { cn } from "@/lib/utils";
import { ProductSizeSchema } from "@/schemas/admin-schemas";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

interface Props {
  productSizes?: ProductSizeSchema[];
  sizeChanger: (newSizes: string[]) => void;
}

const SizeMapper = (props:Props) => {
  const [StandardSizes, setStandardSizes] = useState<Size[]>([]);
  const [newSelectedSizeIds, setNewSelectedSizeIds] = useState<string[]>([]);

  const fetchSizes = async () => {
    try {
      const response = await getSizes();

      if(!response.success && response.error) {
        toast.error(response.error);
      }
      
      if(response.success) {
        setStandardSizes(response.data.sizes)
      }
    } catch(error:any) {
      toast.error(error.message)
    }
  }

  const hasDataChanged = useMemo(() => {
    if(props.productSizes?.length !== newSelectedSizeIds.length) {
      return false;
    }
    const setOfNewIds = new Set(newSelectedSizeIds);
    return props.productSizes.every(size => setOfNewIds.has(size.sizeId));
  }, [props.productSizes, newSelectedSizeIds])

  const handleSizeChange = (sizeId: string) => {
    let newSelectedIds: string[];
    if (newSelectedSizeIds.includes(sizeId)) {
      newSelectedIds = newSelectedSizeIds.filter((id) => id !== sizeId);
    } else {
      newSelectedIds = [...newSelectedSizeIds, sizeId];
    }
    setNewSelectedSizeIds(newSelectedIds);
  };

  const setInitialSelectedIds = () => {
    if (props.productSizes && props.productSizes.length > 0) {
      const initialIds = props.productSizes!.map((ps) => ps.sizeId);
      setNewSelectedSizeIds(initialIds);
    }
  }

  const handleSave = () => {
    props.sizeChanger(newSelectedSizeIds);
  }

  const handleReset = () => {
    setInitialSelectedIds();
  }

  useEffect(() => {
    fetchSizes();
  }, [])

  useEffect(() => {
    setInitialSelectedIds();
  }, [props.productSizes]);

  return (
    <Card className="w-full max-w-70">
      <CardHeader className="flex flex-col items-start justify-between">
        <CardTitle>Sizes</CardTitle>
        <CardDescription>
          Check available sizes of this product. 
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        {
          StandardSizes.map((s_size) => {
            const isChecked = newSelectedSizeIds.includes(s_size.id);

            return (
              <div key={s_size.id} className="flex flex-row items-center gap-3">
                <Checkbox
                  id={`size-${s_size.id}`}
                  checked={isChecked}
                  onCheckedChange={() => handleSizeChange(s_size.id)}
                />
                <Label 
                  htmlFor={`size-${s_size.id}`} 
                  className={cn(
                    "cursor-pointer border flex w-fit items-center justify-center rounded-md px-1.5 py-1 text-xs font-medium transition-colors",
                    isChecked 
                      ? "bg-neutral-200 text-neutral-800 border-neutral-400 hover:bg-neutral-300"
                      : "bg-neutral-100 text-neutral-500 border-neutral-200 opacity-100" 
                  )}
                >
                  {s_size.name}
                </Label>
              </div>
            )
          })
        }
      </CardContent>
      <CardFooter className="flex flex-row items-center justify-end gap-2">
        <Button disabled={hasDataChanged} onClick={handleSave}>Save</Button>
        <Button disabled={hasDataChanged} onClick={handleReset}>Reset</Button>
      </CardFooter>
    </Card>
  )
}

export default SizeMapper;