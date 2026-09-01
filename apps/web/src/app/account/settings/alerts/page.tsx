'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Sparkles, Plus, Trash2, Bell, CheckCircle2 } from 'lucide-react';

export default function SettingsResearchAlertsPage() {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState([
    { id: 'ra-1', keywords: 'Arabi-Malayalam, Mappila songs, Lithograph', frequency: 'Instant email', active: true },
    { id: 'ra-2', keywords: 'Zayn al-Din Makhdum, Fath al-Muin, Malabar', frequency: 'Weekly digest', active: true },
    { id: 'ra-3', keywords: 'Ponnani ulama, Hadith manuscripts', frequency: 'Instant email', active: false }
  ]);
  const [newKeywords, setNewKeywords] = useState('');
  const [newFreq, setNewFreq] = useState('Instant email');
  const [showAdd, setShowAdd] = useState(false);

  const handleToggle = (id: string) => {
    setAlerts(alerts.map((a) => (a.id === id ? { ...a, active: !a.active } : a)));
  };

  const handleRemove = (id: string) => {
    setAlerts(alerts.filter((a) => a.id !== id));
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeywords.trim()) return;
    setAlerts([
      ...alerts,
      {
        id: `ra-${Date.now()}`,
        keywords: newKeywords,
        frequency: newFreq,
        active: true
      }
    ]);
    setNewKeywords('');
    setShowAdd(false);
  };

  if (!user) return null;

  return (
    <div className="space-y-6 font-sans">
      <div className="flex justify-between items-baseline flex-wrap gap-3">
        <div>
          <h2 className="font-amiri text-[28px] sm:text-[34px] font-bold text-black m-0 leading-tight">
            Accession Research Alerts
          </h2>
          <p className="text-xs sm:text-sm text-heritage-muted mt-1">
            Configure automated keyword notifications triggered whenever new manuscripts, prints, or working papers are cataloged.
          </p>
        </div>

        <button
          onClick={() => setShowAdd(!showAdd)}
          className="px-4 py-2 bg-black text-white rounded text-xs font-bold hover:bg-heritage-red hover:text-white  transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Keyword Trigger</span>
        </button>
      </div>

      <div className="double-rule"></div>

      {showAdd && (
        <form onSubmit={handleAdd} className="p-5 border-2 border-black bg-[#FAF8F5] rounded space-y-4">
          <h3 className="font-amiri text-xl font-bold text-black m-0">Create Keyword Alert Trigger</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-averia uppercase font-bold text-heritage-muted mb-1">
                Target Keywords / Subject Tags*
              </label>
              <input
                type="text"
                required
                value={newKeywords}
                onChange={(e) => setNewKeywords(e.target.value)}
                placeholder="e.g. Parappur family collection, Shafi'i fiqh"
                className="w-full border border-black bg-white h-11 px-3 text-sm rounded outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-averia uppercase font-bold text-heritage-muted mb-1">
                Notification Frequency
              </label>
              <select
                value={newFreq}
                onChange={(e) => setNewFreq(e.target.value)}
                className="w-full border border-black bg-white h-11 px-3 text-xs rounded outline-none"
              >
                <option value="Instant email">Instant Email Alert</option>
                <option value="Weekly digest">Weekly Digest (Friday)</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowAdd(false)}
              className="px-4 py-2 border border-gray-300 rounded text-xs font-semibold hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-black text-white rounded text-xs font-bold hover:bg-heritage-red hover:text-white  transition-colors"
            >
              Activate Alert
            </button>
          </div>
        </form>
      )}

      <div className="space-y-3">
        {alerts.map((ra) => (
          <div
            key={ra.id}
            className="border-2 border-black bg-white rounded p-4 sm:p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            <div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-heritage-red" />
                <h4 className="font-bold text-black text-base">{ra.keywords}</h4>
              </div>
              <p className="text-xs text-heritage-muted mt-1 font-mono">
                Delivery: <strong className="text-black">{ra.frequency}</strong> · Status: {ra.active ? 'Active Tracker' : 'Paused'}
              </p>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-center text-xs">
              <button
                type="button"
                onClick={() => handleToggle(ra.id)}
                className={`px-3 py-1.5 rounded font-bold transition-colors cursor-pointer ${ra.active ? 'bg-green-100 text-green-800 border border-green-300' : 'bg-gray-100 text-gray-500 border border-gray-300'
                  }`}
              >
                {ra.active ? 'Active Trigger' : 'Paused'}
              </button>

              <button
                type="button"
                onClick={() => handleRemove(ra.id)}
                className="p-1.5 text-gray-400 hover:text-heritage-red cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
