"use client";

import { useMemo, useState } from "react";

type Props = {
  name?: string;
  brands: string[];
};

export default function BrandSelect({ name = "brand", brands }: Props) {
  const [value, setValue] = useState("");
  const normalized = value.trim().toLowerCase();

  const hasBrand = useMemo(() => {
    if (!normalized) return false;
    return brands.some((brand) => brand.toLowerCase() === normalized);
  }, [brands, normalized]);

  return (
    <div className="space-y-1">
      <input
        name={name}
        list="brand-options"
        placeholder="Brand"
        className="input"
        value={value}
        onChange={(event) => setValue(event.target.value)}
      />
      <datalist id="brand-options">
        {brands.map((brand) => (
          <option key={brand} value={brand} />
        ))}
      </datalist>
      {!normalized ? (
        <p className="text-xs text-ink/40">Start typing to pick a brand.</p>
      ) : hasBrand ? (
        <p className="text-xs text-ink/50">Existing brand</p>
      ) : (
        <p className="text-xs text-ember">Create new brand</p>
      )}
    </div>
  );
}
