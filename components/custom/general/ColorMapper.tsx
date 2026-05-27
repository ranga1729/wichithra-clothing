import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProductColorSchema } from "@/schemas/admin-schemas";
import { Plus, Trash2 } from "lucide-react";

interface Props {
  colors?: ProductColorSchema[];
}

const ColorMapper = (props:Props) => {
  return (
    <Card className="w-full max-w-90">
      <CardHeader className="flex flex-col items-center justify-between">
        <div className="flex flex-row items-center justify-between w-full"> 
          <CardTitle>Colors</CardTitle>
          <CardAction>
            <Button variant="outline"> <Plus /> </Button>
          </CardAction>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-0">
        <div className="flex flex-col gap-1">
          {
            props.colors && props.colors.map((color) => (
              <div key={color.id} className="flex flex-row justify-between items-center border w-full p-2 rounded-xl">
                <div className="flex flex-row  gap-2 items-center justify-start">
                  <div className="rounded-full border w-5 h-5 " style={{ backgroundColor: "#" + color.color.hexCode }}> </div>
                  <div> {color.color.name} </div>
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

export default ColorMapper;