import GoBack from '@/components/GoBack';
import Wave from '@/components/Wave';
import useAuthStore from '@/store/authStore';
import useICPStore from '@/store/icpStore';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import Dropzone from 'react-dropzone';
import * as XLSX from 'xlsx';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Eye, Trash, Upload as UploadIcon } from 'lucide-react';

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

const ICP: React.FC = () => {
    const { user } = useAuthStore(state => state);
    const { icpSheets, loading, getICPSheets, deleteICPSheet, uploadICPSheet } = useICPStore(state => state);

    // Upload dialog state
    const [uploadOpen, setUploadOpen] = useState(false);
    const [sheetName, setSheetName] = useState("");
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [nameError, setNameError] = useState<string | null>(null);
    const [fileError, setFileError] = useState<string | null>(null);

    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const [uploading, setUploading] = useState(false);

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

    useEffect(() => {
        if (user) getICPSheets(user.id as number);
    }, [user, getICPSheets]);

    const activeSheet = useMemo(() => icpSheets.find(s => s.uuid === openPreviewFor?.uuid) || null, [icpSheets, openPreviewFor]);
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
                className: "!bg-green-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2"
            });
        } catch (err: any) {
            toast(err?.message || 'Failed to delete ICP list');
        }
    };

    // Upload dialog handlers
    const handleBrowseClick = () => fileInputRef.current?.click();

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            setFileError(null);
        }
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        const file = e.dataTransfer?.files?.[0];
        if (file) {
            setSelectedFile(file);
            setFileError(null);
        }
    };

    const handleUpload = async () => {
        if (!sheetName.trim()) {
            setNameError('Name is required');
            return;
        } else {
            setNameError(null);
        }
        if (!selectedFile) {
            setFileError('Please select a file');
            return;
        } else {
            setFileError(null);
        }
        if (!user?.id) return;

        setUploading(true);
        try {

            const res = await uploadICPSheet(user.id as number, selectedFile, sheetName.trim());
            toast(res && 'message' in res ? res.message || 'Uploaded successfully' : 'Uploaded successfully', {
                className: "!bg-green-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2"
            });
            setUploadOpen(false);
            setSheetName("");
            setSelectedFile(null);
        } catch (err: any) {
            toast(err?.message || 'Failed to upload ICP', {
                className: "!bg-red-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2"
            });
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };


    // Comparison helpers
    const normalize = (s: string) => (s || "").toLowerCase().replace(/[^a-z0-9]+/g, "").trim();

    const soundex = (s: string) => {
        const a = normalize(s);
        if (!a) return "";
        const f = a[0];
        const m: Record<string, string> = { b:"1",f:"1",p:"1",v:"1", c:"2",g:"2",j:"2",k:"2",q:"2",s:"2",x:"2",z:"2", d:"3",t:"3", l:"4", m:"5",n:"5", r:"6" };
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
            const percent = (companyWithDesignationScore/((uploadedRows.length * 5) + companyHighestScore)) * 100;

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
                    <Button className='btn' onClick={() => setUploadOpen(true)}>
                        <UploadIcon className="mr-2 h-4 w-4" /> Upload New ICP
                    </Button>
                    <Button variant="outline" onClick={() => { setCompareOpen(true); setCompareResult(null); setCompareError(null); setCompareFile(null); setCompareTargetUUID(""); }}>
                        Compare
                    </Button>
                </div>
            </div>


            {/* Upload ICP Dialog */}
            <Dialog open={uploadOpen} onOpenChange={(open) => { setUploadOpen(open); if (!open) { setNameError(null); setFileError(null); } }}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Upload ICP</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 mt-5">
                        <div>
                            <Label htmlFor="sheetName">Name</Label>
                            <Input
                                id="sheetName"
                                placeholder="Enter sheet name"
                                value={sheetName}
                                className='mt-2'
                                onChange={(e) => { setSheetName(e.target.value); if (e.target.value.trim()) setNameError(null); }}
                            />
                            {nameError && <p className="text-destructive text-xs mt-1">{nameError}</p>}
                        </div>
                        <div>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".xlsx,.xls,.csv"
                                onChange={handleFileChange}
                                className="hidden"
                            />
                            <div
                                onDragOver={handleDragOver}
                                onDrop={handleDrop}
                                onClick={handleBrowseClick}
                                className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:bg-accent/40"
                            >
                                {selectedFile ? (
                                    <div className="text-sm">
                                        <p className="font-medium">{selectedFile.name}</p>
                                        <p className="text-muted-foreground">{(selectedFile.size / 1024).toFixed(0)} KB</p>
                                        <p className="underline mt-2">Click to change</p>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                                        <UploadIcon className="h-6 w-6" />
                                        <p className="text-sm">Drag & drop your file here, or click to browse</p>
                                        <p className="text-xs">Accepted: .xlsx, .xls, .csv</p>
                                    </div>
                                )}
                            </div>
                            {fileError && <p className="text-destructive text-xs mt-1">{fileError}</p>}
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setUploadOpen(false)} disabled={uploading}>Cancel</Button>
                        <Button onClick={handleUpload} disabled={uploading} className='btn'>{uploading ? 'Saving…' : 'Save'}</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

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
                                        {icpSheets.map(s => (
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


            <div className='mt-6 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6'>
                {icpSheets.map((sheet) => {
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
                                                <AlertDialogAction className='cursor-pointer bg-destructive text-white' onClick={() => handleDelete(sheet.uuid)}>
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
                })}
            </div>

            <Dialog open={!!openPreviewFor} onOpenChange={(o) => { if (!o) setOpenPreviewFor(null); }}>
                <DialogContent className='sm:max-w-5xl w-[calc(100%-2rem)] overflow-y-auto'>
                    <DialogHeader>
                        <DialogTitle className='capitalize'>{activeSheet?.sheet_name.split("").find((char:string) => char === '_') ? activeSheet?.sheet_name.split("_")[0] : activeSheet?.sheet_name}</DialogTitle>
                    </DialogHeader>
                    <div className='border rounded-md overflow-hidden'>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className='min-w-[220px]'>Company</TableHead>
                                    <TableHead>Designation</TableHead>
                                    <TableHead className='w-[120px]'>Priority</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {paginatedRows.map((row, idx) => (

                                    <TableRow key={idx}>
                                        <TableCell className='font-medium'>{row.companyname}</TableCell>
                                        <TableCell className='text-muted-foreground'>{Array.isArray(row.designation) ? row.designation.join(', ') : String(row.designation || '')}</TableCell>
                                        <TableCell>{row.priority}</TableCell>
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

export default ICP;