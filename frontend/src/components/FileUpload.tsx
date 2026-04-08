"use client";

import { useCallback, useState } from "react";

interface FileUploadProps {
  onUpload: (file: File) => Promise<void>;
}

export default function FileUpload({ onUpload }: FileUploadProps) {
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = useCallback(
    async (file: File) => {
      setError(null);
      setUploading(true);
      try {
        await onUpload(file);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Upload failed");
      } finally {
        setUploading(false);
      }
    },
    [onUpload]
  );

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) handleFile(file);
      }}
      className={`retro-panel flex flex-col items-center justify-center p-12 transition-all ${
        dragging ? "!border-[var(--retro-blue)]" : ""
      }`}
    >
      {uploading ? (
        <p className="cursor-blink" style={{ color: "var(--retro-blue)" }}>
          Loading data
        </p>
      ) : (
        <>
          <p className="mb-2 text-center" style={{ color: "var(--retro-text-dim)" }}>
            Drop a CSV file here
          </p>
          <p className="mb-4" style={{ color: "var(--retro-text-dim)" }}>
            - or -
          </p>
          <label className="retro-btn cursor-pointer">
            Choose file
            <input
              type="file"
              accept=".csv"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFile(file);
              }}
            />
          </label>
        </>
      )}
      {error && (
        <p className="mt-4" style={{ color: "var(--retro-highlight)" }}>
          Error: {error}
        </p>
      )}
    </div>
  );
}
