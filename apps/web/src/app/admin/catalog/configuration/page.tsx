'use client';

import { useState } from 'react';
import {
  Upload,
  Download,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
} from 'lucide-react';
import { PageHeader } from '@/components/admin/ui';
import { api } from '@/lib/api';
import KohaOdsImportModal from '@/components/admin/KohaOdsImportModal';

export default function CatalogueImportExportPage() {
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Import / Export State
  const [importFormat, setImportFormat] = useState('KOHA_ODS');
  const [showOdsModal, setShowOdsModal] = useState(false);

  const handleExport = async (format: 'marcxml' | 'csv') => {
    try {
      const { blob, filename } = await api.exportCatalog(format);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      setNotification({ type: 'success', text: `Catalogue exported as ${filename}.` });
    } catch (err: any) {
      setNotification({ type: 'error', text: err.message || 'Export failed.' });
    } finally {
      setTimeout(() => setNotification(null), 4000);
    }
  };

  return (
    <div className="space-y-6 font-sans pb-12 max-w-[1240px]">
      <PageHeader
        eyebrow="Catalogue · Data Management"
        title="Import & Exports"
        description="Import Koha ODS reports, MARC21 XML/binary datasets, CSV files, and export the institutional catalogue."
      />

      {notification && (
        <div
          className={`p-4 rounded-xl text-xs font-semibold flex items-center gap-2 border ${
            notification.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-red-50 text-red-800 border-red-200'
          }`}
        >
          {notification.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
          )}
          <span>{notification.text}</span>
        </div>
      )}

      <div className="space-y-6 text-xs font-sans">
        {/* Featured Koha ODS Accession Register Importer Banner */}
        <div className="bg-[#FAF8F5] border border-amber-300 rounded-[2px] p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-amber-100 text-[#A52307] rounded-lg flex items-center justify-center font-bold flex-shrink-0">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-lg font-bold text-gray-900">Koha Accession Register ODS Importer</h3>
                <span className="bg-[#A52307] text-white text-[10px] font-bold uppercase px-2 py-0.5 rounded">
                  ODS Compatible
                </span>
              </div>
              <p className="text-gray-600 mt-1 max-w-2xl text-xs">
                Directly import OpenDocument Spreadsheet (<code className="font-mono bg-white px-1.5 py-0.5 rounded border border-gray-200 text-gray-900">.ods</code>) reports exported from Koha ILS. Automatically parses all 16 accession columns (biblionumber, barcode, call number, author, title, publisher, uniform title, and holdings).
              </p>
              <div className="flex items-center gap-3 mt-2 text-[11px] text-gray-500 font-mono">
                <span>Target File: <strong>1-Accession Register-reportresults.ods</strong></span>
                <span>·</span>
                <span>11,000+ Records Capacity</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowOdsModal(true)}
            className="px-6 py-2.5 bg-[#A52307] text-white rounded text-xs font-bold hover:bg-red-800 transition-colors shadow-md flex items-center gap-2 flex-shrink-0 cursor-pointer"
          >
            <Upload className="w-4 h-4" />
            <span>Launch Koha ODS Importer</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Import Card */}
          <div className="bg-white border border-[#E2E0DB] rounded-[2px] p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-[#E2E0DB] pb-3">
              <Upload className="w-5 h-5 text-[#A52307]" />
              <h3 className="font-bold text-gray-900 text-base">Standard Catalog Batch Ingestion</h3>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block font-bold text-gray-700 uppercase mb-1">Source Format</label>
                <select
                  value={importFormat}
                  onChange={(e) => setImportFormat(e.target.value)}
                  className="w-full border border-gray-200 h-10 px-3 rounded text-xs bg-white text-gray-900 font-medium"
                >
                  <option value="KOHA_ODS">Koha Accession Register Spreadsheet (.ods)</option>
                  <option value="MARC21_XML">MARC21 XML (Koha / LOC format)</option>
                  <option value="MARC21_RAW">MARC21 Raw Binary (.mrc / ISO 2709)</option>
                  <option value="DUBLIN_CORE_XML">Dublin Core XML / OAI-PMH</option>
                  <option value="CSV_SPREADSHEET">KMLRI Bulk Records CSV</option>
                </select>
              </div>

              <div className="p-4 border-2 border-dashed border-gray-300 rounded bg-[#FAF8F5] text-center space-y-2">
                <FileSpreadsheet className="w-8 h-8 text-gray-400 mx-auto" />
                <p className="text-gray-700 font-bold">Select .ods, .mrc, .xml, or .csv dataset</p>
                <button
                  type="button"
                  onClick={() => setShowOdsModal(true)}
                  className="px-4 py-1.5 bg-black text-white rounded text-xs font-semibold hover:bg-[#A52307] hover:text-white transition-colors cursor-pointer"
                >
                  Select &amp; Parse File
                </button>
              </div>
            </div>
          </div>

          {/* Export Card */}
          <div className="bg-white border border-[#E2E0DB] rounded-[2px] p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-[#E2E0DB] pb-3">
              <Download className="w-5 h-5 text-gray-900" />
              <h3 className="font-bold text-gray-900 text-base">Export Catalogue Records</h3>
            </div>

            <div className="space-y-3 pt-1">
              <p className="text-gray-600">Export the current institutional repository catalogue dataset for backup or external union catalogs.</p>
              
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => handleExport('marcxml')}
                  className="w-full p-3 border border-gray-200 hover:border-black rounded flex justify-between items-center bg-[#FAF8F5] transition-colors cursor-pointer"
                >
                  <span className="font-bold text-gray-900">MARC21 XML (.xml)</span>
                  <Download className="w-4 h-4 text-gray-500" />
                </button>
                <button
                  type="button"
                  onClick={() => handleExport('csv')}
                  className="w-full p-3 border border-gray-200 hover:border-black rounded flex justify-between items-center bg-[#FAF8F5] transition-colors cursor-pointer"
                >
                  <span className="font-bold text-gray-900">Catalogue CSV Spreadsheet (.csv)</span>
                  <Download className="w-4 h-4 text-gray-500" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Modal */}
        <KohaOdsImportModal
          isOpen={showOdsModal}
          onClose={() => setShowOdsModal(false)}
          onImportComplete={(summary) => {
            setNotification({
              type: 'success',
              text: `Imported: ${summary.created} created, ${summary.updated} updated${summary.skipped ? `, ${summary.skipped} skipped` : ''} into the catalogue backend.`,
            });
            setTimeout(() => setNotification(null), 5000);
          }}
        />
      </div>
    </div>
  );
}
