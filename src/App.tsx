import { useCallback, useEffect, useRef, useState } from "react";
import { AccountInfo } from "./components/AccountInfo";
import { DonationDialog, HelpDialog, UpdateDialog } from "./components/dialogs";
import { StreamControl } from "./components/StreamControl";
import { StreamDetails } from "./components/StreamDetails";
import { TokenLoader } from "./components/TokenLoader";
import {
  Badge,
  Button,
  IconCoffee,
  IconHelp,
  IconMonitor,
  IconSave,
  ToastViewport,
  toast,
} from "./components/ui";
import {
  BUY_ME_A_COFFEE_URL,
  LIVE_MONITOR_URL,
  accountInfo,
  checkUpdate,
  loadConfig,
  openExternal,
  saveConfig,
  toMessage,
} from "./lib/tauri";
import type { AccountInfo as AccountInfoData, UpdateInfo } from "./types";

const APP_VERSION = "v2.1.0 · Tauri";
const ACCOUNT_REFRESH_DEBOUNCE_MS = 600;

export default function App() {
  const [token, setToken] = useState("");
  const [account, setAccount] = useState<AccountInfoData | null>(null);
  const [accountLoading, setAccountLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [game, setGame] = useState("");
  const [gameMaskId, setGameMaskId] = useState("");
  const [mature, setMature] = useState(false);
  const [suppressDonation, setSuppressDonation] = useState(false);
  const [donationOpen, setDonationOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [updateOpen, setUpdateOpen] = useState(false);
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null);
  const [saving, setSaving] = useState(false);

  const refreshAccount = useCallback(async (tokenValue: string): Promise<void> => {
    const trimmed = tokenValue.trim();
    if (trimmed === "") return;
    setAccountLoading(true);
    try {
      const info = await accountInfo(trimmed);
      setAccount(info);
    } catch (err) {
      toast.error(toMessage(err));
    } finally {
      setAccountLoading(false);
    }
  }, []);

  // Startup sequence: load config, then schedule the donation reminder (3s)
  // and the update check (6s). Safe under StrictMode's double effect run.
  useEffect(() => {
    let cancelled = false;
    const timers: number[] = [];

    void (async () => {
      let suppress = false;
      try {
        const config = await loadConfig();
        if (cancelled) return;
        setToken(config.token);
        setTitle(config.title);
        setGame(config.game);
        setGameMaskId("");
        setMature(config.audience_type === "1");
        setSuppressDonation(config.suppress_donation_reminder);
        suppress = config.suppress_donation_reminder;
      } catch (err) {
        if (!cancelled) toast.error(toMessage(err));
      }

      timers.push(
        window.setTimeout(() => {
          if (!cancelled && !suppress) setDonationOpen(true);
        }, 3000),
      );
      timers.push(
        window.setTimeout(() => {
          if (cancelled) return;
          void (async () => {
            try {
              const info = await checkUpdate();
              // null = up to date or the check failed — stay silent either way.
              if (!cancelled && info !== null) {
                setUpdateInfo(info);
                setUpdateOpen(true);
              }
            } catch {
              /* intentionally silent */
            }
          })();
        }, 6000),
      );
    })();

    return () => {
      cancelled = true;
      for (const timer of timers) window.clearTimeout(timer);
    };
  }, []);

  // Refresh account info whenever the token settles (debounced so manual
  // typing doesn't spam the backend); clears it when the token is removed.
  const lastAutoTokenRef = useRef<string | null>(null);
  useEffect(() => {
    const trimmed = token.trim();
    if (trimmed === "") {
      lastAutoTokenRef.current = null;
      setAccount(null);
      return;
    }
    const handle = window.setTimeout(() => {
      if (lastAutoTokenRef.current === trimmed) return;
      lastAutoTokenRef.current = trimmed;
      void refreshAccount(trimmed);
    }, ACCOUNT_REFRESH_DEBOUNCE_MS);
    return () => window.clearTimeout(handle);
  }, [token, refreshAccount]);

  const hasToken = token.trim() !== "";
  const canGoLive = hasToken && account !== null && account.can_be_live;
  const inputsDisabled = account !== null && !account.can_be_live;

  async function handleSaveConfig(): Promise<void> {
    setSaving(true);
    try {
      await saveConfig({
        token: token.trim(),
        title,
        game,
        audience_type: mature ? "1" : "0",
        suppress_donation_reminder: suppressDonation,
      });
      toast.success("¡Configuración guardada con éxito!");
    } catch (err) {
      toast.error(toMessage(err));
    } finally {
      setSaving(false);
    }
  }

  function handleDonationClose(suppress: boolean): void {
    setDonationOpen(false);
    if (!suppress) return;
    setSuppressDonation(true);
    void (async () => {
      try {
        await saveConfig({
          token: token.trim(),
          title,
          game,
          audience_type: mature ? "1" : "0",
          suppress_donation_reminder: true,
        });
      } catch (err) {
        toast.error(toMessage(err));
      }
    })();
  }

  async function handleOpenUrl(url: string): Promise<void> {
    try {
      await openExternal(url);
    } catch (err) {
      toast.error(toMessage(err));
    }
  }

  return (
    <div className="relative flex min-h-screen flex-col bg-zinc-950 text-zinc-100">
      {/* Decorative background glows */}
      <div
        aria-hidden="true"
        className="animate-bg-drift pointer-events-none fixed -left-32 -top-32 h-96 w-96 rounded-full bg-tiktok-cyan/10 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="animate-bg-drift-slow pointer-events-none fixed -bottom-32 -right-32 h-96 w-96 rounded-full bg-tiktok-rose/10 blur-3xl"
      />

      <main className="relative z-10 mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6">
        {/* Header */}
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <img
              src="/icon.png"
              alt="Logotipo de StreamLabs TikTok Stream Key Generator"
              width={48}
              height={48}
              className="h-12 w-12 shrink-0 rounded-xl shadow-lg shadow-tiktok-rose/25"
            />
            <div className="min-w-0">
              <h1 className="truncate text-lg font-bold sm:text-xl">
                Generador de <span className="text-tiktok-cyan">claves de stream</span> de{" "}
                <span className="text-tiktok-rose">TikTok</span> vía StreamLabs
              </h1>
              <p className="text-sm text-zinc-400">
                Genera tu clave de stream de TikTok Live para OBS Studio vía la API de Streamlabs
              </p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Badge variant="cyan">{APP_VERSION}</Badge>
            <Badge variant="default">Windows</Badge>
          </div>
        </header>

        {/* Main grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
          <div className="flex flex-col gap-6 lg:col-span-3">
            <TokenLoader token={token} onTokenChange={setToken} />
            <AccountInfo
              hasToken={hasToken}
              account={account}
              loading={accountLoading}
              onRefresh={() => void refreshAccount(token)}
            />
            <StreamDetails
              token={token}
              title={title}
              game={game}
              mature={mature}
              disabled={inputsDisabled}
              onTitleChange={setTitle}
              onGameChange={setGame}
              onMaskIdChange={setGameMaskId}
              onMatureChange={setMature}
            />
          </div>

          <div className="self-start lg:sticky lg:top-6 lg:col-span-2">
            <StreamControl
              token={token}
              title={title}
              gameMaskId={gameMaskId}
              mature={mature}
              canGoLive={canGoLive}
            />
          </div>
        </div>

        {/* Bottom action bar */}
        <div className="flex min-w-0 flex-wrap items-center gap-2.5">
          <Button variant="secondary" loading={saving} onClick={() => void handleSaveConfig()}>
            <IconSave className="h-4 w-4" />
            Guardar configuración
          </Button>
          <Button variant="ghost" onClick={() => setHelpOpen(true)}>
            <IconHelp className="h-4 w-4" />
            Ayuda
          </Button>
          <Button variant="ghost" onClick={() => void handleOpenUrl(BUY_ME_A_COFFEE_URL)}>
            <IconCoffee className="h-4 w-4" />
            Donar
          </Button>
          <Button variant="ghost" onClick={() => void handleOpenUrl(LIVE_MONITOR_URL)}>
            <IconMonitor className="h-4 w-4" />
            Abrir Live Monitor
          </Button>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 mt-auto border-t border-zinc-800/80">
        <div className="mx-auto w-full max-w-6xl px-4 py-4">
          <p className="text-xs text-zinc-500">
            Reconstruido con Tauri + React + Tailwind CSS · App original en Python por Loukious · Licencia MIT
          </p>
        </div>
      </footer>

      {/* Dialogs + toasts */}
      <HelpDialog open={helpOpen} onClose={() => setHelpOpen(false)} />
      <UpdateDialog open={updateOpen} info={updateInfo} onClose={() => setUpdateOpen(false)} />
      <DonationDialog open={donationOpen} onClose={handleDonationClose} />
      <ToastViewport />
    </div>
  );
}
