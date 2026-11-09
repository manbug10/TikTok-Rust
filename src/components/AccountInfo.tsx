import { Badge, Button, Card, CardContent, CardHeader, CardTitle, IconRefresh } from "./ui";
import type { AccountInfo as AccountInfoData } from "../types";

interface AccountInfoProps {
  /** True when the token input is non-empty. */
  hasToken: boolean;
  /** null until the first successful `account_info` fetch. */
  account: AccountInfoData | null;
  loading: boolean;
  onRefresh: () => void;
}

function InfoRow({ label, value, placeholder }: { label: string; value: string; placeholder: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-zinc-800/60 bg-zinc-950/60 px-3 py-2.5">
      <span className="shrink-0 text-xs font-medium uppercase tracking-wider text-zinc-500">{label}</span>
      <span className={`truncate text-sm ${value === "" ? "text-zinc-500" : "text-zinc-200"}`}>
        {value === "" ? placeholder : value}
      </span>
    </div>
  );
}

/**
 * Read-only account overview card rendered below the Token Loader card.
 * When `can_be_live` is false, App disables the stream inputs and Go Live.
 */
export function AccountInfo({ hasToken, account, loading, onRefresh }: AccountInfoProps) {
  const canGoLiveBadge = (() => {
    if (!hasToken || account === null) return <Badge variant="default">Desconocido</Badge>;
    return account.can_be_live ? <Badge variant="emerald">Sí</Badge> : <Badge variant="red">No</Badge>;
  })();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Info de la cuenta</CardTitle>
        <Button size="sm" variant="secondary" className="min-w-0" disabled={!hasToken || loading} onClick={onRefresh}>
          <IconRefresh className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          {loading ? "Actualizando…" : "Actualizar cuenta"}
        </Button>
      </CardHeader>
      <CardContent>
        <InfoRow
          label="Usuario"
          value={account?.username ?? ""}
          placeholder={hasToken ? (loading ? "Cargando…" : "—") : "Sin token cargado"}
        />
        <InfoRow
          label="Estado"
          value={account?.status ?? ""}
          placeholder={hasToken ? (loading ? "Cargando…" : "—") : "Sin token cargado"}
        />
        <div className="flex items-center justify-between gap-3 rounded-lg border border-zinc-800/60 bg-zinc-950/60 px-3 py-2.5">
          <span className="shrink-0 text-xs font-medium uppercase tracking-wider text-zinc-500">Puede transmitir</span>
          {canGoLiveBadge}
        </div>
      </CardContent>
    </Card>
  );
}
