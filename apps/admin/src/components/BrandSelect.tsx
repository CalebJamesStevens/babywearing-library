"use client";

import { useState } from "react";
import FormField from "@/components/FormField";

type Props = {
  name?: string;
  brands: string[];
};

export default function BrandSelect({ name = "brand", brands }: Props) {
  const [value, setValue] = useState("");
  const normalized = value.trim().toLowerCase();
  const hasBrand =
    normalized.length > 0 &&
    brands.some((brand) => brand.toLowerCase() === normalized);

  return (
    <div className="space-y-1">
      <FormField label="Brand">
        <input
          name={name}
          list="brand-options"
          placeholder="Brand"
          className="input"
          value={value}
          onChange={(event) => setValue(event.target.value)}
        />
      </FormField>
      <datalist id="brand-options">
        {brands.map((brand) => (
          <option key={brand} value={brand} />
        ))}
      </datalist>
      {!normalized ? (
        <p className="text-xs text-slate-500">Start typing to pick a brand.</p>
      ) : hasBrand ? (
        <p className="text-xs text-slate-500">Existing brand</p>
      ) : (
        <p className="text-xs text-amber-700">Create new brand</p>
      )}
    </div>
  );
}
