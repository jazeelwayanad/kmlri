'use client';

import { useEffect, useState, useMemo } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { Save, Languages } from 'lucide-react';
import { PageHeader, Card } from '@/components/admin/ui';
import { DataTable, DataTableColumnHeader } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { toast } from 'sonner';

const SETTING_KEY = 'system.languages';

const DEFAULT_LANGUAGE_PACKS = [
  { code: 'en', name: 'English (UK / Academic)', direction: 'LTR', coverage: '100%', stringsCount: 1420, isDefault: true },
  { code: 'ar', name: 'Arabic (العربية)', direction: 'RTL', coverage: '98.5%', stringsCount: 1398, isDefault: false },
  { code: 'ml', name: 'Malayalam (മലയാളം)', direction: 'LTR', coverage: '96.2%', stringsCount: 1366, isDefault: false },
  { code: 'am', name: 'Arabi-Malayalam Transliteration (അറബി-മലയാളം)', direction: 'RTL / LTR', coverage: '94.0%', stringsCount: 1335, isDefault: false },
];

interface TranslationKeyItem {
  key: string;
  en: string;
  ar: string;
  ml: string;
}

export default function LanguagesAdminPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [languagePacks, setLanguagePacks] = useState(DEFAULT_LANGUAGE_PACKS);

  const translationKeys: TranslationKeyItem[] = [
    { key: 'nav.catalog', en: 'Library Catalog', ar: 'فهرس المكتبة', ml: 'ലൈബ്രറി കാറ്റലോഗ്' },
    { key: 'nav.circulation', en: 'Circulation Desk', ar: 'مكتب الإعارة', ml: 'സർക്കുലേഷൻ ഡെസ്ക്' },
    { key: 'nav.manuscripts', en: 'Rare Manuscripts', ar: 'المخطوطات النادرة', ml: 'അപൂർവ കൈയെഴുത്തുപ്രതികൾ' },
    { key: 'action.search', en: 'Search Collections', ar: 'البحث في المجموعات', ml: 'ശേഖരങ്ങളിൽ തിരയുക' },
    { key: 'action.renew', en: 'Renew Loan', ar: 'تجديد الإعارة', ml: 'വായ്പ പുതുക്കുക' },
    { key: 'status.overdue', en: 'Overdue Loan', ar: 'إعارة متأخرة', ml: 'കാലാവധി കഴിഞ്ഞത്' },
    { key: 'member.role.faculty', en: 'Faculty Member', ar: 'عضو هيئة التدريس', ml: 'അധ്യാപകൻ' },
    { key: 'member.role.scholar', en: 'Research Scholar', ar: 'باحث أكاديمي', ml: 'ഗവേഷകൻ' },
  ];

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const setting = await api.getSetting(SETTING_KEY);
        if (!cancelled && Array.isArray(setting?.value)) {
          setLanguagePacks(setting.value);
        }
      } catch (err: any) {
        if (!cancelled) toast.error(err.message || 'Failed to load language pack settings.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.setSetting(SETTING_KEY, languagePacks, 'Supported locale / language pack list');
      toast.success('Multilingual localization strings saved and cache invalidated.');
    } catch (err: any) {
      toast.error(err.message || 'Failed to save language pack settings.');
    } finally {
      setSaving(false);
    }
  };

  const columns = useMemo<ColumnDef<TranslationKeyItem>[]>(
    () => [
      {
        accessorKey: 'key',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Key Identifier" />,
        cell: ({ row }) => (
          <span className="font-mono font-bold text-foreground text-xs">{row.getValue('key')}</span>
        ),
      },
      {
        accessorKey: 'en',
        header: ({ column }) => <DataTableColumnHeader column={column} title="English (Default)" />,
        cell: ({ row }) => <span className="font-semibold text-foreground text-xs">{row.getValue('en')}</span>,
      },
      {
        accessorKey: 'ar',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Arabic (العربية)" />,
        cell: ({ row }) => (
          <span className="font-bold text-foreground text-sm" dir="rtl">
            {row.getValue('ar')}
          </span>
        ),
      },
      {
        accessorKey: 'ml',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Malayalam (മലയാളം)" />,
        cell: ({ row }) => <span className="text-foreground text-xs">{row.getValue('ml')}</span>,
      },
      {
        id: 'status',
        header: () => <div className="text-right">Status</div>,
        cell: () => (
          <div className="text-right">
            <Badge variant="success" className="text-[10px]">
              Synchronized
            </Badge>
          </div>
        ),
      },
    ],
    []
  );

  return (
    <div className="space-y-6 font-sans pb-12 max-w-[1280px]">
      {/* Header */}
      <PageHeader
        eyebrow="System Administration · Localization"
        title="Multilingual Language Packs"
        description="Manage translations and RTL/LTR script rendering across English, Classical Arabic, Malayalam, and Arabi-Malayalam."
        actions={
          <Button variant="default" onClick={handleSave} disabled={saving || loading}>
            <Save className="w-4 h-4 mr-1.5" />
            {saving ? 'Saving…' : 'Save Translations'}
          </Button>
        }
      />

      {/* Language Packs Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        {languagePacks.map((lp) => (
          <div key={lp.code} className="bg-card border border-border p-4 rounded-lg shadow-xs space-y-1">
            <div className="flex justify-between items-start mb-1">
              <span className="font-mono text-xs font-bold text-heritage-red uppercase">{lp.code}</span>
              {lp.isDefault && <Badge variant="neutral">DEFAULT</Badge>}
            </div>
            <h4 className="text-sm font-bold text-foreground">{lp.name}</h4>
            <div className="mt-2 text-xs text-muted-foreground flex justify-between pt-1">
              <span>{lp.direction}</span>
              <span className="text-emerald-600 font-bold">{lp.coverage} Translated</span>
            </div>
          </div>
        ))}
      </div>

      {/* Translation Strings TanStack Table */}
      <div className="space-y-2">
        <h3 className="text-sm font-bold text-foreground">Core Interface String Matrix</h3>
        <DataTable
          columns={columns}
          data={translationKeys}
          searchKey="key"
          searchPlaceholder="Search translation keys or phrases..."
          isLoading={loading}
        />
      </div>
    </div>
  );
}
