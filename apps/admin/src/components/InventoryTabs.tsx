"use client";

import { useState } from "react";
import AddCarrierForm from "@/components/AddCarrierForm";
import type { ReactNode } from "react";

type Props = {
  brandOptions: string[];
  addInstanceForm: ReactNode;
};

export default function InventoryTabs({ brandOptions, addInstanceForm }: Props) {
  const [tab, setTab] = useState<"model" | "instance">("instance");

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setTab("instance")}
          className={
            tab === "instance"
              ? "btn-primary"
              : "btn-secondary"
          }
        >
          Add carrier instance
        </button>
        <button
          type="button"
          onClick={() => setTab("model")}
          className={
            tab === "model"
              ? "btn-primary"
              : "btn-secondary"
          }
        >
          Add carrier model
        </button>
      </div>

      {tab === "instance" ? (
        <div className="card">
          <h2 className="text-lg font-semibold text-slate-900">Add carrier instance</h2>
          {addInstanceForm}
        </div>
      ) : (
        <div className="card">
          <h2 className="text-lg font-semibold text-slate-900">Add carrier model</h2>
          <AddCarrierForm brandOptions={brandOptions} />
        </div>
      )}
    </div>
  );
}
