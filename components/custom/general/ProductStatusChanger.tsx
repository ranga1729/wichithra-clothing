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
  return <FieldLabel htmlFor="status-card">
    <Field orientation="responsive" 
      className={
        props.isLoading ? "opacity-50 pointer-events-none select-none" : "opacity-100"
      }>
    <FieldContent>
      <FieldTitle> {en.product_status} </FieldTitle>
      <FieldDescription>
        {en.product_status_description}
      </FieldDescription>
    </FieldContent>

      <Select value={props.productStatus ?? ""} onValueChange={(value) => props.changer(value as ProductStatus)}>
        <SelectTrigger className="w-full max-w-48">
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