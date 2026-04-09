// FILE: src/components/ui/advanced-table.tsx
'use client';

import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuItem, DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuSubContent } from '@/components/ui/dropdown-menu';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ArrowUp, ArrowDown, ArrowUpDown, ListFilter, Download, FileJson, Search, FileText, Filter, Layers } from 'lucide-react';
import { getColumnValue, exportTableToJSON, exportTableToTSV } from '@/utils/exportData';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';
import { Label } from './label';

// --- TYPE DEFINITIONS ---

export interface ColumnDef<T> {
    accessorKey: keyof T | 'actions';
    header: React.ReactNode;
    // Backward-compatible: support both raw row and TanStack-like props
    cell?: (row: T) => React.ReactNode;
    cellProps?: (props: { row: { original: T } }) => React.ReactNode;
    isSortable?: boolean;
    isDefaultVisible?: boolean;
    type?: 'string' | 'number' | 'date';
    id?: string;
}

export interface AdvancedTableProps<T extends Record<string, any>> {
    data: T[];
    columns: ColumnDef<T>[];
    sortConfig?: { key: keyof T; direction: 'asc' | 'desc' } | null;
    onSortChange?: (config: { key: keyof T; direction: 'asc' | 'desc' } | null) => void;
    selectedRowId?: string | null;
    groupBy?: (keyof T)[];
    onGroupByChange?: (keys: (keyof T)[]) => void;
    onRowClick?: (row: T) => void;
    searchPlaceholder?: string;
    exportFileName?: string;
    cardTitle?: string;
    cardDescription?: string;
    defaultPageSize?: number;
    children?: React.ReactNode;
}

// --- FILTER TYPES ---

type Operator = '=' | '!=' | '>' | '>=' | '<' | '<=' | 'contains' | 'startsWith' | 'endsWith';

interface Filter<T> {
    column: keyof T;
    operator: Operator;
    value: string;
}

// --- RECURSIVE GROUPING LOGIC ---

function groupData<T extends Record<string, any>>(data: T[], groupByKeys: (keyof T)[]): Map<string, any> | T[] {
    if (groupByKeys.length === 0) return data;
    const [currentKey, ...restKeys] = groupByKeys;
    const grouped = new Map<string, T[]>();
    data.forEach(item => {
        const groupValue = String(item[currentKey] ?? 'Uncategorized');
        if (!grouped.has(groupValue)) grouped.set(groupValue, []);
        grouped.get(groupValue)!.push(item);
    });
    const result = new Map<string, any>();
    for (const [key, value] of grouped.entries()) {
        result.set(key, groupData(value, restKeys));
    }
    return result;
}

// --- IMPROVED SORT COMPARATOR ---

function getComparator<T>(key: keyof T, type?: 'string' | 'number' | 'date'): (a: T, b: T) => number {
    return (a, b) => {
        let aVal: any = a[key]; let bVal: any = b[key];
        if (type === 'date') { aVal = aVal ? new Date(aVal as string).getTime() : 0; bVal = bVal ? new Date(bVal as string).getTime() : 0; } 
        else if (type === 'number') { aVal = Number(aVal) || 0; bVal = Number(bVal) || 0; } 
        else { aVal = String(aVal).toLowerCase(); bVal = String(bVal).toLowerCase(); }
        if (aVal < bVal) return -1; if (aVal > bVal) return 1; return 0;
    };
}

// --- ADVANCED FILTER FUNCTION ---

function applyFilters<T>(data: T[], filters: Filter<T>[]): T[] {
    return data.filter(item => {
        return filters.every(filter => {
            const value = getColumnValue(item, filter.column as string);
            const filterValue = filter.value;
            switch (filter.operator) {
                case '=': return value == filterValue;
                case '!=': return value != filterValue;
                case '>': return value > filterValue;
                case '>=': return value >= filterValue;
                case '<': return value < filterValue;
                case '<=': return value <= filterValue;
                case 'contains': return String(value).toLowerCase().includes(filterValue.toLowerCase());
                case 'startsWith': return String(value).toLowerCase().startsWith(filterValue.toLowerCase());
                case 'endsWith': return String(value).toLowerCase().endsWith(filterValue.toLowerCase());
                default: return true;
            }
        });
    });
}

// --- RECURSIVE RENDERING COMPONENT ---

interface RenderGroupProps<T> {
    groupData: Map<string, any> | T[];
    level: number;
    columns: ColumnDef<T>[];
    selectedRowId?: string | null;
    onRowClick?: (row: T) => void;
}

