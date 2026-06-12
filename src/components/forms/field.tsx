import * as React from "react"
import { cn } from "@/lib/utils"
import { Label } from "@/components/ui/label"
import { Stack } from "@/components/layout"

/**
 * Field — the shared anatomy every form control plugs into: label, a single
 * control slot, and one line of support text below (error wins over help).
 * MVDS-authored (not vendored shadcn); the Phase-2 controls (Checkbox, Radio,
 * Switch, Textarea, Select) compose into this scaffold rather than each
 * re-implementing label/help/error wiring.
 *
 * Accessibility is wired automatically when the child is a single element:
 * Field assigns it an id (generated unless the child brings its own), points
 * the label's `htmlFor` at it, links help/error via `aria-describedby`, and
 * sets `aria-invalid` while an error is shown.
 */
function Field({
  label,
  help,
  error,
  required,
  children,
  className,
  ...props
}: Omit<React.ComponentProps<"div">, "children"> & {
  label: string
  /** One line of guidance under the control. Suppressed while `error` is set. */
  help?: string
  /** Validation message — replaces `help` and marks the control invalid. */
  error?: string
  required?: boolean
  children: React.ReactNode
}) {
  const generatedId = React.useId()
  const child = React.isValidElement(children) ? children : null
  const childProps = child?.props as { id?: string } | undefined
  const controlId = childProps?.id ?? generatedId
  const description = error ?? help
  const descriptionId = `${controlId}-description`

  const control = child
    ? React.cloneElement(child as React.ReactElement<Record<string, unknown>>, {
        id: controlId,
        "aria-describedby": description ? descriptionId : undefined,
        "aria-invalid": error ? true : undefined,
      })
    : children

  return (
    <Stack gap={8} data-slot="field" className={className} {...props}>
      <Label htmlFor={controlId}>
        {label}
        {required && (
          <span aria-hidden="true" className="text-destructive">
            *
          </span>
        )}
      </Label>
      {control}
      {description && (
        <p
          id={descriptionId}
          data-slot="field-description"
          role={error ? "alert" : undefined}
          className={cn(
            "text-caption",
            error ? "text-destructive" : "text-muted-foreground"
          )}
        >
          {description}
        </p>
      )}
    </Stack>
  )
}

export { Field }
