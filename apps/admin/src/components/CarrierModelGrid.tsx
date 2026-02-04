"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

type CarrierRow = {
  id: string;
  brand: string;
  model: string | null;
  type: string;
  imageUrl: string | null;
  instanceCount: number;
};

type Props = {
  carriers: CarrierRow[];
};

const typeLabels: Record<string, string> = {
  soft_structured_carrier: "Soft structured carrier",
  ring_sling: "Ring sling",
  woven_wrap: "Woven wrap",
  stretch_wrap: "Stretch wrap",
  meh_dai_half_buckle: "Meh dai / half buckle",
  onbuhimo: "Onbuhimo",
};

export default function CarrierModelGrid({ carriers }: Props) {
  const [groupBy, setGroupBy] = useState<"brand" | "type">("brand");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return carriers;
    return carriers.filter((carrier) => {
      const label = `${carrier.brand} ${carrier.model ?? ""} ${carrier.type}`.toLowerCase();
      return label.includes(q);
    });
  }, [carriers, query]);

  const groups = useMemo(() => {
    const grouped = new Map<string, CarrierRow[]>();
    for (const carrier of filtered) {
      const key = groupBy === "brand" ? carrier.brand : typeLabels[carrier.type] ?? carrier.type;
      const list = grouped.get(key) ?? [];
      list.push(carrier);
      grouped.set(key, list);
    }
    return Array.from(grouped.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [filtered, groupBy]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <input
          className="input sm:max-w-xs"
          placeholder="Filter carriers"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <div className="flex items-center gap-2 text-xs text-slate-600">
          <span>Group by</span>
          <select
            className="input h-9 text-xs sm:w-40"
            value={groupBy}
            onChange={(event) => setGroupBy(event.target.value as "brand" | "type")}
          >
            <option value="brand">Brand</option>
            <option value="type">Type</option>
          </select>
        </div>
      </div>

      {groups.length === 0 ? (
        <p className="text-sm text-slate-600">No carriers match this filter.</p>
      ) : (
        groups.map(([label, items]) => (
          <div key={label} className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-900">{label}</h3>
              <span className="text-xs text-slate-500">{items.length} models</span>
            </div>
            <div className="grid min-h-[12rem] grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((carrier) => (
                <Link
                  key={carrier.id}
                  href={`/inventory/${carrier.id}`}
                  className="card flex h-[11.5rem] flex-col gap-2 overflow-hidden p-3 transition-colors hover:border-slate-300"
                >
                  {carrier.imageUrl ? (
                    <div className="h-20 w-full overflow-hidden rounded-md border border-slate-200 bg-slate-50">
                      <img
                        src={carrier.imageUrl}
                        alt={`${carrier.brand} ${carrier.model ?? ""}`}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="flex h-20 items-center justify-center rounded-md border border-slate-200 bg-slate-50 text-[11px] text-slate-500">
                      No image
                    </div>
                  )}
                  <div>
                    <p className="text-[10px] uppercase tracking-wide text-slate-500">
                      {typeLabels[carrier.type] ?? carrier.type}
                    </p>
                    <h4 className="truncate text-sm font-semibold text-slate-900">
                      {carrier.brand}
                      {carrier.model ? ` · ${carrier.model}` : ""}
                    </h4>
                    <p className="mt-1 text-xs text-slate-600">
                      {Number(carrier.instanceCount) || 0} units
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
