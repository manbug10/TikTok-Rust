import { useState } from "react";
import { Button, Checkbox, IconCoffee, IconDownload, Modal, toast } from "./ui";
import { BUY_ME_A_COFFEE_URL, openExternal, toMessage } from "../lib/tauri";
import type { UpdateInfo } from "../types";

/* --------------------------------- Help ---------------------------------- */

const HELP_STEPS: readonly string[] = [
  "Solicita acceso LIVE en Streamlabs",
  "Instala Streamlabs e inicia sesión con TikTok",
  "Usa esta app para obtener el token de Streamlabs",
  "¡Ve en vivo!",
];

export function HelpDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Modal open={open} onClose={onClose} title="Ayuda">
      <div className="flex flex-col gap-4">
        <ol className="ml-5 flex list-decimal flex-col gap-2 text-sm leading-relaxed text-zinc-300 marker:font-semibold marker:text-tiktok-cyan">
          {HELP_STEPS.map((step) => (
            <li key={step} className="pl-1">
              {step}
            </li>
          ))}
        </ol>
        <p className="text-xs leading-relaxed text-zinc-500">
          La URL y la clave generadas se pegan directamente en OBS Studio → Configuración → Emisión.
        </p>
        <div className="flex justify-end">
          <Button onClick={onClose}>Aceptar</Button>
        </div>
      </div>
    </Modal>
  );
}

/* --------------------------------- Update --------------------------------- */

interface UpdateDialogProps {
  open: boolean;
  info: UpdateInfo | null;
  onClose: () => void;
}

export function UpdateDialog({ open, info, onClose }: UpdateDialogProps) {
  const [downloading, setDownloading] = useState(false);

  async function handleDownload(): Promise<void> {
    if (info === null) return;
    setDownloading(true);
    try {
      await openExternal(info.url);
    } catch (err) {
      toast.error(toMessage(err));
    } finally {
      setDownloading(false);
    }
  }

  return (
    <Modal open={open && info !== null} onClose={onClose} title="Actualización disponible">
      {info !== null && (
        <div className="flex flex-col gap-4">
          <p className="text-sm leading-relaxed text-zinc-300">
            ¡La versión <span className="font-semibold text-tiktok-cyan">{info.latest}</span> está disponible! Versión
            actual: <span className="text-zinc-400">{info.current}</span>
          </p>
          {info.notes.trim() !== "" && (
            <p className="max-h-40 overflow-y-auto whitespace-pre-wrap rounded-lg border border-zinc-800 bg-zinc-950/60 p-3 text-xs leading-relaxed text-zinc-400">
              {info.notes}
            </p>
          )}
          <div className="flex flex-wrap justify-end gap-2">
            <Button variant="ghost" onClick={onClose}>
              Más tarde
            </Button>
            <Button variant="primary" loading={downloading} onClick={() => void handleDownload()}>
              <IconDownload className="h-4 w-4" />
              Descargar
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}

/* -------------------------------- Donation -------------------------------- */

interface DonationDialogProps {
  open: boolean;
  /** Receives true when the "never show again" checkbox was checked on close. */
  onClose: (suppress: boolean) => void;
}

export function DonationDialog({ open, onClose }: DonationDialogProps) {
  const [neverShow, setNeverShow] = useState(false);

  function close(): void {
    onClose(neverShow);
  }

  async function handleDonate(): Promise<void> {
    try {
      await openExternal(BUY_ME_A_COFFEE_URL);
    } catch (err) {
      toast.error(toMessage(err));
    }
    close();
  }

  return (
    <Modal open={open} onClose={close} title="Apoya la app">
      <div className="flex flex-col gap-4">
        <div className="flex items-start gap-3 rounded-lg border border-tiktok-rose/20 bg-tiktok-rose/5 p-3">
          <IconCoffee className="mt-0.5 h-5 w-5 shrink-0 text-tiktok-rose" />
          <p className="text-sm leading-relaxed text-zinc-300">
            ¿Disfrutas de esta app? ¡Considera apoyar su desarrollo!
          </p>
        </div>
        <Checkbox checked={neverShow} onChange={setNeverShow} label="No volver a mostrar este mensaje" />
        <div className="flex flex-wrap justify-end gap-2">
          <Button variant="primary" onClick={() => void handleDonate()}>
            <IconCoffee className="h-4 w-4" />
            Donar ahora
          </Button>
          <Button onClick={close}>Aceptar</Button>
        </div>
      </div>
    </Modal>
  );
}
