'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import {
  Users,
  Search,
  Plus,
  Filter,
  MoreVertical,
  Edit3,
  Eye,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  X,
  UserCheck,
  UserX,
  CreditCard,
  BookOpen,
  Trash2,
  Save
} from 'lucide-react';
import { PageHeader, Badge, Button } from '@/components/admin/ui';
import { getMemberIdentifier } from '@/lib/slugs';
import { confirmDialog } from '@/lib/dialog';
import { MemberForm } from '@/components/members/MemberForm';
import { UserAvatar } from '@/components/ui/UserAvatar';

export default function MembersManagementPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Member Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [userList, rolesList] = await Promise.all([
        api.getUsers(search),
        api.getRoles().catch(() => []),
      ]);
      setUsers(userList || []);
      setRoles(rolesList || []);
    } catch (err: any) {
      console.warn('Load users error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [search]);

  const openCreateModal = () => {
    setEditingUser(null);
    setShowModal(true);
  };

  const openEditModal = (u: any) => {
    setEditingUser(u);
    setShowModal(true);
  };

  const handleDeleteMember = async (userId: string, name: string) => {
    if (!(await confirmDialog({ message: `Are you sure you want to permanently delete member "${name}"? This is only possible for members with no circulation history.`, variant: 'danger' }))) return;
    try {
      await api.deleteUser(userId);
      setNotification({ type: 'success', text: `Member "${name}" deleted successfully.` });
      await loadData();
    } catch (err: any) {
      setNotification({ type: 'error', text: err.message || `Could not delete "${name}".` });
    } finally {
      setTimeout(() => setNotification(null), 4000);
    }
  };

  const handleStatusToggle = async (userId: string, currentStatus: string, name: string) => {
    const nextStatus = currentStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    try {
      await api.updateUser(userId, { status: nextStatus });
      setNotification({ type: 'success', text: `Member "${name}" status updated to ${nextStatus}.` });
      await loadData();
    } catch (err: any) {
      setNotification({ type: 'error', text: err.message || `Could not update status for "${name}".` });
    } finally {
      setTimeout(() => setNotification(null), 4000);
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesStatus = statusFilter === 'ALL' || u.status === statusFilter;
    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
    return matchesStatus && matchesRole;
  });

  return (
    <div className="space-y-6 font-sans pb-12 max-w-[1240px]">
      <PageHeader
        eyebrow="Library Operations · Members"
        title="Member Management"
        actions={
          <Button variant="primary" icon={Plus} onClick={openCreateModal}>
            Create New Member
          </Button>
        }
      />

      {notification && (
        <div
          className={`p-4 border rounded-xl flex items-center gap-3 text-xs font-semibold ${notification.type === 'success'
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

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-[#E2E0DB] p-4 rounded-[2px]">
          <span className="text-[11px] font-bold uppercase text-gray-500 block">Total Members</span>
          <span className="text-2xl font-bold text-gray-900 mt-1 block">{users.length}</span>
          <span className="text-[11px] text-gray-500">Registered in directory</span>
        </div>
        <div className="bg-white border border-[#E2E0DB] p-4 rounded-[2px]">
          <span className="text-[11px] font-bold uppercase text-gray-500 block">Active Status</span>
          <span className="text-2xl font-bold text-emerald-700 mt-1 block">
            {users.filter((u) => u.status === 'ACTIVE').length}
          </span>
          <span className="text-[11px] text-emerald-600">Eligible to borrow</span>
        </div>
        <div className="bg-white border border-[#E2E0DB] p-4 rounded-[2px]">
          <span className="text-[11px] font-bold uppercase text-gray-500 block">Suspended</span>
          <span className="text-2xl font-bold text-[#A52307] mt-1 block">
            {users.filter((u) => u.status === 'SUSPENDED').length}
          </span>
          <span className="text-[11px] text-[#A52307]">Hold on circulation</span>
        </div>
        <div className="bg-white border border-[#E2E0DB] p-4 rounded-[2px]">
          <span className="text-[11px] font-bold uppercase text-gray-500 block">Faculty &amp; Fellows</span>
          <span className="text-2xl font-bold text-gray-900 mt-1 block">
            {users.filter((u) => u.role === 'FACULTY' || u.role === 'RESEARCHER').length}
          </span>
          <span className="text-[11px] text-gray-500">Extended research quotas</span>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white border border-[#E2E0DB] p-4 rounded-[2px] flex flex-col sm:flex-row gap-3 justify-between items-center">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, membership #, or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 h-10 border border-gray-200 rounded text-xs outline-none focus:border-[#A52307] bg-white text-gray-900"
          />
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-200 px-3 h-10 text-xs rounded bg-white text-gray-700 outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="SUSPENDED">Suspended</option>
          </select>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="border border-gray-200 px-3 h-10 text-xs rounded bg-white text-gray-700 outline-none"
          >
            <option value="ALL">All Roles</option>
            <option value="STUDENT">Student</option>
            <option value="FACULTY">Faculty</option>
            <option value="RESEARCHER">Researcher</option>
            <option value="LIBRARIAN">Librarian</option>
            <option value="SUPER_ADMIN">Admin</option>
          </select>
        </div>
      </div>

      {/* Members Table */}
      <div className="bg-white border border-[#E2E0DB] rounded-[2px] overflow-x-auto shadow-sm">
        <table className="w-full border-collapse text-left text-xs font-sans">
          <thead>
            <tr className="border-b border-[#E2E0DB] bg-[#FAF8F5] text-gray-600 uppercase tracking-wider font-bold">
              <th className="py-3 px-4">Membership #</th>
              <th className="py-3 px-4">Member Name &amp; Contact</th>
              <th className="py-3 px-4">Assigned Role</th>
              <th className="py-3 px-4">Borrow Quota</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#EEECE7]">
            {filteredUsers.map((u) => (
              <tr key={u.id} className="hover:bg-[#FAF8F5] transition-colors group">
                <td className="py-3.5 px-4 font-mono font-bold text-gray-900">
                  <Link prefetch href={`/admin/members/${getMemberIdentifier(u)}`} className="hover:text-[#A52307] underline">
                    {u.membershipNumber}
                  </Link>
                </td>
                <td className="py-3.5 px-4">
                  <div className="flex items-center gap-3">
                    <UserAvatar src={u.avatarUrl} name={u.fullName} size="sm" />
                    <div>
                      <Link prefetch href={`/admin/members/${getMemberIdentifier(u)}`} className="font-semibold text-gray-900 text-sm hover:text-[#A52307] block">
                        {u.fullName}
                      </Link>
                      <span className="text-[11px] text-gray-500 font-mono">{u.email}</span>
                    </div>
                  </div>
                </td>
                <td className="py-3.5 px-4">
                  <span className="inline-block bg-gray-100 text-gray-800 text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                    {u.role}
                  </span>
                </td>
                <td className="py-3.5 px-4 font-mono text-gray-700 font-semibold">
                  {u.maxBorrowLimit || 5} Books
                </td>
                <td className="py-3.5 px-4">
                  <span
                    className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${u.status === 'ACTIVE'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-red-100 text-red-800'
                      }`}
                  >
                    {u.status}
                  </span>
                </td>
                <td className="py-3.5 px-4 text-right space-x-1.5">
                  <Link prefetch
                    href={`/admin/members/${getMemberIdentifier(u)}`}
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-gray-300 rounded text-[11px] font-semibold text-gray-700 hover:bg-black hover:text-white transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View Details</span>
                  </Link>
                  <button
                    type="button"
                    onClick={() => openEditModal(u)}
                    className="px-2 py-1 bg-white border border-gray-300 rounded text-[11px] font-semibold text-gray-700 hover:bg-black hover:text-white transition-colors inline-flex items-center gap-1"
                  >
                    <Edit3 className="w-3 h-3" />
                    <span>Edit</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleStatusToggle(u.id, u.status, u.fullName)}
                    className={`px-2 py-1 rounded text-[11px] font-semibold border transition-colors ${u.status === 'ACTIVE'
                        ? 'border-amber-400 text-amber-800 hover:bg-amber-100'
                        : 'border-emerald-400 text-emerald-800 hover:bg-emerald-100'
                      }`}
                  >
                    {u.status === 'ACTIVE' ? 'Suspend' : 'Activate'}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteMember(u.id, u.fullName)}
                    className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded inline-block align-middle"
                    title="Delete Member"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredUsers.length === 0 && (
          <div className="p-12 text-center text-gray-500 text-sm">
            No library members found matching your search and filter criteria.
          </div>
        )}
      </div>

      {/* POPUP MODAL: Unified Member Form */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-2xl w-full border border-gray-200 shadow-2xl p-6 sm:p-8 font-sans text-xs my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start border-b border-gray-100 pb-4 mb-6">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#A52307]">Member Registry</p>
                <h3 className="text-xl font-bold text-gray-900 mt-0.5">
                  {editingUser ? 'Edit Member Profile' : 'Create New Member'}
                </h3>
              </div>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-900 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <MemberForm
              mode={editingUser ? 'admin-edit' : 'admin-create'}
              initialData={editingUser}
              rolesList={roles}
              onCancel={() => setShowModal(false)}
              onSuccess={async (u) => {
                setNotification({
                  type: 'success',
                  text: editingUser
                    ? `Member "${u?.fullName || editingUser.fullName}" updated successfully.`
                    : `Member "${u?.fullName || 'New member'}" created successfully.`,
                });
                setShowModal(false);
                await loadData();
                setTimeout(() => setNotification(null), 4000);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
