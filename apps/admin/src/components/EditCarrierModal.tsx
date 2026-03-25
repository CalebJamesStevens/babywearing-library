"use client";

import { useEffect, useState } from "react";
import { updateCarrier } from "@/app/inventory/actions";
import ActionButton from "@/components/ActionButton";
import FormField from "@/components/FormField";

type Carrier = {
  id: string;
  brand: string;
  type: string;
  model: string | null;
  size: string | null;
};

type Props = {
  carrier: Carrier;
};

export default function EditCarrierModal({ carrier }: Props) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    window.dispatchEvent(
      new CustomEvent("edit-carrier-modal-state", { detail: { open } })
    );
    return () => {
      window.dispatchEvent(
        new CustomEvent("edit-carrier-modal-state", { detail: { open: false } })
      );
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        className="btn-secondary"
        onClick={() => setOpen(true)}
      >
        Edit carrier
      </button>

      {open ? (
        <div
          className="fixed inset-0 z-40 flex items-end bg-slate-900/40 p-2 sm:items-center sm:px-4 sm:py-6"
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              setOpen(false);
            }
          }}
        >
          <div className="mx-auto flex max-h-[calc(100dvh-1rem)] w-full max-w-xl flex-col overflow-hidden rounded-lg border border-slate-200 bg-white p-0 shadow-md sm:my-8 sm:max-h-[calc(100dvh-4rem)]">
            <div className="shrink-0 border-b border-slate-200 px-4 py-4 sm:px-6">
              <h2 className="text-lg font-semibold text-slate-900">Edit carrier details</h2>
              <p className="mt-1 text-sm text-slate-600">
                Update the shared carrier details used by every unit.
              </p>
            </div>

            <form
              action={updateCarrier}
              className="grid min-h-0 flex-1 gap-3 overflow-y-auto px-4 py-5 sm:px-6"
            >
              <input type="hidden" name="carrierId" value={carrier.id} />
              <FormField label="Brand">
                <input name="brand" defaultValue={carrier.brand} placeholder="Brand" className="input" />
              </FormField>
              <FormField label="Type">
                <select name="type" defaultValue={carrier.type} className="input">
                  <option value="soft_structured_carrier">Soft structured carrier</option>
                  <option value="ring_sling">Ring sling</option>
                  <option value="woven_wrap">Woven wrap</option>
                  <option value="stretch_wrap">Stretch wrap</option>
                  <option value="meh_dai_half_buckle">Meh dai / half buckle</option>
                  <option value="onbuhimo">Onbuhimo</option>
                </select>
              </FormField>
              <FormField label="Model">
                <input name="model" defaultValue={carrier.model ?? ""} placeholder="Model" className="input" />
              </FormField>
              <FormField label="Size">
                <input name="size" defaultValue={carrier.size ?? ""} placeholder="Size" className="input" />
              </FormField>
              <ActionButton className="btn-primary">Save carrier details</ActionButton>
            </form>

            <div className="shrink-0 flex justify-end gap-2 border-t border-slate-200 px-4 py-4 sm:px-6">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setOpen(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
