"use client";

import { useEffect, useRef } from "react";
import AddCarrierForm from "@/components/AddCarrierForm";

type Props = {
  brandOptions: string[];
};

export default function AddCarrierModal({ brandOptions }: Props) {
  const dialogRef = useRef<HTMLDialogElement | null>(null);

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

  return (
    <>
      <button
        type="button"
        className="btn-primary fixed bottom-20 left-1/2 z-50 -translate-x-1/2 rounded-full px-6 shadow-md sm:hidden"
        onClick={() => dialogRef.current?.showModal()}
        aria-label="Add carrier model"
      >
        Add carrier
      </button>

      <button
        type="button"
        className="btn-primary hidden sm:inline-flex"
        onClick={() => dialogRef.current?.showModal()}
      >
        Add carrier
      </button>

      <dialog
        ref={dialogRef}
        className="w-full max-w-lg rounded-lg border border-slate-200 bg-white p-0 shadow-md"
      >
        <div className="border-b border-slate-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-slate-900">Add carrier model</h2>
          <p className="mt-1 text-sm text-slate-600">
            Add a new carrier model. You can add individual inventory after saving.
          </p>
        </div>
        <div className="p-6">
          <AddCarrierForm
            brandOptions={brandOptions}
            onSuccess={() => dialogRef.current?.close()}
          />
        </div>
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
