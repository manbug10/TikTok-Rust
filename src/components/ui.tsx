import { useEffect, useSyncExternalStore } from "react";
import type { ButtonHTMLAttributes, FunctionComponent, InputHTMLAttributes, ReactNode } from "react";

/* ---------------------------------- Icons ---------------------------------- */
/* Tiny inline SVG icon set — no external icon dependency. */

export interface IconProps {
  className?: string;
}

/** Circular loading spinner (animates via `animate-spin`). */
export function IconSpinner({ className = "" }: IconProps) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className={`animate-spin ${className}`}>
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-20" />
      <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

export function IconEye({ className = "" }: IconProps) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

export function IconEyeOff({ className = "" }: IconProps) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49" />
      <path d="M14.084 14.158a3 3 0 0 1-4.242-4.242" />
      <path d="M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143" />
      <path d="m2 2 20 20" />
    </svg>
  );
}

export function IconCopy({ className = "" }: IconProps) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
      <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
    </svg>
  );
}

export function IconKey({ className = "" }: IconProps) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M2.586 17.414A2 2 0 0 0 2 18.828V21a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h1a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h.172a2 2 0 0 0 1.414-.586l.814-.814a6.5 6.5 0 1 0-4-4z" />
      <circle cx="16.5" cy="7.5" r="0.5" fill="currentColor" />
    </svg>
  );
}

/** Pulsing red "on air" dot used for the LIVE badge. */
export function IconRadio({ className = "" }: IconProps) {
  return (
    <span aria-hidden="true" className={`relative flex h-2.5 w-2.5 ${className}`}>
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75" />
      <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-500" />
    </span>
  );
}

export function IconMonitor({ className = "" }: IconProps) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect width="20" height="14" x="2" y="3" rx="2" />
      <line x1="8" x2="16" y1="21" y2="21" />
      <line x1="12" x2="12" y1="17" y2="21" />
    </svg>
  );
}

export function IconGlobe({ className = "" }: IconProps) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
      <path d="M2 12h20" />
    </svg>
  );
}

export function IconHelp({ className = "" }: IconProps) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
      <path d="M12 17h.01" />
    </svg>
  );
}

export function IconCoffee({ className = "" }: IconProps) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M17 8h1a4 4 0 1 1 0 8h-1" />
      <path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z" />
      <line x1="6" x2="6" y1="2" y2="4" />
      <line x1="10" x2="10" y1="2" y2="4" />
      <line x1="14" x2="14" y1="2" y2="4" />
    </svg>
  );
}

export function IconDownload({ className = "" }: IconProps) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" x2="12" y1="15" y2="3" />
    </svg>
  );
}

export function IconSave({ className = "" }: IconProps) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
      <polyline points="17 21 17 13 7 13 7 21" />
      <polyline points="7 3 7 8 15 8" />
    </svg>
  );
}

export function IconRefresh({ className = "" }: IconProps) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
      <path d="M21 3v5h-5" />
    </svg>
  );
}

export function IconChevronRight({ className = "" }: IconProps) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

export function IconX({ className = "" }: IconProps) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}

export function IconCheckCircle({ className = "" }: IconProps) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="12" cy="12" r="10" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

export function IconAlertCircle({ className = "" }: IconProps) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 8v4" />
      <path d="M12 16h.01" />
    </svg>
  );
}

export function IconInfoCircle({ className = "" }: IconProps) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4" />
      <path d="M12 8h.01" />
    </svg>
  );
}

/* --------------------------------- Button ---------------------------------- */

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
export type ButtonSize = "sm" | "md";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Shows an inline spinner and disables the button while true. */
  loading?: boolean;
}

const BUTTON_BASE =
  "inline-flex h-auto min-h-10 min-w-0 select-none items-center justify-center gap-2 overflow-hidden whitespace-nowrap rounded-lg px-4 py-2 text-ellipsis font-medium leading-tight transition duration-150 hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tiktok-cyan/60 disabled:pointer-events-none disabled:opacity-50 sm:min-h-9";