function RenderGroup<T extends Record<string, any>>({ groupData, level, columns, selectedRowId, onRowClick }: RenderGroupProps<T>) {
    if (Array.isArray(groupData)) {
        // Base case: Render the actual table rows
        // If level > 0, we're inside an accordion, so wrap in a table
        const rows = groupData.map((row, rowIndex) => (
            <TableRow 
                key={(row.id as string) || `row-${level}-${rowIndex}`}
                onClick={() => onRowClick?.(row)} 
                className={cn(
                    onRowClick && 'cursor-pointer',
                    selectedRowId === row.id 
                        ? 'bg-primary/10 hover:bg-primary/20' 
                        : 'hover:bg-muted/50'
                )}
            >
                {columns.map((col, colIndex) => (
                    <TableCell key={`${String(col.accessorKey)}-${colIndex}`}>
                        {col.cellProps
                            ? col.cellProps({ row: { original: row } })
                            : col.cell
                                ? col.cell(row)
                                : getColumnValue(row, col.accessorKey as string)}
                    </TableCell>
                ))}
            </TableRow>
        ));

        // If we're in a grouped context (level > 0), wrap with Table
        if (level > 0) {
            return (
                <Table>
                    <TableBody>{rows}</TableBody>
                </Table>
            );
        }

        // Otherwise, just return rows (parent already has Table/TableBody)
        return <>{rows}</>;
    }

    // Recursive step: Render accordion for each group
    return (
        <Accordion type="multiple" className="w-full">
            {Array.from(groupData.entries()).map(([groupKey, subGroupData], groupIndex) => (
                <AccordionItem value={groupKey} key={`group-${level}-${groupIndex}`} className="border-none">
                    <AccordionTrigger
                        className="p-2 font-semibold bg-muted/50 hover:bg-muted"
                        style={{ paddingLeft: `${level * 1.5 + 0.5}rem` }}
                    >
                        {groupKey} ({Array.isArray(subGroupData) ? subGroupData.length : subGroupData.size})
                    </AccordionTrigger>
                    <AccordionContent className="p-0">
                        <RenderGroup groupData={subGroupData} level={level + 1} columns={columns} selectedRowId={selectedRowId} onRowClick={onRowClick} />
                    </AccordionContent>
                </AccordionItem>
            ))}
        </Accordion>
    );
}

// --- PAGINATION COMPONENT ---

interface PaginationProps { currentPage: number; totalPages: number; onPageChange: (page: number) => void; }

function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
    const { t } = useTranslation();
    return (
        <div className="flex items-center justify-end space-x-2 px-4 py-2 border-t">
            <Button variant="outline" size="sm" onClick={() => onPageChange(1)} disabled={currentPage === 1}><ChevronsLeft className="h-4 w-4" /></Button>
            <Button variant="outline" size="sm" onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1}><ChevronLeft className="h-4 w-4" /></Button>
            <span className="text-sm text-muted-foreground">{t('advancedTable.pageLabel', { current: currentPage, total: totalPages })}</span>
            <Button variant="outline" size="sm" onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages}><ChevronRight className="h-4 w-4" /></Button>
            <Button variant="outline" size="sm" onClick={() => onPageChange(totalPages)} disabled={currentPage === totalPages}><ChevronsRight className="h-4 w-4" /></Button>
        </div>
    );
}

// --- ADVANCED FILTER SUB-COMPONENT (FIXED) ---
const AdvancedFilterSubContent: React.FC<{ col: ColumnDef<any>, onAddFilter: (column: any, operator: Operator, value: string) => void }> = ({ col, onAddFilter }) => {
    const [operator, setOperator] = useState<Operator>('contains');
    const [value, setValue] = useState('');
    const { t } = useTranslation();

    const handleAdd = () => {
        if (value.trim()) {
            onAddFilter(col.accessorKey, operator, value.trim());
        }
    };

    return (
        <div className="space-y-3">
            <div className="space-y-1">
                <Label htmlFor={`operator-${String(col.accessorKey)}`}>{t('advancedTable.operator')}</Label>
                <Select value={operator} onValueChange={(v: Operator) => setOperator(v)}>
                    <SelectTrigger id={`operator-${String(col.accessorKey)}`}><SelectValue /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="contains">{t('advancedTable.operators.contains')}</SelectItem>
                        <SelectItem value="=">{t('advancedTable.operators.equals')}</SelectItem>
                        <SelectItem value="!=">{t('advancedTable.operators.notEquals')}</SelectItem>
                        <SelectItem value="startsWith">{t('advancedTable.operators.startsWith')}</SelectItem>
                        <SelectItem value="endsWith">{t('advancedTable.operators.endsWith')}</SelectItem>
                        <SelectItem value=">">&gt;</SelectItem>
                        <SelectItem value=">=">&gt;=</SelectItem>
                        <SelectItem value="<">&lt;</SelectItem>
                        <SelectItem value="<=">&lt;=</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div className="space-y-1">
                <Label htmlFor={`value-${String(col.accessorKey)}`}>{t('advancedTable.value')}</Label>
                <Input id={`value-${String(col.accessorKey)}`} value={value} onChange={(e) => setValue(e.target.value)} />
            </div>
            <Button size="sm" className="w-full" onClick={handleAdd}>{t('advancedTable.addFilter')}</Button>
        </div>
    );
};

