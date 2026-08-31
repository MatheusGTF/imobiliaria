"use client";

import { ButtonHTMLAttributes } from "react";
import { Button } from "./Button";

export function ConfirmButton({
  confirmMessage,
  variant = "secondary",
  size = "md",
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  confirmMessage: string;
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md";
}) {
  return (
    <Button
      type="submit"
      variant={variant}
      size={size}
      onClick={(e) => {
        if (!confirm(confirmMessage)) e.preventDefault();
      }}
      {...props}
    >
      {children}
    </Button>
  );
}
