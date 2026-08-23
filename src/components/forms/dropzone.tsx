import * as React from "react"
import { Button } from "@/components/ui/button"
import { Inline, Stack } from "@/components/layout"

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 102.4) / 10} KB`
  return `${Math.round(bytes / 104857.6) / 10} MB`
}

/**
 * Dropzone — the file-selection pattern: drag, drop, paste, or pick over a
 * hidden `<input type="file">`. MVDS-authored (shadcn ships none). The zone is
 * a real button in the accessibility tree — Tab reaches it, Enter/Space opens
 * the picker — and a polite live region announces every selection change.
 * Selected files render below the zone (name + size, removable).
 *
 * It ends at "files selected": every change calls `onFilesSelected` with the
 * full current set, and the app owns transport, progress, and previews.
 */
function Dropzone({
  accept,
  multiple = false,
  disabled = false,
  label = "Drop files here, paste, or browse",
  hint,
  onFilesSelected,
  className,
  ...props
}: Omit<React.ComponentProps<"div">, "onChange"> & {
  /** Passed to the hidden file input (e.g. `"image/*"`). */
  accept?: string
  multiple?: boolean
  disabled?: boolean
  /** The zone's main line. */
  label?: string
  /** One caption line under the label (formats, limits, shortcuts). */
  hint?: string
  /** Fired with the full current selection on every change. */
  onFilesSelected?: (files: File[]) => void
}) {
  const inputRef = React.useRef<HTMLInputElement>(null)
  const [files, setFiles] = React.useState<File[]>([])
  const [dragActive, setDragActive] = React.useState(false)

  const commit = (next: File[]) => {
    setFiles(next)
    onFilesSelected?.(next)
  }
  const addFiles = (incoming: FileList | null) => {
    if (disabled || !incoming || incoming.length === 0) return
    const arr = Array.from(incoming)
    commit(multiple ? [...files, ...arr] : arr.slice(0, 1))
  }

  return (
    <Stack gap={8} data-slot="dropzone" className={className} {...props}>
      <button
        type="button"
        disabled={disabled}
        data-dragging={dragActive || undefined}
        aria-label={label}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault()
          if (!disabled) setDragActive(true)
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDragActive(false)
          addFiles(e.dataTransfer.files)
        }}
        onPaste={(e) => addFiles(e.clipboardData.files)}
        className="w-full rounded-lg border border-dashed border-input bg-transparent p-6 transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 data-[dragging=true]:border-solid data-[dragging=true]:border-ring data-[dragging=true]:bg-muted"
      >
        <Stack gap={4} align="center">
          <span className="text-small font-medium text-foreground">
            {dragActive ? "Release to add files" : label}
          </span>
          {/* muted-foreground is AA only on background/card, never on the
              drag treatment's bg-muted — the hint hides while dragging. */}
          {hint && !dragActive && (
            <span className="text-caption text-muted-foreground">{hint}</span>
          )}
        </Stack>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        disabled={disabled}
        tabIndex={-1}
        aria-hidden="true"
        className="sr-only"
        onChange={(e) => {
          addFiles(e.target.files)
          e.target.value = ""
        }}
      />
      <span role="status" className="sr-only">
        {files.length > 0
          ? `${files.length} ${files.length === 1 ? "file" : "files"} selected: ${files
              .map((f) => f.name)
              .join(", ")}`
          : "No files selected"}
      </span>
      {files.length > 0 && (
        <Stack gap={4} data-slot="dropzone-files">
          {files.map((file, index) => (
            <Inline key={`${file.name}-${index}`} gap={8}>
              <span className="text-small text-foreground">{file.name}</span>
              <span className="text-caption text-muted-foreground">
                {formatFileSize(file.size)}
              </span>
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label={`Remove ${file.name}`}
                onClick={() => commit(files.filter((_, i) => i !== index))}
              >
                ×
              </Button>
            </Inline>
          ))}
        </Stack>
      )}
    </Stack>
  )
}

export { Dropzone }
