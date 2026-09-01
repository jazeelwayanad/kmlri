'use client';

import { useState } from 'react';
import { Save, CheckCircle2 } from 'lucide-react';
import { PageHeader, Card, Button, Badge } from '@/components/admin/ui';

export default function LanguagesAdminPage() {
  const [notification, setNotification] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const languagePacks = [
    { code: 'en', name: 'English (UK / Academic)', direction: 'LTR', coverage: '100%', stringsCount: 1420, isDefault: true },
    { code: 'ar', name: 'Arabic (العربية)', direction: 'RTL', coverage: '98.5%', stringsCount: 1398, isDefault: false },
    { code: 'ml', name: 'Malayalam (മലയാളം)', direction: 'LTR', coverage: '96.2%', stringsCount: 1366, isDefault: false },
    { code: 'am', name: 'Arabi-Malayalam Transliteration (അറബി-മലയാളം)', direction: 'RTL / LTR', coverage: '94.0%', stringsCount: 1335, isDefault: false },
  ];

  const translationKeys = [
    { key: 'nav.catalog', en: 'Library Catalog', ar: 'فهرس المكتبة', ml: 'ലൈബ്രറി കാറ്റലോഗ്' },
    { key: 'nav.circulation', en: 'Circulation Desk', ar: 'مكتب الإعارة', ml: 'സർക്കുലേഷൻ ഡെസ്ക്' },
    { key: 'nav.manuscripts', en: 'Rare Manuscripts', ar: 'المخطوطات النادرة', ml: 'അപൂർവ കൈയെഴുത്തുപ്രതികൾ' },
    { key: 'action.search', en: 'Search Collections', ar: 'البحث في المجموعات', ml: 'ശേഖരങ്ങളിൽ തിരയുക' },
  ];

  const handleSave = () => {
    setNotification('Multilingual localization strings saved and cache invalidated.');
    setTimeout(() => setNotification(null), 4000);
  };

  return (
    <div className="space-y-6 font-sans pb-12">
      {/* Header */}
      <PageHeader
        eyebrow="System Administration · Localization"
        title="Multilingual Language Packs"
        description="Manage translations and RTL/LTR script rendering across English, Classical Arabic, Malayalam, and Arabi-Malayalam."
        actions={
          <Button variant="dark" icon={Save} onClick={handleSave}>
            Save Translations
          </Button>
        }
      />

      {notification && (
        <div className="p-4 bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20 rounded-lg text-sm font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Language Packs Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        {languagePacks.map((lp) => (
          <Card key={lp.code} className="p-4">
            <div className="flex justify-between items-start mb-1">
              <span className="font-mono text-xs font-bold text-heritage-red uppercase">{lp.code}</span>
              {lp.isDefault && <Badge variant="neutral">DEFAULT</Badge>}
            </div>
            <h4 className="text-lg font-bold text-gray-900">{lp.name}</h4>
            <div className="mt-2 text-xs text-gray-500 flex justify-between">
              <span>{lp.direction}</span>
              <span className="text-emerald-700 font-bold">{lp.coverage} Translated</span>
            </div>
          </Card>
        ))}
      </div>

      {/* Translation Strings Editor */}
      <Card className="overflow-x-auto">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Core Interface String Matrix</h3>
        <table className="w-full border-collapse text-left text-xs font-sans">
          <thead>
            <tr className="border-b border-gray-100 text-[11px] uppercase tracking-wide text-gray-400 bg-gray-50">
              <th className="pb-3 pt-2 px-2 first:pl-2">Key Identifier</th>
              <th className="pb-3 pt-2 px-2">English (Default)</th>
              <th className="pb-3 pt-2 px-2">Arabic (العربية)</th>
              <th className="pb-3 pt-2 px-2">Malayalam (മലയാളം)</th>
              <th className="pb-3 pt-2 px-2 text-right last:pr-2">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {translationKeys.map((k) => (
              <tr key={k.key} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-3.5 px-2 font-mono text-gray-700 font-bold">{k.key}</td>
                <td className="py-3.5 px-2 text-gray-900 font-semibold">{k.en}</td>
                <td className="py-3.5 px-2 text-base font-bold text-gray-900" dir="rtl">{k.ar}</td>
                <td className="py-3.5 px-2 text-gray-900">{k.ml}</td>
                <td className="py-3.5 px-2 text-right">
                  <Button variant="outline" onClick={() => alert(`Edit translations for key: ${k.key}`)}>
                    Edit
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
