"use client";
import { useQuery, useMutation } from "@apollo/client/react";
import { promptsClient } from "@/app/lib/apollo";
import { useParams, useRouter } from "next/navigation"; // eslint-disable-line
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { FIND_BY_ID, DELETE_PROMPT } from "@/features/prompts/graphql";
import { Prompt } from "@/features/prompts/types";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PromptDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [confirmDelete, setConfirmDelete] = useState(false);

  const { data, loading } = useQuery<{ findById: Prompt }>(FIND_BY_ID, { client: promptsClient, variables: { id } });
  const [deletePrompt, { loading: deleting }] = useMutation(DELETE_PROMPT, { client: promptsClient });

  async function handleDelete() {
    try {
      const { data } = await deletePrompt({ variables: { id } });
      if (data?.deletePrompt?.success) {
        toast.success("Prompt eliminado");
        router.push("/prompts");
      } else {
        toast.error(data?.deletePrompt?.message ?? "Error al eliminar");
      }
    } catch {
      toast.error("Error al eliminar");
    }
  }

  if (loading) return <div className="text-muted-foreground py-16 text-center">Cargando...</div>;
  const p = data?.findById;
  if (!p) return <div className="text-muted-foreground py-16 text-center">Prompt no encontrado</div>;

  function formatDate(d: string) {
    return new Date(d).toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" });
  }

  return (
    <div className="max-w-2xl">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold">{p.name}</h1>
          <p className="text-muted-foreground text-sm mt-1">
            <code>{p.slug}</code> · v{p.version}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href={`/prompts/${p.id}/render`}>Probar</Link>
          </Button>
          <Button asChild>
            <Link href={`/prompts/${p.id}/edit`}>Editar</Link>
          </Button>
          <Button variant="destructive" onClick={() => setConfirmDelete(true)}>
            Eliminar
          </Button>
        </div>
      </div>

      {p.tags.length > 0 && (
        <div className="flex gap-2 flex-wrap mb-4">
          {p.tags.map((tag) => <Badge key={tag} variant="secondary">{tag}</Badge>)}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-sm text-muted-foreground font-normal">Contenido</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="text-sm whitespace-pre-wrap font-mono bg-muted rounded p-4">{p.content}</pre>
        </CardContent>
      </Card>

      <div className="mt-4 text-xs text-muted-foreground flex gap-6">
        <span>Creado: {formatDate(p.createdAt)}</span>
        <span>Actualizado: {formatDate(p.updatedAt)}</span>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        title="Eliminar prompt"
        message={`¿Eliminar "${p.name}"? Esta acción no se puede deshacer.`}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(false)}
        loading={deleting}
      />
    </div>
  );
}
