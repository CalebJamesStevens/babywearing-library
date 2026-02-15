"use client";

import { useEffect, useState } from "react";
import { updateCarrier } from "@/app/inventory/actions";
import ActionButton from "@/components/ActionButton";

type Carrier = {
  id: string;
  brand: string;
  type: string;
  model: string | null;
  imageUrl: string | null;
  videoUrl: string | null;
  description: string | null;
  safetyInfo: string | null;
  safetyTests: string | null;
  recallInfo: string | null;
  manufacturerUrl: string | null;
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
          className="fixed inset-0 z-40 overflow-y-auto bg-slate-900/40 px-4 py-6"
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              setOpen(false);
            }
          }}
        >
          <div className="mx-auto flex w-full max-w-xl flex-col rounded-lg border border-slate-200 bg-white p-0 shadow-md sm:my-8 max-h-[90vh]">
            <div className="border-b border-slate-200 px-6 py-4">
              <h2 className="text-lg font-semibold text-slate-900">Edit carrier model</h2>
              <p className="mt-1 text-sm text-slate-600">
                Update model name, image, and safety info.
              </p>
            </div>

            <form action={updateCarrier} className="grid gap-3 overflow-y-auto px-6 py-5">
              <input type="hidden" name="carrierId" value={carrier.id} />
              <input name="brand" defaultValue={carrier.brand} placeholder="Brand" className="input" />
              <select name="type" defaultValue={carrier.type} className="input">
                <option value="soft_structured_carrier">Soft structured carrier</option>
                <option value="ring_sling">Ring sling</option>
                <option value="woven_wrap">Woven wrap</option>
                <option value="stretch_wrap">Stretch wrap</option>
                <option value="meh_dai_half_buckle">Meh dai / half buckle</option>
                <option value="onbuhimo">Onbuhimo</option>
              </select>
              <input name="model" defaultValue={carrier.model ?? ""} placeholder="Model" className="input" />
              <label className="grid gap-2 text-sm font-medium text-slate-900">
                Carrier photo
                <input
                  name="imageFile"
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="input"
                />
              </label>
              <input
                name="imageUrl"
                defaultValue={carrier.imageUrl ?? ""}
                placeholder="Image URL (optional)"
                className="input"
              />
              <input
                name="videoUrl"
                defaultValue={carrier.videoUrl ?? ""}
                placeholder="Safety video URL"
                className="input"
              />
              <textarea
                name="description"
                defaultValue={carrier.description ?? ""}
                placeholder="Description"
                className="textarea h-24"
              />
              <textarea
                name="safetyInfo"
                defaultValue={carrier.safetyInfo ?? ""}
                placeholder="Safety info"
                className="textarea h-20"
              />
              <textarea
                name="safetyTests"
                defaultValue={carrier.safetyTests ?? ""}
                placeholder="Safety tests performed"
                className="textarea h-20"
              />
              <textarea
                name="recallInfo"
                defaultValue={carrier.recallInfo ?? ""}
                placeholder="Recalls or safety notices"
                className="textarea h-20"
              />
              <input
                name="manufacturerUrl"
                defaultValue={carrier.manufacturerUrl ?? ""}
                placeholder="Manufacturer URL"
                className="input"
              />
              <ActionButton className="btn-primary">Save carrier model</ActionButton>
            </form>

            <div className="flex justify-end gap-2 border-t border-slate-200 px-6 py-4">
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
