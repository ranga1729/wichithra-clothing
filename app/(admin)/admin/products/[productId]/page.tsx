'use client'
import { ProductSchema } from "@/schemas/admin-schemas";
import { useParams } from "next/navigation"
import { useEffect, useState } from "react";
import { getProduct } from "../action";
import toast from "react-hot-toast";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";

 

export default function ProductDetailPage() {
  const [product, setProduct] = useState<ProductSchema>();
  const [isLoading, setIsLoading] = useState(false);
  
  const params = useParams();
  const productId = params.productId?.toString();

  const fetchData = async () => {
    try {
      setIsLoading(true);

      const response = await getProduct(productId!);

      if(!response.success && response.message) {
        toast.error(response.message);
      }
      
      if(response.success) {
        setProduct(response.data.product)
      }

    } catch(error:any) {
      toast.error(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [productId])

  useEffect(() => {
    console.log("test:", product)
  }, [product])

  const ImageCarousel = () => {
    return <Carousel
        opts={{
          align: "start",
        }}
        className="w-full max-w-[12rem] sm:max-w-md md:max-w-lg lg:max-w-4xl"
      >
      <CarouselPrevious />
      <CarouselContent>
        {product?.productImages.map((image, index) => (
          <CarouselItem key={index} className="basis-1/2 lg:basis-1/4">
            <div className="p-1">
              <Card className="p-0.5">
                <CardContent className="flex aspect-square items-center justify-center m-0 p-0">
                  <Image src={image.imageUrl} alt={"test"} width={1200} height={1200} className="rounded-md" />
                </CardContent>
              </Card>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselNext />
    </Carousel>
  }

  return (
    <div className="flex items-center justify-center bg-neutral-200 py-3">
      <ImageCarousel />
      
      
    </div>
  )
}