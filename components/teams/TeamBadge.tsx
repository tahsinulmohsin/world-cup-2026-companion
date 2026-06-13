import { cn } from "@/utils/cn";

function getCountryCode(emoji: string | null | undefined): string | null {
  if (!emoji) return null;
  const cps = Array.from(emoji).map((c) => c.codePointAt(0));
  if (cps.length >= 2 && cps[0]! >= 0x1f1e6 && cps[0]! <= 0x1f1ff) {
    return (
      String.fromCharCode(cps[0]! - 0x1f1e6 + 0x61) +
      String.fromCharCode(cps[1]! - 0x1f1e6 + 0x61)
    );
  }
  if (cps[0] === 0x1f3f4 && cps.length >= 6) {
    const tags = cps
      .slice(1, -1)
      .map((cp) => String.fromCharCode(cp! - 0xe0000))
      .join("");
    if (tags === "gbeng") return "gb-eng";
    if (tags === "gbsco") return "gb-sct";
    if (tags === "gbwls") return "gb-wls";
  }
  return null;
}

/** Flag emoji or a neutral crest placeholder — never unlicensed assets. */
export default function TeamBadge({
  name,
  flag,
  size = "md"
}: {
  name: string;
  flag?: string | null;
  size?: "sm" | "md" | "lg";
}) {
  const sizes = { sm: "h-6 w-6 text-sm", md: "h-8 w-8 text-lg", lg: "h-12 w-12 text-2xl" };
  const code = getCountryCode(flag);

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-slate-100 ring-1 ring-slate-200 dark:bg-night-800 dark:ring-night-800",
        sizes[size]
      )}
      aria-hidden
    >
      {code ? (
        <img
          src={`https://flagcdn.com/w80/${code}.png`}
          alt={`${name} flag`}
          className="h-full w-full object-cover"
        />
      ) : flag ? (
        flag
      ) : (
        <span className="text-[0.6em] font-bold text-slate-500">{name.slice(0, 3).toUpperCase()}</span>
      )}
    </span>
  );
}
