"use client";
import { useState, useCallback } from "react";
import { useQuery, useMutation } from "@apollo/client/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { FIND_BY_CRITERIA, DELETE_PROMPT } from "@/app/lib/graphql";
import { Prompt, PaginatedResult } from "@/app/lib/types";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const PAGE_SIZES = [10, 25, 50];

function buildCriteria(page: number, perPage: number, search: string, tags: string[]) {
  const filters = [];
  if (search.trim()) filters.push({ field: "name", operator: "LIKE", value: search.trim() });
  for (const tag of tags) filters.push({ field: "tags", operator: "IN", value: tag });
  return { filters, pagination: { page, perPage }, sorts: [{ field: "updatedAt", direction: "DESC" }] };
}

export default function PromptsPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [activeTags, setActiveTags] = useState<string[]>([]);
  const [deleteTarget, setDeleteTarget] = useState<Prompt | null>(null);

  const { data, loading, refetch } = useQuery<{ findByCriteria: PaginatedResult }>(FIND_BY_CRITERIA, {
    variables: { criteria: buildCriteria(page, perPage, debouncedSearch, activeTags) },
  });

  const [deletePrompt, { loading: deleting }] = useMutation(DELETE_PROMPT);

  const handleSearch = useCallback((value: string) => {
    setSearch(value);
    clearTimeout((handleSearch as any).__timer);
    (handleSearch as any).__timer = setTimeout(() => {
      setDebouncedSearch(value);
      setPage(1);
    }, 300);
  }, []);

  function toggleTag(tag: string) {
    setActiveTags((prev) => {
      const next = prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag];
      setPage(1);
      return next;
    });
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      const { data } = await deletePrompt({ variables: { id: deleteTarget.id } });
      if (data?.deletePrompt?.success) {
        toast.success("Prompt eliminado");
        refetch();
      } else {
        toast.error(data?.deletePrompt?.message ?? "Error al eliminar");
      }
    } catch {
      toast.error("Error al eliminar");
    } finally {
      setDeleteTarget(null);
    }
  }

  const result = data?.findByCriteria;
  const prompts = result?.items ?? [];
  const total = result?.total ?? 0;
  const totalPages = result?.totalPages ?? 0;

  function formatDate(d: string) {
    return new Date(d).toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" });
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Prompts</h1>
        <Button asChild>
          <Link href="/prompts/new">+ Nuevo prompt</Link>
        </Button>
      </div>

      <div className="mb-4 flex flex-col gap-3">
        <Input
          placeholder="Buscar por nombre..."
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          className="max-w-sm"
        />
        {activeTags.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm text-muted-foreground">Filtros:</span>
            {activeTags.map((tag) => (
              <Badge
                key={tag}
                variant="default"
                className="cursor-pointer gap-1"
                onClick={() => toggleTag(tag)}
              >
                {tag} ×
              </Badge>
            ))}
          </div>
        )}
      </div>

      {loading ? (
        <div className="text-center py-16 text-muted-foreground">Cargando...</div>
      ) : prompts.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground flex flex-col items-center gap-4">
          <p>No hay prompts. ¡Crea el primero!</p>
          <Button asChild variant="outline">
            <Link href="/prompts/new">Crear prompt</Link>
          </Button>
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Tags</TableHead>
                <TableHead className="w-12">v</TableHead>
                <TableHead>Actualizado</TableHead>
                <TableHead className="w-32" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {prompts.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>
                    <Link href={`/prompts/${p.id}`} className="font-medium text-primary hover:underline">
                      {p.name}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <code className="text-xs bg-muted px-1.5 py-0.5 rounded">{p.slug}</code>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {p.tags.map((tag) => (
                        <Badge
                          key={tag}
                          variant={activeTags.includes(tag) ? "default" : "secondary"}
                          className="cursor-pointer text-xs"
                          onClick={() => toggleTag(tag)}
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>{p.version}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">{formatDate(p.updatedAt)}</TableCell>
                  <TableCell>
                    <div className="flex gap-1 justify-end">
                      <Button size="sm" variant="ghost" asChild title="Probar">
                        <Link href={`/prompts/${p.id}/render`}>▶</Link>
                      </Button>
                      <Button size="sm" variant="ghost" asChild title="Editar">
                        <Link href={`/prompts/${p.id}/edit`}>✏️</Link>
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-destructive hover:text-destructive"
                        onClick={() => setDeleteTarget(p)}
                        title="Eliminar"
                      >
                        🗑
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Filas por página:</span>
            <select
              value={perPage}
              onChange={(e) => { setPerPage(Number(e.target.value)); setPage(1); }}
              className="border rounded px-2 py-1 text-sm bg-background"
            >
              {PAGE_SIZES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            <span>{total} total</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
              ‹ Anterior
            </Button>
            <span className="text-sm">{page} / {totalPages}</span>
            <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
              Siguiente ›
            </Button>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Eliminar prompt"
        message={`¿Eliminar "${deleteTarget?.name}"? Esta acción no se puede deshacer.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleting}
      />
    </div>
  );
}
