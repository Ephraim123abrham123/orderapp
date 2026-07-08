"use client";

import React, { useState } from "react";
import { useBulkImport } from "@/hooks/useBulkImport";
import FileDropzone from "@/components/import/FileDropzone";
import FilePreviewTable from "@/components/import/FilePreviewTable";
import ImportProgress from "@/components/import/ImportProgress";
import ImportSummaryModal from "@/components/import/ImportSummaryModal";
import { FileSpreadsheet, Loader2, ArrowRight, RotateCcw } from "lucide-react";

export default function ImportPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { uploadFile, isUploading, jobState, resetImportState } = useBulkImport();

  const handleUpload = async () => {
    if (!selectedFile) return;
    try {
      await uploadFile(selectedFile);
    } catch (e) {
      console.error(e);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    resetImportState();
  };

  const showUploader = jobState.status === "Idle";
  const showSummary = jobState.status === "Completed" || jobState.status === "Failed";

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Introduction Card */}
      <div className="bg-slate-900/30 p-6 border border-slate-800 rounded-2xl">
        <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
          <FileSpreadsheet className="h-5 w-5 text-indigo-400" />
          <span>Bulk Import Orders</span>
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Upload order sheet schedules. We parse and validate each row, perform currency conversions to USD, and import them in batch.
        </p>
      </div>

      {/* Upload Interface */}
      {showUploader && (
        <div className="space-y-6">
          <FileDropzone onFileSelected={setSelectedFile} disabled={isUploading} />
          
          <FilePreviewTable file={selectedFile} />

          {selectedFile && (
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={handleReset}
                className="rounded-xl border border-slate-800 px-5 py-3 text-sm font-semibold text-slate-300 hover:bg-slate-800 hover:text-slate-100 transition cursor-pointer"
              >
                Clear
              </button>
              <button
                type="button"
                onClick={handleUpload}
                disabled={isUploading}
                className="flex items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] px-5 py-3 text-sm font-semibold text-slate-100 shadow-lg shadow-indigo-600/20 transition cursor-pointer disabled:opacity-50"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Uploading...</span>
                  </>
                ) : (
                  <>
                    <span>Upload and Process File</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Progress & Processing Panel */}
      {jobState.status !== "Idle" && (
        <div className="space-y-6">
          <ImportProgress jobState={jobState} />

          {showSummary && (
            <>
              <ImportSummaryModal errorLog={jobState.error_log} />
              
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleReset}
                  className="flex items-center gap-2 rounded-xl border border-slate-800 px-5 py-3 text-sm font-semibold text-slate-300 hover:bg-slate-800 hover:text-slate-100 transition cursor-pointer"
                >
                  <RotateCcw className="h-4 w-4" />
                  <span>Upload Another File</span>
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
