'use client';

import { useState, useEffect } from 'react';
import { api, PermissionDefinition } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { 
  Shield, 
  Plus, 
  Edit2, 
  Trash2, 
  CheckCircle2, 
  Lock, 
  Users, 
  Key, 
  AlertCircle, 
  X,
  RotateCcw
} from 'lucide-react';
import { Badge, Card, PageHeader, Button } from '@/components/admin/ui';
import { DynamicRole, getDynamicRoles, saveDynamicRoles, INITIAL_DYNAMIC_ROLES } from '@/lib/dynamic-roles';

export default function RolesManagementPage() {
  const { isStaff, hasPermission } = useAuth();
  const [roles, setRoles] = useState<DynamicRole[]>([]);
  const [permissions, setPermissions] = useState<PermissionDefinition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<DynamicRole | null>(null);
  const [formName, setFormName] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formDefaultDays, setFormDefaultDays] = useState(14);
  const [formMaxQuota, setFormMaxQuota] = useState(5);
  const [formGraceDays, setFormGraceDays] = useState(1);
  const [selectedPerms, setSelectedPerms] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  // Delete confirmation
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const storedRoles = getDynamicRoles();
      setRoles(storedRoles);

      const permsData = await api.getAvailablePermissions().catch(() => [
        { key: 'CATALOG_READ', label: 'View Catalogue & Manuscripts', category: 'Cataloging', desc: 'Browse and search master records.' },
        { key: 'CATALOG_WRITE', label: 'Create & Edit Master Records', category: 'Cataloging', desc: 'Author bibliographic records and holdings.' },
        { key: 'CIRCULATION_CHECKOUT', label: 'Execute Check-out & Loan Issues', category: 'Circulation', desc: 'Issue physical items to patrons.' },
        { key: 'CIRCULATION_CHECKIN', label: 'Process Check-in & Condition Assessment', category: 'Circulation', desc: 'Check in returned items and assess damage.' },
        { key: 'HOLD_PLACE', label: 'Place Holds & Reservations', category: 'Circulation', desc: 'Reserve physical holding copies.' },
        { key: 'FINES_MANAGE', label: 'Cashier & Settle Fines', category: 'Circulation', desc: 'Collect and waive overdue penalties.' },
        { key: 'MEMBERS_MANAGE', label: 'Create, Edit & Delete Members', category: 'Membership', desc: 'Manage patron registry and privileges.' },
        { key: 'ROLES_MANAGE', label: 'Configure Roles & Permissions', category: 'System', desc: 'Grant and revoke capability matrices.' },
        { key: 'DIGITAL_VIEW', label: 'Full IIIF & Archival Access', category: 'Digital Library', desc: 'Inspect high-res multispectral manifests.' },
      ]);
      setPermissions(permsData);
    } catch (err: any) {
      setError(err.message || 'Failed to load roles and permissions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const handleRolesUpdate = () => {
      setRoles(getDynamicRoles());
    };
    window.addEventListener('kmlri_roles_updated', handleRolesUpdate);
    return () => window.removeEventListener('kmlri_roles_updated', handleRolesUpdate);
  }, []);

  const openCreateModal = () => {
    setEditingRole(null);
    setFormName('');
    setFormSlug('');
    setFormDesc('');
    setFormDefaultDays(14);
    setFormMaxQuota(5);
    setFormGraceDays(1);
    setSelectedPerms(['CATALOG_READ', 'CIRCULATION_CHECKOUT', 'HOLD_PLACE']);
    setModalOpen(true);
  };

  const openEditModal = (role: DynamicRole) => {
    setEditingRole(role);
    setFormName(role.name);
    setFormSlug(role.slug);
    setFormDesc(role.description || '');
    setFormDefaultDays(role.defaultDays || 14);
    setFormMaxQuota(role.maxQuota || 5);
    setFormGraceDays(role.gracePeriodDays ?? 1);
    setSelectedPerms(role.permissions || []);
    setModalOpen(true);
  };

  const handleSaveRole = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const generatedSlug = formSlug
        ? formSlug.toLowerCase().replace(/[^a-z0-9]+/g, '-')
        : formName.toLowerCase().replace(/[^a-z0-9]+/g, '-');

      if (editingRole) {
        const updatedRoles = roles.map((r) =>
          r.id === editingRole.id
            ? {
                ...r,
                name: formName,
                description: formDesc,
                permissions: selectedPerms,
                defaultDays: Number(formDefaultDays),
                maxQuota: Number(formMaxQuota),
                gracePeriodDays: Number(formGraceDays),
                isSystem: r.slug === 'super-admin',
              }
            : r
        );
        saveDynamicRoles(updatedRoles);
        setRoles(updatedRoles);
        setSuccess(`Role "${formName}" updated successfully.`);
      } else {
        const newRole: DynamicRole = {
          id: `role-${Date.now()}`,
          name: formName,
          slug: generatedSlug,
          description: formDesc,
          isSystem: false, // Only super-admin is system
          permissions: selectedPerms,
          defaultDays: Number(formDefaultDays),
          maxQuota: Number(formMaxQuota),
          gracePeriodDays: Number(formGraceDays),
          memberCount: 0,
        };
        const updatedRoles = [...roles, newRole];
        saveDynamicRoles(updatedRoles);
        setRoles(updatedRoles);
        setSuccess(`Custom role "${formName}" created successfully.`);
      }
      setModalOpen(false);
    } catch (err: any) {
      setError(err.message || 'Could not save role');
    } finally {
      setSaving(false);
      setTimeout(() => setSuccess(''), 4000);
    }
  };

  const handleDeleteRole = (id: string, name: string, slug: string) => {
    if (slug === 'super-admin') {
      alert('Super Administrator is the core system role and cannot be deleted.');
      return;
    }
    setError('');
    setSuccess('');
    try {
      const updatedRoles = roles.filter((r) => r.id !== id);
      saveDynamicRoles(updatedRoles);
      setRoles(updatedRoles);
      setSuccess(`Role "${name}" deleted successfully.`);
      setDeleteConfirmId(null);
    } catch (err: any) {
      setError(err.message || 'Could not delete role');
    } finally {
      setTimeout(() => setSuccess(''), 4000);
    }
  };

  const handleResetToDefaults = () => {
    if (confirm('Reset all roles to default initial configuration?')) {
      saveDynamicRoles(INITIAL_DYNAMIC_ROLES);
      setRoles(INITIAL_DYNAMIC_ROLES);
      setSuccess('Roles reset to default institutional configuration.');
      setTimeout(() => setSuccess(''), 4000);
    }
  };

  const togglePermission = (key: string) => {
    if (selectedPerms.includes(key)) {
      setSelectedPerms(selectedPerms.filter((p) => p !== key));
    } else {
      setSelectedPerms([...selectedPerms, key]);
    }
  };

  const categories = Array.from(new Set(permissions.map((p) => p.category)));

  return (
    <div className="space-y-6 font-sans pb-12 max-w-[1240px]">
      {/* Header */}
      <PageHeader
        eyebrow="Access Control · Dynamic RBAC"
        title="Roles &amp; Permissions Management"
        description="Super Administrator is the single default system role. All other member roles (Students, Faculty, Researchers, Staff, Archivists) are fully dynamic, editable, and configurable."
        actions={
          <div className="flex gap-2">
            <Button variant="outline" icon={RotateCcw} onClick={handleResetToDefaults}>
              Reset Defaults
            </Button>
            <Button variant="primary" icon={Plus} onClick={openCreateModal}>
              Create New Role
            </Button>
          </div>
        }
      />

      {/* Notifications */}
      {error && (
        <div className="p-4 bg-red-50 text-heritage-red border border-red-200 rounded-lg text-sm font-semibold flex items-center gap-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="p-4 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-sm font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="flex items-center justify-between" padded>
          <div>
            <p className="text-[11px] uppercase tracking-wider text-gray-500 font-semibold">Total Defined Roles</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{roles.length}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
            <Key className="w-5 h-5 text-gray-700" />
          </div>
        </Card>

        <Card className="flex items-center justify-between" padded>
          <div>
            <p className="text-[11px] uppercase tracking-wider text-gray-500 font-semibold">System Default Roles</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">1 (Super Admin)</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-gray-900 text-white flex items-center justify-center">
            <Lock className="w-5 h-5" />
          </div>
        </Card>

        <Card className="flex items-center justify-between" padded>
          <div>
            <p className="text-[11px] uppercase tracking-wider text-gray-500 font-semibold">Dynamic User Roles</p>
            <p className="text-3xl font-bold text-[#A52307] mt-1">{roles.filter((r) => !r.isSystem).length}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center">
            <Shield className="w-5 h-5 text-[#A52307]" />
          </div>
        </Card>
      </div>

      {/* Roles List */}
      <Card padded={false} className="overflow-hidden">
        <div className="p-5 border-b border-gray-200 flex justify-between items-center bg-gray-50">
          <h2 className="text-lg font-bold text-gray-900 m-0">Dynamic Roles Matrix</h2>
          <span className="text-[11px] text-gray-500 font-semibold uppercase tracking-wider font-mono">
            {roles.length} Dynamic Roles
          </span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-gray-400 text-sm">
            Loading roles and permission matrices...
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {roles.map((role) => {
              const permsList: string[] = role.permissions || [];
              const isSuper = role.slug === 'super-admin' || role.isSystem;

              return (
                <div key={role.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-start flex-wrap gap-4 mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-sm ${
                        isSuper ? 'bg-gray-900 text-white' : 'bg-[#A52307] text-white'
                      }`}>
                        {isSuper ? <Lock className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-lg font-bold text-gray-900 m-0">{role.name}</h3>
                          <span className="font-mono text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md border border-gray-200">
                            {role.slug}
                          </span>
                          {isSuper ? (
                            <span className="bg-black text-white text-[10px] font-bold uppercase px-2 py-0.5 rounded">
                              Only Default System Role
                            </span>
                          ) : (
                            <span className="bg-amber-100 text-amber-900 text-[10px] font-bold uppercase px-2 py-0.5 rounded border border-amber-200">
                              Dynamic Role
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5 max-w-2xl">
                          {role.description || 'No description provided.'}
                        </p>
                        <div className="flex items-center gap-4 text-[11px] text-gray-600 mt-1 font-mono">
                          <span>Loan Duration: <strong>{role.defaultDays} days</strong></span>
                          <span>Borrow Quota: <strong>{role.maxQuota} books</strong></span>
                          <span>Grace Period: <strong>{role.gracePeriodDays} days</strong></span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <Button variant="outline" icon={Edit2} onClick={() => openEditModal(role)}>
                        Edit Role &amp; Permissions
                      </Button>

                      {!isSuper ? (
                        <button
                          type="button"
                          onClick={() => handleDeleteRole(role.id, role.name, role.slug)}
                          className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg border border-red-200 text-red-700 hover:bg-red-700 hover:text-white transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete</span>
                        </button>
                      ) : (
                        <span className="text-[11px] text-gray-400 font-mono italic px-2">
                          Protected System Role
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Permissions Tag Bar */}
                  <div className="mt-4 pt-3 border-t border-gray-100">
                    <p className="text-[11px] uppercase tracking-widest text-gray-400 font-semibold mb-2">
                      Active Permissions ({isSuper ? 'Full System Authority' : `${permsList.length} Grants`}):
                    </p>
                    {isSuper ? (
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-900 text-white text-xs font-bold rounded-full">
                        <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                        <span>Unrestricted Master Clearance (All Capabilities)</span>
                      </div>
                    ) : permsList.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {permsList.map((p) => {
                          const def = permissions.find((perm) => perm.key === p);
                          return (
                            <span
                              key={p}
                              title={def?.desc || p}
                              className="text-xs bg-white text-gray-700 px-2.5 py-1 rounded-full border border-gray-200 font-medium inline-flex items-center gap-1.5 shadow-2xs"
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-[#A52307]"></span>
                              {def?.label || p}
                            </span>
                          );
                        })}
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400 italic">No explicit capabilities assigned.</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* CREATE / EDIT ROLE MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 bg-[#FAF8F5] border-b border-gray-200 flex justify-between items-center sticky top-0 z-10">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded bg-red-50 text-[#A52307] flex items-center justify-center font-bold">
                  <Shield className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-sm">
                    {editingRole ? `Edit Role: ${editingRole.name}` : 'Create Dynamic Role'}
                  </h3>
                  <span className="text-[11px] text-gray-500">Configure role definition, borrow defaults, and security matrix</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="text-gray-400 hover:text-gray-700 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveRole} className="p-6 space-y-4 text-xs font-sans">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-gray-800 block mb-1">Role Display Name *</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => {
                      setFormName(e.target.value);
                      if (!editingRole) {
                        setFormSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
                      }
                    }}
                    placeholder="e.g. Visiting Scholar / Conservator"
                    className="w-full px-3 py-2 border border-gray-300 rounded text-xs text-gray-900 focus:border-[#A52307] outline-none font-semibold"
                  />
                </div>

                <div>
                  <label className="font-bold text-gray-800 block mb-1">Role Key / Identifier</label>
                  <input
                    type="text"
                    required
                    value={formSlug}
                    onChange={(e) => setFormSlug(e.target.value)}
                    disabled={editingRole?.slug === 'super-admin'}
                    placeholder="e.g. visiting-scholar"
                    className="w-full px-3 py-2 border border-gray-300 rounded text-xs font-mono text-gray-900 focus:border-[#A52307] outline-none disabled:bg-gray-100"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="font-bold text-gray-800 block mb-1">Description &amp; Institutional Scope</label>
                  <textarea
                    rows={2}
                    value={formDesc}
                    onChange={(e) => setFormDesc(e.target.value)}
                    placeholder="Describe which patrons or staff this role applies to..."
                    className="w-full px-3 py-2 border border-gray-300 rounded text-xs text-gray-900 outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-gray-800 block mb-1">Default Loan Period (Days)</label>
                  <input
                    type="number"
                    min={1}
                    max={180}
                    value={formDefaultDays}
                    onChange={(e) => setFormDefaultDays(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded text-xs font-mono text-gray-900 outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-gray-800 block mb-1">Max Borrow Quota (Books)</label>
                  <input
                    type="number"
                    min={1}
                    max={50}
                    value={formMaxQuota}
                    onChange={(e) => setFormMaxQuota(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded text-xs font-mono text-gray-900 outline-none"
                  />
                </div>
              </div>

              {/* Permissions Matrix */}
              <div className="space-y-3 pt-3 border-t border-gray-200">
                <h4 className="font-bold text-gray-900 text-xs uppercase tracking-wider">Granular Capabilities Matrix</h4>
                
                {categories.map((cat) => {
                  const catPerms = permissions.filter((p) => p.category === cat);
                  return (
                    <div key={cat} className="p-3 bg-[#FAF8F5] border border-gray-200 rounded space-y-2">
                      <span className="font-bold text-gray-900 uppercase text-[10px] tracking-wider block">{cat}</span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {catPerms.map((p) => (
                          <label key={p.key} className="flex items-start gap-2 cursor-pointer text-[11px] text-gray-800">
                            <input
                              type="checkbox"
                              checked={selectedPerms.includes(p.key) || editingRole?.slug === 'super-admin'}
                              disabled={editingRole?.slug === 'super-admin'}
                              onChange={() => togglePermission(p.key)}
                              className="mt-0.5 rounded border-gray-300 text-[#A52307] focus:ring-[#A52307]"
                            />
                            <div>
                              <span className="font-semibold block">{p.label}</span>
                              <span className="text-[10px] text-gray-500 block">{p.desc}</span>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-end gap-2.5 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded text-xs font-semibold text-gray-700 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2 bg-[#A52307] text-white rounded text-xs font-bold hover:bg-red-800 transition-colors shadow-md disabled:opacity-50"
                >
                  {saving ? 'Saving...' : editingRole ? 'Save Changes' : 'Create Role'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
