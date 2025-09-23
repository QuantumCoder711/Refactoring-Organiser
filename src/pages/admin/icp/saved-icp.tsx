import GoBack from '@/components/GoBack';
import Wave from '@/components/Wave';
import useAuthStore from '@/store/authStore';
import useICPStore from '@/store/icpStore';
import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import useExtrasStore from '@/store/extrasStore';
import { CountrySelect, StateSelect } from 'react-country-state-city';
import 'react-country-state-city/dist/react-country-state-city.css';

import Dropzone from 'react-dropzone';
import * as XLSX from 'xlsx';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

// Custom Combo Box (copied from CreateICP with minor condensation to fit)
const CustomComboBox = React.memo(({
    label,
    value,
    onValueChange,
    placeholder,
    options,
    required = false,
    isMulti = false,
    onSearch,
}: {
    label: string;
    value: string | string[];
    onValueChange: (value: string | string[]) => void;
    placeholder: string;
    options: { id: number; name: string }[];
    required?: boolean;
    isMulti?: boolean;
    onSearch?: (term: string) => void;
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [inputValue, setInputValue] = useState(typeof value === 'string' ? value : '');
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const inputRef = React.useRef<HTMLInputElement>(null);
    const dropdownRef = React.useRef<HTMLDivElement>(null);

    const selectedValues = Array.isArray(value) ? value : [];
    const filteredOptions = options
        .filter(o => o.name.toLowerCase().includes(searchTerm.toLowerCase()))
        .filter(o => !isMulti || !selectedValues.some(v => v.toLowerCase() === o.name.toLowerCase()));

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const term = e.target.value;
        if (!isMulti) { setInputValue(term); onValueChange(term); }
        setSearchTerm(term); setIsOpen(true); setSelectedIndex(-1); onSearch?.(term);
    };
    const addValue = (name: string) => {
        if (!isMulti) { setInputValue(name); onValueChange(name); }
        else {
            const exists = selectedValues.some(v => v.toLowerCase() === name.toLowerCase());
            if (!exists) onValueChange([...selectedValues, name]);
        }
        setSearchTerm(''); setIsOpen(false); setSelectedIndex(-1); inputRef.current?.blur();
    };
    const removeValue = (name: string) => { if (isMulti) onValueChange(selectedValues.filter(v => v.toLowerCase() !== name.toLowerCase())); };
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (isOpen) {
            if (e.key === 'ArrowDown') { e.preventDefault(); setSelectedIndex(p => (p < filteredOptions.length - 1 ? p + 1 : p)); }
            else if (e.key === 'ArrowUp') { e.preventDefault(); setSelectedIndex(p => (p > 0 ? p - 1 : p)); }
            else if (e.key === 'Enter') { e.preventDefault(); if (selectedIndex >= 0 && selectedIndex < filteredOptions.length) addValue(filteredOptions[selectedIndex].name); else if (searchTerm) addValue(searchTerm); }
        } else if (e.key === 'Enter' && searchTerm) { addValue(searchTerm); }
    };

    useEffect(() => { const h = (e: MouseEvent) => { if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) { setIsOpen(false); setSearchTerm(''); setSelectedIndex(-1); } }; document.addEventListener('mousedown', h); return () => document.removeEventListener('mousedown', h); }, []);
    useEffect(() => { if (!isMulti && typeof value === 'string') setInputValue(value); }, [value, isMulti]);
    useEffect(() => { if (selectedIndex >= 0 && dropdownRef.current) { const el = dropdownRef.current.querySelectorAll('.option')[selectedIndex] as HTMLElement; el?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); } }, [selectedIndex]);

    return (
        <div className="flex gap-2 flex-col w-full" ref={dropdownRef}>
            <Label className="font-semibold">{label} {required && <span className="text-brand-secondary">*</span>}</Label>
            <div className="relative">
                <div className="relative">
                    <Input ref={inputRef} type="text" value={isMulti ? searchTerm : inputValue} onChange={handleInputChange} onKeyDown={handleKeyDown} onFocus={() => setIsOpen(true)} placeholder={placeholder} className="w-full capitalize bg-white !h-12 text-base pr-10" />
                    <ChevronDown className={`absolute right-3 top-1/2 transform -translate-y-1/2 size-4 opacity-50 transition-transform cursor-pointer ${isOpen ? 'rotate-180' : ''}`} onClick={() => { setIsOpen(!isOpen); inputRef.current?.focus(); }} />
                </div>
                {isMulti && selectedValues.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                        {selectedValues.map((val) => (
                            <Badge key={val} variant="secondary" className="flex items-center gap-1 px-2 py-1 rounded-full">
                                <span className="capitalize">{val}</span>
                                <button type="button" onClick={() => removeValue(val)} className="hover:text-red-600"><X className="size-3 cursor-pointer" /></button>
                            </Badge>
                        ))}
                    </div>
                )}
                {isOpen && (
                    <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
                        {filteredOptions.length > 0 ? (
                            filteredOptions.map((o, idx) => (
                                <div key={o.id} className={`px-3 py-2 cursor-pointer hover:bg-gray-50 flex items-center justify-between text-sm ${selectedIndex === idx ? 'bg-gray-100' : ''} option`} onClick={() => addValue(o.name)}>
                                    <span className="capitalize">{o.name}</span>
                                    {!isMulti && typeof value === 'string' && value === o.name && (<Check className="size-4 text-brand-secondary" />)}
                                </div>
                            ))
                        ) : searchTerm ? (
                            <div className="px-3 py-2 cursor-pointer hover:bg-gray-50 text-sm font-medium" onClick={() => addValue(searchTerm)}>{searchTerm}</div>
                        ) : (
                            <div className="px-3 py-2 text-gray-500 text-sm">No options found</div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
});

import { CircleCheck, Eye, Trash, Upload as UploadIcon, XIcon, X, Check, ChevronDown } from 'lucide-react';

const ROWS_PER_PAGE: number = 10;

const formatUploadedOn = (sheetName: string): { name: string; uploadedOn?: string } => {
    if (!sheetName) return { name: '' };
    const cleaned = sheetName.replace(/\.(xlsx?|csv)$/i, '').trim();
    const idx = cleaned.lastIndexOf('_');
    const nameRaw = idx > -1 ? cleaned.slice(0, idx) : cleaned;
    const tsStr = idx > -1 ? cleaned.slice(idx + 1) : '';

    const name = nameRaw.trim();

    let uploadedOn: string | undefined;
    if (tsStr && tsStr.length === 14) { // Format: YYYYMMDDHHmmss
        const year = tsStr.slice(0, 4);
        const month = tsStr.slice(4, 6);
        const day = tsStr.slice(6, 8);
        const d = new Date(`${year}-${month}-${day}`);
        if (!isNaN(d.getTime())) {
            uploadedOn = d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
        }
    }

    return { name, uploadedOn };
};

const SavedICP: React.FC = () => {
    const { user } = useAuthStore(state => state);
    const { icpSheets, loading, getICPSheets, deleteICPSheet, addICPEntry, updateICPEntry, deleteICPEntry } = useICPStore(state => state);

    // Compare dialog state
    const [compareOpen, setCompareOpen] = useState(false);
    const [compareFile, setCompareFile] = useState<File | null>(null);
    const [compareTargetUUID, setCompareTargetUUID] = useState<string>("");
    const [comparing, setComparing] = useState(false);
    const [compareError, setCompareError] = useState<string | null>(null);
    const [compareResult, setCompareResult] = useState<null | {
        percent: number;
        matchedCompanies: string[];
        matchedDesignations: Array<{ company: string; designation: string; score: number }>;
        totals: { companyWithDesignationScore: number; companyHighestScore: number; totalMax: number };
    }>(null);

    // Preview dialog state
    const [openPreviewFor, setOpenPreviewFor] = useState<null | { uuid: string }>(null);
    const [currentPage, setCurrentPage] = useState(1);

    // Entry add/edit dialog state
    const { designations, companies, getCompanies, getDesignations } = useExtrasStore(state => state);
    const [entryOpen, setEntryOpen] = useState(false);
    const [entryMode, setEntryMode] = useState<'add' | 'edit'>('add');
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [entryCountryId, setEntryCountryId] = useState<string | number | null>(null);
    const employeeOptions = ['0-10', '10-50', '50-100', '100-500', '500-1000', '1000-5000', '5000-10000', 'more than 10,000'];
    const [entryForm, setEntryForm] = useState({
        companyname: '',
        designation: [] as string[],
        country_name: '',
        state_name: '',
        employee_size: '',
        priority: 'P4' as 'P1' | 'P2' | 'P3' | 'P4',
        uuid: ''
    });
    const isEntryValid = Boolean(
        entryForm.companyname.trim() &&
        entryForm.designation.length > 0 &&
        entryForm.country_name.trim() &&
        entryForm.state_name.trim() &&
        entryForm.employee_size &&
        entryForm.priority
    );

    const openAddEntry = () => {
        setEntryMode('add');
        setEditingIndex(null);
        setEntryForm({ companyname: '', designation: [], country_name: '', state_name: '', employee_size: '', priority: 'P4', uuid:  ''});
        setEntryCountryId(null);
        setEntryOpen(true);
        getCompanies();
        getDesignations();
    };

    const openEditEntry = (row: any, absIndex: number) => {
        setEntryMode('edit');
        setEditingIndex(absIndex);
        setEntryForm({
            companyname: row.companyname || '',
            designation: Array.isArray(row.designation) ? row.designation : String(row.designation || '').split(',').map((s: string) => s.trim()).filter(Boolean),
            country_name: row.country_name || '',
            state_name: row.state_name || '',
            employee_size: row.employee_size || '',
            priority: String(row.priority || 'P4').toUpperCase() as 'P1' | 'P2' | 'P3' | 'P4',
            uuid: row.uuid || '',
        });
        setEntryCountryId(null);
        setEntryOpen(true);
        getCompanies(row.companyname);
        getDesignations();
    };

    const handleSaveEntry = async () => {
        if (!activeSheet || !isEntryValid) return;
        try {
            if (entryMode === 'add') {
                await addICPEntry(activeSheet.sheet_name, entryForm, user?.id as number);
                toast.success('ICP entry added', { className: "!bg-green-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2", icon: <CircleCheck className='size-5' /> });
            } else if (editingIndex !== null) {
                const rowUuid = (activeSheet.sheetRows[editingIndex] as any)?.uuid;
                await updateICPEntry(activeSheet.uuid, rowUuid, editingIndex, entryForm, user?.id as number);
                toast.success('ICP entry updated', { className: "!bg-green-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2", icon: <CircleCheck className='size-5' /> });
            }
            setEntryOpen(false);
        } catch (e: any) {
            toast.error(e?.message || 'Operation failed', { className: "!bg-red-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2", icon: <XIcon className='size-5' /> });
        }
    };

    const handleDeleteEntry = async (absIndex: number) => {
        if (!activeSheet) return;
        try {
            await deleteICPEntry(activeSheet.uuid, (activeSheet.sheetRows[absIndex] as any)?.uuid);
            toast.success('ICP entry deleted', { className: "!bg-green-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2", icon: <CircleCheck className='size-5' /> });
        } catch (e: any) {
            toast.error(e?.message || 'Failed to delete entry', { className: "!bg-red-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2", icon: <XIcon className='size-5' /> });
        }
    };

    useEffect(() => {
        if (user) getICPSheets(user.id as number);
    }, [user, getICPSheets]);

    const activeSheet = useMemo(() => icpSheets?.find(s => s.uuid === openPreviewFor?.uuid) || null, [icpSheets, openPreviewFor]);
    const totalPages = activeSheet ? Math.max(1, Math.ceil(activeSheet.sheetRows.length / ROWS_PER_PAGE)) : 1;
    const paginatedRows = activeSheet ? activeSheet.sheetRows.slice((currentPage - 1) * ROWS_PER_PAGE, currentPage * ROWS_PER_PAGE) : [];

    const handlePreview = (uuid: string) => {
        setOpenPreviewFor({ uuid });
        setCurrentPage(1);
    };

    const handleDelete = async (uuid: string) => {
        try {
            const res = await deleteICPSheet(uuid);
            toast(res && 'message' in res ? res.message : 'ICP list deleted', {
                className: "!bg-green-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
                icon: <CircleCheck className='size-5' />
            });
        } catch (err: any) {
            toast.error(err?.message || "Error Deleting ICP", {
                className: "!bg-red-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
                icon: <XIcon className='size-5' />
            });
        } finally {
            getICPSheets(user?.id as number);
        }
    };

    // Comparison helpers
    const normalize = (s: string) => (s || "").toLowerCase().replace(/[^a-z0-9]+/g, "").trim();

    const soundex = (s: string) => {
        const a = normalize(s);
        if (!a) return "";
        const f = a[0];
        const m: Record<string, string> = { b: "1", f: "1", p: "1", v: "1", c: "2", g: "2", j: "2", k: "2", q: "2", s: "2", x: "2", z: "2", d: "3", t: "3", l: "4", m: "5", n: "5", r: "6" };
        let r = f;
        let prev = m[f] || "";
        for (let i = 1; i < a.length && r.length < 4; i++) {
            const ch = a[i];
            const code = m[ch] || "";
            if (code && code !== prev) r += code;
            prev = code;
        }
        return (r + "000").slice(0, 4);
    };

    const hashName = (s: string) => {
        let h = 5381;
        for (let i = 0; i < s.length; i++) h = ((h << 5) + h) + s.charCodeAt(i);
        return (h >>> 0).toString(36);
    };

    const companyKey = (name: string) => {
        const n = normalize(name);
        return `${soundex(n)}-${hashName(n)}`;
    };

    const getPriorityWeight = (p: string) => {
        const v = (p || "").toLowerCase();
        if (v === "p1") return 5;
        if (v === "p2") return 3;
        if (v === "p3") return 1;
        return 1;
    };

    const getRoleScore = (designationText: string, icpDesignations: string[] = []) => {
        const text = (designationText || "").toLowerCase();
        const has = (kw: string) => text.includes(kw.toLowerCase());
        if (icpDesignations.length) {
            const matched = icpDesignations.some(d => has(d));
            if (!matched) return 1;
        }
        if (has("chief") || has("cxo") || has("c-suite") || has("ceo") || has("coo") || has("cfo") || has("cto") || has("cio")) return 5;
        if (has("vp") || has("vice president")) return 4;
        if (has("director") || has("gm") || has("general manager") || has("head")) return 3;
        if (has("manager")) return 2;
        return 1;
    };

    type UploadedRow = { company: string; designation: string; priority?: string };

    const parseUploadedFile = async (file: File): Promise<UploadedRow[]> => {
        const data = await file.arrayBuffer();
        const wb = XLSX.read(data, { type: 'array' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const json: any[] = XLSX.utils.sheet_to_json(ws, { defval: "" });
        if (!json.length) return [];
        const pick = (row: any, candidates: string[]) => {
            for (const key of Object.keys(row)) {
                const k = key.toLowerCase().trim();
                if (candidates.includes(k)) return row[key];
            }
            return "";
        };
        const companyKeys = ["company", "companyname", "company_name", "organization", "organisation", "org", "brand"];
        const designationKeys = ["designation", "title", "job title", "jobtitle", "role", "position"];
        const priorityKeys = ["priority", "p", "prio"];
        const rows: UploadedRow[] = json.map(r => ({
            company: String(pick(r, companyKeys)).trim(),
            designation: String(pick(r, designationKeys)).trim(),
            priority: String(pick(r, priorityKeys)).trim(),
        })).filter(r => r.company);
        return rows;
    };

    const runComparison = async () => {
        if (!compareTargetUUID) { setCompareError('Please select an ICP sheet'); return; }
        if (!compareFile) { setCompareError('Please upload a file to compare'); return; }
        setCompareError(null);
        setComparing(true);
        try {
            const target = icpSheets.find(s => s.uuid === compareTargetUUID);
            if (!target) { setCompareError('Selected ICP sheet not found'); setComparing(false); return; }
            const uploadedRows = await parseUploadedFile(compareFile);

            const icp = target.sheetRows.map(r => ({
                company: r.companyname,
                key: companyKey(r.companyname),
                prioWeight: getPriorityWeight(r.priority),
                icpDesignations: Array.isArray(r.designation) ? r.designation : String(r.designation || '').split(',').map(s => s.trim()).filter(Boolean)
            }));
            const icpKeyMap = new Map<string, typeof icp[number][]>();
            icp.forEach(row => {
                const arr = icpKeyMap.get(row.key) || [];
                arr.push(row);
                icpKeyMap.set(row.key, arr);
            });

            let companyWithDesignationScore = 0;
            const companyHighestScore = icp.reduce((acc, r) => acc + r.prioWeight, 0);
            const matchedCompaniesSet = new Set<string>();
            const matchedDesignations: Array<{ company: string; designation: string; score: number }> = [];

            for (const ur of uploadedRows) {
                const key = companyKey(ur.company);
                const matches = icpKeyMap.get(key);
                if (!matches?.length) continue;
                matchedCompaniesSet.add(ur.company);
                for (const m of matches) {
                    const roleScore = getRoleScore(ur.designation, m.icpDesignations);
                    const secured = m.prioWeight + roleScore;
                    companyWithDesignationScore += secured;
                    matchedDesignations.push({ company: m.company, designation: ur.designation, score: secured });
                }
            }

            const totalMax = (icp.length * 5) + companyHighestScore;
            const percent = (companyWithDesignationScore / ((uploadedRows.length * 5) + companyHighestScore)) * 100;

            setCompareResult({
                percent,
                matchedCompanies: Array.from(matchedCompaniesSet),
                matchedDesignations,
                totals: { companyWithDesignationScore, companyHighestScore, totalMax }
            });
        } catch (e: any) {
            setCompareError(e?.message || 'Failed to compare');
        } finally {
            setComparing(false);
        }
    };

    if (loading) return <Wave />;

    return (
        <div>
            <div className='flex items-center justify-between gap-3'>
                <div className='flex items-center gap-3'>
                    <GoBack />
                    <h1 className='text-xl font-semibold'>ICP</h1>
                </div>
                <div className='flex items-center gap-3'>
                    <Button variant="outline" onClick={() => { setCompareOpen(true); setCompareResult(null); setCompareError(null); setCompareFile(null); setCompareTargetUUID(""); }}>
                        Compare
                    </Button>
                </div>
            </div>

            {/* Compare ICP Dialog */}
            <Dialog open={compareOpen} onOpenChange={(o) => { setCompareOpen(o); if (!o) { setCompareFile(null); setCompareTargetUUID(""); setCompareResult(null); setCompareError(null); } }}>
                <DialogContent className="sm:max-w-3xl max-h-[85vh] overflow-hidden overflow-y-auto grid grid-rows-[auto,auto,1fr,auto]">
                    <DialogHeader className="shrink-0">
                        <DialogTitle>Compare ICP</DialogTitle>
                    </DialogHeader>

                    {/* Static form area (always visible) */}
                    <div className="space-y-4 mt-5 shrink-0">
                        <div>
                            <Label>Select ICP sheet to compare against</Label>
                            <div className="mt-2">
                                <Select value={compareTargetUUID} onValueChange={(v) => setCompareTargetUUID(v)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select ICP sheet" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {icpSheets?.map(s => (
                                            <SelectItem key={s.uuid} value={s.uuid}>{s.sheet_name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div>
                            <Label>Upload file to compare</Label>
                            <div className="mt-2">
                                <Dropzone accept={{ 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'], 'application/vnd.ms-excel': ['.xls'] }} maxFiles={1} onDrop={(files) => setCompareFile(files?.[0] || null)}>
                                    {({ getRootProps, getInputProps, isDragActive }) => (
                                        <div {...getRootProps({ className: `border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:bg-accent/40 ${isDragActive ? 'bg-accent/60' : ''}` })}>
                                            <input {...getInputProps()} />
                                            {compareFile ? (
                                                <div className="text-sm">
                                                    <p className="font-medium">{compareFile.name}</p>
                                                    <p className="text-muted-foreground">{(compareFile.size / 1024).toFixed(0)} KB</p>
                                                    <p className="underline mt-2">Click to change</p>
                                                </div>
                                            ) : (
                                                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                                                    <UploadIcon className="h-6 w-6" />
                                                    <p className="text-sm">Drag & drop your file here, or click to browse</p>
                                                    <p className="text-xs">Accepted: .xlsx, .xls</p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </Dropzone>
                            </div>
                        </div>

                        {compareError && <p className="text-destructive text-sm">{compareError}</p>}
                    </div>

                    {/* Results area (scrolls independently if long) */}
                    {compareResult && (
                        <div className="min-h-0 mt-4 overflow-auto">
                            <div className="border rounded-md p-4 space-y-4">
                                <div className="flex items-end gap-4">
                                    <div className="text-3xl font-semibold">{compareResult.percent}%</div>
                                    <div className="text-muted-foreground">match score</div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                                    <div className="rounded-md bg-sky-100 p-3">
                                        <div className="text-xs text-muted-foreground">Companies matched</div>
                                        <div className="font-medium">{compareResult.matchedCompanies.length}</div>
                                    </div>
                                    <div className="rounded-md bg-yellow-100 p-3">
                                        <div className="text-xs text-muted-foreground">Secured score</div>
                                        <div className="font-medium">{compareResult.totals.companyWithDesignationScore}</div>
                                    </div>
                                    <div className="rounded-md bg-purple-100 p-3">
                                        <div className="text-xs text-muted-foreground">Percentage</div>
                                        <div className="font-medium">{compareResult.percent}</div>
                                    </div>
                                </div>
                                <div>
                                    <div className="text-sm font-medium mb-2">Matched breakdown</div>
                                    <div className="border rounded-md">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Company</TableHead>
                                                    <TableHead>Designation</TableHead>
                                                    <TableHead className="w-[120px]">Score</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {compareResult.matchedDesignations.map((m, i) => (
                                                    <TableRow key={i}>
                                                        <TableCell className='font-medium'>{m.company}</TableCell>
                                                        <TableCell className='text-muted-foreground'>{m.designation}</TableCell>
                                                        <TableCell>{m.score}</TableCell>
                                                    </TableRow>
                                                ))}
                                                {compareResult.matchedDesignations.length === 0 && (
                                                    <TableRow>
                                                        <TableCell colSpan={3} className='text-center text-muted-foreground'>No matches found</TableCell>
                                                    </TableRow>
                                                )}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <DialogFooter className="shrink-0">
                        <Button variant="outline" onClick={() => setCompareOpen(false)} className='cursor-pointer' disabled={comparing}>Close</Button>
                        <Button onClick={runComparison} disabled={comparing || !compareFile || !compareTargetUUID} className='btn !h-full'>
                            {comparing ? 'Comparing...' : 'Compare'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Add/Edit ICP Entry Dialog */}
            <Dialog open={entryOpen} onOpenChange={(o) => setEntryOpen(o)}>
                <DialogContent className="sm:max-w-3xl max-h-[85vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{entryMode === 'add' ? 'Add New ICP Entry' : 'Edit ICP Entry'}</DialogTitle>
                    </DialogHeader>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                        <div className="flex flex-col gap-2">
                            <CustomComboBox
                                label="Company Name"
                                value={entryForm.companyname}
                                onValueChange={(val) => setEntryForm(prev => ({ ...prev, companyname: String(val || '') }))}
                                placeholder="Type or select company"
                                options={companies.map((c, idx) => ({ id: idx + 1, name: c.company }))}
                                onSearch={(term) => getCompanies(term)}
                                required
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <CustomComboBox
                                label="Job Title"
                                isMulti
                                value={entryForm.designation}
                                onValueChange={(val) => setEntryForm(prev => ({ ...prev, designation: Array.isArray(val) ? val : (val ? [String(val)] : []) }))}
                                placeholder="Type or select job title"
                                options={designations.map((d, idx) => ({ id: idx + 1, name: d.designation }))}
                                onSearch={(term) => getDesignations(term)}
                                required
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <Label className="font-semibold">Country <span className="text-brand-secondary">*</span></Label>
                            <CountrySelect
                                placeHolder="Select Country"
                                onChange={(val: any) => { setEntryCountryId(val?.id ?? null); setEntryForm(prev => ({ ...prev, country_name: val?.name || '', state_name: '' })); }}
                                inputClassName="!h-12 !text-base !bg-white"
                                containerClassName="!w-full"
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <Label className="font-semibold">State <span className="text-brand-secondary">*</span></Label>
                            <StateSelect
                                countryid={entryCountryId as any}
                                placeHolder={entryCountryId ? 'Select State' : 'Select country first'}
                                onChange={(val: any) => setEntryForm(prev => ({ ...prev, state_name: val?.name || '' }))}
                                inputClassName="!h-12 !text-base !bg-white"
                                containerClassName="!w-full"
                                disabled={!entryCountryId}
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <Label className="font-semibold">Employee Size <span className="text-brand-secondary">*</span></Label>
                            <Select value={entryForm.employee_size} onValueChange={(v) => setEntryForm(prev => ({ ...prev, employee_size: v }))}>
                                <SelectTrigger className="input !h-12 text-base cursor-pointer min-w-full">
                                    <SelectValue placeholder="Select employee size" />
                                </SelectTrigger>
                                <SelectContent>
                                    {employeeOptions.map(opt => (
                                        <SelectItem key={opt} value={opt} className="cursor-pointer">{opt}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex flex-col gap-2">
                            <Label className="font-semibold">Priority <span className="text-brand-secondary">*</span></Label>
                            <Select value={entryForm.priority} onValueChange={(v) => setEntryForm(prev => ({ ...prev, priority: v as 'P1' | 'P2' | 'P3' | 'P4' }))}>
                                <SelectTrigger className="input !h-12 text-base cursor-pointer min-w-full">
                                    <SelectValue placeholder="Select priority" />
                                </SelectTrigger>
                                <SelectContent>
                                    {['P1', 'P2', 'P3', 'P4'].map(p => (
                                        <SelectItem key={p} value={p} className="cursor-pointer">{p}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" className="cursor-pointer" onClick={() => setEntryOpen(false)}>Cancel</Button>
                        <Button onClick={handleSaveEntry} disabled={!isEntryValid} className="btn !h-full">{entryMode === 'add' ? 'Add Entry' : 'Save Changes'}</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>



            <div className='mt-6 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6'>
                {icpSheets ? icpSheets?.map((sheet) => {
                    const meta = formatUploadedOn(sheet.sheet_name || sheet.uuid);
                    return (
                        <Card key={sheet.uuid} className='transition-shadow hover:shadow-md'>
                            <CardHeader className='flex flex-col'>
                                <CardTitle className='text-base sm:text-lg capitalize break-words line-clamp-2'>{meta.name}</CardTitle>
                                <CardDescription>{meta.uploadedOn ? `Uploaded on ${meta.uploadedOn}` : '—'}</CardDescription>
                                <CardAction className='flex gap-2 mt-3'>
                                    <Button variant="outline" size="sm" onClick={() => handlePreview(sheet.uuid)}>
                                        <Eye className='size-4' /> Preview
                                    </Button>
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button variant="destructive" size="sm">
                                                <Trash className='size-4' /> Delete
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Are you sure you want to delete this ICP list?</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    This action cannot be undone. This will permanently delete the selected ICP list.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel className='cursor-pointer'>Cancel</AlertDialogCancel>
                                                <AlertDialogAction className='cursor-pointer bg-destructive text-white' onClick={() => handleDelete(sheet.sheet_name)}>
                                                    Delete
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </CardAction>
                            </CardHeader>
                            <CardContent>
                                <div className='text-sm text-muted-foreground'>
                                    {sheet.sheetRows.length} entries
                                </div>
                            </CardContent>
                        </Card>
                    );
                }) : (
                    <div className='text-center text-muted-foreground w-full h-full col-span-full'>
                        No ICP sheets found.
                    </div>
                )}
            </div>

            <Dialog open={!!openPreviewFor} onOpenChange={(o) => { if (!o) setOpenPreviewFor(null); }}>
                <DialogContent className='sm:max-w-5xl w-[calc(100%-2rem)] overflow-y-auto'>
                    <DialogHeader>
                        <DialogTitle className='capitalize flex justify-between items-center mt-5'>
                            {activeSheet?.sheet_name.split("").find((char: string) => char === '_') ? activeSheet?.sheet_name.split("_")[0] : activeSheet?.sheet_name}
                            <div><Button variant="outline" size="sm" className='cursor-pointer' onClick={openAddEntry}>Add Entry</Button></div>
                        </DialogTitle>
                    </DialogHeader>
                    <div className='border rounded-md overflow-hidden'>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className='min-w-[220px]'>Company</TableHead>
                                    <TableHead>Designation</TableHead>
                                    <TableHead className='w-[120px]'>Country</TableHead>
                                    <TableHead className='w-[120px]'>State</TableHead>
                                    <TableHead className='w-[120px]'>Employee Size</TableHead>
                                    <TableHead className='w-[120px]'>Priority</TableHead>
                                    <TableHead className='w-[120px]'>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {paginatedRows?.map((row, idx) => (
                                    <TableRow key={idx} className='capitalize'>
                                        <TableCell className='font-medium'>{row.companyname}</TableCell>
                                        <TableCell className='text-muted-foreground'>{row.designation.map(d => d).join(", ")}</TableCell>
                                        <TableCell>{row.country_name}</TableCell>
                                        <TableCell>{row.state_name}</TableCell>
                                        <TableCell>{row.employee_size}</TableCell>
                                        <TableCell>{row.priority}</TableCell>
                                        <TableCell className="space-x-2">
                                            <Button variant="outline" size="sm" className="cursor-pointer" onClick={() => openEditEntry(row, ((currentPage - 1) * ROWS_PER_PAGE) + idx)}>Edit</Button>
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button variant="destructive" size="sm" className="cursor-pointer">Delete</Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Delete this entry?</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            This action cannot be undone. This will permanently delete the selected ICP entry.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel className="cursor-pointer">Cancel</AlertDialogCancel>
                                                        <AlertDialogAction className="cursor-pointer bg-destructive text-white" onClick={() => handleDeleteEntry(((currentPage - 1) * ROWS_PER_PAGE) + idx)}>
                                                            Delete
                                                        </AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>

                    {activeSheet && activeSheet.sheetRows.length > ROWS_PER_PAGE && (
                        <Pagination className='mt-4'>
                            <PaginationContent>
                                <PaginationItem>
                                    <PaginationPrevious
                                        onClick={(e) => { e.preventDefault(); setCurrentPage(p => Math.max(1, p - 1)); }}
                                        className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                                        href="#"
                                    />
                                </PaginationItem>

                                {/* Show first page */}
                                {totalPages > 0 && (
                                    <PaginationItem>
                                        <PaginationLink
                                            href="#"
                                            isActive={currentPage === 1}
                                            onClick={(e) => { e.preventDefault(); setCurrentPage(1); }}
                                            className="cursor-pointer"
                                        >
                                            1
                                        </PaginationLink>
                                    </PaginationItem>
                                )}

                                {/* Show ellipsis if needed */}
                                {currentPage > 3 && (
                                    <PaginationItem>
                                        <PaginationEllipsis />
                                    </PaginationItem>
                                )}

                                {/* Show current page and surrounding pages */}
                                {Array.from({ length: 3 }, (_, i) => currentPage + i - 1)
                                    .filter(pageNum => pageNum > 1 && pageNum < totalPages)
                                    .map(pageNum => (


                                        <PaginationItem key={pageNum}>
                                            <PaginationLink
                                                href="#"
                                                isActive={currentPage === pageNum}
                                                onClick={(e) => { e.preventDefault(); setCurrentPage(pageNum); }}
                                                className="cursor-pointer"
                                            >
                                                {pageNum}
                                            </PaginationLink>
                                        </PaginationItem>
                                    ))}

                                {/* Show ellipsis if needed */}
                                {currentPage < totalPages - 2 && (
                                    <PaginationItem>
                                        <PaginationEllipsis />
                                    </PaginationItem>
                                )}

                                {/* Show last page */}
                                {totalPages > 1 && (
                                    <PaginationItem>
                                        <PaginationLink
                                            href="#"
                                            isActive={currentPage === totalPages}
                                            onClick={(e) => { e.preventDefault(); setCurrentPage(totalPages); }}
                                            className="cursor-pointer"
                                        >
                                            {totalPages}
                                        </PaginationLink>
                                    </PaginationItem>
                                )}

                                <PaginationItem>
                                    <PaginationNext
                                        onClick={(e) => { e.preventDefault(); setCurrentPage(p => Math.min(totalPages, p + 1)); }}
                                        className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                                        href="#"
                                    />
                                </PaginationItem>
                            </PaginationContent>
                        </Pagination>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    )
}

export default SavedICP;