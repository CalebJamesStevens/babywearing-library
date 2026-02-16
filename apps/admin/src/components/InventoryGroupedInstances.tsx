"use client";

import { useState } from "react";
import InventoryUnitGrid from "@/components/InventoryUnitGrid";

type InstanceRow = {
  id: string;
  carrierId: string;
  status: string;
  serialNumber: string | null;
  material: string | null;
  colorPattern: string | null;
  imageUrl: string | null;
  location: string | null;
  conditionNotes: string | null;
  issues: string | null;
  qrCodeValue: string | null;
  brand: string;
  model: string | null;
  type: string;
};

type Props = {
  instances: InstanceRow[];
};

const typeLabels: Record<string, string> = {
  soft_structured_carrier: "Soft structured carrier",
  ring_sling: "Ring sling",
  woven_wrap: "Woven wrap",
  stretch_wrap: "Stretch wrap",
  meh_dai_half_buckle: "Meh dai / half buckle",
  onbuhimo: "Onbuhimo",
};

export default function InventoryGroupedInstances({ instances }: Props) {
  const [collapsedTypes, setCollapsedTypes] = useState<Record<string, boolean>>({});
  const [collapsedBrands, setCollapsedBrands] = useState<Record<string, boolean>>({});

  const groupedByType = new Map<string, Map<string, InstanceRow[]>>();
  for (const instance of instances) {
    const typeKey = instance.type;
    const brandKey = instance.brand;
    const brandMap = groupedByType.get(typeKey) ?? new Map<string, InstanceRow[]>();
    const list = brandMap.get(brandKey) ?? [];
    list.push(instance);
    brandMap.set(brandKey, list);
    groupedByType.set(typeKey, brandMap);
  }

  if (instances.length === 0) {
    return <p className="text-sm text-slate-600">No carrier instances yet.</p>;
  }

  return (
    <div className="space-y-6">
      {Array.from(groupedByType.entries()).map(([type, brandMap]) => {
        const typeUnitCount = Array.from(brandMap.values()).reduce(
          (sum, items) => sum + items.length,
          0
        );
        const typeIsCollapsed = collapsedTypes[type] ?? false;

        return (
          <div key={type} className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <button
                type="button"
                className="btn-ghost px-0 text-left text-sm font-semibold text-slate-900"
                onClick={() =>
                  setCollapsedTypes((prev) => ({ ...prev, [type]: !typeIsCollapsed }))
                }
              >
                <span className="mr-2 inline-block w-4">{typeIsCollapsed ? "▸" : "▾"}</span>
                {typeLabels[type] ?? type}
              </button>
              <span className="text-xs text-slate-500">{typeUnitCount} units</span>
            </div>

            {typeIsCollapsed ? null : (
              <div className="space-y-5">
                {Array.from(brandMap.entries())
                  .sort(([a], [b]) => a.localeCompare(b))
                  .map(([brand, items]) => {
                    const brandKey = `${type}::${brand}`;
                    const brandIsCollapsed = collapsedBrands[brandKey] ?? false;

                    return (
                      <div key={brandKey} className="space-y-2">
                        <div className="flex items-center justify-between gap-3">
                          <button
                            type="button"
                            className="btn-ghost px-0 text-left text-sm font-medium text-slate-800"
                            onClick={() =>
                              setCollapsedBrands((prev) => ({
                                ...prev,
                                [brandKey]: !brandIsCollapsed,
                              }))
                            }
                          >
                            <span className="mr-2 inline-block w-4">
                              {brandIsCollapsed ? "▸" : "▾"}
                            </span>
                            {brand}
                          </button>
                          <span className="text-xs text-slate-500">{items.length} units</span>
                        </div>
                        {brandIsCollapsed ? null : <InventoryUnitGrid instances={items} />}
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
