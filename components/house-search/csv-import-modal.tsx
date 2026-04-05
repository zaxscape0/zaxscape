"use client";

import { useState, useCallback } from "react";
import { X, Upload, FileText, Check } from "lucide-react";
import type { TaxDelinquentProperty } from "@/lib/mock-data";

interface CsvImportModalProps {
  onClose: () => void;
  onImport: (properties: TaxDelinquentProperty[]) => void;
  nextId: number;
}

interface ParsedRow {
  address: string;
  city: string;
  owner: string;
  property_type: string;
  assessed_value: string;
  tax_owed: string;
  years_delinquent: string;
  status: string;
}

export function CsvImportModal({ onClose, onImport, nextId }: CsvImportModalProps) {
  const [parsed, setParsed] = useState<ParsedRow[]>([]);
  const [fileName, setFileName] = useState("");
  const [error, setError] = useState("");

  const handleFile = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      setFileName(file.name);
      setError("");

      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const text = ev.target?.result as string;
          const lines = text.trim().split("\n");
          if (lines.length < 2) {
            setError("CSV must have a header row and at least one data row.");
            return;
          }
          const headers = lines[0].split(",").map((h) => h.trim().toLowerCase().replace(/\s+/g, "_"));
          const rows: ParsedRow[] = [];
          for (let i = 1; i < lines.length; i++) {
            const cols = lines[i].split(",").map((c) => c.trim());
            const row: Record<string, string> = {};
            headers.forEach((h, j) => {
              row[h] = cols[j] || "";
            });
            rows.push(row as unknown as ParsedRow);
          }
          setParsed(rows);
        } catch {
          setError("Failed to parse CSV. Check format.");
        }
      };
      reader.readAsText(file);
    },
    []
  );

  const handleImport = () => {
    const VALID_TYPES = ["single_family", "multi_family", "condo", "commercial", "land"];
    const VALID_STATUSES = ["tax_lien", "tax_title", "in_redemption", "foreclosure_pending"];

    const properties: TaxDelinquentProperty[] = parsed.map((row, i) => ({
      id: nextId + i,
      address: row.address || "Unknown",
      city: row.city || "Newton",
      state: "MA",
      zip: "",
      ownerName: row.owner || "Unknown",
      propertyType: (VALID_TYPES.includes(row.property_type) ? row.property_type : "single_family") as TaxDelinquentProperty["propertyType"],
      assessedValue: parseInt(row.assessed_value) || 0,
      estimatedMarketValue: Math.round((parseInt(row.assessed_value) || 0) * 1.2),
      totalTaxOwed: parseInt(row.tax_owed) || 0,
      yearsDelinquent: parseInt(row.years_delinquent) || 5,
      taxTitleDate: null,
      status: (VALID_STATUSES.includes(row.status) ? row.status : "tax_lien") as TaxDelinquentProperty["status"],
      lastPaymentDate: null,
      lotSizeSqft: null,
      yearBuilt: null,
      bedrooms: null,
      bathrooms: null,
      units: null,
      source: "CSV Import",
      sourceUrl: null,
      notes: "",
      addedAt: new Date().toISOString().split("T")[0],
    }));
    onImport(properties);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="w-full max-w-2xl rounded-lg border bg-card shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h2 className="text-sm font-semibold">Import CSV</h2>
          <button onClick={onClose} className="p-1 text-muted-foreground hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* Expected format */}
          <div className="rounded-md border bg-muted/30 p-3">
            <p className="text-xxs text-muted-foreground mb-1 font-medium uppercase tracking-wider">
              Expected CSV columns
            </p>
            <code className="text-xxs text-foreground font-mono">
              address, city, owner, property_type, assessed_value, tax_owed, years_delinquent, status
            </code>
          </div>

          {/* Upload */}
          {parsed.length === 0 ? (
            <label className="flex flex-col items-center justify-center h-32 rounded-md border-2 border-dashed border-border cursor-pointer hover:border-primary/50 transition-colors">
              <Upload className="h-6 w-6 text-muted-foreground mb-2" />
              <span className="text-xs text-muted-foreground">
                Click to upload CSV
              </span>
              <input
                type="file"
                accept=".csv"
                onChange={handleFile}
                className="hidden"
              />
            </label>
          ) : (
            <>
              {/* Preview */}
              <div className="flex items-center gap-2 text-xs text-foreground">
                <FileText className="h-4 w-4" />
                <span>{fileName}</span>
                <span className="text-muted-foreground">
                  — {parsed.length} rows
                </span>
              </div>
              <div className="max-h-48 overflow-auto rounded-md border">
                <table className="w-full text-xxs">
                  <thead>
                    <tr className="border-b bg-muted/30 text-muted-foreground">
                      <th className="px-2 py-1 text-left">Address</th>
                      <th className="px-2 py-1 text-left">City</th>
                      <th className="px-2 py-1 text-left">Owner</th>
                      <th className="px-2 py-1 text-right">Assessed</th>
                      <th className="px-2 py-1 text-right">Tax Owed</th>
                      <th className="px-2 py-1 text-right">Yrs</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parsed.slice(0, 10).map((row, i) => (
                      <tr key={i} className="border-b border-border/50">
                        <td className="px-2 py-1">{row.address}</td>
                        <td className="px-2 py-1">{row.city}</td>
                        <td className="px-2 py-1">{row.owner}</td>
                        <td className="px-2 py-1 text-right font-mono">
                          {row.assessed_value}
                        </td>
                        <td className="px-2 py-1 text-right font-mono">
                          {row.tax_owed}
                        </td>
                        <td className="px-2 py-1 text-right font-mono">
                          {row.years_delinquent}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {parsed.length > 10 && (
                  <div className="px-2 py-1 text-xxs text-muted-foreground">
                    ... and {parsed.length - 10} more rows
                  </div>
                )}
              </div>
            </>
          )}

          {error && (
            <p className="text-xs text-red-400">{error}</p>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground"
            >
              Cancel
            </button>
            {parsed.length > 0 && (
              <button
                onClick={handleImport}
                className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs text-primary-foreground hover:bg-primary/90"
              >
                <Check className="h-3 w-3" /> Import {parsed.length} Properties
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