const BUTTON_VARIANTS: Record<ButtonVariant, string> = {
  primary: "bg-gradient-to-r from-tiktok-rose to-red-500 text-white shadow-lg shadow-tiktok-rose/25",
  secondary: "border border-zinc-700 bg-zinc-800 text-zinc-100 hover:bg-zinc-700",
  ghost: "text-zinc-300 hover:bg-zinc-800/70 hover:text-zinc-100",
  danger: "bg-red-600 text-white shadow-lg shadow-red-600/20 hover:bg-red-500",
};

const BUTTON_SIZES: Record<ButtonSize, string> = {
  sm: "px-3 py-2 text-xs sm:py-1.5",
  md: "text-sm",
};

export function Button({
  variant = "secondary",
  size = "md",
  loading = false,
  type = "button",
  className = "",
  disabled,
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`${BUTTON_BASE} ${BUTTON_SIZES[size]} ${BUTTON_VARIANTS[variant]} ${className}`}
      {...rest}
    >
      {loading && <IconSpinner className="h-4 w-4 shrink-0" />}
      {children}
    </button>
  );
}

/* -------------------------------- IconButton -------------------------------- */

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
}

export function IconButton({ label, type = "button", className = "", children, ...rest }: IconButtonProps) {
  return (
    <button
      type={type}
      aria-label={label}
      title={label}
      className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-zinc-400 transition duration-150 hover:bg-zinc-800 hover:text-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tiktok-cyan/60 disabled:pointer-events-none disabled:opacity-40 ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}

/* ----------------------------------- Card ----------------------------------- */

export function Card({ className = "", children }: { className?: string; children: ReactNode }) {
  return <div className={`rounded-2xl border border-zinc-800/80 bg-zinc-900/60 backdrop-blur ${className}`}>{children}</div>;
}

export function CardHeader({ className = "", children }: { className?: string; children: ReactNode }) {
  return <div className={`flex flex-wrap items-center justify-between gap-3 p-5 pb-3 ${className}`}>{children}</div>;
}

export function CardTitle({ className = "", children }: { className?: string; children: ReactNode }) {
  return <h2 className={`text-xs font-semibold uppercase tracking-wider text-zinc-400 ${className}`}>{children}</h2>;
}

export function CardContent({ className = "", children }: { className?: string; children: ReactNode }) {
  return <div className={`flex flex-col gap-4 p-5 pt-0 ${className}`}>{children}</div>;
}

/* ---------------------------------- Input ----------------------------------- */

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  className?: string;
}

export function Input({ className = "", ...rest }: InputProps) {
  return (
    <input
      className={`w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 outline-none transition placeholder:text-zinc-500 focus:border-tiktok-cyan/60 focus:ring-2 focus:ring-tiktok-cyan/40 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      {...rest}
    />
  );
}

/* ---------------------------------- Label ----------------------------------- */

export function Label({
  htmlFor,
  className = "",
  children,
}: {
  htmlFor?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <label htmlFor={htmlFor} className={`text-xs font-medium uppercase tracking-wider text-zinc-400 ${className}`}>
      {children}
    </label>
  );
}

/* --------------------------------- Checkbox --------------------------------- */

export interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
  id?: string;
}

export function Checkbox({ checked, onChange, label, disabled = false, id }: CheckboxProps) {
  return (
    <label
      className={`inline-flex select-none items-center gap-2.5 text-sm text-zinc-300 ${
        disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"
      }`}
    >
      <input
        id={id}
        type="checkbox"
        className="peer sr-only"
        checked={checked}
        disabled={disabled}
        onChange={(event) => onChange(event.target.checked)}
      />
      <span
        aria-hidden="true"
        className="flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded border border-zinc-700 bg-zinc-900 text-white transition peer-checked:border-tiktok-rose peer-checked:bg-tiktok-rose peer-focus-visible:ring-2 peer-focus-visible:ring-tiktok-cyan/60"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={3}
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`h-3 w-3 transition-opacity ${checked ? "opacity-100" : "opacity-0"}`}
        >
          <path d="m5 13 4 4L19 7" />
        </svg>
      </span>
      {label !== undefined && <span>{label}</span>}
    </label>
  );
}

/* ---------------------------------- Badge ----------------------------------- */

export type BadgeVariant = "default" | "cyan" | "rose" | "emerald" | "red";

const BADGE_VARIANTS: Record<BadgeVariant, string> = {
  default: "border-zinc-700 bg-zinc-800/80 text-zinc-300",
  cyan: "border-tiktok-cyan/30 bg-tiktok-cyan/10 text-tiktok-cyan",
  rose: "border-tiktok-rose/30 bg-tiktok-rose/10 text-tiktok-rose",
  emerald: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
  red: "border-red-500/30 bg-red-500/10 text-red-400",
};

export function Badge({
  variant = "default",
  className = "",
  children,
}: {
  variant?: BadgeVariant;
  className?: string;
  children: ReactNode;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${BADGE_VARIANTS[variant]} ${className}`}
    >
      {children}
    </span>
  );
}

