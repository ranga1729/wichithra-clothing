'use client'

import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ProductDesignSchema } from "@/schemas/admin-schemas";
import { Plus, Trash2 } from "lucide-react";
import { useMemo } from "react";

interface Props {
  designs?: ProductDesignSchema[];
}

// take all the designs to the drop down menu
// let create new product-design map using "+" icon
//make this editable
// 

const DesignMapper = (props: Props) => {

  const hasDataChanged = useMemo(() => {
    return true
  }, [])

  const handleSave = () => {
    console.log("Change design changes")
  }

  const handleReset = () => {
    console.log("Reset design changes")
  }

  return (
    <Card className="w-full max-w-70">
      <CardHeader className="flex flex-col items-center justify-between">
        <div className="flex flex-row items-center justify-between w-full"> 
          <CardTitle>Designs</CardTitle>
          <CardAction>
            <Button variant="outline"> <Plus /> </Button>
          </CardAction>
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
      <CardFooter className="flex flex-row items-center justify-end gap-2">

        <Button disabled={hasDataChanged} onClick={handleSave}>Save</Button>
        <Button disabled={hasDataChanged} onClick={handleReset}>Reset</Button>
      </CardFooter>
      
    </Card>
  )
}

export default DesignMapper;