// --- MAIN ADVANCED TABLE COMPONENT ---

export function AdvancedTable<T extends Record<string, any>>({
    data, columns, selectedRowId, 
    groupBy: initialGroupBy = [], onGroupByChange, 
    onRowClick, searchPlaceholder = "Filter items...", 
    exportFileName = "export",
    cardTitle, cardDescription, defaultPageSize = 50, children,
    sortConfig: controlledSortConfig,
    onSortChange
}: AdvancedTableProps<T>) {
    const { t } = useTranslation();
    const [filterText, setFilterText] = useState('');
    
    // Internal state for uncontrolled sort
    const [internalSortConfig, setInternalSortConfig] = useState<{ key: keyof T; direction: 'asc' | 'desc' } | null>(null);

    const isControlled = controlledSortConfig !== undefined;
    const sortConfig = isControlled ? controlledSortConfig : internalSortConfig;
    const setSortConfig = onSortChange || setInternalSortConfig;

    const [columnVisibility, setColumnVisibility] = useState<Record<string, boolean>>(
        columns.reduce((acc, col) => ({ ...acc, [String(col.accessorKey)]: col.isDefaultVisible ?? true }), {})
    );
    const [filters, setFilters] = useState<Filter<T>[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [groupBy, setGroupBy] = useState<(keyof T)[]>(initialGroupBy);

    const visibleColumns = useMemo(() => columns.filter(col => columnVisibility[String(col.accessorKey)]), [columns, columnVisibility]);
    const groupableColumns = useMemo(() => columns.filter(col => col.isSortable), [columns]);

    const processedData = useMemo(() => {
        let filteredData = data;
        if (filterText) { filteredData = filteredData.filter(item => visibleColumns.some(col => String(getColumnValue(item, col.accessorKey as string)).toLowerCase().includes(filterText.toLowerCase()))); }
        filteredData = applyFilters(filteredData, filters);
        
        if (sortConfig !== null) {
            const col = columns.find(c => c.accessorKey === sortConfig.key);
            const comparator = getComparator(sortConfig.key, col?.type);
            filteredData = [...filteredData].sort((a, b) => { 
                const order = comparator(a, b); 
                return sortConfig.direction === 'asc' ? order : -order; 
            });
        }
        return groupBy.length > 0 ? groupData(filteredData, groupBy) : filteredData;
    }, [data, filterText, filters, sortConfig, visibleColumns, groupBy, columns]);

    const paginatedData = useMemo(() => {
        if (groupBy.length > 0) return processedData;
        const start = (currentPage - 1) * defaultPageSize;
        const end = start + defaultPageSize;
        return (processedData as T[]).slice(start, end);
    }, [processedData, currentPage, defaultPageSize, groupBy]);

    const totalItems = Array.isArray(processedData) ? processedData.length : data.length;
    const totalPages = Math.ceil(totalItems / defaultPageSize);

    const requestSort = (key: keyof T) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig?.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };
    const addFilter = (column: keyof T, operator: Operator, value: string) => { setFilters(prev => [...prev, { column, operator, value }]); setCurrentPage(1); };
    const removeFilter = (index: number) => { setFilters(prev => prev.filter((_, i) => i !== index)); setCurrentPage(1); };
    
    const handleGroupByChange = (key: keyof T) => {
        const newGroupBy = groupBy.includes(key) ? groupBy.filter(k => k !== key) : [...groupBy, key];
        setGroupBy(newGroupBy);
        onGroupByChange?.(newGroupBy);
    };

    return (
        <Card className="flex flex-col h-full">
            {(cardTitle || children) && (
                <CardHeader>
                    <div className="flex justify-between items-start">
                        <div>{cardTitle && <CardTitle>{cardTitle}</CardTitle>}{cardDescription && <CardDescription>{cardDescription}</CardDescription>}</div>
                        {children && <div>{children}</div>}
                    </div>
                </CardHeader>
            )}
            <CardContent className="p-0 flex-1 flex flex-col min-h-0">
                <div className="flex flex-wrap items-center justify-between gap-2 p-4 border-b">
                    <div className="relative flex-1"><Search aria-hidden className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" /><Input aria-label={t('advancedTable.searchPlaceholder')} placeholder={searchPlaceholder || t('advancedTable.searchPlaceholder')} value={filterText} onChange={(e) => setFilterText(e.target.value)} className="pl-8 max-w-sm" /></div>
                    <div className="flex items-center gap-2">
                        <DropdownMenu><DropdownMenuTrigger asChild><Button variant="outline" aria-label={t('advancedTable.columns')}><ListFilter aria-hidden className="mr-2 h-4 w-4" /> {t('advancedTable.columns')}</Button></DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuLabel>{t('advancedTable.toggleColumns')}</DropdownMenuLabel><DropdownMenuSeparator />
                                {columns.map((col) => (<DropdownMenuCheckboxItem key={String(col.accessorKey)} checked={columnVisibility[String(col.accessorKey)]} onCheckedChange={() => setColumnVisibility(prev => ({ ...prev, [String(col.accessorKey)]: !prev[String(col.accessorKey)] }))}>{col.header}</DropdownMenuCheckboxItem>))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                        <DropdownMenu><DropdownMenuTrigger asChild><Button variant="outline" aria-label={t('advancedTable.advancedFilters')}><Filter aria-hidden className="mr-2 h-4 w-4" /> {t('advancedTable.advancedFilters')}</Button></DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-64">
                                <DropdownMenuLabel>{t('advancedTable.activeFilters', { count: filters.length })}</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                {filters.map((f, i) => (<DropdownMenuItem key={i} onClick={() => removeFilter(i)}>{String(f.column)} {f.operator} &quot;{f.value}&quot; <Button variant="ghost" size="sm" className="ml-auto">{t('advancedTable.remove')}</Button></DropdownMenuItem>))}
                                <DropdownMenuSeparator /><DropdownMenuLabel>{t('advancedTable.addFilter')}</DropdownMenuLabel>
                                {visibleColumns.map((col) => (
                                    <DropdownMenuSub key={String(col.accessorKey)}>
                                        <DropdownMenuSubTrigger><Filter className="mr-2 h-4 w-4" /> {t('advancedTable.filterColumn', { column: col.header })}</DropdownMenuSubTrigger>
                                        <DropdownMenuSubContent className="p-4 w-64"><AdvancedFilterSubContent col={col} onAddFilter={addFilter} /></DropdownMenuSubContent>
                                    </DropdownMenuSub>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                        <DropdownMenu><DropdownMenuTrigger asChild><Button variant="outline" aria-label={t('advancedTable.groupBy')}><Layers aria-hidden className="mr-2 h-4 w-4" /> {t('advancedTable.groupBy')}</Button></DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuLabel>{t('advancedTable.groupBy')}</DropdownMenuLabel><DropdownMenuSeparator />
                                {groupableColumns.map((col) => (<DropdownMenuCheckboxItem key={String(col.accessorKey)} checked={groupBy.includes(col.accessorKey)} onCheckedChange={() => handleGroupByChange(col.accessorKey)}>{col.header}</DropdownMenuCheckboxItem>))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                        <DropdownMenu><DropdownMenuTrigger asChild><Button variant="outline" aria-label={t('advancedTable.export')}><Download aria-hidden className="mr-2 h-4 w-4" /> {t('advancedTable.export')}</Button></DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => exportTableToTSV(data, visibleColumns, exportFileName)}><FileText className="mr-2 h-4 w-4" /><span>{t('advancedTable.exportTSV')}</span></DropdownMenuItem>
                                <DropdownMenuItem onClick={() => exportTableToJSON(data, exportFileName)}><FileJson className="mr-2 h-4 w-4" /><span>{t('advancedTable.exportJSON')}</span></DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
                <div className="flex-1 relative">
                    <ScrollArea className="absolute inset-0">
                        {groupBy.length > 0 ? (
                            // Grouped view: no table structure, use accordions directly
                            <div className="p-4">
                                <RenderGroup groupData={processedData} level={0} columns={visibleColumns} selectedRowId={selectedRowId} onRowClick={onRowClick} />
                            </div>
                        ) : (
                            // Non-grouped view: standard table
                            <Table>
                                <TableHeader className="sticky top-0 bg-card z-10">
                                    <TableRow>{visibleColumns.map((col) => (
                                        <TableHead key={String(col.accessorKey)}>
                                            {col.isSortable ? (
                                                <Button variant="ghost" onClick={() => requestSort(col.accessorKey as keyof T)} className="px-1 -ml-3">
                                                    {col.header}
                                                    <span className="ml-2">
                                                        {sortConfig?.key === col.accessorKey 
                                                            ? (sortConfig.direction === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />)
                                                            : <ArrowUpDown className="h-3 w-3 text-muted-foreground/50" />
                                                        }
                                                    </span>
                                                </Button>
                                            ) : col.header}
                                        </TableHead>
                                    ))}</TableRow>
                                </TableHeader>
                                <TableBody>
                                    <RenderGroup groupData={paginatedData} level={0} columns={visibleColumns} selectedRowId={selectedRowId} onRowClick={onRowClick} />
                                </TableBody>
                            </Table>
                        )}
                    </ScrollArea>
                </div>
                {!groupBy.length && totalPages > 1 && (<Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />)}
            </CardContent>
        </Card>
    );
}