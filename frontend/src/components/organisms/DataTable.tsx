import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  ChevronRight,
  Search,
  X,
  Filter,
  SlidersHorizontal,
  Check,
  GripVertical,
} from 'lucide-react';
import { MicroLabel } from '../atoms/MicroLabel';
import { Card } from '../atoms/Card';

export type FilterType = 'text' | 'select-list';

export interface FilterConfig {
  type: FilterType;
  placeholder?: string;
  options?: string[];
  label?: string;
}

export interface ColumnDef<T> {
  id: string;
  header: string;
  render: (row: T) => React.ReactNode;
  sortValue?: (row: T) => string | number;
  /** Enables the per-header inline text search icon; matched against `searchValue` (defaults to `sortValue`). */
  searchable?: boolean;
  searchValue?: (row: T) => string;
  /** false = always shown, excluded from the column chooser (e.g. name/primary columns). Defaults to true. */
  hideable?: boolean;
  defaultVisible?: boolean;
  align?: 'left' | 'right' | 'center';
  headerClassName?: string;
  cellClassName?: string;
  /** Explicit filter control in the filter panel; auto-generated from data when omitted and `filterable` is true. */
  filter?: FilterConfig;
  filterable?: boolean;
  filterPredicate?: (row: T, value: any) => boolean;
}

type SortDir = 'asc' | 'desc';
interface SortState {
  colId: string;
  dir: SortDir;
}

export interface DataTableProps<T> {
  columns: ColumnDef<T>[];
  data: T[];
  getRowKey: (row: T) => string;
  /** Row click navigates/selects. Mutually exclusive with `renderExpanded` (expand takes priority). */
  onRowClick?: (row: T) => void;
  /** When provided, rows toggle an inline expanded panel instead of navigating on click. */
  renderExpanded?: (row: T) => React.ReactNode;
  isRowExpanded?: (row: T) => boolean;
  onToggleExpand?: (row: T) => void;
  rowClassName?: (row: T) => string;
  emptyState?: React.ReactNode;
  /** Rendered on the right side of the toolbar (e.g. a page's "Create X" button). */
  tableCta?: React.ReactNode;
  /** Hides the filter/columns toolbar row — for compact tables with no filterable columns. */
  hideToolbar?: boolean;
}

function isFilterActive(value: any): boolean {
  if (value === undefined || value === null) return false;
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === 'string') return value.trim().length > 0;
  return false;
}

