"use client";

import { useActionState, useEffect } from "react";
import BrandSelect from "@/components/BrandSelect";
import ActionButton from "@/components/ActionButton";
import FormField from "@/components/FormField";
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
      </div>
      <BrandSelect brands={brandOptions} />
      <FormField label="Type">
        <select name="type" className="input">
          <option value="">Select type</option>
          <option value="soft_structured_carrier">Soft structured carrier</option>
          <option value="ring_sling">Ring sling</option>
          <option value="woven_wrap">Woven wrap</option>
          <option value="stretch_wrap">Stretch wrap</option>
          <option value="meh_dai_half_buckle">Meh dai / half buckle</option>
          <option value="onbuhimo">Onbuhimo</option>
        </select>
      </FormField>
      <FormField label="Model">
        <input name="model" placeholder="Model" className="input" />
      </FormField>
      <FormField label="Size">
        <input name="size" placeholder="Size" className="input" />
      </FormField>
      <FormField label="Serial number">
        <input name="serialNumber" placeholder="Serial number (optional)" className="input" />
      </FormField>
      <FormField label="Replacement value">
        <input
          name="replacementValue"
          type="number"
          min="0"
          step="0.01"
          inputMode="decimal"
          placeholder="Replacement value ($, optional)"
          className="input"
        />
      </FormField>
      <FormField label="Material">
        <input name="material" placeholder="Material (optional)" className="input" />
      </FormField>
      <FormField label="Color / pattern">
        <input name="colorPattern" placeholder="Color / pattern (optional)" className="input" />
      </FormField>
      <FormField label="Unit photo" className="gap-2">
        <input
          name="instanceImageFile"
          type="file"
          accept="image/*"
          capture="environment"
          className="input"
        />
      </FormField>
      <FormField label="Unit image URL">
        <input name="instanceImageUrl" placeholder="Unit image URL (optional)" className="input" />
      </FormField>
      <FormField label="Storage location">
        <input name="location" placeholder="Storage location (optional)" className="input" />
      </FormField>
      <FormField label="Condition notes">
        <textarea name="conditionNotes" placeholder="Condition notes (optional)" className="textarea h-20" />
      </FormField>
      <FormField label="Known issues">
        <textarea name="issues" placeholder="Known issues (optional)" className="textarea h-20" />
      </FormField>
      {state.error ? (
        <p className="text-xs text-ember">{state.error}</p>
      ) : null}
      {state.ok ? (
        <p className="text-xs text-emerald-700">Carrier added.</p>
      ) : null}
      <ActionButton className="btn-primary">Add Carrier</ActionButton>
    </form>
  );
}
