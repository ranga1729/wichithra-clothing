'use client'
import { Field, FieldContent, FieldDescription, FieldLabel, FieldTitle } from "@/components/ui/field"
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ProductStatus } from "@/generated/prisma/enums";
import { en } from "@/lib/i18n/en"

interface Props {
  productStatus: ProductStatus;
  isLoading: boolean;
  changer: (newStatus: ProductStatus) => void;
}

const ProductStatusChanger = (props: Props) => {

  const statusStyles: Record<ProductStatus, string> = {
    AVAILABLE: "bg-green-400/5 border-green-500 dark:bg-green-500/10",
    OUTOFSTOCK: "bg-amber-700/5 border-amber-700 dark:bg-amber-700/10", // Brown-ish
    DISCONTINUED: "bg-red-400/5 border-red-500 dark:bg-red-500/10",
    DRAFT: "bg-yellow-400/5 border-yellow-500 dark:bg-yellow-500/10",
  };

  const currentStyle = statusStyles[props.productStatus] || "border-border";

  return <FieldLabel htmlFor="status-card">
    <Field 
      orientation="responsive" 
      className={`
        transition-colors duration-200 border rounded-md
        ${currentStyle}
        ${props.isLoading ? "opacity-50 pointer-events-none select-none" : "opacity-100"}
      `}
      >
    <FieldContent>
      <FieldTitle> {en.product_status} </FieldTitle>
      <FieldDescription>
        {en.product_status_description}
      </FieldDescription>
    </FieldContent>

      <Select 
        value={props.productStatus ?? ""} 
        onValueChange={(value) => props.changer(value as ProductStatus)}
        disabled={props.isLoading}
      >
        <SelectTrigger className={`w-full max-w-48 bg-background ${currentStyle}`}>
          <SelectValue placeholder="Select Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {
              Object.values(ProductStatus).map((status) => (
                <SelectItem key={status} value={status}>
                  {status.charAt(0) + status.slice(1).toLowerCase()}
                </SelectItem>
              ))
            }
          </SelectGroup>
        </SelectContent>
      </Select>

    </Field>
  </FieldLabel>
}

export default ProductStatusChanger;