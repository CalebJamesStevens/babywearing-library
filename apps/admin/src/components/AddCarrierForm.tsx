"use client";

import { useActionState, useEffect } from "react";
import BrandSelect from "@/components/BrandSelect";
import ActionButton from "@/components/ActionButton";
import { createCarrier } from "@/app/inventory/actions";

type Props = {
  brandOptions: string[];
  onSuccess?: () => void;
};

type FormState = {
  ok: boolean;
  error?: string;
};

const initialState: FormState = { ok: false };

export default function AddCarrierForm({ brandOptions, onSuccess }: Props) {
  const [state, formAction] = useActionState(createCarrier, initialState);

  useEffect(() => {
    if (state.ok) {
      onSuccess?.();
    }
  }, [state.ok, onSuccess]);

  return (
    <form action={formAction} className="mt-4 grid gap-3">
      <div>
        <h3 className="text-sm font-semibold text-slate-900">Carrier details</h3>
        <p className="mt-1 text-xs text-slate-600">
          Save the shared details for this carrier, then add the first physical unit below.
        </p>
      </div>
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
      <label className="grid gap-2 text-sm font-medium text-slate-900">
        Carrier photo
        <input
          name="carrierImageFile"
          type="file"
          accept="image/*"
          capture="environment"
          className="input"
        />
      </label>
      <input name="carrierImageUrl" placeholder="Image URL (optional)" className="input" />
      <input name="videoUrl" placeholder="Safety video URL" className="input" />
      <textarea name="description" placeholder="Description" className="textarea h-24" />
      <textarea name="safetyInfo" placeholder="Safety info" className="textarea h-20" />
      <textarea name="safetyTests" placeholder="Safety tests performed" className="textarea h-20" />
      <textarea name="recallInfo" placeholder="Recalls or safety notices" className="textarea h-20" />
      <input name="manufacturerUrl" placeholder="Manufacturer URL" className="input" />
      <div className="pt-2">
        <h3 className="text-sm font-semibold text-slate-900">First inventory unit</h3>
        <p className="mt-1 text-xs text-slate-600">
          This creates the first individual carrier instance right away.
        </p>
      </div>
      <input name="serialNumber" placeholder="Serial number (optional)" className="input" />
      <input name="material" placeholder="Material (optional)" className="input" />
      <input name="colorPattern" placeholder="Color / pattern (optional)" className="input" />
      <label className="grid gap-2 text-sm font-medium text-slate-900">
        Unit photo
        <input
          name="instanceImageFile"
          type="file"
          accept="image/*"
          capture="environment"
          className="input"
        />
      </label>
      <input name="instanceImageUrl" placeholder="Unit image URL (optional)" className="input" />
      <input name="location" placeholder="Storage location (optional)" className="input" />
      <textarea name="conditionNotes" placeholder="Condition notes (optional)" className="textarea h-20" />
      <textarea name="issues" placeholder="Known issues (optional)" className="textarea h-20" />
      {state.error ? (
        <p className="text-xs text-ember">{state.error}</p>
      ) : null}
      {state.ok ? (
        <p className="text-xs text-emerald-700">Carrier instance added.</p>
      ) : null}
      <ActionButton className="btn-primary">
        Add carrier instance
      </ActionButton>
    </form>
  );
}
