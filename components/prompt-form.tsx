"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { TagInput } from "@/components/tag-input";
import { Prompt } from "@/app/lib/types";

const schema = z.object({
  name: z.string().min(3, "Mínimo 3 caracteres"),
  content: z.string().min(10, "Mínimo 10 caracteres"),
  tags: z.array(z.string()),
});

export type PromptFormValues = z.infer<typeof schema>;

interface Props {
  defaultValues?: Partial<Prompt>;
  onSubmit: (values: PromptFormValues) => void;
  loading?: boolean;
  submitLabel?: string;
}

export function PromptForm({ defaultValues, onSubmit, loading, submitLabel = "Guardar" }: Props) {
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<PromptFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: defaultValues?.name ?? "",
      content: defaultValues?.content ?? "",
      tags: defaultValues?.tags ?? [],
    },
  });

  const tags = watch("tags");

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <Label htmlFor="name">Nombre</Label>
        <Input id="name" {...register("name")} placeholder="ej. email-bienvenida" />
        {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="content">Contenido</Label>
        <Textarea
          id="content"
          {...register("content")}
          rows={12}
          placeholder="Hola {{nombre}}, bienvenido/a a {{empresa}}..."
          className="font-mono text-sm"
        />
        <p className="text-xs text-muted-foreground">Usa {"{{nombreVariable}}"} para definir variables</p>
        {errors.content && <p className="text-sm text-destructive">{errors.content.message}</p>}
      </div>

      <div className="flex flex-col gap-2">
        <Label>Tags</Label>
        <TagInput value={tags} onChange={(t) => setValue("tags", t)} />
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={loading}>
          {loading ? "Guardando..." : submitLabel}
        </Button>
        <Button type="button" variant="outline" onClick={() => history.back()} disabled={loading}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}
