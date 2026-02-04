"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import ActionButton from "@/components/ActionButton";
import { generateQr, updateInstance } from "@/app/inventory/actions";

type Instance = {
  id: string;
  status: string;
  serialNumber: string | null;
  material: string | null;
  colorPattern: string | null;
  imageUrl: string | null;
  location: string | null;
  conditionNotes: string | null;
  issues: string | null;
  qrCodeValue: string | null;
};

type Props = {
  carrierId: string;
  instances: Instance[];
};

export default function InventoryUnitGrid({ carrierId, instances }: Props) {
  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);

  const active = useMemo(
    () => instances.find((instance) => instance.id === activeId) ?? null,
    [activeId, instances]
  );

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const onClick = (event: MouseEvent) => {
      if (event.target === dialog) {
        dialog.close();
        setActiveId(null);
      }
    };
    dialog.addEventListener("click", onClick);
    return () => dialog.removeEventListener("click", onClick);
  }, []);

  useEffect(() => {
    if (activeId) {
      dialogRef.current?.showModal();
    }
  }, [activeId]);

  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {instances.map((instance) => (
          <button
            type="button"
            key={instance.id}
            className="card text-left transition-colors hover:border-slate-300"
            onClick={() => setActiveId(instance.id)}
          >
            <div className="space-y-3">
              {instance.imageUrl ? (
                <div className="h-28 w-full overflow-hidden rounded-md border border-slate-200 bg-slate-50">
                  <img
                    src={instance.imageUrl}
                    alt={`Unit ${instance.serialNumber ?? instance.id}`}
                    className="h-full w-full object-cover"
                  />
                </div>
              ) : (
                <div className="flex h-28 w-full items-center justify-center rounded-md border border-slate-200 bg-slate-50 text-xs text-slate-500">
                  No image
                </div>
              )}
              <div className="space-y-1">
                <p className="text-sm font-semibold text-slate-900">
                  Unit {instance.serialNumber ? `· ${instance.serialNumber}` : instance.id.slice(0, 8)}
                </p>
                <p className="text-xs text-slate-500">
                  Status: {instance.status.replace("_", " ")}
                </p>
                <p className="text-xs text-slate-500">
                  {instance.material ? `Material: ${instance.material}` : "Material: —"}
                </p>
                <p className="text-xs text-slate-500">
                  {instance.colorPattern ? `Color/Pattern: ${instance.colorPattern}` : "Color/Pattern: —"}
                </p>
              </div>
            </div>
          </button>
        ))}
      </div>

      <dialog
        ref={dialogRef}
        className="w-full max-w-xl rounded-lg border border-slate-200 bg-white p-0 shadow-md"
      >
        {active ? (
          <>
            <div className="border-b border-slate-200 px-6 py-4">
              <h2 className="text-lg font-semibold text-slate-900">
                Unit {active.serialNumber ? `· ${active.serialNumber}` : active.id.slice(0, 8)}
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                Update unit details and QR code.
              </p>
            </div>
            <div className="space-y-4 px-6 py-5">
              <div className="flex flex-wrap gap-2">
                <form action={generateQr}>
                  <input type="hidden" name="instanceId" value={active.id} />
                  <input type="hidden" name="carrierId" value={carrierId} />
                  <button className="btn-secondary">Generate QR</button>
                </form>
                {active.qrCodeValue ? (
                  <a
                    className="btn-ghost"
                    href={`/api/qr/${active.id}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    View QR
                  </a>
                ) : null}
              </div>
              <form action={updateInstance} className="grid gap-3">
                <input type="hidden" name="instanceId" value={active.id} />
                <input type="hidden" name="carrierId" value={carrierId} />
                <select name="status" defaultValue={active.status} className="input">
                  <option value="available">Available</option>
                  <option value="checked_out">Checked out</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="retired">Retired</option>
                </select>
                <input name="location" defaultValue={active.location ?? ""} placeholder="Location" className="input" />
                <input name="material" defaultValue={active.material ?? ""} placeholder="Material" className="input" />
                <input name="colorPattern" defaultValue={active.colorPattern ?? ""} placeholder="Color / pattern" className="input" />
                <input name="imageUrl" defaultValue={active.imageUrl ?? ""} placeholder="Image URL" className="input" />
                <textarea name="conditionNotes" defaultValue={active.conditionNotes ?? ""} placeholder="Condition notes" className="textarea h-20" />
                <textarea name="issues" defaultValue={active.issues ?? ""} placeholder="Known issues" className="textarea h-20" />
                <ActionButton className="btn-primary">
                  Save updates
                </ActionButton>
              </form>
            </div>
            <div className="flex justify-end gap-2 border-t border-slate-200 px-6 py-4">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => {
                  dialogRef.current?.close();
                  setActiveId(null);
                }}
              >
                Close
              </button>
            </div>
          </>
        ) : null}
      </dialog>
    </>
  );
}
