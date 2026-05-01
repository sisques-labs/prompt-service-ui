"use client";
import { useQuery, useMutation } from "@apollo/client/react";
import { promptsClient } from "@/app/lib/apollo";
import { useParams, useRouter } from "next/navigation"; // eslint-disable-line
import { toast } from "sonner";
import { FIND_BY_ID, UPDATE_PROMPT } from "@/features/prompts/graphql";
import { Prompt } from "@/features/prompts/types";
import { PromptForm, PromptFormValues } from "@/features/prompts/components/prompt-form";

export default function EditPromptPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const { data, loading } = useQuery<{ findById: Prompt }>(FIND_BY_ID, { client: promptsClient, variables: { id } });
  const [updatePrompt, { loading: saving }] = useMutation(UPDATE_PROMPT, { client: promptsClient });

  async function handleSubmit(values: PromptFormValues) {
    try {
      const { data } = await updatePrompt({ variables: { input: { id, ...values } } });
      if (data?.updatePrompt?.success) {
        toast.success("Prompt actualizado");
        router.push(`/prompts/${id}`);
      } else {
        toast.error(data?.updatePrompt?.message ?? "Error al actualizar");
      }
    } catch {
      toast.error("Error al actualizar");
    }
  }

  if (loading) return <div className="text-muted-foreground py-16 text-center">Cargando...</div>;
  const p = data?.findById;
  if (!p) return <div className="text-muted-foreground py-16 text-center">Prompt no encontrado</div>;

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-semibold mb-6">Editar: {p.name}</h1>
      <PromptForm defaultValues={p} onSubmit={handleSubmit} loading={saving} submitLabel="Guardar cambios" />
    </div>
  );
}
