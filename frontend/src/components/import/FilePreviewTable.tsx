"use client";

import React, { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import { Table, Eye, AlertCircle } from "lucide-react";

interface FilePreviewTableProps {
  file: File | null;
}

export default function FilePreviewTable({ file }: FilePreviewTableProps) {
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<any[][]>([]);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!file) {
      setHeaders([]);
      setRows([]);
      setError("");
      return;
    }

    const parsePreview = async () => {
      setLoading(true);
      setError("");
      try {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const data = e.target?.result;
            if (!data) throw new Error("Could not read file data");

            let workbook;
            if (file.name.endsWith(".csv")) {
              // Parse CSV text directly
              const text = new TextDecoder().decode(new Uint8Array(data as ArrayBuffer));
              workbook = XLSX.read(text, { type: "string" });
            } else {
              // Parse Excel array buffer
              const bytes = new Uint8Array(data as ArrayBuffer);
              workbook = XLSX.read(bytes, { type: "array" });
            }

            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];
            
            // Read spreadsheet rows as raw arrays (header: 1 forces array grid)
            const rawData = XLSX.utils.sheet_to_json<any[]>(sheet, { header: 1 });
            
            if (rawData.length === 0) {
              setError("The selected file is empty.");
              return;
            }

            const headerRow = rawData[0].map((h) => String(h || "").trim());
            const valueRows = rawData.slice(1, 6); // preview first 5 data rows

            setHeaders(headerRow);
            setRows(valueRows);
          } catch (err: any) {
            setError(`Failed to read file preview: ${err.message || err}`);
          }
        };
        
        reader.readAsArrayBuffer(file);
      } catch (err: any) {
        setError(`Failed to parse preview: ${err.message || err}`);
      } finally {
        setLoading(false);
      }
    };

    parsePreview();
  }, [file]);

  if (!file) return null;

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4 shadow-xl space-y-3">
      <div className="flex items-center gap-2 border-b border-slate-800/60 pb-2 text-xs font-semibold text-slate-300">
        <Eye className="h-4 w-4 text-indigo-400" />
        <span>Client-Side Preview (First 5 Rows)</span>
      </div>

      {loading && (
        <div className="flex justify-center py-4">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent"></div>
        </div>
      )}

      {error && (
        <div className="flex gap-2 rounded-lg border border-red-500/20 bg-red-500/5 p-3 text-xs text-red-400">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {!loading && !error && rows.length > 0 && (
        <div className="overflow-x-auto rounded-lg border border-slate-800 bg-slate-950/60 max-h-[220px]">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/60 text-slate-400 font-bold uppercase tracking-wider">
                {headers.map((h, i) => (
                  <th key={i} className="py-2.5 px-4 font-mono">
                    {h || `Column ${i + 1}`}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40 text-slate-300">
              {rows.map((row, rIdx) => (
                <tr key={rIdx} className="hover:bg-slate-900/20 transition">
                  {headers.map((_, cIdx) => (
                    <td key={cIdx} className="py-2.5 px-4 truncate max-w-[150px]">
                      {row[cIdx] !== undefined ? String(row[cIdx]) : ""}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!loading && !error && rows.length === 0 && (
        <p className="text-center text-xs text-slate-500 py-4">
          No data rows found under headers.
        </p>
      )}
    </div>
  );
}
