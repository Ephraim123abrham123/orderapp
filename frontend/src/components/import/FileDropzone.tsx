"use client";

import React, { useState, useRef } from "react";
import { UploadCloud, FileSpreadsheet, AlertCircle } from "lucide-react";
import { useUiStore } from "@/store/uiStore";

interface FileDropzoneProps {
  onFileSelected: (file: File) => void;
  disabled?: boolean;
}

export default function FileDropzone({ onFileSelected, disabled }: FileDropzoneProps) {
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const addToast = useUiStore((state) => state.addToast);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const validateAndSelectFile = (file: File) => {
    const filename = file.name.toLowerCase();
    if (!filename.endsWith(".xlsx") && !filename.endsWith(".csv")) {
      addToast("Unsupported format. Please upload .xlsx or .csv files.", "error");
      return;
    }
    onFileSelected(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (disabled) return;

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSelectFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (disabled) return;

    if (e.target.files && e.target.files[0]) {
      validateAndSelectFile(e.target.files[0]);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div
      onDragEnter={handleDrag}
      onDragOver={handleDrag}
      onDragLeave={handleDrag}
      onDrop={handleDrop}
      className={`relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 text-center transition duration-200 ${
        dragActive
          ? "border-indigo-500 bg-indigo-950/20"
          : "border-slate-800 bg-slate-900/20 hover:border-slate-700"
      } ${disabled ? "opacity-50 pointer-events-none" : ""}`}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx, .csv"
        onChange={handleChange}
        className="hidden"
      />

      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-900 border border-slate-800 text-slate-400 mb-4 group-hover:scale-110 transition duration-300">
        <UploadCloud className="h-6 w-6 text-indigo-400" />
      </div>

      <p className="text-sm font-semibold text-slate-200">
        Drag and drop your file here, or{" "}
        <button
          type="button"
          onClick={handleButtonClick}
          className="text-indigo-400 hover:text-indigo-300 font-bold underline cursor-pointer"
        >
          browse
        </button>
      </p>
      <p className="text-xs text-slate-500 mt-1">Supports Excel (.xlsx) and CSV (.csv)</p>

      {/* Template Guideline Alert */}
      <div className="mt-6 flex items-start gap-2 max-w-sm rounded-lg border border-indigo-500/10 bg-indigo-500/5 p-3 text-left text-[10px] leading-relaxed text-slate-400">
        <AlertCircle className="h-4 w-4 shrink-0 text-indigo-400 mt-0.5" />
        <div>
          <span className="font-semibold text-slate-200">Required Columns: </span>
          Your file must contain <code className="text-indigo-300">customer_name</code>,{" "}
          <code className="text-indigo-300">amount</code>, and optionally{" "}
          <code className="text-indigo-300">currency</code>, <code className="text-indigo-300">status</code> headers.
        </div>
      </div>
    </div>
  );
}