/* ---------------------------------- Modal ----------------------------------- */

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}

export function Modal({ open, onClose, title, children }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    function handleKeyDown(event: KeyboardEvent): void {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label={title}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
      <div className="relative w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900 p-5 shadow-2xl shadow-black/60">
        {title !== undefined && (
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-300">{title}</h2>
            <IconButton label="Cerrar diálogo" onClick={onClose}>
              <IconX className="h-4 w-4" />
            </IconButton>
          </div>
        )}
        {children}
      </div>
    </div>
  );
}

/* ---------------------------------- Toasts ---------------------------------- */
/* Module-level store: no provider or context needed. */

export type ToastKind = "success" | "error" | "info";

export interface ToastItem {
  id: number;
  kind: ToastKind;
  message: string;
}

const TOAST_DURATION_MS = 4000;

let toastState: ToastItem[] = [];
let toastSeq = 0;
const toastListeners = new Set<() => void>();

function notifyToastListeners(): void {
  for (const listener of toastListeners) listener();
}

function pushToast(kind: ToastKind, message: string): void {
  const id = ++toastSeq;
  toastState = [...toastState, { id, kind, message }];
  notifyToastListeners();
  window.setTimeout(() => dismissToast(id), TOAST_DURATION_MS);
}

function dismissToast(id: number): void {
  if (!toastState.some((item) => item.id === id)) return;
  toastState = toastState.filter((item) => item.id !== id);
  notifyToastListeners();
}

export const toast = {
  success: (message: string): void => pushToast("success", message),
  error: (message: string): void => pushToast("error", message),
  info: (message: string): void => pushToast("info", message),
};

/** Subscribes to the module-level toast store. */
export function useToasts(): ToastItem[] {
  return useSyncExternalStore(
    (onStoreChange) => {
      toastListeners.add(onStoreChange);
      return () => {
        toastListeners.delete(onStoreChange);
      };
    },
    () => toastState,
    () => toastState,
  );
}

interface ToastStyle {
  box: string;
  iconColor: string;
  Icon: FunctionComponent<IconProps>;
}

const TOAST_STYLES: Record<ToastKind, ToastStyle> = {
  success: {
    box: "border-emerald-500/40 bg-emerald-950/80",
    iconColor: "text-emerald-400",
    Icon: IconCheckCircle,
  },
  error: {
    box: "border-red-500/40 bg-red-950/80",
    iconColor: "text-red-400",
    Icon: IconAlertCircle,
  },
  info: {
    box: "border-tiktok-cyan/40 bg-zinc-900/95",
    iconColor: "text-tiktok-cyan",
    Icon: IconInfoCircle,
  },
};

function ToastCard({ item }: { item: ToastItem }) {
  const style = TOAST_STYLES[item.kind];
  const Icon = style.Icon;
  return (
    <div
      role="status"
      className={`animate-toast-in pointer-events-auto flex items-start gap-2.5 rounded-xl border p-3 shadow-xl shadow-black/40 backdrop-blur-sm ${style.box}`}
    >
      <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${style.iconColor}`} />
      <p className="flex-1 text-sm leading-snug text-zinc-100">{item.message}</p>
      <IconButton label="Descartar notificación" className="-mr-1 -mt-1" onClick={() => dismissToast(item.id)}>
        <IconX className="h-3.5 w-3.5" />
      </IconButton>
    </div>
  );
}

/** Fixed bottom-right stack of toast notifications. */
export function ToastViewport() {
  const toasts = useToasts();
  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed bottom-4 right-4 z-[60] flex w-80 max-w-[calc(100vw-2rem)] flex-col gap-2"
    >
      {toasts.map((item) => (
        <ToastCard key={item.id} item={item} />
      ))}
    </div>
  );
}
