import { cn } from "@/lib/utils";

export function StatusBadge({ ativo }: { ativo: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium",
        ativo
          ? "bg-success/10 text-success"
          : "bg-destructive/10 text-destructive",
      )}
    >
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          ativo ? "bg-success" : "bg-destructive",
        )}
      />
      {ativo ? "Ativo" : "Inativo"}
    </span>
  );
}