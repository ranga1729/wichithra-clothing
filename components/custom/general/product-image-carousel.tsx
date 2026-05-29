'use client'

import { useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Eye, Loader2, Plus, X } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { addProductImage, deleteProductImage } from "@/app/(admin)/admin/products/action";
import { en } from "@/lib/i18n/en";

interface ProductImage {
  id: string;
  imageUrl: string;
}

interface ProductImageCarouselProps {
  productId: string;
  productImages: ProductImage[];
}

export default function ProductImageCarousel({ productId, productImages }: ProductImageCarouselProps) {
  const queryClient = useQueryClient();
  const [uploadingImageCount, setUploadingImageCount] = useState(0);
  const [deletingImageIds, setDeletingImageIds] = useState<Set<string>>(new Set());
  const imageInputRef = useRef<HTMLInputElement>(null);

  const imageCount = (productImages?.length ?? 0) + uploadingImageCount;

  const handleImageFilesChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const currentCount = productImages?.length ?? 0;
    const remaining = 10 - currentCount;
    const filesToUpload = files.slice(0, remaining);

    setUploadingImageCount(filesToUpload.length);
    e.target.value = "";

    for (const file of filesToUpload) {
      try {
        const formData = new FormData();
        formData.append("file", file);
        const response = await addProductImage(productId, formData);
        if (response.success) {
          queryClient.invalidateQueries({ queryKey: ["products", productId] });
        } else {
          toast.error(response.error || en.failed_to_upload_image);
        }
      } catch {
        toast.error(en.failed_to_upload_image);
      }
      setUploadingImageCount((prev) => Math.max(0, prev - 1));
    }
  };

  const handleDeleteImage = async (imageId: string) => {
    setDeletingImageIds((prev) => new Set(prev).add(imageId));
    const response = await deleteProductImage(imageId);
    if (response.success) {
      queryClient.invalidateQueries({ queryKey: ["products", productId] });
    } else {
      toast.error(response.error || en.failed_to_remove_image);
    }
    setDeletingImageIds((prev) => {
      const next = new Set(prev);
      next.delete(imageId);
      return next;
    });
  };

  return (
    <div className="flex flex-col gap-2">
      <h1 className="font-bold text-md text-neutral-600 text-center">Product Images</h1>
      <div className="border border-neutral-300 dark:border-neutral-600 p-4 rounded-2xl flex flex-col gap-3">
        <div className="flex flex-wrap gap-3">
          {productImages?.map((image) => (
            <div key={image.id} className="relative w-40 h-40 rounded-lg overflow-hidden border border-neutral-300 dark:border-neutral-600 shrink-0">
              <img
                src={image.imageUrl}
                alt="Product image"
                className="object-cover w-full h-full"
              />
              <div className="absolute top-1 right-1 flex gap-1">
                <button
                  type="button"
                  onClick={() => window.open(image.imageUrl, "_blank")}
                  className="bg-black/60 hover:bg-black/80 text-white rounded-full p-1 transition-colors"
                  title="View full image"
                >
                  <Eye size={13} />
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteImage(image.id)}
                  disabled={deletingImageIds.has(image.id)}
                  className="bg-red-600/80 hover:bg-red-600 text-white rounded-full p-1 transition-colors disabled:opacity-50"
                  title="Delete image"
                >
                  {deletingImageIds.has(image.id)
                    ? <Loader2 size={13} className="animate-spin" />
                    : <X size={13} />}
                </button>
              </div>
            </div>
          ))}
          {Array.from({ length: uploadingImageCount }).map((_, i) => (
            <Skeleton key={i} className="w-32 h-32 rounded-lg shrink-0" />
          ))}
        </div>
        <div className="flex items-center gap-3">
          {imageCount < 10 ? (
            <>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => imageInputRef.current?.click()}
                disabled={uploadingImageCount > 0}
              >
                <Plus size={15} className="mr-1" /> Add Images
              </Button>
              <input
                ref={imageInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/jpg"
                multiple
                className="hidden"
                onChange={handleImageFilesChange}
              />
              <span className="text-xs text-muted-foreground">{imageCount}/10 images</span>
            </>
          ) : (
            <span className="text-xs text-muted-foreground">Maximum of 10 images reached</span>
          )}
        </div>
      </div>
    </div>
  );
}
