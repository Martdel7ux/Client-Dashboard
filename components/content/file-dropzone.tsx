"use client";

import { useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { UploadCloud, Loader2, X, FileText, ImageIcon } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface FileDropzoneProps {
  itemId: string;
  projectId: string;
  kind: "image" | "file";
  fileUrl: string | null;
  fileName: string | null;
  demo?: boolean;
  onUploaded: (fileUrl: string, fileName: string) => void;
  onCleared: () => void;
}

const MAX_BYTES = 15 * 1024 * 1024; // 15 MB

export function FileDropzone({
  itemId,
  projectId,
  kind,
  fileUrl,
  fileName,
  demo = false,
  onUploaded,
  onCleared,
}: FileDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File) {
    setError(null);
    if (file.size > MAX_BYTES) {
      setError("File is larger than 15 MB.");
      return;
    }

    setUploading(true);
    try {
      if (demo) {
        // Preview-only: never touches storage.
        await new Promise((r) => setTimeout(r, 500));
        onUploaded(URL.createObjectURL(file), file.name);
        return;
      }
      const supabase = createClient();
      const safeName = file.name.replace(/[^\w.\-]+/g, "_");
      const path = `${projectId}/${itemId}/${Date.now()}-${safeName}`;
      const { error: upErr } = await supabase.storage
        .from("content")
        .upload(path, file, { upsert: true });
      if (upErr) throw upErr;
      const {
        data: { publicUrl },
      } = supabase.storage.from("content").getPublicUrl(path);
      onUploaded(publicUrl, file.name);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  }

  const isImage = kind === "image";

  return (
    <div>
      <AnimatePresence mode="wait">
        {fileUrl ? (
          <motion.div
            key="preview"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="flex items-center gap-3 rounded-lg border border-line bg-surface-sunken p-3"
          >
            {isImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={fileUrl}
                alt={fileName ?? "upload"}
                className="size-14 shrink-0 rounded-md border border-line object-cover"
              />
            ) : (
              <span className="grid size-14 shrink-0 place-items-center rounded-md border border-line bg-surface text-accent">
                <FileText className="size-6" />
              </span>
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-ink">
                {fileName ?? "Uploaded file"}
              </p>
              <a
                href={fileUrl}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-accent hover:underline"
              >
                View file
              </a>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={onCleared}
              aria-label="Remove file"
            >
              <X className="size-4" />
            </Button>
          </motion.div>
        ) : (
          <motion.button
            key="drop"
            type="button"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragging(false);
              const f = e.dataTransfer.files?.[0];
              if (f) handleFile(f);
            }}
            disabled={uploading}
            className={cn(
              "flex w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-line bg-surface-sunken/50 px-4 py-6 text-center transition-colors",
              dragging && "border-accent bg-accent/5",
              !uploading && "hover:border-line-strong hover:bg-surface-raised",
            )}
          >
            {uploading ? (
              <Loader2 className="size-5 animate-spin text-accent" />
            ) : isImage ? (
              <ImageIcon className="size-5 text-ink-faint" />
            ) : (
              <UploadCloud className="size-5 text-ink-faint" />
            )}
            <span className="text-sm font-medium text-ink-muted">
              {uploading
                ? "Uploading…"
                : dragging
                  ? "Drop to upload"
                  : isImage
                    ? "Drop an image or click to browse"
                    : "Drop a file or click to browse"}
            </span>
            <span className="text-xs text-ink-ghost">Up to 15 MB</span>
          </motion.button>
        )}
      </AnimatePresence>

      <input
        ref={inputRef}
        type="file"
        accept={isImage ? "image/*" : undefined}
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
          e.target.value = "";
        }}
      />

      {error && <p className="mt-2 text-xs text-red-400">{error}</p>}
    </div>
  );
}
