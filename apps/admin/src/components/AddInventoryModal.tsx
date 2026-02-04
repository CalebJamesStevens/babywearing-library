"use client";

import { useEffect, useRef } from "react";
import { useActionState } from "react";
import ActionButton from "@/components/ActionButton";
import { createInstanceWithState } from "@/app/inventory/actions";

type Props = {
  carrierId: string;
};

type FormState = {
  ok: boolean;
  error?: string;
};

const initialState: FormState = { ok: false };

export default function AddInventoryModal({ carrierId }: Props) {
  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const [state, formAction] = useActionState(createInstanceWithState, initialState);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const onClick = (event: MouseEvent) => {
      if (event.target === dialog) {
        dialog.close();
      }
    };
    dialog.addEventListener("click", onClick);
    return () => dialog.removeEventListener("click", onClick);
  }, []);

  useEffect(() => {
    if (state.ok) {
      dialogRef.current?.close();
    }
  }, [state.ok]);

  return (
    <>
      <button
        type="button"
        className="btn-primary fixed bottom-20 left-1/2 z-50 -translate-x-1/2 rounded-full px-6 shadow-md sm:hidden"
        onClick={() => dialogRef.current?.showModal()}
        aria-label="Add inventory unit"
      >
        Add inventory
      </button>

      <button
        type="button"
        className="btn-primary hidden sm:inline-flex"
        onClick={() => dialogRef.current?.showModal()}
      >
        Add inventory
      </button>

      <dialog
        ref={dialogRef}
        className="w-full max-w-lg rounded-lg border border-slate-200 bg-white p-0 shadow-md"
      >
        <div className="border-b border-slate-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-slate-900">Add inventory unit</h2>
          <p className="mt-1 text-sm text-slate-600">
            Add a physical unit for this carrier model.
          </p>
        </div>
        <form action={formAction} className="grid gap-3 px-6 py-5" encType="multipart/form-data">
          <input type="hidden" name="carrierId" value={carrierId} />
          <input name="serialNumber" placeholder="Serial number" className="input" />
          <input name="material" placeholder="Material (optional)" className="input" />
          <input name="colorPattern" placeholder="Color / pattern (optional)" className="input" />
          <label className="grid gap-2 text-sm font-medium text-slate-900">
            Unit photo
            <input
              name="imageFile"
              type="file"
              accept="image/*"
              capture="environment"
              className="input"
            />
          </label>
          <input name="imageUrl" placeholder="Unit image URL (optional)" className="input" />
          <input name="location" placeholder="Storage location" className="input" />
          <textarea name="conditionNotes" placeholder="Condition notes" className="textarea h-20" />
          <textarea name="issues" placeholder="Known issues" className="textarea h-20" />
          {state.error ? (
            <p className="text-xs text-rose-600">{state.error}</p>
          ) : null}
          <ActionButton className="btn-primary">Add inventory</ActionButton>
        </form>
        <div className="flex justify-end gap-2 border-t border-slate-200 px-6 py-4">
          <button
            type="button"
            className="btn-secondary"
            onClick={() => dialogRef.current?.close()}
          >
            Close
          </button>
        </div>
      </dialog>
    </>
  );
}
