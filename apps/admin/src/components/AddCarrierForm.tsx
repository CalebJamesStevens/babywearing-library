"use client";

import { useFormState } from "react-dom";
import BrandSelect from "@/components/BrandSelect";
import ActionButton from "@/components/ActionButton";
import { createCarrier } from "@/app/inventory/actions";

type Props = {
  brandOptions: string[];
};

type FormState = {
  ok: boolean;
  error?: string;
};

const initialState: FormState = { ok: false };

export default function AddCarrierForm({ brandOptions }: Props) {
  const [state, formAction] = useFormState(createCarrier, initialState);

  return (
    <form action={formAction} className="mt-4 grid gap-2.5">
      <BrandSelect brands={brandOptions} />
      <select name="type" className="input">
        <option value="">Select type</option>
        <option value="soft_structured_carrier">Soft structured carrier</option>
        <option value="ring_sling">Ring sling</option>
        <option value="woven_wrap">Woven wrap</option>
        <option value="stretch_wrap">Stretch wrap</option>
        <option value="meh_dai_half_buckle">Meh dai / half buckle</option>
        <option value="onbuhimo">Onbuhimo</option>
      </select>
      <input name="model" placeholder="Model" className="input" />
      <input name="material" placeholder="Material (optional)" className="input" />
      <input name="imageUrl" placeholder="Image URL" className="input" />
      <input name="videoUrl" placeholder="Safety video URL" className="input" />
      <textarea name="description" placeholder="Description" className="input h-24" />
      <textarea name="safetyInfo" placeholder="Safety info" className="input h-20" />
      <textarea name="safetyTests" placeholder="Safety tests performed" className="input h-20" />
      <textarea name="recallInfo" placeholder="Recalls or safety notices" className="input h-20" />
      <input name="manufacturerUrl" placeholder="Manufacturer URL" className="input" />
      {state.error ? (
        <p className="text-xs text-ember">{state.error}</p>
      ) : null}
      {state.ok ? (
        <p className="text-xs text-emerald-700">Carrier added.</p>
      ) : null}
      <ActionButton className="rounded-full bg-lake px-4 py-2 text-sm font-semibold text-white">
        Add carrier
      </ActionButton>
    </form>
  );
}
