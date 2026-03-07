import { Field, FieldContent, FieldDescription, FieldLabel, FieldTitle } from "@/components/ui/field"
import { Switch } from "@/components/ui/switch"
import { en } from "@/lib/i18n/en"
import { useState } from "react"

interface Props {
  isFeatured? : boolean;
  isLoading: boolean;
  toggler: () => void;
}

const IsFeaturedToggler = (props: Props) => {
  return <FieldLabel htmlFor="switch-featured">
    <Field 
      orientation="horizontal" 
      className={`
        h-full transition-opacity
        has-data-[state=checked]:bg-blue-400/5 
        has-data-[state=checked]:border-blue-500 
        dark:has-data-[state=checked]:bg-blue-500/10
        ${props.isLoading ? "opacity-50 pointer-events-none select-none" : "opacity-100"}
      `}>
    <FieldContent>
      <FieldTitle> {en.isFeatured} </FieldTitle>
      <FieldDescription>
        {en.isFeatured_description}
      </FieldDescription>
    </FieldContent>
    <Switch 
      id="switch-featured" 
      checked={props.isFeatured ?? false}
      onCheckedChange={props.toggler} 
      className="data-[state=checked]:bg-blue-500"
      disabled={props.isLoading}
    />
    </Field>
  </FieldLabel>
}

export default IsFeaturedToggler;