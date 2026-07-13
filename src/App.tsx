import { useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { COUNTRIES, type Country } from "@/countries";
import { FLAG_SVGS } from "@/flagSvgs";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const SORTED_COUNTRIES = [...COUNTRIES].sort((a, b) => a.name.localeCompare(b.name));

export default function App() {
  const [deck, setDeck] = useState<Country[]>(() => shuffle(COUNTRIES));
  const [index, setIndex] = useState(0);
  const [open, setOpen] = useState(false);
  const [picked, setPicked] = useState<Country | null>(null);
  const [status, setStatus] = useState<"idle" | "correct" | "wrong">("idle");
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [log, setLog] = useState<{ correct: boolean }[]>([]);
  const [seenCount, setSeenCount] = useState(0);

  const current = deck[index % deck.length];

  const roundLabel = String((index % deck.length) + 1).padStart(3, "0");

  function choose(country: Country) {
    if (status !== "idle") return;
    setOpen(false);
    setPicked(country);

    const correct = country.code === current.code;
    setStatus(correct ? "correct" : "wrong");
    setSeenCount((c) => c + 1);
    setLog((l) => [{ correct }, ...l].slice(0, 12));

    if (correct) {
      setScore((s) => s + 1);
      setStreak((s) => {
        const nextStreak = s + 1;
        setBestStreak((b) => Math.max(b, nextStreak));
        return nextStreak;
      });
    } else {
      setStreak(0);
    }
  }

  function skip() {
    if (status !== "idle") return;
    setSeenCount((c) => c + 1);
    setLog((l) => [{ correct: false }, ...l].slice(0, 12));
    setStreak(0);
    setStatus("wrong");
    setPicked(null);
  }

  function next() {
    setStatus("idle");
    setPicked(null);
    setIndex((i) => {
      const nextI = i + 1;
      if (nextI % deck.length === 0) {
        setDeck(shuffle(COUNTRIES));
      }
      return nextI;
    });
  }

  const accuracy = seenCount > 0 ? Math.round((score / seenCount) * 100) : null;

  return (
    <div className="min-h-screen flex flex-col items-center px-4 py-10 sm:py-14">
      {/* Masthead */}
      <header className="w-full max-w-xl flex items-end justify-between border-b-2 border-[hsl(var(--ink))] pb-3 mb-8">
        <div>
          <p className="font-mono text-[11px] tracking-[0.25em] text-[hsl(var(--ink-soft))] uppercase">
            Field Atlas &middot; Sheet {roundLabel}
          </p>
          <h1 className="font-display text-4xl sm:text-5xl font-semibold tracking-tight leading-none mt-1">
            FLAG SURVEY
          </h1>
        </div>
        <div className="text-right font-mono">
          <p className="text-[11px] tracking-[0.2em] text-[hsl(var(--ink-soft))] uppercase">Score</p>
          <p className="text-2xl font-bold leading-none">{score}<span className="text-sm text-[hsl(var(--ink-soft))]">/{seenCount}</span></p>
        </div>
      </header>

      {/* Specimen card */}
      <main className="w-full max-w-xl">
        <div className="relative bg-[hsl(var(--card))] border-2 border-[hsl(var(--ink))] shadow-[6px_6px_0_hsl(var(--ink)/0.15)]">
          {/* corner ticks */}
          <span className="absolute -top-[7px] -left-[7px] w-3 h-3 border-t-2 border-l-2 border-[hsl(var(--ink))]" />
          <span className="absolute -top-[7px] -right-[7px] w-3 h-3 border-t-2 border-r-2 border-[hsl(var(--ink))]" />
          <span className="absolute -bottom-[7px] -left-[7px] w-3 h-3 border-b-2 border-l-2 border-[hsl(var(--ink))]" />
          <span className="absolute -bottom-[7px] -right-[7px] w-3 h-3 border-b-2 border-r-2 border-[hsl(var(--ink))]" />

          <div className="px-6 pt-6 flex items-center justify-between font-mono text-[11px] tracking-[0.2em] text-[hsl(var(--ink-soft))] uppercase">
            <span>Specimen {String(current.code).toUpperCase()}</span>
            <span>Streak {streak}{bestStreak > 0 && <span className="text-[hsl(var(--brass))]"> &middot; best {bestStreak}</span>}</span>
          </div>

          <div className="relative flex items-center justify-center py-10 px-6">
            <div
              key={current.code}
              className="relative w-64 sm:w-72 aspect-[3/2] overflow-hidden [&_svg]:w-full [&_svg]:h-full [&_svg]:object-cover [&_svg]:block"
              role="img"
              aria-label="Flag to identify"
              dangerouslySetInnerHTML={{ __html: FLAG_SVGS[current.code] ?? "" }}
            />

            {/* Stamp */}
            {status !== "idle" && (
              <div
                className={cn("pointer-events-none absolute select-none font-display font-bold uppercase border-4 rounded-full px-5 py-2 text-2xl sm:text-3xl tracking-widest",
                  status === "correct"
                    ? "text-[hsl(var(--brick))] border-[hsl(var(--brick))]"
                    : "text-[hsl(var(--ink-soft))] border-[hsl(var(--ink-soft))]"
                )}
                style={{
                  transform: "rotate(-12deg) scale(1)",
                  animation: "stamp-thud 0.35s ease-out",
                  opacity: status === "correct" ? 0.9 : 0.85,
                }}
              >
                {status === "correct" ? "Verified" : "Unfiled"}
              </div>
            )}
          </div>

          <div className="px-6 pb-6">
            {status !== "idle" && (
              <p className="text-center font-mono text-sm mb-3 text-[hsl(var(--ink-soft))]">
                {picked ? (
                  <>
                    You chose <span className="font-semibold text-[hsl(var(--ink))]">{picked.name}</span>
                  </>
                ) : (
                  <span className="font-semibold text-[hsl(var(--ink))]">Skipped</span>
                )}
                {status === "wrong" && (
                  <>
                    {" "}&middot; correct answer is{" "}
                    <span className="font-semibold text-[hsl(var(--brick))]">{current.name}</span>
                  </>
                )}
              </p>
            )}

            <div className="flex gap-2">
              <Popover open={open} onOpenChange={(o) => status === "idle" && setOpen(o)}>
                <PopoverTrigger asChild>
                  <button
                    role="combobox"
                    aria-expanded={open}
                    disabled={status !== "idle"}
                    className="flex-1 flex items-center justify-between bg-transparent border-2 border-[hsl(var(--ink))] px-4 py-3 font-mono text-base text-left focus:outline-none focus:ring-2 focus:ring-[hsl(var(--blueprint))] disabled:opacity-60"
                  >
                    <span className={picked ? "" : "text-[hsl(var(--ink-soft)/0.7)]"}>
                      {picked ? picked.name : "Select the country…"}
                    </span>
                    <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-[--radix-popover-trigger-width] p-0 rounded-none border-2 border-[hsl(var(--ink))]">
                  <Command>
                    <CommandInput placeholder="Search countries…" className="font-mono" />
                    <CommandList>
                      <CommandEmpty>No country found.</CommandEmpty>
                      <CommandGroup>
                        {SORTED_COUNTRIES.map((country) => (
                          <CommandItem
                            key={country.code}
                            value={country.name}
                            onSelect={() => choose(country)}
                            className="font-mono"
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                picked?.code === country.code ? "opacity-100" : "opacity-0"
                              )}
                            />
                            {country.name}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>

              {status === "idle" && (
                <button
                  onClick={skip}
                  className="shrink-0 px-5 font-display font-semibold uppercase tracking-wide text-base border-2 border-[hsl(var(--ink-soft))] text-[hsl(var(--ink-soft))] hover:bg-[hsl(var(--ink-soft))] hover:text-[hsl(var(--paper))] transition-colors"
                >
                  Skip
                </button>
              )}

              {status !== "idle" && (
                <button
                  onClick={next}
                  className="shrink-0 px-5 font-display font-semibold uppercase tracking-wide text-base border-2 border-[hsl(var(--ink))] bg-[hsl(var(--ink))] text-[hsl(var(--paper))] hover:bg-[hsl(var(--blueprint))] hover:border-[hsl(var(--blueprint))] transition-colors"
                >
                  Next →
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Field log */}
        <div className="mt-6 flex items-center gap-3">
          <span className="font-mono text-[11px] tracking-[0.2em] text-[hsl(var(--ink-soft))] uppercase whitespace-nowrap">
            Log{accuracy !== null ? ` · ${accuracy}%` : ""}
          </span>
          <div className="flex-1 flex gap-1.5 flex-wrap">
            {log.length === 0 && (
              <span className="font-mono text-xs text-[hsl(var(--ink-soft)/0.6)]">no entries yet</span>
            )}
            {log.map((entry, i) => (
              <span
                key={i}
                className={
                  "w-2.5 h-2.5 rounded-full border " +
                  (entry.correct
                    ? "bg-[hsl(var(--brass))] border-[hsl(var(--brass))]"
                    : "bg-transparent border-[hsl(var(--brick))]")
                }
                title={entry.correct ? "Correct" : "Missed"}
              />
            ))}
          </div>
        </div>
      </main>

      <style>{`
        @keyframes stamp-thud {
          0% { transform: rotate(-12deg) scale(2.2); opacity: 0; }
          60% { transform: rotate(-12deg) scale(0.92); opacity: 1; }
          100% { transform: rotate(-12deg) scale(1); opacity: 0.9; }
        }
      `}</style>
    </div>
  );
}
