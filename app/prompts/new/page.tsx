"use client";
import { useMutation } from "@apollo/client/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CREATE_PROMPT } from "@/app/lib/graphql";
import { PromptForm, PromptFormValues } from "@/components/prompt-form";

export default function NewPromptPage() {
  const router = useRouter();
  const [createPrompt, { loading }] = useMutation(CREATE_PROMPT);

  async function handleSubmit(values: PromptFormValues) {
    try {
      const { data } = await createPrompt({ variables: { input: values } });
      if (data?.createPrompt?.success) {
        toast.success("Prompt creado");
        router.push("/prompts");
      } else {
        toast.error(data?.createPrompt?.message ?? "Error al crear");
      }
    } catch {
      toast.error("Error al crear");
    }
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-semibold mb-6">Nuevo prompt</h1>
      <PromptForm onSubmit={handleSubmit} loading={loading} submitLabel="Crear" />
    </div>
  );
}
