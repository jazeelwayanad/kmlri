'use client';

import { useState } from 'react';
import { Building2, Plus, CheckCircle2 } from 'lucide-react';
import { PageHeader, Button, Card } from '@/components/admin/ui';

export default function DepartmentsAdminPage() {
  const [notification, setNotification] = useState<string | null>(null);

  const departments = [
    {
      id: 'DEP-01',
      name: 'Department of Islamic Studies & Jurisprudence',
      code: 'IS-JUR',
      headOfDept: 'Dr. Taha Malabari',
      facultyCount: 14,
      studentCount: 240,
      annualBookBudget: '₹3,50,000',
      budgetSpent: '₹2,40,000',
    },
    {
      id: 'DEP-02',
      name: 'Centre for Arabi-Malayalam Language & Linguistics',
      code: 'AM-LING',
      headOfDept: 'Prof. Zakariyya Nadwi',
      facultyCount: 8,
      studentCount: 120,
      annualBookBudget: '₹2,80,000',
      budgetSpent: '₹1,95,000',
    },
    {
      id: 'DEP-03',
      name: 'Department of History, Epigraphy & Littoral Studies',
      code: 'HIST-EPI',
      headOfDept: 'Dr. M. K. Faizee',
      facultyCount: 10,
      studentCount: 160,
      annualBookBudget: '₹3,00,000',
      budgetSpent: '₹2,10,000',
    },
    {
      id: 'DEP-04',
      name: 'Manuscript Conservation & Archival Sciences Lab',
      code: 'ARCH-SCI',
      headOfDept: 'Senior Conservator Zubair Ahmad',
      facultyCount: 6,
      studentCount: 45,
      annualBookBudget: '₹2,70,000',
      budgetSpent: '₹1,71,000',
    },
  ];

  return (
    <div className="space-y-6 font-sans pb-12">
      {/* Header */}
      <PageHeader
        eyebrow="Administration · Academic Units"
        title="Departments & Programs"
        description="Administer institutional academic departments, research centres, faculty headcount allocations, and annual library acquisition budgets."
        actions={
          <Button
            variant="primary"
            icon={Plus}
            onClick={() => {
              setNotification('Department Registration form opened.');
              setTimeout(() => setNotification(null), 3000);
            }}
          >
            Add Academic Department
          </Button>
        }
      />

      {notification && (
        <div className="p-4 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-sm font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Grid of Departments */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {departments.map((d) => (
          <Card key={d.id} className="hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-700 shrink-0">
                  <Building2 className="w-4.5 h-4.5" />
                </div>
                <div>
                  <span className="font-mono text-xs text-gray-500 font-bold">{d.code}</span>
                  <h3 className="text-lg font-bold text-gray-900 mt-0.5">{d.name}</h3>
                </div>
              </div>
            </div>

            <p className="text-xs text-gray-600 mt-1 font-semibold">HOD / Chair: {d.headOfDept}</p>

            <div className="mt-4 grid grid-cols-3 gap-3 bg-gray-50 p-3 rounded-lg border border-gray-200 text-center text-xs">
              <div>
                <span className="text-gray-500 block text-[10px] uppercase font-bold tracking-wide">Faculty</span>
                <span className="font-bold text-lg text-gray-900">{d.facultyCount} Scholars</span>
              </div>
              <div>
                <span className="text-gray-500 block text-[10px] uppercase font-bold tracking-wide">Students</span>
                <span className="font-bold text-lg text-gray-900">{d.studentCount} Enrolled</span>
              </div>
              <div>
                <span className="text-gray-500 block text-[10px] uppercase font-bold tracking-wide">Acquisition Budget</span>
                <span className="font-mono font-bold text-sm text-gray-900">{d.annualBookBudget}</span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between items-center text-xs">
              <span className="text-gray-500">Spent: <strong className="text-gray-900 font-mono">{d.budgetSpent}</strong></span>
              <button
                type="button"
                onClick={() => alert(`Editing department: ${d.name}`)}
                className="px-3 py-1.5 border border-gray-300 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-900 hover:text-white hover:border-gray-900 transition-colors"
              >
                Configure Dept
              </button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
