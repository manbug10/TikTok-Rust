import { useEffect, useRef, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Checkbox,
  IconSpinner,
  Input,
  Label,
  toast,
} from "./ui";
import { searchCategories, toMessage } from "../lib/tauri";
import type { Category } from "../types";

interface StreamDetailsProps {
  token: string;
  title: string;
  game: string;
  mature: boolean;
  /** True when the account cannot go live — disables all inputs. */
  disabled: boolean;
  onTitleChange: (title: string) => void;
  /** Fires while typing; App stores the name and clears the mask id. */
  onGameChange: (name: string) => void;
  /** Fires when a mask id is resolved (dropdown pick or exact match). */
  onMaskIdChange: (maskId: string) => void;
  onMatureChange: (mature: boolean) => void;
}

const SEARCH_DEBOUNCE_MS = 300;

export function StreamDetails({
  token,
  title,
  game,
  mature,
  disabled,
  onTitleChange,
  onGameChange,
  onMaskIdChange,
  onMatureChange,
}: StreamDetailsProps) {
  const [suggestions, setSuggestions] = useState<Category[]>([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searching, setSearching] = useState(false);
  const debounceRef = useRef<number | null>(null);
  const requestRef = useRef(0);
  const boxRef = useRef<HTMLDivElement | null>(null);

  // Resolve the mask id for the saved game name whenever the token becomes
  // available (mirrors the original fetch_game_mask_id). Intentionally keyed
  // on [token] only: `game` holds the value loaded alongside the token.
  useEffect(() => {
    const trimmedToken = token.trim();
    if (trimmedToken === "" || game.trim() === "") return;
    let cancelled = false;
    const myRequest = ++requestRef.current;
    searchCategories(trimmedToken, game)
      .then((results) => {
        if (cancelled || requestRef.current !== myRequest) return;
        const exact = results.find((category) => category.full_name === game);
        onMaskIdChange(exact !== undefined ? exact.game_mask_id : "");
      })
      .catch((err: unknown) => {
        if (cancelled || requestRef.current !== myRequest) return;
        toast.error(toMessage(err));
      });
    return () => {
      cancelled = true;
    };
  }, [token]);

  // Cancel pending debounce / invalidate in-flight requests on unmount.
  useEffect(() => {
    return () => {
      if (debounceRef.current !== null) window.clearTimeout(debounceRef.current);
      requestRef.current += 1;
    };
  }, []);

  // Close the suggestion dropdown when clicking outside of it.
  useEffect(() => {
    function handlePointerDown(event: MouseEvent): void {
      if (boxRef.current === null) return;
      if (event.target instanceof Node && !boxRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, []);

  function cancelPendingSearch(): void {
    if (debounceRef.current !== null) {
      window.clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }
    requestRef.current += 1; // invalidate any in-flight request
  }

  function handleGameInput(text: string): void {
    onGameChange(text);
    onMaskIdChange(""); // manual typing loses the mask id until re-resolved below
    cancelPendingSearch();
    setSuggestions([]);
    setDropdownOpen(false);
    if (disabled || token.trim() === "" || text.trim() === "") {
      setSearching(false);
      return;
    }
    setSearching(true);
    const myRequest = ++requestRef.current;
    debounceRef.current = window.setTimeout(() => {
      void runSearch(myRequest, text);
    }, SEARCH_DEBOUNCE_MS);
  }

  async function runSearch(myRequest: number, query: string): Promise<void> {
    try {
      const results = await searchCategories(token.trim(), query);
      if (requestRef.current !== myRequest) return; // a newer request superseded this one
      setSuggestions(results);
      setDropdownOpen(results.length > 0);
      // Auto-resolve: an exact full_name match sets the mask id, otherwise "".
      const exact = results.find((category) => category.full_name === query);
      onMaskIdChange(exact !== undefined ? exact.game_mask_id : "");
    } catch (err) {
      if (requestRef.current !== myRequest) return;
      toast.error(toMessage(err));
      setDropdownOpen(false);
    } finally {
      if (requestRef.current === myRequest) setSearching(false);
    }
  }

  function pickCategory(category: Category): void {
    cancelPendingSearch();
    setSearching(false);
    onGameChange(category.full_name);
    onMaskIdChange(category.game_mask_id);
    setSuggestions([]);
    setDropdownOpen(false);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Detalles de la transmisión</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-2">
          <Label htmlFor="title-input">Título de la transmisión</Label>
          <Input
            id="title-input"
            value={title}
            disabled={disabled}
            placeholder="Escribe el título de tu transmisión"
            onChange={(event) => onTitleChange(event.target.value)}
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="game-input">Categoría</Label>
          <div ref={boxRef} className="relative">
            <Input
              id="game-input"
              value={game}
              disabled={disabled}
              placeholder="Buscar categorías..."
              autoComplete="off"
              autoCapitalize="off"
              spellCheck={false}
              className="pr-24"
              onChange={(event) => handleGameInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Escape") setDropdownOpen(false);
              }}
            />
            {searching && (
              <span className="pointer-events-none absolute right-3 top-1/2 flex -translate-y-1/2 items-center gap-1.5 text-[11px] text-zinc-500">
                <IconSpinner className="h-3 w-3" />
                Buscando…
              </span>
            )}
            {dropdownOpen && suggestions.length > 0 && (
              <div className="absolute inset-x-0 top-full z-50 mt-1 max-h-48 overflow-y-auto rounded-lg border border-zinc-800 bg-zinc-900 py-1 shadow-xl shadow-black/40">
                {suggestions.map((category, index) => (
                  <button
                    key={`${category.game_mask_id}-${category.full_name}-${index}`}
                    type="button"
                    className="block w-full truncate px-3 py-2 text-left text-sm text-zinc-200 transition-colors hover:bg-zinc-800/80 hover:text-white focus-visible:bg-zinc-800/80 focus-visible:outline-none"
                    onMouseDown={(event) => {
                      event.preventDefault(); // keep input focus, avoid blur flash
                      pickCategory(category);
                    }}
                  >
                    {category.full_name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <Checkbox
          id="mature-checkbox"
          checked={mature}
          disabled={disabled}
          label="Adulto (18+)"
          onChange={onMatureChange}
        />
      </CardContent>
    </Card>
  );
}
