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
 * Accessibility is wired automatically when the child is exactly one
 * non-Fragment element: Field assigns it an id (generated unless the child
 * brings its own), points the label's `htmlFor` at it, links help/error via
 * `aria-describedby` (merged with any existing value), and sets
 * `aria-invalid` / `aria-required` while an error / `required` apply. Any
 * other children shape renders unwired — bring your own attributes.
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
  const child =
    React.Children.count(children) === 1 &&
    React.isValidElement(children) &&
    children.type !== React.Fragment
      ? children
      : null
  const childProps = child?.props as
    | { id?: string; "aria-describedby"?: string }
    | undefined
  const controlId = childProps?.id ?? generatedId
  const description = error ?? help
  const descriptionId = `${controlId}-description`

  let control = children
  if (child) {
    const wired: Record<string, unknown> = { id: controlId }
    if (description)
      wired["aria-describedby"] = [childProps?.["aria-describedby"], descriptionId]
        .filter(Boolean)
        .join(" ")
    if (error) wired["aria-invalid"] = true
    if (required) wired["aria-required"] = true
    control = React.cloneElement(
      child as React.ReactElement<Record<string, unknown>>,
      wired
    )
  }

  return (
    <Stack gap={8} data-slot="field" className={className} {...props}>
      <Label htmlFor={child ? controlId : undefined}>
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
