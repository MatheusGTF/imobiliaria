"use client";

import { Button } from "@/components/ui/Button";
import { Printer } from "lucide-react";

export function PrintButton() {
  return (
    <Button onClick={() => window.print()} className="print:hidden">
      <Printer size={16} /> Imprimir / Salvar em PDF
    </Button>
  );
}
