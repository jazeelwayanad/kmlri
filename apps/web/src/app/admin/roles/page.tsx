'use client';

import { useState, useEffect } from 'react';
import { api, Role, PermissionDefinition } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { Shield, Plus, Edit2, Trash2, CheckCircle2, Lock, Users, Key, AlertCircle, X } from 'lucide-react';
import { Badge, Card, PageHeader, Button } from '@/components/admin/ui';

export default function RolesManagementPage() {
  const { isStaff, hasPermission } = useAuth();
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<PermissionDefinition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [formName, setFormName] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [selectedPerms, setSelectedPerms] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  // Delete confirmation
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [rolesData, permsData] = await Promise.all([
        api.getRoles(),
        api.getAvailablePermissions(),
      ]);
      setRoles(rolesData);
      setPermissions(permsData);
    } catch (err: any) {
      setError(err.message || 'Failed to load roles and permissions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openCreateModal = () => {
    setEditingRole(null);
    setFormName('');
    setFormSlug('');
    setFormDesc('');
    setSelectedPerms(['ADMIN_ACCESS']);
    setModalOpen(true);
  };

  const openEditModal = (role: Role) => {
    setEditingRole(role);
    setFormName(role.name);
    setFormSlug(role.slug);
    setFormDesc(role.description || '');

    let perms: string[] = [];
    if (role.permissionsList) {
      perms = role.permissionsList;
    } else {
      try {
        perms = JSON.parse(role.permissions);
      } catch {
        perms = [];
      }
    }
    setSelectedPerms(perms);
    setModalOpen(true);
  };

  const handleSaveRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      if (editingRole) {
        await api.updateRole(editingRole.id, {
          name: formName,
          description: formDesc,
          permissions: selectedPerms,
        });
        setSuccess(`Role "${formName}" updated successfully.`);
      } else {
        await api.createRole({
          name: formName,
          slug: formSlug || undefined,
          description: formDesc,
          permissions: selectedPerms,
        });
        setSuccess(`Custom role "${formName}" created successfully.`);
      }
      setModalOpen(false);
      await loadData();
    } catch (err: any) {
      setError(err.message || 'Could not save role');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteRole = async (id: string) => {
    setError('');
    setSuccess('');
    try {
      await api.deleteRole(id);
      setSuccess('Role deleted successfully.');
      setDeleteConfirmId(null);
      await loadData();
    } catch (err: any) {
      setError(err.message || 'Could not delete role');
    }
  };

  const togglePermission = (key: string) => {
    if (selectedPerms.includes(key)) {
      setSelectedPerms(selectedPerms.filter((p) => p !== key));
    } else {
      setSelectedPerms([...selectedPerms, key]);
    }
  };

  const toggleAllCategory = (category: string) => {
    const catKeys = permissions.filter((p) => p.category === category).map((p) => p.key);
    const allSelected = catKeys.every((k) => selectedPerms.includes(k));
    if (allSelected) {
      setSelectedPerms(selectedPerms.filter((k) => !catKeys.includes(k)));
    } else {
      setSelectedPerms(Array.from(new Set([...selectedPerms, ...catKeys])));
    }
  };

  // Group permissions by category
  const categories = Array.from(new Set(permissions.map((p) => p.category)));

  if (!hasPermission('ROLES_MANAGE') && !hasPermission('SUPER_ADMIN')) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-8 text-center max-w-lg mx-auto my-12 font-sans">
        <div className="w-14 h-14 bg-red-50 text-heritage-red rounded-full flex items-center justify-center mx-auto mb-4">
          <Shield className="w-7 h-7" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Restricted</h2>
        <p className="text-xs uppercase tracking-widest text-heritage-red font-bold mb-4">
          Roles Administration Clearance Required
        </p>
        <p className="text-sm text-gray-500 mb-6">
          Your account does not possess the <code>ROLES_MANAGE</code> capability required to view or modify institutional roles.
        </p>
        <Button variant="dark" onClick={() => window.history.back()}>
          ← Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans pb-12">
      {/* Header */}
      <PageHeader
        eyebrow="Access Control & RBAC"
        title="Roles & Permissions Management"
        description="Configure dynamic institutional roles and assign granular capability matrices for staff, catalogers, archivists, researchers, and students."
        actions={
          <Button variant="primary" icon={Plus} onClick={openCreateModal}>
            Create Custom Role
          </Button>
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
            <p className="text-[11px] uppercase tracking-wider text-gray-500 font-semibold">Custom Created Roles</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">
              {roles.filter((r) => !r.isSystem).length}
            </p>
          </div>
          <div className="w-10 h-10 rounded-full bg-heritage-red/10 flex items-center justify-center">
            <Shield className="w-5 h-5 text-heritage-red" />
          </div>
        </Card>

        <Card className="flex items-center justify-between" padded>
          <div>
            <p className="text-[11px] uppercase tracking-wider text-gray-500 font-semibold">Available Permissions</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{permissions.length}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
            <Users className="w-5 h-5 text-blue-700" />
          </div>
        </Card>
      </div>

      {/* Roles List */}
      <Card padded={false} className="overflow-hidden">
        <div className="p-5 border-b border-gray-200 flex justify-between items-center bg-gray-50">
          <h2 className="text-lg font-bold text-gray-900 m-0">Institutional Roles Registry</h2>
          <span className="text-[11px] text-gray-500 font-semibold uppercase tracking-wider">
            {roles.length} Roles Registered
          </span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-gray-400 text-sm">
            Loading roles and permission matrices...
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {roles.map((role) => {
              const permsList: string[] = role.permissionsList || [];
              const isSuper = role.slug === 'super-admin';

              return (
                <div key={role.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-start flex-wrap gap-4 mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-sm ${role.isSystem ? 'bg-gray-900 text-white' : 'bg-heritage-red text-white'
                        }`}>
                        {role.isSystem ? <Lock className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-lg font-bold text-gray-900 m-0">{role.name}</h3>
                          <span className="font-mono text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md border border-gray-200">
                            {role.slug}
                          </span>
                          {role.isSystem ? (
                            <Badge variant="neutral">System</Badge>
                          ) : (
                            <Badge variant="warning">Custom Role</Badge>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {role.description || 'No description provided.'}
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <div className="text-xs text-gray-500 mr-3">
                        <span className="font-bold text-gray-900">{role.memberCount ?? 0}</span> Members Assigned
                      </div>

                      <Button variant="outline" icon={Edit2} onClick={() => openEditModal(role)}>
                        Edit Permissions
                      </Button>

                      {!role.isSystem && (
                        <button
                          onClick={() => setDeleteConfirmId(role.id)}
                          className="inline-flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-lg border border-red-200 text-heritage-red hover:bg-heritage-red hover:text-white hover:border-heritage-red transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete</span>
                        </button>
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
                              className="text-xs bg-gray-50 text-gray-700 px-2.5 py-1 rounded-full border border-gray-200 font-medium inline-flex items-center gap-1.5"
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-heritage-red"></span>
                              {def?.label || p}
                            </span>
                          );
                        })}
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400 italic">No administrative clearances (Patron only access)</span>
                    )}
                  </div>

                  {/* Delete Confirmation Inline */}
                  {deleteConfirmId === role.id && (
                    <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex justify-between items-center flex-wrap gap-3 text-xs">
                      <div>
                        <p className="font-bold text-heritage-red">Permanently delete custom role &quot;{role.name}&quot;?</p>
                        <p className="text-gray-600">Ensure any assigned members are reassigned to another role first.</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setDeleteConfirmId(null)}
                          className="px-3.5 py-2 bg-white border border-gray-200 rounded-lg font-semibold text-gray-700 hover:bg-gray-50"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleDeleteRole(role.id)}
                          className="px-3.5 py-2 bg-heritage-red text-white rounded-lg font-semibold hover:bg-red-700"
                        >
                          Confirm Delete
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Create / Edit Role Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-gray-900/60 z-50 flex items-center justify-center p-4 overflow-y-auto font-sans">
          <div className="bg-white max-w-3xl w-full border border-gray-200 rounded-xl shadow-2xl p-6 md:p-8 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start border-b border-gray-200 pb-4 mb-6">
              <div>
                <p className="text-xs uppercase tracking-widest text-heritage-red font-bold">
                  {editingRole ? 'Edit Clearances' : 'New Role Definition'}
                </p>
                <h2 className="text-2xl font-bold text-gray-900 mt-1">
                  {editingRole ? `Edit Role: ${editingRole.name}` : 'Create Custom Role'}
                </h2>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="text-gray-400 hover:text-gray-900 p-1"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSaveRole} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase font-semibold text-gray-500 mb-1.5">
                    Role Title*
                  </label>
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
                    placeholder="e.g. Senior Manuscript Conservator"
                    className="w-full border border-gray-200 bg-white h-10 px-3 text-sm rounded-lg outline-none focus:border-heritage-red focus:ring-1 focus:ring-heritage-red/20"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase font-semibold text-gray-500 mb-1.5">
                    Role Slug (Identifier)
                  </label>
                  <input
                    type="text"
                    required
                    disabled={!!editingRole}
                    value={formSlug}
                    onChange={(e) => setFormSlug(e.target.value)}
                    placeholder="e.g. manuscript-conservator"
                    className="w-full border border-gray-200 bg-white h-10 px-3 text-sm rounded-lg outline-none focus:border-heritage-red focus:ring-1 focus:ring-heritage-red/20 disabled:bg-gray-100 disabled:text-gray-400 font-mono text-xs"
                  />
                </div>

                <div className="col-span-full">
                  <label className="block text-xs uppercase font-semibold text-gray-500 mb-1.5">
                    Role Scope &amp; Responsibilities Description
                  </label>
                  <textarea
                    rows={2}
                    value={formDesc}
                    onChange={(e) => setFormDesc(e.target.value)}
                    placeholder="Describe which departments or operations this role oversees..."
                    className="w-full border border-gray-200 bg-white p-3 text-sm rounded-lg outline-none focus:border-heritage-red focus:ring-1 focus:ring-heritage-red/20"
                  ></textarea>
                </div>
              </div>

              {/* Categorized Permissions Selection */}
              <div>
                <div className="flex justify-between items-baseline mb-3">
                  <h3 className="text-lg font-bold text-gray-900">Granular Permission Matrix</h3>
                  <div className="flex gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => setSelectedPerms(permissions.map((p) => p.key))}
                      className="text-heritage-red font-semibold hover:underline"
                    >
                      Grant All
                    </button>
                    <span className="text-gray-300">·</span>
                    <button
                      type="button"
                      onClick={() => setSelectedPerms([])}
                      className="text-gray-500 font-semibold hover:underline"
                    >
                      Revoke All
                    </button>
                  </div>
                </div>

                <div className="space-y-5 border border-gray-200 rounded-lg p-4 bg-gray-50">
                  {categories.map((category) => {
                    const catPerms = permissions.filter((p) => p.category === category);
                    const allCatSelected = catPerms.every((p) => selectedPerms.includes(p.key));

                    return (
                      <div key={category} className="border-b border-gray-200 last:border-0 pb-4 last:pb-0">
                        <div className="flex justify-between items-center mb-2.5">
                          <span className="text-xs uppercase tracking-wider font-semibold text-gray-700">
                            {category} ({catPerms.length})
                          </span>
                          <button
                            type="button"
                            onClick={() => toggleAllCategory(category)}
                            className="text-[11px] text-heritage-red font-semibold hover:underline"
                          >
                            {allCatSelected ? 'Uncheck category' : 'Select category'}
                          </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                          {catPerms.map((perm) => {
                            const isChecked = selectedPerms.includes(perm.key);
                            return (
                              <label
                                key={perm.key}
                                className={`flex items-start gap-2.5 p-2.5 border rounded-lg cursor-pointer transition-colors ${isChecked
                                  ? 'bg-heritage-red/5 border-heritage-red/40'
                                  : 'bg-white border-gray-200 hover:border-gray-300'
                                  }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => togglePermission(perm.key)}
                                  className="mt-1 w-4 h-4 accent-heritage-red"
                                />
                                <div>
                                  <p className="text-xs font-bold text-gray-900">{perm.label}</p>
                                  <p className="text-[11px] text-gray-500 leading-tight mt-0.5">{perm.desc}</p>
                                  <p className="font-mono text-[10px] text-gray-400 mt-1">{perm.key}</p>
                                </div>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-3.5 py-2 border border-gray-200 rounded-lg font-semibold text-xs text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-heritage-red text-white rounded-lg font-semibold text-xs hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  {saving ? 'Saving Role...' : editingRole ? 'Save Changes' : 'Create Role'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
