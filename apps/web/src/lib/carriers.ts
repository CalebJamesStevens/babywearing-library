export type AvailabilityStatus = "available" | "checked_out" | "maintenance" | "retired";

export function formatCarrierType(value: string | null | undefined) {
  return (value ?? "carrier")
    .replaceAll("_", " ")
    .replace("meh dai half buckle", "Meh dai / half buckle")
    .replace("soft structured carrier", "Soft structured carrier")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function formatAvailabilityStatus(value: AvailabilityStatus) {
  switch (value) {
    case "available":
      return "Available";
    case "checked_out":
      return "Checked out";
    case "maintenance":
      return "Maintenance";
    case "retired":
      return "Retired";
    default:
      return value;
  }
}

export function getAvailabilityBadgeVariant(value: AvailabilityStatus) {
  switch (value) {
    case "available":
      return "default";
    case "checked_out":
      return "destructive";
    case "maintenance":
      return "outline";
    case "retired":
      return "ghost";
    default:
      return "outline";
  }
}

export function buildCarrierName({
  brand,
  model,
  size,
}: {
  brand: string;
  model: string | null;
  size: string | null;
}) {
  return [brand, model, size].filter(Boolean).join(" · ");
}
