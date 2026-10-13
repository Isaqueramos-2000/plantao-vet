"use client";

import type { ComponentProps } from "react";
import { Button, type ButtonStyleProps } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

/** Botão de protótipo: mostra um aviso em vez de executar a ação. */
export function DemoButton({
  toastTitle = "Ação de demonstração",
  toastDescription = "Nesta versão de protótipo nada é salvo ou enviado.",
  ...props
}: Omit<ComponentProps<"button">, "onClick"> &
  ButtonStyleProps & { toastTitle?: string; toastDescription?: string }) {
  const toast = useToast();
  return <Button {...props} onClick={() => toast({ title: toastTitle, description: toastDescription })} />;
}
