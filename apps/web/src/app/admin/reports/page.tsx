'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Download, Printer, Inbox, FileSpreadsheet } from 'lucide-react';
import { PageHeader, Button, Card, Badge } from '@/components/admin/ui';

export default function AdminReportsPage() {
  const [loans, setLoans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadReports() {
      setLoading(true);
      try {
        const res = await api.getCirculationReports();
        setLoans(res || []);
      } catch (err) {
        setLoans([]);
      } finally {
        setLoading(false);
      }
    }
    loadReports();
  }, []);

  const exportCSV = () => {
    if (loans.length === 0) return;
    const headers = ['Loan ID', 'Patron Name', 'Membership No', 'Title', 'Shelfmark', 'Barcode', 'Issued Date', 'Due Date', 'Status'];
    const rows = loans.map((l) => [
      l.id,
      `"${l.user?.fullName || ''}"`,
      l.user?.membershipNumber || '',
      `"${l.copy?.bibRecord?.titleLatin || ''}"`,
      l.copy?.bibRecord?.shelfmark || '',
      l.copy?.barcode || '',
      new Date(l.issuedAt).toLocaleDateString(),
      new Date(l.dueDate).toLocaleDateString(),
      l.status,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `kmlri_circulation_report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 font-sans pb-12 max-w-[1240px]">
      <PageHeader
        eyebrow="Auditing & Analytics"
        title="Circulation Reports"
        description="Auditing and collection turnover records."
        actions={
          <div className="flex gap-2">
            <Button
              variant="dark"
              icon={Download}
              onClick={exportCSV}
              disabled={loans.length === 0}
            >
              Export CSV
            </Button>
            <Button
              variant="outline"
              icon={Printer}
              onClick={() => window.print()}
              disabled={loans.length === 0}
            >
              Print Report
            </Button>
          </div>
        }
      />

      <Card className="overflow-x-auto p-0">
        {loading ? (
          <div className="py-16 text-center text-xs text-gray-500 font-sans">
            Loading circulation audit data...
          </div>
        ) : loans.length === 0 ? (
          <div className="py-16 text-center p-8">
            <Inbox className="w-10 h-10 text-gray-300 mx-auto mb-3 stroke-[1.5]" />
            <h3 className="text-base font-bold text-gray-800">No circulation report entries</h3>
            <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
              Circulation loans, check-ins, and return events will be recorded here for auditing.
            </p>
          </div>
        ) : (
          <table className="w-full border-collapse text-xs">
            <thead>
              <tr className="border-b border-gray-200 text-left text-[11px] uppercase tracking-wide text-gray-500 bg-gray-50 font-bold">
                <th className="py-3 px-4">Title &amp; Shelfmark</th>
                <th className="py-3 px-4">Barcode</th>
                <th className="py-3 px-4">Patron Name &amp; ID</th>
                <th className="py-3 px-4">Issued Date</th>
                <th className="py-3 px-4">Due Date</th>
                <th className="py-3 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loans.map((l) => (
                <tr key={l.id} className="hover:bg-gray-50">
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-gray-900">{l.copy?.bibRecord?.titleLatin}</div>
                    <div className="text-[11px] font-mono text-gray-400">{l.copy?.bibRecord?.shelfmark}</div>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-xs text-gray-900">{l.copy?.barcode}</td>
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-gray-900">{l.user?.fullName}</div>
                    <div className="text-[11px] text-gray-500 font-mono">{l.user?.membershipNumber}</div>
                  </td>
                  <td className="py-3.5 px-4 text-gray-600">{new Date(l.issuedAt).toLocaleDateString()}</td>
                  <td className="py-3.5 px-4 font-bold text-gray-900">{new Date(l.dueDate).toLocaleDateString()}</td>
                  <td className="py-3.5 px-4 text-right">
                    <span className="inline-block bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded text-[10px] uppercase">
                      {l.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}
