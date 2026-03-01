import { getSizes } from "@/app/(admin)/admin/sizes/action";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Size } from "@/generated/prisma/client";
import { cn } from "@/lib/utils";
import { ProductSizeSchema } from "@/schemas/admin-schemas";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

interface Props {
  productSizes?: ProductSizeSchema[];
  onChange?: (selectedIds: string[]) => void;
}

const SizeMapper = (props:Props) => {
  const [StandardSizes, setStandardSizes] = useState<Size[]>([]);
  const [selectedSizeIds, setSelectedSizeIds] = useState<string[]>([]);

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

  useEffect(() => {
    fetchSizes();
  }, [])

  useEffect(() => {
    if (props.productSizes && props.productSizes.length > 0) {
      const initialIds = props.productSizes!.map((ps) => ps.sizeId);
      setSelectedSizeIds(initialIds);
    }
  }, [props.productSizes]);

  const handleToggle = (sizeId: string) => {
    let newSelectedIds: string[];

    if (selectedSizeIds.includes(sizeId)) {
      newSelectedIds = selectedSizeIds.filter((id) => id !== sizeId);
    } else {
      newSelectedIds = [...selectedSizeIds, sizeId];
    }

    setSelectedSizeIds(newSelectedIds);
    
    if (props.onChange) {
      props.onChange(newSelectedIds);
    }
  };

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
            const isChecked = selectedSizeIds.includes(s_size.id);

            return (
              <div key={s_size.id} className="flex flex-row items-center gap-3">
                <Checkbox
                  id={`size-${s_size.id}`}
                  checked={isChecked}
                  onCheckedChange={() => handleToggle(s_size.id)}
                />
                <Label 
                  htmlFor={`size-${s_size.id}`} 
                  className={cn(
                    "cursor-pointer border flex w-fit items-center justify-center rounded-md px-1.5 py-1 text-xs font-medium transition-colors",
                    isChecked 
                      ? "bg-neutral-200 text-neutral-800 border-neutral-400 hover:bg-neutral-300"
                      : "bg-neutral-100 text-neutral-400 border-neutral-200 cursor-not-allowed opacity-100" 
                  )}
                >
                  {s_size.name}
                </Label>
              </div>
            )
          })
        }
      </CardContent>
      
    </Card>
  )
}

export default SizeMapper;