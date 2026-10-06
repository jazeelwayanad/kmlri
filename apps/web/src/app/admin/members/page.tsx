'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { ColumnDef } from '@tanstack/react-table';
import { api } from '@/lib/api';
import {
  MoreVertical,
  Edit3,
  Eye,
  CheckCircle2,
  AlertCircle,
  UserCheck,
  UserX,
  Trash2,
  Plus,
} from 'lucide-react';
import { PageHeader } from '@/components/admin/ui';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { DataTable, DataTableColumnHeader } from '@/components/ui/data-table';
import { getMemberIdentifier } from '@/lib/slugs';
import { confirmDialog } from '@/lib/dialog';
import { UserAvatar } from '@/components/ui/UserAvatar';

export default function MembersManagementPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

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

  const handleDeleteMember = async (userId: string, name: string) => {
    if (!(await confirmDialog({ message: `Are you sure you want to permanently delete member "${name}"? This is only possible for members with no circulation history.`, tone: 'danger' }))) return;
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

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchesStatus = statusFilter === 'ALL' || u.status === statusFilter;
      const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
      return matchesStatus && matchesRole;
    });
  }, [users, statusFilter, roleFilter]);

  const columns = useMemo<ColumnDef<any>[]>(() => [
    {
      accessorKey: 'membershipNumber',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Membership #" />,
      cell: ({ row }) => {
        const u = row.original;
        return (
          <Link
            prefetch
            href={`/admin/members/${getMemberIdentifier(u)}`}
            className="font-mono font-bold text-gray-900 hover:text-heritage-red underline"
          >
            {u.membershipNumber}
          </Link>
        );
      },
    },
    {
      accessorKey: 'fullName',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Member Name & Contact" />,
      cell: ({ row }) => {
        const u = row.original;
        return (
          <div className="flex items-center gap-3">
            <UserAvatar src={u.avatarUrl} name={u.fullName} size="sm" />
            <div>
              <Link
                prefetch
                href={`/admin/members/${getMemberIdentifier(u)}`}
                className="font-semibold text-gray-900 text-sm hover:text-heritage-red block"
              >
                {u.fullName}
              </Link>
              <span className="text-[11px] text-gray-500 font-mono">{u.email}</span>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'role',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Assigned Role" />,
      cell: ({ row }) => (
        <span className="inline-block bg-gray-100 text-gray-800 text-[10px] font-bold px-2 py-0.5 rounded uppercase">
          {row.original.role}
        </span>
      ),
    },
    {
      accessorKey: 'maxBorrowLimit',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Borrow Quota" />,
      cell: ({ row }) => (
        <span className="font-mono text-gray-700 font-semibold">
          {row.original.maxBorrowLimit || 5} Books
        </span>
      ),
    },
    {
      accessorKey: 'status',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
      cell: ({ row }) => {
        const status = row.original.status;
        return (
          <Badge variant={status === 'ACTIVE' ? 'success' : 'destructive'}>
            {status}
          </Badge>
        );
      },
    },
    {
      id: 'actions',
      header: () => <div className="text-right">Actions</div>,
      cell: ({ row }) => {
        const u = row.original;
        return (
          <div className="text-right">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0 cursor-pointer">
                  <span className="sr-only">Open menu</span>
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuLabel>Member Actions</DropdownMenuLabel>
                <DropdownMenuItem asChild>
                  <Link prefetch href={`/admin/members/${getMemberIdentifier(u)}`} className="cursor-pointer">
                    <Eye className="mr-2 h-4 w-4" />
                    <span>View Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link prefetch href={`/admin/members/${getMemberIdentifier(u)}/edit`} className="cursor-pointer">
                    <Edit3 className="mr-2 h-4 w-4" />
                    <span>Edit Details</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleStatusToggle(u.id, u.status, u.fullName)}
                  className="cursor-pointer"
                >
                  {u.status === 'ACTIVE' ? (
                    <>
                      <UserX className="mr-2 h-4 w-4 text-amber-600" />
                      <span className="text-amber-600">Suspend Member</span>
                    </>
                  ) : (
                    <>
                      <UserCheck className="mr-2 h-4 w-4 text-emerald-600" />
                      <span className="text-emerald-600">Activate Member</span>
                    </>
                  )}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => handleDeleteMember(u.id, u.fullName)}
                  className="text-destructive focus:text-destructive cursor-pointer"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  <span>Delete Member</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ], []);

  return (
    <div className="space-y-6 font-sans pb-12 max-w-[1240px]">
      <PageHeader
        eyebrow="Library Operations · Members"
        title="Member Management"
        actions={
          <Button variant="default" asChild>
            <Link href="/admin/members/create">
              <Plus className="w-4 h-4 mr-1.5" />
              Create New Member
            </Link>
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
        <div className="bg-white border border-[#E2E0DB] p-4 rounded-xl shadow-sm">
          <span className="text-[11px] font-bold uppercase text-gray-500 block">Total Members</span>
          <span className="text-2xl font-bold text-gray-900 mt-1 block">{users.length}</span>
          <span className="text-[11px] text-gray-500">Registered in directory</span>
        </div>
        <div className="bg-white border border-[#E2E0DB] p-4 rounded-xl shadow-sm">
          <span className="text-[11px] font-bold uppercase text-gray-500 block">Active Status</span>
          <span className="text-2xl font-bold text-emerald-700 mt-1 block">
            {users.filter((u) => u.status === 'ACTIVE').length}
          </span>
          <span className="text-[11px] text-emerald-600">Eligible to borrow</span>
        </div>
        <div className="bg-white border border-[#E2E0DB] p-4 rounded-xl shadow-sm">
          <span className="text-[11px] font-bold uppercase text-gray-500 block">Suspended</span>
          <span className="text-2xl font-bold text-heritage-red mt-1 block">
            {users.filter((u) => u.status === 'SUSPENDED').length}
          </span>
          <span className="text-[11px] text-heritage-red">Hold on circulation</span>
        </div>
        <div className="bg-white border border-[#E2E0DB] p-4 rounded-xl shadow-sm">
          <span className="text-[11px] font-bold uppercase text-gray-500 block">Faculty &amp; Fellows</span>
          <span className="text-2xl font-bold text-gray-900 mt-1 block">
            {users.filter((u) => u.role === 'FACULTY' || u.role === 'RESEARCHER').length}
          </span>
          <span className="text-[11px] text-gray-500">Extended research quotas</span>
        </div>
      </div>

      {/* TanStack Members Data Table */}
      <DataTable
        columns={columns}
        data={filteredUsers}
        loading={loading}
        enableRowSelection
        searchKey="fullName"
        searchPlaceholder="Filter members by name or membership #..."
        emptyTitle="No members found"
        emptyMessage="Try adjusting your search criteria or register a new member."
        facetedFilters={[
          {
            columnId: 'status',
            title: 'Status',
            options: [
              { label: 'Active', value: 'ACTIVE' },
              { label: 'Suspended', value: 'SUSPENDED' },
            ],
          },
          {
            columnId: 'role',
            title: 'Role',
            options: [
              { label: 'Student', value: 'STUDENT' },
              { label: 'Faculty', value: 'FACULTY' },
              { label: 'Researcher', value: 'RESEARCHER' },
              { label: 'Librarian', value: 'LIBRARIAN' },
              { label: 'Admin', value: 'SUPER_ADMIN' },
            ],
          },
        ]}
        bulkActions={[
          {
            label: "Export Selected",
            variant: "outline",
            onClick: (selected) => {
              const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(selected, null, 2));
              const downloadAnchor = document.createElement('a');
              downloadAnchor.setAttribute("href", dataStr);
              downloadAnchor.setAttribute("download", `members_export_${new Date().toISOString().slice(0, 10)}.json`);
              document.body.appendChild(downloadAnchor);
              downloadAnchor.click();
              downloadAnchor.remove();
            },
          },
        ]}
      />
    </div>
  );
}
