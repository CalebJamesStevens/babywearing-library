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
        aria-label="Add Carrier"
      >
        Add Carrier
      </button>

      <button
        type="button"
        className="btn-primary hidden sm:inline-flex"
        onClick={() => dialogRef.current?.showModal()}
      >
        Add Carrier
      </button>

      <dialog
        ref={dialogRef}
        className="m-auto w-[calc(100vw-1rem)] max-w-lg overflow-hidden rounded-lg border border-slate-200 bg-white p-0 shadow-md sm:w-full"
      >
        <div className="flex max-h-[calc(100dvh-1rem)] flex-col sm:max-h-[calc(100dvh-3rem)]">
          <div className="shrink-0 border-b border-slate-200 px-4 py-4 sm:px-6">
            <h2 className="text-lg font-semibold text-slate-900">Add Carrier</h2>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-6">
            <AddCarrierForm
              brandOptions={brandOptions}
              onSuccess={() => dialogRef.current?.close()}
            />
          </div>
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
