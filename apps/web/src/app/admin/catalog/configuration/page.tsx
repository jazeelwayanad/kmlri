'use client';

import { useState } from 'react';
import { 
  Settings, 
  Upload, 
  Download, 
  Plus, 
  CheckCircle2, 
  AlertCircle, 
  Database, 
  Tag, 
  FileSpreadsheet, 
  FileCode,
  Save,
  CheckSquare,
  Square,
  Sliders
} from 'lucide-react';
import { PageHeader, Badge, Button } from '@/components/admin/ui';

export default function CatalogueConfigurationPage() {
  const [activeTab, setActiveTab] = useState<'field_requirements' | 'categories' | 'record_types' | 'item_types' | 'classification' | 'import_export'>('field_requirements');
  const [notification, setNotification] = useState<string | null>(null);

  // Field Requirements Configuration
  const [catalogFields, setCatalogFields] = useState([
    { id: 'f_title', tag: '245$a', name: 'Title Proper', group: 'Title & Statement', required: true, enabled: true, locked: true },
    { id: 'f_subtitle', tag: '245$b', name: 'Subtitle / Remainder of Title', group: 'Title & Statement', required: false, enabled: true },
    { id: 'f_author', tag: '100$a / 245$c', name: 'Author / Statement of Responsibility', group: 'Authorship', required: true, enabled: true },
    { id: 'f_itemtype', tag: '942$c', name: 'Koha [default] Item Type', group: 'Item Definition', required: true, enabled: true, locked: true },
    { id: 'f_lang', tag: '041$a', name: 'Language of Text', group: 'Classification', required: true, enabled: true },
    { id: 'f_ddc', tag: '082', name: 'Dewey Decimal Classification (DDC)', group: 'Classification', required: false, enabled: true },
    { id: 'f_isbn', tag: '020$a', name: 'ISBN / Standard Number', group: 'Identifiers', required: false, enabled: true },
    { id: 'f_uniform_title', tag: '240$a', name: 'Uniform Title / Original Arabic Title', group: 'Title & Statement', required: false, enabled: true },
    { id: 'f_varying_title', tag: '246$a', name: 'Varying Form of Title', group: 'Title & Statement', required: false, enabled: true },
    { id: 'f_edition', tag: '250$a', name: 'Edition Statement', group: 'Publication', required: false, enabled: true },
    { id: 'f_pub_place', tag: '260$a', name: 'Place of Publication', group: 'Publication', required: false, enabled: true },
    { id: 'f_publisher', tag: '260$b', name: 'Publisher Name', group: 'Publication', required: false, enabled: true },
    { id: 'f_pub_year', tag: '260$c', name: 'Year of Publication', group: 'Publication', required: false, enabled: true },
    { id: 'f_physical', tag: '300$a', name: 'Physical Description / Extent (Pages)', group: 'Physical Description', required: false, enabled: true },
    { id: 'f_series', tag: '490$a', name: 'Series Statement', group: 'Publication', required: false, enabled: true },
    { id: 'f_note', tag: '500$a', name: 'General Cataloging Note', group: 'Notes', required: false, enabled: true },
    { id: 'f_subjects', tag: '650$a', name: 'Topical Subject Terms', group: 'Subject Headings', required: false, enabled: true },
    { id: 'f_added_person', tag: '700$a', name: 'Added Entry (Personal Name / Scribe)', group: 'Authorship', required: false, enabled: true },
    { id: 'f_uri', tag: '856$u', name: 'Electronic Location & URI Access', group: 'Digital Access', required: false, enabled: true },
  ]);

  // Categories
  const [categories, setCategories] = useState([
    { id: 'CAT-01', code: 'ISL-JUR', name: 'Islamic Jurisprudence (Fiqh)', prefix: 'MS-FIQ', count: 142 },
    { id: 'CAT-02', code: 'MAL-HIST', name: 'Malabar History & Historiography', prefix: 'HIS-MAL', count: 98 },
    { id: 'CAT-03', code: 'ARB-LIT', name: 'Classical Arabic & Arabi-Malayalam Poetry', prefix: 'LIT-ARM', count: 64 },
    { id: 'CAT-04', code: 'ASTR-MED', name: 'Traditional Unani & Coastal Navigation', prefix: 'NAV-MED', count: 28 },
  ]);

  // Record Types
  const [recordTypes, setRecordTypes] = useState([
    { id: 'RT-01', code: 'MANUSCRIPT', name: 'Archival Manuscript Codex', defaultAccess: 'DIGITISED_FULL' },
    { id: 'RT-02', code: 'ARABI_MALAYALAM_PRINT', name: 'Arabi-Malayalam Lithograph Print', defaultAccess: 'DIGITISED_FULL' },
    { id: 'RT-03', code: 'RARE_BOOK', name: 'Rare Antiquarian Book', defaultAccess: 'READING_ROOM_ONLY' },
    { id: 'RT-04', code: 'PERIODICAL', name: 'Serial & Historical Journal', defaultAccess: 'DIGITISED_FULL' },
    { id: 'RT-05', code: 'THESIS', name: 'Doctoral Dissertation & Research Monograph', defaultAccess: 'OPEN_ACCESS' },
  ]);

  // Item Types
  const [itemTypes, setItemTypes] = useState([
    { id: 'IT-01', code: 'CIRCULATING_BOOK', name: 'Circulating General Volume', maxDays: 14, renewable: true },
    { id: 'IT-02', code: 'REFERENCE_ONLY', name: 'Reference Reading Room Copy', maxDays: 0, renewable: false },
    { id: 'IT-03', code: 'RARE_VAULT', name: 'Rare Archival Manuscript Folio', maxDays: 0, renewable: false },
    { id: 'IT-04', code: 'FACSIMILE_REPRINT', name: 'Study Facsimile / Working Print', maxDays: 7, renewable: true },
  ]);

  // Import / Export State
  const [importFormat, setImportFormat] = useState('MARC21_XML');
  const [exportFormat, setExportFormat] = useState('MARC21_BINARY');
  const [importing, setImporting] = useState(false);

  const toggleRequired = (id: string) => {
    setCatalogFields(
      catalogFields.map((f) => {
        if (f.id === id && !f.locked) {
          return { ...f, required: !f.required };
        }
        return f;
      })
    );
  };

  const toggleEnabled = (id: string) => {
    setCatalogFields(
      catalogFields.map((f) => {
        if (f.id === id && !f.locked) {
          return { ...f, enabled: !f.enabled };
        }
        return f;
      })
    );
  };

  const handleSaveFieldSettings = () => {
    setNotification('Catalogue field requirement settings saved successfully.');
    setTimeout(() => setNotification(null), 4000);
  };

  const handleImport = (e: React.FormEvent) => {
    e.preventDefault();
    setImporting(true);
    setTimeout(() => {
      setImporting(false);
      setNotification('Catalogue dataset imported successfully (24 records parsed with MARC21 authority headers).');
      setTimeout(() => setNotification(null), 4000);
    }, 1200);
  };

  const handleExport = (fmt: string) => {
    setNotification(`Exporting full institutional catalogue in ${fmt} format...`);
    setTimeout(() => setNotification(null), 3500);
  };

  return (
    <div className="space-y-6 font-sans pb-12 max-w-[1240px]">
      <PageHeader
        eyebrow="Catalogue · Master Configuration"
        title="Catalogue Configuration"
        description="Configure required and optional cataloging fields, manage taxonomy categories, record classifications, item loan rules, and import/export library datasets."
        actions={
          activeTab === 'field_requirements' ? (
            <Button variant="primary" icon={Save} onClick={handleSaveFieldSettings}>
              Save Field Settings
            </Button>
          ) : undefined
        }
      />

      {notification && (
        <div className="p-4 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Tabs Navigation */}
      <div className="border-b border-[#E2E0DB] flex gap-2 flex-wrap">
        {[
          { key: 'field_requirements', label: 'Field Requirements (Required / Optional)' },
          { key: 'categories', label: 'Catalogue Categories' },
          { key: 'record_types', label: 'Record Types' },
          { key: 'item_types', label: 'Item Types' },
          { key: 'classification', label: 'Classification Schemes' },
          { key: 'import_export', label: 'Import & Export Data' },
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key as any)}
            className={`py-2.5 px-4 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === tab.key
                ? 'border-[#A52307] text-[#A52307] bg-white'
                : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: FIELD REQUIREMENTS */}
      {activeTab === 'field_requirements' && (
        <div className="bg-white border border-[#E2E0DB] rounded-[2px] p-6 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-[#E2E0DB] pb-3 flex-wrap gap-2">
            <div>
              <h3 className="font-bold text-gray-900 text-base">Record Creation Field Configuration</h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Toggle which fields are <strong>Required</strong> or <strong>Optional</strong> when cataloging a new record.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">
                {catalogFields.filter((f) => f.required).length} Required fields
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs font-sans">
              <thead>
                <tr className="border-b border-[#E2E0DB] bg-[#FAF8F5] text-gray-600 uppercase font-bold">
                  <th className="py-3 px-4">Field Name</th>
                  <th className="py-3 px-4">MARC21 Tag</th>
                  <th className="py-3 px-4">Field Group</th>
                  <th className="py-3 px-4 text-center">Required Status</th>
                  <th className="py-3 px-4 text-center">Enabled / Visible</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EEECE7]">
                {catalogFields.map((f) => (
                  <tr key={f.id} className="hover:bg-[#FAF8F5] transition-colors">
                    <td className="py-3.5 px-4 font-bold text-gray-900">
                      {f.name}
                      {f.locked && <span className="ml-2 text-[10px] text-gray-400 font-normal">(System Mandated)</span>}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-[#A52307]">{f.tag}</td>
                    <td className="py-3.5 px-4 text-gray-600">{f.group}</td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        type="button"
                        disabled={f.locked}
                        onClick={() => toggleRequired(f.id)}
                        className={`px-3 py-1 rounded text-[11px] font-bold transition-colors ${
                          f.required
                            ? 'bg-red-100 text-[#A52307] border border-red-200'
                            : 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200'
                        } ${f.locked ? 'opacity-80 cursor-not-allowed' : 'cursor-pointer'}`}
                      >
                        {f.required ? 'Required' : 'Optional'}
                      </button>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        type="button"
                        disabled={f.locked}
                        onClick={() => toggleEnabled(f.id)}
                        className={`px-3 py-1 rounded text-[11px] font-bold transition-colors ${
                          f.enabled
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : 'bg-gray-100 text-gray-400 border border-gray-200'
                        } ${f.locked ? 'opacity-80 cursor-not-allowed' : 'cursor-pointer'}`}
                      >
                        {f.enabled ? 'Enabled' : 'Hidden'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: CATEGORIES */}
      {activeTab === 'categories' && (
        <div className="bg-white border border-[#E2E0DB] rounded-[2px] p-6 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-[#E2E0DB] pb-3">
            <div>
              <h3 className="font-bold text-gray-900 text-base">Catalogue Taxonomy Categories</h3>
              <p className="text-xs text-gray-500 mt-0.5">Define subject categories and call number shelfmark prefixes.</p>
            </div>
            <button
              type="button"
              onClick={() => alert('Add Category')}
              className="px-3 py-1.5 bg-black text-white rounded text-xs font-bold hover:bg-[#A52307] flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Category</span>
            </button>
          </div>

          <table className="w-full border-collapse text-left text-xs font-sans">
            <thead>
              <tr className="border-b border-[#E2E0DB] bg-[#FAF8F5] text-gray-600 uppercase font-bold">
                <th className="py-3 px-4">Code</th>
                <th className="py-3 px-4">Category Name</th>
                <th className="py-3 px-4">Shelfmark Prefix</th>
                <th className="py-3 px-4">Active Records</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EEECE7]">
              {categories.map((c) => (
                <tr key={c.id} className="hover:bg-[#FAF8F5]">
                  <td className="py-3.5 px-4 font-mono font-bold text-gray-900">{c.code}</td>
                  <td className="py-3.5 px-4 font-semibold text-gray-900">{c.name}</td>
                  <td className="py-3.5 px-4 font-mono text-gray-600">{c.prefix}</td>
                  <td className="py-3.5 px-4 font-mono font-bold text-gray-900">{c.count} Records</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 3: RECORD TYPES */}
      {activeTab === 'record_types' && (
        <div className="bg-white border border-[#E2E0DB] rounded-[2px] p-6 shadow-sm space-y-4">
          <h3 className="font-bold text-gray-900 text-base border-b border-[#E2E0DB] pb-3">Bibliographic Record Formats</h3>
          <table className="w-full border-collapse text-left text-xs font-sans">
            <thead>
              <tr className="border-b border-[#E2E0DB] bg-[#FAF8F5] text-gray-600 uppercase font-bold">
                <th className="py-3 px-4">Code</th>
                <th className="py-3 px-4">Record Type Name</th>
                <th className="py-3 px-4">Default Digital Clearance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EEECE7]">
              {recordTypes.map((rt) => (
                <tr key={rt.id} className="hover:bg-[#FAF8F5]">
                  <td className="py-3.5 px-4 font-mono font-bold text-gray-900">{rt.code}</td>
                  <td className="py-3.5 px-4 font-semibold text-gray-900">{rt.name}</td>
                  <td className="py-3.5 px-4 font-mono text-gray-600">{rt.defaultAccess}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 4: ITEM TYPES */}
      {activeTab === 'item_types' && (
        <div className="bg-white border border-[#E2E0DB] rounded-[2px] p-6 shadow-sm space-y-4">
          <h3 className="font-bold text-gray-900 text-base border-b border-[#E2E0DB] pb-3">Physical Item Loan Types</h3>
          <table className="w-full border-collapse text-left text-xs font-sans">
            <thead>
              <tr className="border-b border-[#E2E0DB] bg-[#FAF8F5] text-gray-600 uppercase font-bold">
                <th className="py-3 px-4">Code</th>
                <th className="py-3 px-4">Item Type Name</th>
                <th className="py-3 px-4">Max Loan Period</th>
                <th className="py-3 px-4">Renewable</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EEECE7]">
              {itemTypes.map((it) => (
                <tr key={it.id} className="hover:bg-[#FAF8F5]">
                  <td className="py-3.5 px-4 font-mono font-bold text-gray-900">{it.code}</td>
                  <td className="py-3.5 px-4 font-semibold text-gray-900">{it.name}</td>
                  <td className="py-3.5 px-4 font-mono font-bold text-gray-900">
                    {it.maxDays > 0 ? `${it.maxDays} Days` : 'Reading Room Only (0 Days)'}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-emerald-800">
                    {it.renewable ? 'Yes' : 'No'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 5: CLASSIFICATION SCHEMES */}
      {activeTab === 'classification' && (
        <div className="bg-white border border-[#E2E0DB] rounded-[2px] p-6 shadow-sm space-y-4 text-xs font-sans">
          <h3 className="font-bold text-gray-900 text-base border-b border-[#E2E0DB] pb-3">Classification &amp; Call Number Rules</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-[#FAF8F5] border border-gray-200 rounded">
              <strong className="text-gray-900 block text-sm mb-1">Primary Scheme: Dewey Decimal (DDC 23rd)</strong>
              <p className="text-gray-600">Standard for printed books, monographs, and secondary academic scholarship.</p>
            </div>
            <div className="p-4 bg-[#FAF8F5] border border-gray-200 rounded">
              <strong className="text-gray-900 block text-sm mb-1">Archival Scheme: KMLRI Manuscript Accession Registry</strong>
              <p className="text-gray-600">Special classification for palm-leaf, Arabi-Malayalam codices, and maritime scrolls.</p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: IMPORT & EXPORT */}
      {activeTab === 'import_export' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs font-sans">
          {/* Import Card */}
          <div className="bg-white border border-[#E2E0DB] rounded-[2px] p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-[#E2E0DB] pb-3">
              <Upload className="w-5 h-5 text-[#A52307]" />
              <h3 className="font-bold text-gray-900 text-base">Import Catalogue Records</h3>
            </div>
            <form onSubmit={handleImport} className="space-y-4">
              <div>
                <label className="block font-bold text-gray-700 uppercase mb-1">Source Format</label>
                <select
                  value={importFormat}
                  onChange={(e) => setImportFormat(e.target.value)}
                  className="w-full border border-gray-200 h-10 px-3 rounded text-xs bg-white"
                >
                  <option value="MARC21_XML">MARC21 XML (Koha / LOC format)</option>
                  <option value="MARC21_RAW">MARC21 Raw Binary (.mrc / ISO 2709)</option>
                  <option value="DUBLIN_CORE_XML">Dublin Core XML / OAI-PMH</option>
                  <option value="CSV_SPREADSHEET">KMLRI Bulk Records CSV</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-gray-700 uppercase mb-1">Select File (.xml, .mrc, .csv)</label>
                <input
                  type="file"
                  className="w-full border border-gray-200 p-2 rounded text-xs bg-[#FAF8F5]"
                />
              </div>

              <button
                type="submit"
                disabled={importing}
                className="w-full py-2.5 bg-[#A52307] text-white rounded font-bold hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {importing ? 'Parsing & Ingesting Dataset...' : 'Start Batch Import'}
              </button>
            </form>
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
                  onClick={() => handleExport('MARC21 Raw Binary (.mrc)')}
                  className="w-full p-3 border border-gray-200 hover:border-black rounded flex justify-between items-center bg-[#FAF8F5] transition-colors"
                >
                  <span className="font-bold text-gray-900">MARC21 Raw Binary (.mrc)</span>
                  <Download className="w-4 h-4 text-gray-500" />
                </button>
                <button
                  type="button"
                  onClick={() => handleExport('Dublin Core XML / OAI-PMH')}
                  className="w-full p-3 border border-gray-200 hover:border-black rounded flex justify-between items-center bg-[#FAF8F5] transition-colors"
                >
                  <span className="font-bold text-gray-900">Dublin Core XML (.xml)</span>
                  <Download className="w-4 h-4 text-gray-500" />
                </button>
                <button
                  type="button"
                  onClick={() => handleExport('CSV Spreadsheet Dataset')}
                  className="w-full p-3 border border-gray-200 hover:border-black rounded flex justify-between items-center bg-[#FAF8F5] transition-colors"
                >
                  <span className="font-bold text-gray-900">Catalogue CSV Spreadsheet (.csv)</span>
                  <Download className="w-4 h-4 text-gray-500" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
