'use client';

import { useState, useEffect, useMemo } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { Plus, FileCheck, ArrowRight, MoreHorizontal, Send } from 'lucide-react';
import { PageHeader } from '@/components/admin/ui';
import { DataTable, DataTableColumnHeader } from '@/components/ui/data-table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { api } from '@/lib/api';
import { toast } from 'sonner';

interface Submission {
  id: string;
  title: string;
  type: string;
  authorName: string;
  advisorName?: string;
  departmentName?: string;
  stage: 'DRAFT' | 'REVIEW' | 'APPROVED' | 'PUBLISHED' | 'ARCHIVED';
  doi?: string;
  createdAt: string;
}

const STAGE_ORDER = ['DRAFT', 'REVIEW', 'APPROVED', 'PUBLISHED', 'ARCHIVED'] as const;
const NEXT_STAGE: Record<string, string> = { DRAFT: 'REVIEW', REVIEW: 'APPROVED', APPROVED: 'PUBLISHED' };

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function RepositoryAdminPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [actingId, setActingId] = useState<string | null>(null);

  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [type, setType] = useState('THESIS');
  const [authorName, setAuthorName] = useState('');
  const [advisorName, setAdvisorName] = useState('');
  const [departmentName, setDepartmentName] = useState('');
  const [doi, setDoi] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const data = await api.getRepositorySubmissions();
      setSubmissions(data || []);
    } catch {
      toast.error('Could not load repository submissions from the server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleAdvanceStage = async (s: Submission) => {
    const next = NEXT_STAGE[s.stage];
    if (!next) return;
    setActingId(s.id);
    try {
      await api.updateRepositorySubmissionStage(s.id, next);
      toast.success(`"${s.title}" moved to ${next}.`);
      await load();
    } catch (err: any) {
      toast.error(err.message || 'Could not update stage.');
    } finally {
      setActingId(null);
    }
  };

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.createRepositorySubmission({
        title,
        type,
        authorName,
        advisorName: advisorName || undefined,
        departmentName: departmentName || undefined,
        doi: doi || undefined,
      });
      toast.success(`"${title}" deposited as a draft submission.`);
      setShowModal(false);
      setTitle('');
      setAuthorName('');
      setAdvisorName('');
      setDepartmentName('');
      setDoi('');
      await load();
    } catch (err: any) {
      toast.error(err.message || 'Could not deposit this submission.');
    } finally {
      setSubmitting(false);
    }
  };

  const stageCounts = STAGE_ORDER.reduce(
    (acc, s) => ({ ...acc, [s]: submissions.filter((x) => x.stage === s).length }),
    {} as Record<string, number>
  );

  const columns = useMemo<ColumnDef<Submission>[]>(
    () => [
      {
        id: 'select',
        header: ({ table }) => (
          <Checkbox
            checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')}
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
            aria-label="Select all"
            className="translate-y-[2px]"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
            className="translate-y-[2px]"
          />
        ),
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorKey: 'title',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Title & DOI" />,
        cell: ({ row }) => {
          const s = row.original;
          return (
            <div className="space-y-0.5">
              <div className="font-semibold text-sm text-foreground">{s.title}</div>
              {s.doi && <div className="text-muted-foreground text-xs font-mono">DOI: {s.doi}</div>}
            </div>
          );
        },
      },
      {
        accessorKey: 'type',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Type & Dept" />,
        cell: ({ row }) => {
          const s = row.original;
          return (
            <div>
              <Badge variant="outline" className="text-[10px] font-semibold mb-0.5">
                {s.type}
              </Badge>
              <div className="text-muted-foreground text-xs">{s.departmentName || '—'}</div>
            </div>
          );
        },
        filterFn: (row, id, value) => value.includes(row.getValue(id)),
      },
      {
        accessorKey: 'authorName',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Author & Advisor" />,
        cell: ({ row }) => {
          const s = row.original;
          return (
            <div>
              <div className="font-semibold text-foreground text-xs">{s.authorName}</div>
              {s.advisorName && <div className="text-muted-foreground text-xs">Adv: {s.advisorName}</div>}
            </div>
          );
        },
      },
      {
        accessorKey: 'stage',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Workflow Stage" />,
        cell: ({ row }) => {
          const stage = row.getValue('stage') as Submission['stage'];
          return (
            <Badge
              variant={
                stage === 'PUBLISHED'
                  ? 'success'
                  : stage === 'APPROVED'
                  ? 'default'
                  : stage === 'REVIEW'
                  ? 'warning'
                  : 'neutral'
              }
            >
              {stage}
            </Badge>
          );
        },
        filterFn: (row, id, value) => value.includes(row.getValue(id)),
      },
      {
        accessorKey: 'createdAt',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Submitted" />,
        cell: ({ row }) => (
          <div className="text-muted-foreground text-xs">{formatDate(row.getValue('createdAt'))}</div>
        ),
      },
      {
        id: 'actions',
        header: () => <div className="text-right">Actions</div>,
        cell: ({ row }) => {
          const s = row.original;
          return (
            <div className="text-right">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    disabled={actingId === s.id}
                    className="h-8 w-8 p-0 inline-flex items-center justify-center rounded-md hover:bg-gray-100 text-gray-500 hover:text-gray-900 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <span className="sr-only">Open menu</span>
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuLabel>Workflow Actions</DropdownMenuLabel>
                  {s.stage === 'REVIEW' && (
                    <DropdownMenuItem onClick={() => handleAdvanceStage(s)} className="cursor-pointer">
                      <FileCheck className="mr-2 h-4 w-4 text-emerald-600" />
                      <span>Approve Submission</span>
                    </DropdownMenuItem>
                  )}
                  {s.stage === 'APPROVED' && (
                    <DropdownMenuItem onClick={() => handleAdvanceStage(s)} className="cursor-pointer">
                      <ArrowRight className="mr-2 h-4 w-4 text-heritage-red" />
                      <span>Publish to Repository</span>
                    </DropdownMenuItem>
                  )}
                  {s.stage === 'DRAFT' && (
                    <DropdownMenuItem onClick={() => handleAdvanceStage(s)} className="cursor-pointer">
                      <Send className="mr-2 h-4 w-4 text-blue-600" />
                      <span>Send to Review</span>
                    </DropdownMenuItem>
                  )}
                  {s.stage === 'PUBLISHED' && (
                    <DropdownMenuItem disabled className="text-xs text-muted-foreground">
                      Published Item
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          );
        },
      },
    ],
    [actingId]
  );

  return (
    <div className="space-y-6 font-sans pb-12 max-w-[1280px]">
      <PageHeader
        eyebrow="Scholarly Output"
        title="Institutional Repository & Theses"
        description="Track academic submissions (theses, dissertations, faculty articles, datasets) through the publishing workflow."
        actions={
          <Button variant="default" onClick={() => setShowModal(true)}>
            <Plus className="w-4 h-4 mr-1.5" />
            Deposit Academic Work
          </Button>
        }
      />

      {/* Workflow Stage Progress Banner */}
      <div className="bg-muted/40 border border-border rounded-lg p-4">
        <span className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider block mb-2">
          Publishing Workflow Pipeline
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-xs font-semibold">
          <div className="p-2.5 bg-background rounded-md border border-border text-foreground">
            1. Draft ({stageCounts.DRAFT || 0})
          </div>
          <div className="p-2.5 bg-amber-500/10 rounded-md border border-amber-500/30 text-amber-700 dark:text-amber-400">
            2. Review ({stageCounts.REVIEW || 0})
          </div>
          <div className="p-2.5 bg-blue-500/10 rounded-md border border-blue-500/30 text-blue-700 dark:text-blue-400">
            3. Approved ({stageCounts.APPROVED || 0})
          </div>
          <div className="p-2.5 bg-emerald-500/10 rounded-md border border-emerald-500/30 text-emerald-700 dark:text-emerald-400">
            4. Published ({stageCounts.PUBLISHED || 0})
          </div>
          <div className="p-2.5 bg-muted rounded-md border border-border text-muted-foreground">
            5. Archived ({stageCounts.ARCHIVED || 0})
          </div>
        </div>
      </div>

      {/* TanStack Table */}
      <DataTable
        columns={columns}
        data={submissions}
        searchKey="title"
        searchPlaceholder="Search repository titles, authors, or DOI..."
        isLoading={loading}
        facetedFilters={[
          {
            columnId: 'stage',
            title: 'Stage',
            options: [
              { label: 'Draft', value: 'DRAFT' },
              { label: 'Review', value: 'REVIEW' },
              { label: 'Approved', value: 'APPROVED' },
              { label: 'Published', value: 'PUBLISHED' },
              { label: 'Archived', value: 'ARCHIVED' },
            ],
          },
          {
            columnId: 'type',
            title: 'Type',
            options: [
              { label: 'Thesis', value: 'THESIS' },
              { label: 'Dissertation', value: 'DISSERTATION' },
              { label: 'Faculty Paper', value: 'FACULTY_PAPER' },
              { label: 'Dataset', value: 'DATASET' },
            ],
          },
        ]}
      />

      {/* Dialog: Deposit Academic Work */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Deposit Academic Work</DialogTitle>
            <DialogDescription>
              Register a new student thesis, faculty research paper, or digital dataset into the repository.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleDeposit} className="space-y-3.5 py-2 text-xs">
            <div className="space-y-1.5">
              <Label htmlFor="dep-title">
                Title <span className="text-destructive">*</span>
              </Label>
              <Input
                id="dep-title"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Arabi-Malayalam Linguistic Transformations in Early 20th Century Malabar"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="dep-type">Type</Label>
                <select
                  id="dep-type"
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full border border-input h-10 px-3 rounded-md text-xs bg-background text-foreground outline-none"
                >
                  <option value="THESIS">Thesis</option>
                  <option value="DISSERTATION">Dissertation</option>
                  <option value="FACULTY_PAPER">Faculty Paper</option>
                  <option value="DATASET">Dataset</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="dep-doi">DOI (Optional)</Label>
                <Input
                  id="dep-doi"
                  value={doi}
                  onChange={(e) => setDoi(e.target.value)}
                  placeholder="10.1000/182"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="dep-author">
                Author <span className="text-destructive">*</span>
              </Label>
              <Input
                id="dep-author"
                required
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                placeholder="e.g. Dr. K. M. Rasheed"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="dep-advisor">Advisor (Optional)</Label>
                <Input
                  id="dep-advisor"
                  value={advisorName}
                  onChange={(e) => setAdvisorName(e.target.value)}
                  placeholder="e.g. Prof. O. Aboobacker"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="dep-dept">Department</Label>
                <Input
                  id="dep-dept"
                  value={departmentName}
                  onChange={(e) => setDepartmentName(e.target.value)}
                  placeholder="e.g. Islamic History & Manuscriptology"
                />
              </div>
            </div>

            <DialogFooter className="pt-3">
              <Button type="button" variant="outline" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Depositing…' : 'Deposit'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
