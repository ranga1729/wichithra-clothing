import { Field, FieldContent, FieldDescription, FieldLabel, FieldTitle } from "@/components/ui/field"
import { Switch } from "@/components/ui/switch"
import { en } from "@/lib/i18n/en"
import { useState } from "react"

interface Props {
  isFeatured? : boolean;
}

const IsFeaturedToggler = (props: Props) => {

  const toggleFeaturedStatus = () => {
    console.log("toggle featured status")
  }

  return <FieldLabel htmlFor="switch-featured">
    <Field orientation="horizontal" className="has-data-[state=checked]:bg-blue-400/5 has-data-[state=checked]:border-blue-500 dark:has-data-[state=checked]:bg-blue-500/10 h-full">
    <FieldContent>
      <FieldTitle> {en.input_labels.isFeatured} </FieldTitle>
      <FieldDescription>
        {en.input_labels.isFeatured_description}
      </FieldDescription>
    </FieldContent>
    <Switch 
      id="switch-featured" 
      checked={props.isFeatured}
      onCheckedChange={toggleFeaturedStatus} 
      className="data-[state=checked]:bg-blue-500"
    />
    </Field>
  </FieldLabel>
}

export default IsFeaturedToggler;