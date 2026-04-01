"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";

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
      className="mt-4"
    >
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="checkout-notes">Notes for the librarian</FieldLabel>
          <Textarea
            id="checkout-notes"
            name="notes"
            placeholder="Notes for the librarian (fit preferences, dates, etc.)"
            className="min-h-24"
          />
          <FieldDescription>
            Share fit preferences, timing, or anything else the librarian should know.
          </FieldDescription>
        </Field>
        <Button type="submit" size="lg" disabled={disabled || !available || isPending}>
          {available ? (isPending ? "Submitting..." : "Request checkout") : "Unavailable"}
        </Button>
      </FieldGroup>
    </form>
  );
}
