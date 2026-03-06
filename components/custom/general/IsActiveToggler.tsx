import { Field, FieldContent, FieldDescription, FieldLabel, FieldTitle } from "@/components/ui/field"
import { Switch } from "@/components/ui/switch"
import { en } from "@/lib/i18n/en"

interface Props {
  isActive?: boolean;
  isLoading: boolean;
  toggler: () => void;
}

const IsActiveToggler = (props: Props) => {
  return <FieldLabel htmlFor="switch-active">
    <Field 
      orientation="horizontal" 
      className={`
        h-full transition-opacity
        has-data-[state=checked]:bg-green-400/5 
        has-data-[state=checked]:border-green-500 
        dark:has-data-[state=checked]:bg-green-500/10
        ${props.isLoading ? "opacity-50 pointer-events-none select-none" : "opacity-100"}
      `}>
    <FieldContent>
      <FieldTitle> {en.input_labels.isActive} </FieldTitle>
      <FieldDescription>
        {en.input_labels.isActive_description} 
      </FieldDescription>
    </FieldContent>
    <Switch 
      id="switch-active" 
      checked={props.isActive}
      onCheckedChange={props.toggler}
      className="data-[state=checked]:bg-green-500"
      disabled={props.isLoading}
    />
    </Field>
  </FieldLabel>
}

export default IsActiveToggler;