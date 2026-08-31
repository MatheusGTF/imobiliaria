"use client";

import { ConfirmButton } from "./ConfirmButton";

export function DeleteButton({
  confirmMessage = "Tem certeza que deseja excluir? Essa ação não pode ser desfeita.",
  label = "Excluir",
}: {
  confirmMessage?: string;
  label?: string;
}) {
  return (
    <ConfirmButton variant="danger" size="sm" confirmMessage={confirmMessage}>
      {label}
    </ConfirmButton>
  );
}
