"use client";
import { useQuery, useLazyQuery } from "@apollo/client/react";
import { promptsClient } from "@/app/lib/apollo";
import { useParams } from "next/navigation";
import { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { FIND_BY_ID, RENDER_PROMPT } from "@/features/prompts/graphql";
import { Prompt } from "@/features/prompts/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const VAR_REGEX = /\{\{\s*(\w+)\s*\}\}/g;

function extractVariables(content: string): string[] {
  return [...new Set([...content.matchAll(VAR_REGEX)].map((m) => m[1]))];
}

export default function RenderPromptPage() {
  const { id } = useParams<{ id: string }>();
  const [rendered, setRendered] = useState<Prompt | null>(null);

  const { data, loading } = useQuery<{ findById: Prompt }>(FIND_BY_ID, { client: promptsClient, variables: { id } });
  const [renderPrompt, { loading: rendering }] = useLazyQuery(RENDER_PROMPT, { client: promptsClient });

  const p = data?.findById;
  const variables = useMemo(() => (p ? extractVariables(p.content) : []), [p]);

  const { register, handleSubmit } = useForm<Record<string, string>>();

  async function onSubmit(values: Record<string, string>) {
    const variableInputs = Object.entries(values).map(([name, value]) => ({ name, value }));
    try {
      const { data } = await renderPrompt({ variables: { input: { id, variables: variableInputs } } });
      if (data?.renderPrompt) {
        setRendered(data.renderPrompt);
      }
    } catch {
      toast.error("Error al renderizar");
    }
  }

  if (loading) return <div className="text-muted-foreground py-16 text-center">Cargando...</div>;
  if (!p) return <div className="text-muted-foreground py-16 text-center">Prompt no encontrado</div>;

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Probar: {p.name}</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-sm">Template original</CardTitle></CardHeader>
          <CardContent>
            <pre className="text-sm whitespace-pre-wrap font-mono bg-muted rounded p-3">{p.content}</pre>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-sm">Variables</CardTitle></CardHeader>
          <CardContent>
            {variables.length === 0 ? (
              <p className="text-sm text-muted-foreground mb-4">
                Este prompt no tiene variables. Puedes renderizarlo directamente.
              </p>
            ) : (
              <form id="var-form" onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 mb-4">
                {variables.map((varName) => (
                  <div key={varName} className="flex flex-col gap-1">
                    <Label htmlFor={varName}>{varName}</Label>
                    <Input id={varName} {...register(varName, { required: true })} placeholder={varName} />
                  </div>
                ))}
              </form>
            )}
            <Button
              form="var-form"
              type="submit"
              disabled={rendering}
              onClick={variables.length === 0 ? handleSubmit(onSubmit) : undefined}
            >
              {rendering ? "Renderizando..." : "Renderizar"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-sm">Resultado</CardTitle></CardHeader>
          <CardContent>
            {rendered ? (
              <pre className="text-sm whitespace-pre-wrap font-mono bg-muted rounded p-3">{rendered.content}</pre>
            ) : (
              <p className="text-sm text-muted-foreground">El resultado aparecerá aquí.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
