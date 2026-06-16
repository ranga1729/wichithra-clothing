import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { VariantSchema } from "@/schemas/admin-schemas";

const SIZE_ORDER = ["XS", "S", "M", "L", "XL", "XXL", "XXXL"];

interface Props {
  variants?: VariantSchema[];
}

const SizeMapper = (props: Props) => {
  const distinctSizes = props.variants
    ? Array.from(new Set(props.variants.map((v) => v.size))).sort(
        (a, b) => SIZE_ORDER.indexOf(a) - SIZE_ORDER.indexOf(b)
      )
    : [];

  return (
    <Card className="w-full max-w-70">
      <CardHeader className="flex flex-col items-start justify-between">
        <CardTitle>Sizes</CardTitle>
        <CardDescription>Sizes available for this product.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-row flex-wrap gap-2">
        {distinctSizes.length === 0 ? (
          <p className="text-sm text-neutral-400 py-2">No sizes assigned yet</p>
        ) : (
          distinctSizes.map((size) => (
            <span
              key={size}
              className={cn(
                "border flex items-center justify-center rounded-md px-2 py-1 text-xs font-medium",
                "bg-neutral-200 text-neutral-800 border-neutral-400"
              )}
            >
              {size}
            </span>
          ))
        )}
      </CardContent>
    </Card>
  );
};

export default SizeMapper;
