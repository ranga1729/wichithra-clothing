'use client'

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { en } from "@/lib/i18n/en";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { getAvailableDesigns, assignDesignToProduct } from "@/app/(admin)/admin/products/action";
import SearchableSelect from "./SearchableSelect";
import SaveButton from "@/components/SaveButton";
import CancelButton from "@/components/CancelButton";
import toast from "react-hot-toast";

interface DesignOption {
  id: string;
  name: string;
}

interface Props {
  isModalOpen: boolean;
  onOpenChange: (open: boolean) => void;
  productId: string;
  assignedDesignIds: string[];
}

export default function AssignDesignModal({ isModalOpen, onOpenChange, productId, assignedDesignIds }: Props) {
  const queryClient = useQueryClient();
  const [selectedDesign, setSelectedDesign] = useState<DesignOption | null>(null);

  const { data: availableDesigns, isPending: isLoadingDesigns } = useQuery({
    queryKey: ["available-designs"],
    queryFn: async () => {
      const response = await getAvailableDesigns();
      if (!response.success) throw new Error(response.error || en.failed_to_fetch_data);
      return response.data as DesignOption[];
    },
    enabled: isModalOpen,
  });

  const filteredDesigns = availableDesigns
    ? availableDesigns.filter((d) => !assignedDesignIds.includes(d.id))
    : [];

  const { mutate: assignDesign, isPending } = useMutation({
    mutationFn: (designId: string) => assignDesignToProduct(productId, designId),
    onSuccess: (response) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: ["products", productId] });
        toast.success(en.design_assigned_to_product);
        setSelectedDesign(null);
        onOpenChange(false);
      } else {
        toast.error(response.error || en.failed_to_assign_design);
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || en.failed_to_assign_design);
    },
  });

  const handleSave = () => {
    if (!selectedDesign) return;
    assignDesign(selectedDesign.id);
  };

  const handleCancel = () => {
    setSelectedDesign(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={onOpenChange}>
      <DialogContent className="dark:bg-neutral-800">
        <DialogHeader>
          <DialogTitle>{en.assign_design_title}</DialogTitle>
          <DialogDescription>{en.assign_design_subtitle}</DialogDescription>
        </DialogHeader>

        <div className="py-2">
          {isLoadingDesigns ? (
            <p className="text-sm text-muted-foreground text-center py-4">{en.loading}</p>
          ) : filteredDesigns.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">{en.no_available_designs}</p>
          ) : (
            <SearchableSelect
              items={filteredDesigns}
              itemToStringValue={(item) => item.name}
              value={selectedDesign}
              onValueChange={setSelectedDesign}
              placeholder="Search designs..."
              emptyMessage={en.no_search_result_found}
            />
          )}
        </div>

        <DialogFooter>
          <SaveButton isPending={isPending} disabled={!selectedDesign} onClick={handleSave} />
          <CancelButton onClick={handleCancel} isPending={isPending} />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
