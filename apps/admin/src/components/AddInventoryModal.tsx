"use client";

import { useEffect, useRef, useState } from "react";
import { useActionState } from "react";
import { createPortal } from "react-dom";
import ActionButton from "@/components/ActionButton";
import FormField from "@/components/FormField";
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
  const [mounted, setMounted] = useState(false);
  const [hideTrigger, setHideTrigger] = useState(false);

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

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const onModalState = (event: Event) => {
      const customEvent = event as CustomEvent<{ open?: boolean }>;
      setHideTrigger(Boolean(customEvent.detail?.open));
    };
    window.addEventListener("edit-carrier-modal-state", onModalState);
    return () => window.removeEventListener("edit-carrier-modal-state", onModalState);
  }, []);

  const triggerButtons = (
    <>
      <button
        type="button"
        className="btn-primary fixed bottom-20 left-1/2 z-[1000] -translate-x-1/2 rounded-full px-6 shadow-md sm:hidden"
        style={{ zIndex: 2147483647 }}
        onClick={() => dialogRef.current?.showModal()}
        aria-label="Add inventory unit"
      >
        Add inventory
      </button>

      <button
        type="button"
        className="btn-primary fixed bottom-6 right-6 z-[1000] hidden sm:inline-flex"
        style={{ zIndex: 2147483647 }}
        onClick={() => dialogRef.current?.showModal()}
      >
        Add inventory
      </button>
    </>
  );

  return (
    <>
      {mounted && !hideTrigger ? createPortal(triggerButtons, document.body) : null}

      <dialog
        ref={dialogRef}
        className="m-auto w-[calc(100vw-1rem)] max-w-lg overflow-hidden rounded-lg border border-slate-200 bg-white p-0 shadow-md sm:w-full"
      >
        <div className="flex max-h-[calc(100dvh-1rem)] flex-col sm:max-h-[calc(100dvh-3rem)]">
          <div className="shrink-0 border-b border-slate-200 px-4 py-4 sm:px-6">
            <h2 className="text-lg font-semibold text-slate-900">Add inventory unit</h2>
            <p className="mt-1 text-sm text-slate-600">
              Add another physical unit for this carrier.
            </p>
          </div>
          <form
            action={formAction}
            className="grid min-h-0 flex-1 gap-3 overflow-y-auto px-4 py-5 sm:px-6"
          >
            <input type="hidden" name="carrierId" value={carrierId} />
            <FormField label="Serial number">
              <input name="serialNumber" placeholder="Serial number" className="input" />
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
                name="imageFile"
                type="file"
                accept="image/*"
                capture="environment"
                className="input"
              />
            </FormField>
            <FormField label="Unit image URL">
              <input name="imageUrl" placeholder="Unit image URL (optional)" className="input" />
            </FormField>
            <FormField label="Storage location">
              <input name="location" placeholder="Storage location" className="input" />
            </FormField>
            <FormField label="Condition notes">
              <textarea name="conditionNotes" placeholder="Condition notes" className="textarea h-20" />
            </FormField>
            <FormField label="Known issues">
              <textarea name="issues" placeholder="Known issues" className="textarea h-20" />
            </FormField>
            {state.error ? (
              <p className="text-xs text-rose-600">{state.error}</p>
            ) : null}
            <ActionButton className="btn-primary">Add inventory</ActionButton>
          </form>
          <div className="shrink-0 flex justify-end gap-2 border-t border-slate-200 px-4 py-4 sm:px-6">
            <button
              type="button"
              className="btn-secondary"
              onClick={() => dialogRef.current?.close()}
            >
              Close
            </button>
          </div>
        </div>
      </dialog>
    </>
  );
}
