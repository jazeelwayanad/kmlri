'use client';

import { useState } from 'react';
import { 
  Upload, 
  FileSpreadsheet, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  BookOpen, 
  Layers, 
  Search, 
  ArrowRight,
  Database,
  Sparkles,
  FileCheck,
  RotateCw
} from 'lucide-react';
import { api } from '@/lib/api';

interface KohaOdsImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportComplete: (summary: { created: number; updated: number; skipped: number }) => void;
}

export default function KohaOdsImportModal({ isOpen, onClose, onImportComplete }: KohaOdsImportModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [parsing, setParsing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [importResult, setImportResult] = useState<{
    totalRowsParsed: number;
    totalRecordsCount: number;
    totalItemsCount: number;
    samplePreview: any[];
    headers: string[];
    accessionRows: Record<string, string>[];
  } | null>(null);
  const [searchFilter, setSearchFilter] = useState('');
  const [defaultAccessLevel, setDefaultAccessLevel] = useState('OPEN_ACCESS');
  const [defaultFormat, setDefaultFormat] = useState('AUTO_DETECT');
  const [committing, setCommitting] = useState(false);
  const [committedCount, setCommittedCount] = useState<number | null>(null);
  const [commitSummary, setCommitSummary] = useState<{ created: number; updated: number; skipped: number } | null>(null);

  if (!isOpen) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      await parseOdsFile(file);
    }
  };

  const parseOdsFile = async (file: File) => {
    setParsing(true);
    setError(null);
    setImportResult(null);
    setCommittedCount(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/catalog/import-ods', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to parse Koha ODS document');
      }

      setImportResult(data);
    } catch (err: any) {
      setError(err.message || 'Error occurred while unpacking ODS spreadsheet');
    } finally {
      setParsing(false);
    }
  };

  const handleCommitImport = async () => {
    if (!importResult) return;
    setCommitting(true);
    setError(null);

    try {
      const summary = await api.importCatalogRows(importResult.accessionRows);
      setCommitSummary({ created: summary.created, updated: summary.updated, skipped: summary.skipped });
      setCommittedCount(summary.created + summary.updated);
      onImportComplete({ created: summary.created, updated: summary.updated, skipped: summary.skipped });
    } catch (err: any) {
      setError(err.message || 'Failed to commit the import to the catalogue backend.');
    } finally {
      setCommitting(false);
    }
  };

  const filteredPreview = (importResult?.samplePreview || []).filter((r) => {
    if (!searchFilter.trim()) return true;
    const q = searchFilter.toLowerCase();
    return (
      r.titleLatin?.toLowerCase().includes(q) ||
      r.kohaBiblioNumber?.includes(q) ||
      (r.authors || []).some((a: string) => a.toLowerCase().includes(q)) ||
      r.shelfmark?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col border border-gray-200 overflow-hidden font-sans">
        
        {/* Header */}
        <div className="px-6 py-4 bg-[#FAF8F5] border-b border-gray-200 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-red-50 text-[#A52307] flex items-center justify-center font-bold">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-base">Koha Accession Register ODS Importer</h3>
              <p className="text-[11px] text-gray-500">
                Directly import Koha report exports (.ods spreadsheets) with 16-column accession records &amp; copy holdings
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          
          {error && (
            <div className="p-4 bg-red-50 text-red-800 border border-red-200 rounded-lg font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {committedCount !== null ? (
            <div className="p-8 text-center space-y-4 bg-emerald-50 border border-emerald-200 rounded-xl">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <div>
                <h4 className="text-lg font-bold text-emerald-900">Koha Dataset Imported Successfully!</h4>
                <p className="text-xs text-emerald-800 mt-1">
                  <strong>{commitSummary?.created ?? 0} created</strong>, <strong>{commitSummary?.updated ?? 0} updated</strong>
                  {commitSummary && commitSummary.skipped > 0 ? <>, <strong>{commitSummary.skipped} skipped</strong></> : null} in the KMLRI Catalogue backend.
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 bg-emerald-800 text-white rounded text-xs font-bold hover:bg-emerald-900 transition-colors"
              >
                Done &amp; View Catalogue
              </button>
            </div>
          ) : (
            <>
              {/* File Upload Zone */}
              <div className="border-2 border-dashed border-gray-300 hover:border-[#A52307] rounded-xl p-6 text-center bg-[#FAF8F5] transition-colors relative">
                <input
                  type="file"
                  accept=".ods,.xml,.csv"
                  onChange={handleFileChange}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
                <div className="space-y-2 pointer-events-none">
                  <div className="w-10 h-10 rounded-full bg-white shadow-xs border border-gray-200 flex items-center justify-center mx-auto text-[#A52307]">
                    <Upload className="w-5 h-5" />
                  </div>
                  <p className="font-bold text-gray-800 text-sm">
                    {selectedFile ? selectedFile.name : 'Drag & Drop Koha ODS Export File here, or click to browse'}
                  </p>
                  <p className="text-[11px] text-gray-500">
                    Supports OpenDocument Spreadsheet (<code className="font-mono bg-gray-100 px-1 py-0.5 rounded">.ods</code>) reports exported from Koha Accession Register
                  </p>
                </div>
              </div>

              {parsing && (
                <div className="p-8 text-center space-y-3 bg-gray-50 rounded-xl border border-gray-200">
                  <RotateCw className="w-6 h-6 text-[#A52307] animate-spin mx-auto" />
                  <p className="font-bold text-gray-800">Unpacking and parsing Koha ODS archive...</p>
                  <p className="text-[11px] text-gray-500">Decompressing content.xml and extracting 16 accession columns.</p>
                </div>
              )}

              {/* Parsed Results Overview */}
              {importResult && (
                <div className="space-y-4">
                  
                  {/* Summary Metric Strip */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-[#FAF8F5] border border-gray-200 p-3 rounded text-center">
                      <span className="text-[10px] uppercase font-bold text-gray-500 block">Total Accession Rows</span>
                      <span className="text-xl font-bold font-mono text-gray-900 mt-0.5 block">
                        {importResult.totalRowsParsed.toLocaleString()}
                      </span>
                    </div>
                    <div className="bg-[#FAF8F5] border border-gray-200 p-3 rounded text-center">
                      <span className="text-[10px] uppercase font-bold text-gray-500 block">Distinct Catalog Records</span>
                      <span className="text-xl font-bold font-mono text-[#A52307] mt-0.5 block">
                        {importResult.totalRecordsCount.toLocaleString()}
                      </span>
                    </div>
                    <div className="bg-[#FAF8F5] border border-gray-200 p-3 rounded text-center">
                      <span className="text-[10px] uppercase font-bold text-gray-500 block">Physical Copy Holdings</span>
                      <span className="text-xl font-bold font-mono text-emerald-700 mt-0.5 block">
                        {importResult.totalItemsCount.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Configuration & Options */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-gray-50 p-3.5 rounded border border-gray-200">
                    <div>
                      <label className="font-bold text-gray-700 block mb-1">Default Access Clearance</label>
                      <select
                        value={defaultAccessLevel}
                        onChange={(e) => setDefaultAccessLevel(e.target.value)}
                        className="w-full border border-gray-300 h-9 px-2.5 rounded text-xs bg-white"
                      >
                        <option value="OPEN_ACCESS">Open Access (Standard Borrowing)</option>
                        <option value="DIGITISED_FULL">Digitized Full Access</option>
                        <option value="READING_ROOM_ONLY">Reading Room Consultation Only</option>
                        <option value="RESTRICTED">Restricted Archival Vault</option>
                      </select>
                    </div>

                    <div>
                      <label className="font-bold text-gray-700 block mb-1">Catalog Item Type Override</label>
                      <select
                        value={defaultFormat}
                        onChange={(e) => setDefaultFormat(e.target.value)}
                        className="w-full border border-gray-300 h-9 px-2.5 rounded text-xs bg-white"
                      >
                        <option value="AUTO_DETECT">Auto-Detect from Title &amp; Era</option>
                        <option value="MONOGRAPH">General Monograph Book</option>
                        <option value="PERIODICAL">Serial / Journal / Digest</option>
                        <option value="MANUSCRIPT">Archival Manuscript</option>
                        <option value="RARE_BOOK">Rare Antiquarian Book</option>
                      </select>
                    </div>
                  </div>

                  {/* Preview Table */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <FileCheck className="w-4 h-4 text-emerald-700" />
                        <h4 className="font-bold text-gray-900">Extracted Records Preview</h4>
                      </div>
                      <div className="relative w-64">
                        <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Filter preview..."
                          value={searchFilter}
                          onChange={(e) => setSearchFilter(e.target.value)}
                          className="w-full pl-8 pr-2.5 h-8 border border-gray-300 rounded text-xs bg-white"
                        />
                      </div>
                    </div>

                    <div className="border border-gray-200 rounded max-h-56 overflow-y-auto">
                      <table className="w-full text-left text-[11px] border-collapse">
                        <thead className="bg-[#FAF8F5] border-b border-gray-200 sticky top-0 font-bold uppercase text-gray-600">
                          <tr>
                            <th className="py-2 px-3">Biblio #</th>
                            <th className="py-2 px-3">Title Proper</th>
                            <th className="py-2 px-3">Publisher / Place</th>
                            <th className="py-2 px-3">Language</th>
                            <th className="py-2 px-3">Holdings Copies</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {filteredPreview.map((rec) => (
                            <tr key={rec.id} className="hover:bg-[#FAF8F5]">
                              <td className="py-2 px-3 font-mono font-bold text-gray-900">{rec.kohaBiblioNumber}</td>
                              <td className="py-2 px-3 font-semibold text-gray-900">{rec.titleLatin}</td>
                              <td className="py-2 px-3 text-gray-600">
                                {rec.publisher || ''} {rec.originPlace ? `(${rec.originPlace})` : ''}
                              </td>
                              <td className="py-2 px-3 text-gray-600">{rec.language}</td>
                              <td className="py-2 px-3 font-mono font-bold text-emerald-700">
                                {rec.items?.length || 1} copies
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        {committedCount === null && (
          <div className="px-6 py-4 bg-[#FAF8F5] border-t border-gray-200 flex justify-between items-center">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded text-xs font-semibold text-gray-700 hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={!importResult || committing}
              onClick={handleCommitImport}
              className="px-6 py-2 bg-[#A52307] text-white rounded text-xs font-bold hover:bg-red-800 transition-colors shadow-md disabled:opacity-50 flex items-center gap-1.5"
            >
              {committing ? (
                <>
                  <RotateCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Importing Records...</span>
                </>
              ) : (
                <>
                  <span>Commit to Catalogue</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
