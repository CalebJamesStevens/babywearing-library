"use client";

import { useState } from "react";
import ActionButton from "@/components/ActionButton";
import FormField from "@/components/FormField";
import { deleteInstance, generateQr, updateInstance } from "@/app/inventory/actions";

type Instance = {
  id: string;
  carrierId: string;
  status: string;
  serialNumber: string | null;
  replacementValueCents: number | null;
  material: string | null;
  colorPattern: string | null;
  imageUrl: string | null;
  location: string | null;
  conditionNotes: string | null;
  issues: string | null;
  qrCodeValue: string | null;
  brand?: string | null;
  model?: string | null;
  size?: string | null;
  type?: string;
};

type Props = {
  instances: Instance[];
};

const typeLabels: Record<string, string> = {
  soft_structured_carrier: "Soft structured carrier",
  ring_sling: "Ring sling",
  woven_wrap: "Woven wrap",
  stretch_wrap: "Stretch wrap",
  meh_dai_half_buckle: "Meh dai / half buckle",
  onbuhimo: "Onbuhimo",
};

function formatDollars(cents: number | null) {
  if (cents == null) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

function formatDollarsForInput(cents: number | null) {
  if (cents == null) return "";
  return (cents / 100).toFixed(2);
}

export default function InventoryUnitGrid({ instances }: Props) {
  const [active, setActive] = useState<Instance | null>(null);

  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {instances.map((instance, index) => {
          const primaryLabel =
            instance.colorPattern?.trim() ||
            instance.material?.trim() ||
            `Unit ${index + 1}`;
          return (
            <button
              type="button"
              key={instance.id}
              className="card text-left transition-colors hover:border-slate-300"
              onClick={() => setActive(instance)}
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
                  {instance.brand ? (
                    <p className="text-sm font-semibold text-slate-900">
                      {[instance.brand, instance.model, instance.size].filter(Boolean).join(" · ")}
                    </p>
                  ) : null}
                  <p className="text-xs text-slate-500">
                    {primaryLabel}
                  </p>
                  {instance.type ? (
                    <p className="text-xs text-slate-500">
                      {typeLabels[instance.type] ?? instance.type}
                    </p>
                  ) : null}
                  <p className="text-xs text-slate-500">
                    Status: {instance.status.replace("_", " ")}
                  </p>
                  <p className="text-xs text-slate-500">
                    {instance.material ? `Material: ${instance.material}` : "Material: —"}
                  </p>
                  <p className="text-xs text-slate-500">
                    {instance.colorPattern ? `Color/Pattern: ${instance.colorPattern}` : "Color/Pattern: —"}
                  </p>
                  <p className="text-xs text-slate-500">
                    Replacement value: {formatDollars(instance.replacementValueCents)}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {active ? (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/30 p-2 sm:items-center sm:p-4"
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              setActive(null);
            }
          }}
        >
          <div className="flex max-h-[calc(100dvh-1rem)] w-full max-w-xl flex-col overflow-hidden rounded-lg border border-slate-200 bg-white p-0 shadow-md sm:max-h-[calc(100dvh-4rem)]">
            <div className="shrink-0 border-b border-slate-200 px-4 py-4 sm:px-6">
              <h2 className="text-lg font-semibold text-slate-900">
                Unit {active.serialNumber ? `· ${active.serialNumber}` : active.id.slice(0, 8)}
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                Update unit details and QR code.
              </p>
            </div>
            <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-5 sm:px-6">
              <div className="flex flex-wrap gap-2">
                <form action={generateQr}>
                  <input type="hidden" name="instanceId" value={active.id} />
                  <input type="hidden" name="carrierId" value={active.carrierId} />
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
                <input type="hidden" name="carrierId" value={active.carrierId} />
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">Carrier details</h3>
                </div>
                <FormField label="Brand">
                  <input
                    name="brand"
                    defaultValue={active.brand ?? ""}
                    placeholder="Brand"
                    className="input"
                  />
                </FormField>
                <FormField label="Type">
                  <select name="type" defaultValue={active.type ?? "soft_structured_carrier"} className="input">
                    <option value="soft_structured_carrier">Soft structured carrier</option>
                    <option value="ring_sling">Ring sling</option>
                    <option value="woven_wrap">Woven wrap</option>
                    <option value="stretch_wrap">Stretch wrap</option>
                    <option value="meh_dai_half_buckle">Meh dai / half buckle</option>
                    <option value="onbuhimo">Onbuhimo</option>
                  </select>
                </FormField>
                <FormField label="Model">
                  <input name="model" defaultValue={active.model ?? ""} placeholder="Model" className="input" />
                </FormField>
                <FormField label="Size">
                  <input name="size" defaultValue={active.size ?? ""} placeholder="Size" className="input" />
                </FormField>
                <div className="pt-2">
                  <h3 className="text-sm font-semibold text-slate-900">Unit details</h3>
                </div>
                <FormField label="Status">
                  <select name="status" defaultValue={active.status} className="input">
                    <option value="available">Available</option>
                    <option value="checked_out">Checked out</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="retired">Retired</option>
                  </select>
                </FormField>
                <FormField label="Serial number">
                  <input
                    name="serialNumber"
                    defaultValue={active.serialNumber ?? ""}
                    placeholder="Serial number"
                    className="input"
                  />
                </FormField>
                <FormField label="Replacement value">
                  <input
                    name="replacementValue"
                    type="number"
                    min="0"
                    step="0.01"
                    inputMode="decimal"
                    defaultValue={formatDollarsForInput(active.replacementValueCents)}
                    placeholder="Replacement value ($)"
                    className="input"
                  />
                </FormField>
                <FormField label="QR code URL or value">
                  <input
                    name="qrCodeValue"
                    defaultValue={active.qrCodeValue ?? ""}
                    placeholder="QR code URL or value"
                    className="input"
                  />
                </FormField>
                <FormField label="Location">
                  <input name="location" defaultValue={active.location ?? ""} placeholder="Location" className="input" />
                </FormField>
                <FormField label="Material">
                  <input name="material" defaultValue={active.material ?? ""} placeholder="Material" className="input" />
                </FormField>
                <FormField label="Color / pattern">
                  <input name="colorPattern" defaultValue={active.colorPattern ?? ""} placeholder="Color / pattern" className="input" />
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
                <FormField label="Image URL">
                  <input name="imageUrl" defaultValue={active.imageUrl ?? ""} placeholder="Image URL (optional)" className="input" />
                </FormField>
                <FormField label="Condition notes">
                  <textarea name="conditionNotes" defaultValue={active.conditionNotes ?? ""} placeholder="Condition notes" className="textarea h-20" />
                </FormField>
                <FormField label="Known issues">
                  <textarea name="issues" defaultValue={active.issues ?? ""} placeholder="Known issues" className="textarea h-20" />
                </FormField>
                <ActionButton className="btn-primary">
                  Save changes
                </ActionButton>
              </form>
            </div>
            <div className="shrink-0 flex flex-wrap justify-end gap-2 border-t border-slate-200 px-4 py-4 sm:px-6">
              <form
                action={deleteInstance}
                className="mr-auto"
                onSubmit={(event) => {
                  if (!window.confirm("Delete this carrier instance? This cannot be undone.")) {
                    event.preventDefault();
                  }
                }}
              >
                <input type="hidden" name="instanceId" value={active.id} />
                <input type="hidden" name="carrierId" value={active.carrierId} />
                <ActionButton className="btn-secondary border-rose-200 text-rose-700 hover:bg-rose-50">
                  Delete instance
                </ActionButton>
              </form>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => {
                  setActive(null);
                }}
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
