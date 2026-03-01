import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ProductDesignSchema } from "@/schemas/admin-schemas";
import { Plus, Trash2 } from "lucide-react";

interface Props {
  designs?: ProductDesignSchema[];
}

const DesignMapper = (props: Props) => {
  return (
    <Card className="w-full max-w-70">
      <CardHeader className="flex flex-col items-center justify-between">
        <div className="flex flex-row items-center justify-between w-full"> 
          <CardTitle>Designs</CardTitle>
          <CardAction>
            <Button variant="outline"> <Plus /> </Button>
          </CardAction>
        </div>
        <div className="flex flex-row gap-2 items-center justify-between  w-full">
          <div className="flex-1"> Category </div>
          <Select>
            <SelectTrigger className="w-40">
              <SelectValue placeholder={"Select category"} />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value={"test-0"}>
                  {"Test-0"}
                </SelectItem>

                <SelectItem value={"test-1"}>
                  {"Test-1"}
                </SelectItem>
                <SelectItem value={"test-2"}>
                  {"Test-2"}
                </SelectItem>
                {/* {
                  props.colors && Object.values(props.colors).map((color) => (
                    <SelectItem key={color.id} value={color.color.id}>
                      {color.color.name}
                    </SelectItem>
                  ))
                } */}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-0">
        <div className="flex flex-col gap-1">
          {
            props.designs && props.designs.map((design) => (
              <div key={design.id} className="flex flex-row justify-between items-center border w-full p-2 rounded-xl">
                <div className="flex flex-row  gap-2 items-center justify-start">
                  <div> {design.design.name} </div>
                </div>
                <Button size={"sm"} variant="ghost" className="hover:bg-red-50"> <Trash2 stroke="red" /> </Button>
              </div>
            ))
          }
        </div>
      </CardContent>
      
    </Card>
  )
}

export default DesignMapper;