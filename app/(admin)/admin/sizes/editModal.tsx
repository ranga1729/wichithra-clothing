import { Size } from "@/generated/prisma/client";
import { DesignSchema } from "@/schemas/admin-schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";

interface Props {
  isModalOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedsize?: Size;
}

export default function EditModal(props: Props) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [prevData, setPrevData] = useState<Size>();

  const {
      register, handleSubmit,
      setValue, reset, watch,
      formState: { errors },
    } = useForm<DesignSchema>({
      resolver: zodResolver(designSchema),
      mode: "onChange",
      defaultValues: {
        name: "",
        description: "",
        sortOrder: "",
      },
    });
}