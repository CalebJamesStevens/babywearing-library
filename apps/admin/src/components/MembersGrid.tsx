"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import ActionButton from "@/components/ActionButton";
import { upsertMember } from "@/app/members/actions";

type MemberEntry = {
  user: {
    id: string;
    email: string | null;
    name: string | null;
    createdAt: string;
  };
  member?: {
    status: "active" | "inactive" | "expired" | "suspended";
    lastPaidAt: string | null;
    paymentType: "cash" | "card" | "venmo" | "paypal" | "other" | null;
    contactEmail: string | null;
    contactPhone: string | null;
    notes: string | null;
  };
};

type Props = {
  entries: MemberEntry[];
};

export default function MembersGrid({ entries }: Props) {
  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);

  const active = useMemo(
    () => entries.find((entry) => entry.user.id === activeId) ?? null,
    [activeId, entries]
  );

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
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {entries.map((entry) => {
          const status = entry.member?.status ?? "pending";
          return (
            <button
              key={entry.user.id}
              type="button"
              className="card text-left transition-colors hover:border-slate-300"
              onClick={() => {
                setActiveId(entry.user.id);
                dialogRef.current?.showModal();
              }}
            >
              <div className="space-y-2">
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    {entry.user.name || "New member"}
                  </p>
                  <p className="text-xs text-slate-500">{entry.user.email ?? entry.user.id}</p>
                </div>
                <span
                  className={`inline-flex w-fit items-center rounded-md px-2 py-1 text-xs font-medium ${
                    status === "active"
                      ? "bg-emerald-50 text-emerald-700"
                      : status === "pending"
                      ? "bg-amber-50 text-amber-700"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {status === "pending" ? "Requested" : status}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      <dialog
        ref={dialogRef}
        className="w-full max-w-lg rounded-lg border border-slate-200 bg-white p-0 shadow-md"
      >
        {active ? (
          <>
            <div className="border-b border-slate-200 px-6 py-4">
              <h2 className="text-lg font-semibold text-slate-900">Approve member</h2>
              <p className="mt-1 text-sm text-slate-600">
                {active.user.name || active.user.email || active.user.id}
              </p>
            </div>
            <form action={upsertMember} className="grid gap-3 px-6 py-5">
              <input type="hidden" name="userId" value={active.user.id} />
              <select name="status" defaultValue={active.member?.status ?? "active"} className="input">
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="expired">Expired</option>
                <option value="suspended">Suspended</option>
              </select>
              <input
                name="lastPaidAt"
                type="date"
                defaultValue={active.member?.lastPaidAt ?? ""}
                className="input"
              />
              <select name="paymentType" defaultValue={active.member?.paymentType ?? ""} className="input">
                <option value="">Payment type</option>
                <option value="cash">Cash</option>
                <option value="card">Card</option>
                <option value="venmo">Venmo</option>
                <option value="paypal">PayPal</option>
                <option value="other">Other</option>
              </select>
              <input
                name="contactEmail"
                defaultValue={active.member?.contactEmail ?? active.user.email ?? ""}
                placeholder="Email"
                className="input"
              />
              <input
                name="contactPhone"
                defaultValue={active.member?.contactPhone ?? ""}
                placeholder="Phone"
                className="input"
              />
              <textarea
                name="notes"
                defaultValue={active.member?.notes ?? ""}
                placeholder="Notes"
                className="textarea h-24"
              />
              <ActionButton className="btn-primary">Save member</ActionButton>
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
          </>
        ) : null}
      </dialog>
    </>
  );
}
