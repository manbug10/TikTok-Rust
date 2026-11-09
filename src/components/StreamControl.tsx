import { useState } from "react";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  IconCopy,
  IconEye,
  IconEyeOff,
  IconGlobe,
  IconKey,
  IconRadio,
  IconButton,
  Input,
  Label,
  toast,
} from "./ui";
import { copyToClipboard, endStream, startStream, toMessage } from "../lib/tauri";

interface StreamControlProps {
  token: string;
  title: string;
  /** game_mask_id of the selected category ("" is allowed). */
  gameMaskId: string;
  mature: boolean;
  /** True only when token is non-empty AND account.can_be_live. */
  canGoLive: boolean;
}

export function StreamControl({ token, title, gameMaskId, mature, canGoLive }: StreamControlProps) {
  const [live, setLive] = useState(false);
  const [starting, setStarting] = useState(false);
  const [ending, setEnding] = useState(false);
  const [streamId, setStreamId] = useState("");
  const [rtmp, setRtmp] = useState("");
  const [streamKey, setStreamKey] = useState("");
  const [showKey, setShowKey] = useState(false);

  const hasKey = streamKey !== "";

  async function handleGoLive(): Promise<void> {
    if (!canGoLive || live || starting) return;
    setStarting(true);
    try {
      const result = await startStream({
        token: token.trim(),
        title,
        category: gameMaskId,
        audienceType: mature ? "1" : "0",
      });
      setStreamId(result.id);
      setRtmp(result.rtmp);
      setStreamKey(result.key);
      setShowKey(false);
      setLive(true);
      toast.success("¡Transmisión iniciada con éxito! Pega la clave en OBS Studio.");
    } catch (err) {
      toast.error(toMessage(err));
    } finally {
      setStarting(false);
    }
  }

  async function handleEndLive(): Promise<void> {
    if (!live || ending) return;
    setEnding(true);
    try {
      const ended = await endStream(token.trim(), streamId);
      if (ended) {
        setLive(false);
        setStreamId("");
        setRtmp("");
        setStreamKey("");
        setShowKey(false);
        toast.success("¡Transmisión finalizada con éxito!");
      } else {
        toast.error("No se pudo finalizar la transmisión. Inténtalo de nuevo.");
      }
    } catch (err) {
      toast.error(toMessage(err));
    } finally {
      setEnding(false);
    }
  }

  async function handleCopy(value: string): Promise<void> {
    try {
      await copyToClipboard(value);
      toast.success("¡Texto copiado al portapapeles!");
    } catch (err) {
      toast.error(toMessage(err));
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Control de transmisión</CardTitle>
        {live ? (
          <Badge variant="rose">
            <IconRadio />
            LIVE
          </Badge>
        ) : (
          <Badge variant="default">Desconectado</Badge>
        )}
      </CardHeader>
      <CardContent>
        <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:flex-wrap">
          <Button
            variant="primary"
            className="min-w-0 flex-1"
            loading={starting}
            disabled={!canGoLive || live}
            onClick={() => void handleGoLive()}
          >
            {starting ? "Iniciando…" : "Iniciar Live"}
          </Button>
          <Button
            variant="danger"
            className="min-w-0 flex-1"
            loading={ending}
            disabled={!live || ending}
            onClick={() => void handleEndLive()}
          >
            {ending ? "Finalizando…" : "Finalizar Live"}
          </Button>
        </div>

        {!canGoLive && !live && (
          <p className="text-xs leading-relaxed text-zinc-500">
            Carga un token y asegúrate de que tu cuenta pueda ir en vivo para habilitar la transmisión.
          </p>
        )}

        <div className="flex flex-col gap-2">
          <Label htmlFor="rtmp-input">URL RTMP</Label>
          <div className="relative">
            <Input
              id="rtmp-input"
              readOnly
              value={rtmp}
              placeholder="— inicia una transmisión para generar una URL —"
              className="pr-10 font-mono text-xs"
            />
            <IconButton
              label="Copiar URL"
              className="absolute right-1.5 top-1/2 -translate-y-1/2"
              disabled={rtmp === ""}
              onClick={() => void handleCopy(rtmp)}
            >
              <IconCopy className="h-3.5 w-3.5" />
            </IconButton>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="key-input">Clave de stream</Label>
          <div className="relative">
            <Input
              id="key-input"
              readOnly
              type={showKey ? "text" : "password"}
              value={streamKey}
              placeholder="— inicia una transmisión para generar una clave —"
              className="pr-16 font-mono text-xs"
            />
            <div className="absolute right-1.5 top-1/2 flex -translate-y-1/2 items-center">
              <IconButton
                label={showKey ? "Ocultar clave de stream" : "Mostrar clave de stream"}
                disabled={!hasKey}
                onClick={() => setShowKey((visible) => !visible)}
              >
                {showKey ? <IconEyeOff className="h-3.5 w-3.5" /> : <IconEye className="h-3.5 w-3.5" />}
              </IconButton>
              <IconButton label="Copiar clave" disabled={!hasKey} onClick={() => void handleCopy(streamKey)}>
                <IconCopy className="h-3.5 w-3.5" />
              </IconButton>
            </div>
          </div>
        </div>

        <div className="flex items-start gap-2.5 rounded-lg border border-tiktok-cyan/20 bg-tiktok-cyan/5 p-3 text-xs leading-relaxed text-zinc-400">
          <IconGlobe className="mt-0.5 h-3.5 w-3.5 shrink-0 text-tiktok-cyan" />
          <p>
            <span className="font-medium text-tiktok-cyan">URL RTMP:</span> destino RTMP de envío ·{" "}
            <span className="font-medium text-tiktok-cyan">
              <IconKey className="mr-0.5 inline h-3 w-3" />
              Clave de stream:
            </span>{" "}
            OBS Studio → Configuración → Emisión
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
