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
        className="textarea h-24"
      />
      <button
        type="submit"
        className="btn-primary w-full"
        disabled={disabled || !available || isPending}
      >
        {available ? (isPending ? "Submitting..." : "Request checkout") : "Unavailable"}
      </button>
    </form>
  );
}
