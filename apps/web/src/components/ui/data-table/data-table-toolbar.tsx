import * as React from "react"
import { Table } from "@tanstack/react-table"
import { Search, X, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DataTableViewOptions } from "@/components/ui/data-table/data-table-view-options"
import { DataTableFacetedFilter } from "@/components/ui/data-table/data-table-faceted-filter"

export interface FilterOption {
  label: string
  value: string
  icon?: React.ComponentType<{ className?: string }>
}

export interface FacetedFilterConfig {
  columnId: string
  title: string
  options: FilterOption[]
}

export interface BulkAction<TData> {
  label: string
  icon?: React.ComponentType<{ className?: string }>
  variant?: "default" | "destructive" | "outline" | "secondary"
  onClick: (selectedRows: TData[]) => void | Promise<void>
}

interface DataTableToolbarProps<TData> {
  table: Table<TData>
  searchKey?: string
  searchPlaceholder?: string
  facetedFilters?: FacetedFilterConfig[]
  bulkActions?: BulkAction<TData>[]
  actions?: React.ReactNode
}

export function DataTableToolbar<TData>({
  table,
  searchKey,
  searchPlaceholder = "Search...",
  facetedFilters = [],
  bulkActions = [],
  actions,
}: DataTableToolbarProps<TData>) {
  const isFiltered =
    table.getState().columnFilters.length > 0 || !!table.getState().globalFilter
  const selectedRows = table.getFilteredSelectedRowModel().rows.map((r) => r.original)
  const hasSelection = selectedRows.length > 0

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 border-b border-gray-100 bg-white">
      <div className="flex flex-1 flex-wrap items-center gap-2">
        {searchKey ? (
          <div className="relative w-full sm:w-64 max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={searchPlaceholder}
              value={(table.getColumn(searchKey)?.getFilterValue() as string) ?? ""}
              onChange={(event) =>
                table.getColumn(searchKey)?.setFilterValue(event.target.value)
              }
              className="h-9 pl-9 bg-white text-xs"
            />
          </div>
        ) : (
          <div className="relative w-full sm:w-64 max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={searchPlaceholder}
              value={(table.getState().globalFilter as string) ?? ""}
              onChange={(event) => table.setGlobalFilter(event.target.value)}
              className="h-9 pl-9 bg-white text-xs"
            />
          </div>
        )}

        {facetedFilters.map((filter) => {
          const col = table.getColumn(filter.columnId)
          if (!col) return null
          return (
            <DataTableFacetedFilter
              key={filter.columnId}
              column={col}
              title={filter.title}
              options={filter.options}
            />
          )
        })}

        {isFiltered && (
          <Button
            variant="ghost"
            onClick={() => {
              table.resetColumnFilters()
              table.setGlobalFilter("")
            }}
            className="h-9 px-2.5 text-xs text-muted-foreground hover:text-gray-900"
          >
            Reset
            <X className="ml-2 h-3.5 w-3.5" />
          </Button>
        )}
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {hasSelection && bulkActions.length > 0 && (
          <div className="flex items-center gap-2 bg-red-50/80 border border-red-200 px-2.5 py-1 rounded-lg">
            <span className="text-xs font-semibold text-heritage-red mr-1">
              {selectedRows.length} selected:
            </span>
            {bulkActions.map((action, idx) => {
              const ActionIcon = action.icon || Trash2
              return (
                <Button
                  key={idx}
                  size="sm"
                  variant={action.variant || "destructive"}
                  className="h-7 text-xs px-2.5 gap-1.5"
                  onClick={() => action.onClick(selectedRows)}
                >
                  <ActionIcon className="w-3.5 h-3.5" />
                  <span>{action.label}</span>
                </Button>
              )
            })}
          </div>
        )}

        {actions}
        <DataTableViewOptions table={table} />
      </div>
    </div>
  )
}
