'use client'

import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProductDesignSchema } from "@/schemas/admin-schemas";
import { Plus, X } from "lucide-react";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { removeDesignFromProduct } from "@/app/(admin)/admin/products/action";
import toast from "react-hot-toast";
import { en } from "@/lib/i18n/en";
import AssignDesignModal from "./AssignDesignModal";

interface Props {
  designs?: ProductDesignSchema[];
  productId: string;
}

const DesignMapper = (props: Props) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const queryClient = useQueryClient();

  const assignedDesignIds = props.designs?.map((d) => d.designId) ?? [];

  const { mutate: removeDesign, isPending } = useMutation({
    mutationFn: (productDesignId: string) => removeDesignFromProduct(productDesignId),
    onSuccess: (response) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: ["products", props.productId] });
        toast.success(en.design_removed_from_product);
      } else {
        toast.error(response.error || en.failed_to_remove_design);
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || en.failed_to_remove_design);
    },
  });

  return (
    <>
      <Card className="w-full max-w-70">
        <CardHeader className="flex flex-col items-center justify-between">
          <div className="flex flex-row items-center justify-between w-full">
            <CardTitle>Designs</CardTitle>
            <CardAction>
              <Button variant="outline" size="icon" onClick={() => setIsModalOpen(true)}>
                <Plus />
              </Button>
            </CardAction>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-0">
          <div className="flex flex-col gap-1">
            {!props.designs || props.designs.length === 0 ? (
              <p className="text-sm text-neutral-400 text-center py-2">{en.no_designs_assigned}</p>
            ) : (
              props.designs.map((design) => (
                <div key={design.id} className="flex flex-row justify-between items-center border w-full p-2 rounded-xl">
                  <div className="flex flex-row gap-2 items-center justify-start">
                    <div>{design.design.name}</div>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7 hover:bg-red-50"
                    onClick={() => removeDesign(design.id)}
                    disabled={isPending}
                  >
                    <X className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <AssignDesignModal
        isModalOpen={isModalOpen}
        onOpenChange={setIsModalOpen}
        productId={props.productId}
        assignedDesignIds={assignedDesignIds}
      />
    </>
  );
}

export default DesignMapper;