export function DataTable<T extends object>({
  columns,
  data,
  getRowKey,
  onRowClick,
  renderExpanded,
  isRowExpanded,
  onToggleExpand,
  rowClassName,
  emptyState,
  tableCta,
  hideToolbar,
}: DataTableProps<T>) {
  const isExpandable = !!renderExpanded;

  const [columnOrder, setColumnOrder] = useState<string[]>(() => columns.map(c => c.id));
  const [hiddenCols, setHiddenCols] = useState<Set<string>>(
    () => new Set(columns.filter(c => c.defaultVisible === false).map(c => c.id))
  );
  const [sortState, setSortState] = useState<SortState | null>(null);
  const [colSearches, setColSearches] = useState<Record<string, string>>({});
  const [filterValues, setFilterValues] = useState<Record<string, any>>({});
  const [listSearches, setListSearches] = useState<Record<string, string>>({});
  const [openSearchCol, setOpenSearchCol] = useState<string | null>(null);
  const [showColumnChooser, setShowColumnChooser] = useState(false);
  const [showFilterPanel, setShowFilterPanel] = useState(false);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const chooserRef = useRef<HTMLDivElement>(null);
  const dragColId = useRef<string | null>(null);

  const colIdsKey = useMemo(() => columns.map(c => c.id).join(','), [columns]);

  useEffect(() => {
    setColumnOrder(columns.map(c => c.id));
    setHiddenCols(new Set(columns.filter(c => c.defaultVisible === false).map(c => c.id)));
    setColSearches({});
    setFilterValues({});
    setListSearches({});
    setSortState(null);
  }, [colIdsKey]);

  useEffect(() => {
    if (openSearchCol) setTimeout(() => searchInputRef.current?.focus(), 0);
  }, [openSearchCol]);

  useEffect(() => {
    if (!showColumnChooser) return;
    const handler = (e: MouseEvent) => {
      if (chooserRef.current && !chooserRef.current.contains(e.target as Node)) setShowColumnChooser(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showColumnChooser]);

  const handleHeaderClick = (col: ColumnDef<T>) => {
    if (!col.sortValue) return;
    setSortState(prev => {
      if (!prev || prev.colId !== col.id) return { colId: col.id, dir: 'desc' };
      if (prev.dir === 'desc') return { colId: col.id, dir: 'asc' };
      return null;
    });
  };

  const handleSearchIcon = (colId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setOpenSearchCol(prev => (prev === colId ? null : colId));
  };

  const clearColSearch = (colId: string) => {
    setColSearches(prev => {
      const n = { ...prev };
      delete n[colId];
      return n;
    });
  };

  const clearAllFilters = () => {
    setColSearches({});
    setFilterValues({});
  };

  const handleDragStart = (e: React.DragEvent, colId: string) => {
    dragColId.current = colId;
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnter = (colId: string) => {
    const from = dragColId.current;
    if (!from || from === colId) return;
    const fromDef = columns.find(c => c.id === from);
    const toDef = columns.find(c => c.id === colId);
    if (fromDef?.hideable === false || toDef?.hideable === false) return;
    setColumnOrder(prev => {
      const next = [...prev];
      const fi = next.indexOf(from);
      const ti = next.indexOf(colId);
      if (fi === -1 || ti === -1) return prev;
      next.splice(fi, 1);
      next.splice(ti, 0, from);
      return next;
    });
  };

  // Auto-generate a filter control for any column marked `filterable` without an explicit `filter` config.
  const effectiveColumns = useMemo(() => {
    return columns.map(col => {
      if (!col.filterable || col.filter) return col;

      const getVal = col.sortValue ?? col.searchValue;
      const uniqueVals = getVal
        ? Array.from(new Set(data.map(r => String(getVal(r) ?? '')).filter(Boolean)))
        : [];

      const filterCfg: FilterConfig =
        uniqueVals.length > 0 && uniqueVals.length <= 10
          ? { type: 'select-list', label: col.header, options: uniqueVals }
          : { type: 'text', label: col.header, placeholder: `Filter ${col.header}...` };

      return {
        ...col,
        filter: filterCfg,
        filterPredicate:
          col.filterPredicate ||
          ((row: T, val: any) => {
            const rowVal = getVal ? getVal(row) : '';
            if (filterCfg.type === 'select-list' && Array.isArray(val)) {
              return val.length === 0 || val.includes(String(rowVal));
            }
            if (typeof val === 'string' && val.trim().length > 0) {
              return String(rowVal ?? '').toLowerCase().includes(val.toLowerCase());
            }
            return true;
          }),
      };
    });
  }, [columns, data]);

  const processedData = useMemo(() => {
    let result = data;

    const activeSearches = Object.entries(colSearches).filter(([, v]) => v.trim());
    if (activeSearches.length > 0) {
      result = result.filter(row =>
        activeSearches.every(([colId, term]) => {
          const col = effectiveColumns.find(c => c.id === colId);
          const getVal = col?.searchValue ?? col?.sortValue;
          return getVal ? String(getVal(row)).toLowerCase().includes(term.toLowerCase()) : true;
        })
      );
    }

    const activeTyped = Object.entries(filterValues).filter(([, v]) => isFilterActive(v));
    if (activeTyped.length > 0) {
      result = result.filter(row =>
        activeTyped.every(([colId, value]) => {
          const col = effectiveColumns.find(c => c.id === colId);
          return col?.filterPredicate ? col.filterPredicate(row, value) : true;
        })
      );
    }

    if (sortState) {
      const col = effectiveColumns.find(c => c.id === sortState.colId);
      if (col?.sortValue) {
        result = [...result].sort((a, b) => {
          const av = col.sortValue!(a);
          const bv = col.sortValue!(b);
          const cmp = typeof av === 'string' ? av.localeCompare(String(bv)) : Number(av) - Number(bv);
          return sortState.dir === 'asc' ? cmp : -cmp;
        });
      }
    }

    return result;
  }, [data, colSearches, filterValues, sortState, effectiveColumns]);

  const visibleCols = columnOrder
    .filter(id => !hiddenCols.has(id))
    .map(id => effectiveColumns.find(c => c.id === id))
    .filter((c): c is ColumnDef<T> => !!c);

  const keyColumns = effectiveColumns.filter(c => c.hideable === false);
  const hideableColumnsOrdered = columnOrder
    .filter(id => effectiveColumns.find(c => c.id === id)?.hideable !== false)
    .map(id => effectiveColumns.find(c => c.id === id))
    .filter((c): c is ColumnDef<T> => !!c);

  const filterCols = effectiveColumns.filter(c => c.filter);
  const activeSearchCount = Object.values(colSearches).filter(v => v.trim()).length;
  const activeTypedCount = Object.values(filterValues).filter(isFilterActive).length;
  const activeFilterCount = activeSearchCount + activeTypedCount;

  const toggleCol = (colId: string) =>
    setHiddenCols(prev => {
      const next = new Set(prev);
      if (next.has(colId)) next.delete(colId);
      else next.add(colId);
      return next;
    });

  const alignClass = (col: ColumnDef<T>) =>
    col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : '';

  const rowIsInteractive = !!onRowClick || isExpandable;
  const totalColSpan = visibleCols.length + (rowIsInteractive ? 1 : 0);

  const handleRowClick = (row: T) => {
    if (isExpandable) onToggleExpand?.(row);
    else onRowClick?.(row);
  };

  const renderFilterControl = (col: ColumnDef<T>) => {
    const cfg = col.filter!;
    const label = cfg.label || col.header;
    const isHidden = hiddenCols.has(col.id);

    const labelEl = (
      <MicroLabel tone="muted" as="label" className="flex items-center gap-1.5">
        {label}
        {isHidden && <span className="text-[9px] text-ink-muted font-medium normal-case tracking-normal">(hidden)</span>}
      </MicroLabel>
    );

    if (cfg.type === 'text') {
      return (
        <div className="flex flex-col gap-1.5">
          {labelEl}
          <div className="relative">
            <input
              type="text"
              value={colSearches[col.id] || ''}
              onChange={e => setColSearches(prev => ({ ...prev, [col.id]: e.target.value }))}
              placeholder={cfg.placeholder || 'Search…'}
              className="w-full text-xs px-3 py-2 pr-7 rounded-level2 border border-input bg-surface placeholder:text-ink-muted text-ink-primary focus:outline-none focus:ring-2 focus:ring-focus/20 focus:border-brand-navy/30 transition-all"
            />
            {colSearches[col.id] && (
              <button
                onClick={() => clearColSearch(col.id)}
                aria-label={`Clear ${label} search`}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink-secondary focus:outline-none focus-visible:ring-2 focus-visible:ring-focus rounded"
              >
                <X size={11} aria-hidden="true" />
              </button>
            )}
          </div>
        </div>
      );
    }

    // select-list
    const selected: string[] = filterValues[col.id] || [];
    const ls = listSearches[col.id] || '';
    const opts = (cfg.options || []).filter(o => o.toLowerCase().includes(ls.toLowerCase()));
    return (
      <div className="flex flex-col gap-1.5">
        {labelEl}
        <div className="border border-input rounded-level2 overflow-hidden bg-surface">
          <div className="relative border-b border-surface-border">
            <Search size={11} aria-hidden="true" className="absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-muted pointer-events-none" />
            <input
              type="text"
              value={ls}
              onChange={e => setListSearches(prev => ({ ...prev, [col.id]: e.target.value }))}
              placeholder="Search…"
              aria-label={`Search ${label} options`}
              className="w-full text-xs pl-7 pr-3 py-2 bg-transparent focus:outline-none text-ink-primary placeholder:text-ink-muted"
            />
          </div>
          <div className="max-h-28 overflow-y-auto py-1">
            {opts.length === 0 ? (
              <p className="px-3 py-2 text-xs text-ink-muted">No matches</p>
            ) : (
              opts.map(opt => {
                const isChecked = selected.includes(opt);
                return (
                  <button
                    key={opt}
                    onClick={() =>
                      setFilterValues(prev => {
                        const cur: string[] = prev[col.id] || [];
                        const next = isChecked ? cur.filter(x => x !== opt) : [...cur, opt];
                        if (!next.length) {
                          const n = { ...prev };
                          delete n[col.id];
                          return n;
                        }
                        return { ...prev, [col.id]: next };
                      })
                    }
                    aria-pressed={isChecked}
                    className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-brand-navy/[0.04] transition-colors text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-inset"
                  >
                    <div
                      aria-hidden="true"
                      className={`w-3.5 h-3.5 rounded-sm border-2 flex-shrink-0 flex items-center justify-center transition-colors ${
                        isChecked ? 'border-brand-navy bg-brand-navy' : 'border-brand-navy/30 bg-surface'
                      }`}
                    >
                      {isChecked && <Check size={9} className="text-white" />}
                    </div>
                    <span className={`text-xs ${isChecked ? 'text-ink-primary font-semibold' : 'text-ink-secondary'}`}>{opt}</span>
                  </button>
                );
              })
            )}
          </div>
          {selected.length > 0 && (
            <div className="border-t border-surface-border px-3 py-1.5 flex items-center justify-between">
              <span className="text-[10px] text-ink-muted">{selected.length} selected</span>
              <button
                onClick={() =>
                  setFilterValues(prev => {
                    const n = { ...prev };
                    delete n[col.id];
                    return n;
                  })
                }
                className="text-[10px] text-brand-coral hover:text-ink-primary font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-focus rounded"
              >
                Clear
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  const showToolbar = !hideToolbar && (filterCols.length > 0 || hideableColumnsOrdered.length > 0 || tableCta);

  return (
    <div className="space-y-3">
      {showToolbar && (
        <div className="flex items-center gap-2 justify-between flex-wrap">
          <div className="flex items-center gap-2">
            {filterCols.length > 0 && (
              <button
                onClick={() => setShowFilterPanel(p => !p)}
                title="Filters"
                aria-expanded={showFilterPanel}
                aria-controls="datatable-filter-panel"
                className={`flex items-center gap-2 px-3.5 py-2 rounded-level3 border text-[10px] font-bold uppercase tracking-wide transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-focus ${
                  showFilterPanel || activeFilterCount > 0
                    ? 'bg-brand-navy text-white border-brand-navy shadow-level1'
                    : 'bg-surface border-surface-border text-ink-secondary hover:text-brand-navy hover:border-brand-navy/20 shadow-level1'
                }`}
              >
                <Filter size={13} aria-hidden="true" />
                <span>Filter</span>
                {activeFilterCount > 0 && (
                  <span className="ml-0.5 text-[9px] font-bold bg-brand-coral text-white rounded-full w-4 h-4 flex items-center justify-center leading-none">
                    {activeFilterCount}
                  </span>
                )}
              </button>
            )}

            {hideableColumnsOrdered.length > 0 && (
              <div className="relative" ref={chooserRef}>
                <button
                  onClick={() => setShowColumnChooser(p => !p)}
                  onKeyDown={e => {
                    if (e.key === 'Escape') setShowColumnChooser(false);
                  }}
                  title="Choose columns"
                  aria-expanded={showColumnChooser}
                  aria-haspopup="true"
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-level3 border text-[10px] font-bold uppercase tracking-wide transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-focus ${
                    showColumnChooser
                      ? 'bg-brand-navy text-white border-brand-navy shadow-level1'
                      : 'bg-surface border-surface-border text-ink-secondary hover:text-brand-navy hover:border-brand-navy/20 shadow-level1'
                  }`}
                >
                  <SlidersHorizontal size={13} aria-hidden="true" />
                  <span>Columns</span>
                </button>

                {showColumnChooser && (
                  <Card
                    elevation="none"
                    className="absolute top-full left-0 mt-2 w-60 shadow-level4 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150"
                    role="menu"
                    onKeyDown={e => {
                      if (e.key === 'Escape') setShowColumnChooser(false);
                    }}
                  >
                    <div className="px-4 py-3 border-b border-surface-border">
                      <MicroLabel as="p" tier="title" tone="grey">
                        Show / Hide Columns
                      </MicroLabel>
                    </div>
                    <div className="py-2 max-h-80 overflow-y-auto">
                      {keyColumns.map(col => (
                        <div key={col.id} className="flex items-center gap-3 px-4 py-2 opacity-50">
                          <div className="w-3.5 flex-shrink-0" />
                          <div className="w-4 h-4 rounded-sm border-2 border-brand-navy bg-brand-navy flex items-center justify-center flex-shrink-0">
                            <Check size={10} className="text-white" />
                          </div>
                          <span className="text-xs font-medium text-ink-secondary flex-1">{col.header}</span>
                          <MicroLabel tier="label" tone="muted">
                            Fixed
                          </MicroLabel>
                        </div>
                      ))}
                      {hideableColumnsOrdered.map(col => {
                        const isHidden = hiddenCols.has(col.id);
                        return (
                          <div
                            key={col.id}
                            draggable
                            onDragStart={e => handleDragStart(e, col.id)}
                            onDragEnter={() => handleDragEnter(col.id)}
                            onDragEnd={() => {
                              dragColId.current = null;
                            }}
                            onDragOver={e => e.preventDefault()}
                            className="flex items-center gap-3 px-4 py-2.5 hover:bg-brand-navy/[0.02] cursor-default"
                          >
                            <GripVertical size={13} aria-hidden="true" className="text-brand-navy/25 cursor-grab active:cursor-grabbing flex-shrink-0" />
                            <button
                              onClick={() => toggleCol(col.id)}
                              aria-pressed={!isHidden}
                              aria-label={`${isHidden ? 'Show' : 'Hide'} ${col.header} column`}
                              className={`w-4 h-4 rounded-sm border-2 flex-shrink-0 flex items-center justify-center transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-focus ${
                                isHidden ? 'border-brand-navy/20 bg-surface' : 'border-brand-navy bg-brand-navy'
                              }`}
                            >
                              {!isHidden && <Check size={10} className="text-white" />}
                            </button>
                            <span className={`text-xs font-medium flex-1 ${isHidden ? 'text-ink-muted' : 'text-ink-primary'}`}>{col.header}</span>
                          </div>
                        );
                      })}
                    </div>
                  </Card>
                )}
              </div>
            )}
          </div>

          {tableCta && <div className="flex items-center gap-2">{tableCta}</div>}
        </div>
      )}

      {!hideToolbar && showFilterPanel && filterCols.length > 0 && (
        <Card className="overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150" id="datatable-filter-panel">
          <div className="px-5 py-3 border-b border-surface-border flex items-center justify-between">
            <MicroLabel as="p" tier="title" tone="grey">
              Filters
            </MicroLabel>
            {activeFilterCount > 0 && (
              <button
                onClick={clearAllFilters}
                className="text-xs text-brand-coral hover:text-ink-primary font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-focus rounded"
              >
                Clear all
              </button>
            )}
          </div>
          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {filterCols.map(col => (
              <div key={col.id}>{renderFilterControl(col)}</div>
            ))}
          </div>
        </Card>
      )}

      <div className="relative bg-surface rounded-level4 border border-surface-border shadow-level1 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-surface-border text-[10px] font-bold uppercase tracking-widest text-ink-secondary bg-brand-navy/[0.02] dark:bg-white/[0.02]">
                {visibleCols.map(col => {
                  const isSorted = sortState?.colId === col.id;
                  const isSearchOpen = openSearchCol === col.id;
                  const hasActiveSearch = !!colSearches[col.id]?.trim();
                  const hasActiveTypedFilter = isFilterActive(filterValues[col.id]);
                  const hasActiveFilter = hasActiveSearch || hasActiveTypedFilter;

                  return (
                    <th
                      key={col.id}
                      aria-sort={col.sortValue ? (isSorted ? (sortState!.dir === 'asc' ? 'ascending' : 'descending') : 'none') : undefined}
                      className={`py-3.5 px-4 select-none group/th ${col.headerClassName ?? ''} ${alignClass(col)}`}
                    >
                      <div className="flex items-center gap-1.5 min-w-0">
                        {col.sortValue ? (
                          <button
                            type="button"
                            onClick={() => handleHeaderClick(col)}
                            className="flex-1 min-w-0 flex items-center gap-1.5 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-focus rounded"
                          >
                            <span className="flex-1 truncate">{col.header}</span>
                            {hasActiveFilter && !isSorted && (
                              <span aria-hidden="true" className="w-1.5 h-1.5 rounded-full bg-brand-coral flex-shrink-0" />
                            )}
                            <span
                              aria-hidden="true"
                              className={`flex-shrink-0 transition-opacity ${
                                isSorted ? 'opacity-100 text-brand-navy dark:text-brand-blue' : 'opacity-0 group-hover/th:opacity-60'
                              }`}
                            >
                              {isSorted ? (
                                sortState!.dir === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
                              ) : (
                                <ArrowUpDown className="w-3 h-3" />
                              )}
                            </span>
                          </button>
                        ) : (
                          <>
                            <span className="flex-1 truncate">{col.header}</span>
                            {hasActiveFilter && <span aria-hidden="true" className="w-1.5 h-1.5 rounded-full bg-brand-coral flex-shrink-0" />}
                          </>
                        )}

                        {col.searchable && (
                          <button
                            onClick={e => handleSearchIcon(col.id, e)}
                            title="Search this column"
                            aria-label={`Search ${col.header} column`}
                            aria-expanded={isSearchOpen}
                            className={`flex-shrink-0 p-1.5 -m-1 rounded transition-all duration-100 hover:bg-brand-navy/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-focus ${
                              hasActiveSearch
                                ? 'opacity-100 text-brand-coral'
                                : 'opacity-0 group-hover/th:opacity-60 text-ink-secondary hover:!opacity-100'
                            }`}
                          >
                            <Search size={11} aria-hidden="true" />
                          </button>
                        )}
                      </div>

                      {isSearchOpen && (
                        <div className="mt-2 flex items-center gap-1 -mx-1 animate-in fade-in slide-in-from-top-1 duration-150" onClick={e => e.stopPropagation()}>
                          <input
                            ref={searchInputRef}
                            type="text"
                            value={colSearches[col.id] || ''}
                            onChange={e => setColSearches(prev => ({ ...prev, [col.id]: e.target.value }))}
                            onKeyDown={e => {
                              if (e.key === 'Escape') setOpenSearchCol(null);
                            }}
                            placeholder="Search…"
                            aria-label={`Search ${col.header} column`}
                            className="flex-1 min-w-0 text-xs font-normal normal-case tracking-normal px-2 py-1 rounded bg-brand-navy/[0.04] dark:bg-white/[0.06] border border-input focus:outline-none focus:ring-1 focus:ring-focus text-ink-primary placeholder:text-ink-muted"
                          />
                          <button
                            onClick={() => {
                              clearColSearch(col.id);
                              setOpenSearchCol(null);
                            }}
                            aria-label={`Clear and close ${col.header} search`}
                            className="text-ink-muted hover:text-ink-secondary flex-shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-focus rounded"
                          >
                            <X size={10} aria-hidden="true" />
                          </button>
                        </div>
                      )}
                    </th>
                  );
                })}
                {rowIsInteractive && <th className="w-8 py-3.5 pr-4" />}
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-navy/[0.04] dark:divide-white/[0.04]">
              {processedData.length === 0 ? (
                <tr>
                  <td colSpan={totalColSpan} className="py-12 text-center text-ink-secondary">
                    {activeFilterCount > 0 ? (
                      <>
                        No rows match the active filters.{' '}
                        <button onClick={clearAllFilters} className="text-brand-navy dark:text-brand-blue underline underline-offset-2 hover:text-ink-primary transition-colors">
                          Clear filters
                        </button>
                      </>
                    ) : (
                      emptyState ?? 'No rows to display.'
                    )}
                  </td>
                </tr>
              ) : (
                processedData.map(row => {
                  const key = getRowKey(row);
                  const expanded = isExpandable && isRowExpanded?.(row);
                  return (
                    <React.Fragment key={key}>
                      <tr
                        onClick={rowIsInteractive ? () => handleRowClick(row) : undefined}
                        onKeyDown={
                          rowIsInteractive
                            ? e => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                  e.preventDefault();
                                  handleRowClick(row);
                                }
                              }
                            : undefined
                        }
                        tabIndex={rowIsInteractive ? 0 : undefined}
                        className={`group transition-colors ${
                          rowIsInteractive
                            ? 'cursor-pointer hover:bg-brand-navy/[0.02] dark:hover:bg-white/[0.02] focus:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-inset'
                            : ''
                        } ${expanded ? 'bg-brand-navy/[0.015] dark:bg-white/[0.02]' : ''} ${rowClassName?.(row) ?? ''}`}
                      >
                        {visibleCols.map(col => (
                          <td key={col.id} className={`py-3 px-4 ${col.cellClassName ?? ''} ${alignClass(col)}`}>
                            {col.render(row)}
                          </td>
                        ))}
                        {rowIsInteractive && (
                          <td className="w-8 pr-4">
                            <ChevronRight
                              aria-hidden="true"
                              className={`w-4 h-4 text-ink-secondary/60 transition-transform ${expanded ? 'rotate-90' : ''} ${
                                onRowClick ? 'opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-150' : ''
                              }`}
                            />
                          </td>
                        )}
                      </tr>
                      {isExpandable && expanded && (
                        <tr>
                          <td colSpan={totalColSpan} className="p-0">
                            {renderExpanded!(row)}
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        <div className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-surface to-transparent sm:hidden" />
      </div>
    </div>
  );
}
