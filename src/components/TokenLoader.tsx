import { useState } from "react";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  IconChevronRight,
  IconEye,
  IconEyeOff,
  IconButton,
  Input,
  Label,
  toast,
} from "./ui";
import { exchangeCode, findLocalToken, loginWeb, toMessage } from "../lib/tauri";

interface TokenLoaderProps {
  token: string;
  onTokenChange: (token: string) => void;
}

const WEB_LOGIN_TIMEOUT_SECS = 300;

/**
 * Streamlabs API token card: paste manually, scan the local Streamlabs
 * installation, log in via the system browser, or run a manual PKCE
 * code exchange (advanced).
 *
 * Account info refresh is handled by App whenever the token changes.
 */
export function TokenLoader({ token, onTokenChange }: TokenLoaderProps) {
  const [showToken, setShowToken] = useState(false);
  const [loadingPc, setLoadingPc] = useState(false);
  const [loadingWeb, setLoadingWeb] = useState(false);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [code, setCode] = useState("");
  const [verifier, setVerifier] = useState("");
  const [exchanging, setExchanging] = useState(false);

  async function handleLoadFromPc(): Promise<void> {
    setLoadingPc(true);
    try {
      const found = await findLocalToken();
      if (found !== null && found.trim() !== "") {
        onTokenChange(found);
        toast.success("Token de API cargado desde tu instalación local de Streamlabs.");
      } else {
        toast.error("No se encontró ningún token de API localmente. Asegúrate de que Streamlabs esté instalado y de haber iniciado sesión con TikTok.");
      }
    } catch (err) {
      toast.error(toMessage(err));
    } finally {
      setLoadingPc(false);
    }
  }

  async function handleLoadFromWeb(): Promise<void> {
    setLoadingWeb(true);
    try {
      const received = await loginWeb(WEB_LOGIN_TIMEOUT_SECS);
      onTokenChange(received);
      toast.success("¡Inicio de sesión exitoso! Token de API de Streamlabs recibido.");
    } catch (err) {
      toast.error(toMessage(err));
    } finally {
      setLoadingWeb(false);
    }
  }

  async function handleExchange(): Promise<void> {
    const trimmedCode = code.trim();
    const trimmedVerifier = verifier.trim();
    if (trimmedCode === "" || trimmedVerifier === "") {
      toast.error("Se requieren tanto el código de autorización como el verificador de código.");
      return;
    }
    setExchanging(true);
    try {
      const received = await exchangeCode(trimmedCode, trimmedVerifier);
      onTokenChange(received);
      toast.success("¡Código intercambiado con éxito! Token de API de Streamlabs recibido.");
      setCode("");
      setVerifier("");
      setAdvancedOpen(false);
    } catch (err) {
      toast.error(toMessage(err));
    } finally {
      setExchanging(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cargador de token</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-2">
          <Label htmlFor="token-input">Token de API de Streamlabs</Label>
          <div className="relative">
            <Input
              id="token-input"
              type={showToken ? "text" : "password"}
              value={token}
              placeholder="Pega el token aquí o cárgalo abajo..."
              autoComplete="off"
              autoCapitalize="off"
              spellCheck={false}
              className="pr-11 font-mono text-xs"
              onChange={(event) => onTokenChange(event.target.value)}
            />
            <IconButton
              label={showToken ? "Ocultar token" : "Mostrar token"}
              className="absolute right-1.5 top-1/2 -translate-y-1/2"
              onClick={() => setShowToken((visible) => !visible)}
            >
              {showToken ? <IconEyeOff className="h-4 w-4" /> : <IconEye className="h-4 w-4" />}
            </IconButton>
          </div>
        </div>

        <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:flex-wrap">
          <Button
            className="min-w-0 flex-1"
            loading={loadingPc}
            disabled={loadingWeb}
            onClick={() => void handleLoadFromPc()}
          >
            {loadingPc ? "Buscando token local…" : "Cargar desde el PC"}
          </Button>
          <Button
            className="min-w-0 flex-1"
            loading={loadingWeb}
            disabled={loadingPc}
            onClick={() => void handleLoadFromWeb()}
          >
            {loadingWeb ? "Esperando el inicio de sesión…" : "Cargar desde la Web"}
          </Button>
        </div>

        {loadingWeb && (
          <p className="text-xs leading-relaxed text-zinc-500">
            Completa el inicio de sesión en tu navegador — puede tardar unos minutos.
          </p>
        )}

        {/* Advanced: manual PKCE code exchange fallback */}
        <div className="rounded-lg border border-zinc-800/80 bg-zinc-950/40">
          <button
            type="button"
            aria-expanded={advancedOpen}
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs font-medium text-zinc-400 transition hover:text-zinc-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tiktok-cyan/60 rounded-lg"
            onClick={() => setAdvancedOpen((open) => !open)}
          >
            <IconChevronRight className={`h-3.5 w-3.5 transition-transform ${advancedOpen ? "rotate-90" : ""}`} />
            Avanzado · Intercambio manual de código
          </button>
          {advancedOpen && (
            <div className="flex flex-col gap-3 border-t border-zinc-800/80 p-3">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="code-input">Código de autorización</Label>
                <Input
                  id="code-input"
                  value={code}
                  placeholder="Pega el código devuelto por la página de login"
                  autoComplete="off"
                  autoCapitalize="off"
                  spellCheck={false}
                  className="font-mono text-xs"
                  onChange={(event) => setCode(event.target.value)}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="verifier-input">Verificador de código (PKCE)</Label>
                <Input
                  id="verifier-input"
                  value={verifier}
                  placeholder="Pega el verificador de código PKCE"
                  autoComplete="off"
                  autoCapitalize="off"
                  spellCheck={false}
                  className="font-mono text-xs"
                  onChange={(event) => setVerifier(event.target.value)}
                />
              </div>
              <Button size="sm" loading={exchanging} onClick={() => void handleExchange()}>
                Intercambiar código
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
