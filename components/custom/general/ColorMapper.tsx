import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { VariantSchema } from "@/schemas/admin-schemas";

interface Props {
  variants?: VariantSchema[];
}

const ColorMapper = (props: Props) => {
  // Derive distinct colors from variants
  const distinctColors = props.variants
    ? Array.from(
        new Map(props.variants.map((v) => [v.colorId, v.color])).values()
      )
    : [];

  return (
    <Card className="w-full max-w-90">
      <CardHeader className="flex flex-col items-center justify-between">
        <div className="flex flex-row items-center justify-between w-full">
          <CardTitle>Colors</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-0">
        <div className="flex flex-col gap-1">
          {distinctColors.length === 0 ? (
            <p className="text-sm text-neutral-400 text-center py-2">No colors assigned yet</p>
          ) : (
            distinctColors.map((color) => (
              <div
                key={color.id}
                className="flex flex-row justify-between items-center border w-full p-2 rounded-xl"
              >
                <div className="flex flex-row gap-2 items-center justify-start">
                  {color.hexCode ? (
                    <div
                      className="rounded-full border w-5 h-5"
                      style={{ backgroundColor: `#${color.hexCode}` }}
                    />
                  ) : color.swatchImageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={color.swatchImageUrl}
                      alt={color.name}
                      className="rounded-full border w-5 h-5 object-cover"
                    />
                  ) : (
                    <div className="rounded-full border w-5 h-5 bg-neutral-200" />
                  )}
                  <div>{color.name}</div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ColorMapper;
