import Badge from "@/components/ui/Badge";

export default function MatchImportanceBadge({ label }: { label: string | null }) {
  if (!label) return null;
  const gold = ["Final", "Semi-final", "Opening Match", "Third-place Match"].includes(label);
  return <Badge variant={gold ? "gold" : "upcoming"}>{label}</Badge>;
}
