"use client";

import { useTransition } from "react";

type Props = {
  action: (formData: FormData) => void;
  disabled: boolean;
  available: boolean;
};

export function CheckoutForm({ action, disabled, available }: Props) {
  const [isPending, startTransition] = useTransition();

  return (
    <form
      action={(formData) => {
        if (!available || disabled) return;
        if (!confirm("Request this carrier checkout?")) return;
        startTransition(() => action(formData));
      }}
      className="mt-4 space-y-3"
    >
      <textarea
        name="notes"
        placeholder="Notes for the librarian (fit preferences, dates, etc.)"
        className="h-24 w-full rounded-xl border border-ink/10 bg-sand px-3 py-2 text-sm"
      />
      <button
        type="submit"
        className={`w-full rounded-full px-4 py-2 text-sm font-semibold ${
          available && !disabled
            ? "bg-clay text-white"
            : "cursor-not-allowed bg-ink/10 text-ink/40"
        }`}
        disabled={disabled || !available || isPending}
      >
        {available ? (isPending ? "Submitting..." : "Request checkout") : "Unavailable"}
      </button>
    </form>
  );
}
