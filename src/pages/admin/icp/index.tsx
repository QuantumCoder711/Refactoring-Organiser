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

    if (loading) return <Wave />;

    return (
        <div>
            <div className='flex items-center justify-between gap-3'>
                <div className='flex items-center gap-3'>
                    <GoBack />
                    <h1 className='text-xl font-semibold'>ICP</h1>
                </div>

                <div className='flex items-center gap-3'>
                    <Button
                        className='btn'
                        onClick={() => setUploadOpen(true)}
                    >
                        <UploadIcon className="mr-2 h-4 w-4" /> Upload New ICP
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
                <DialogContent className='sm:max-w-5xl w-[calc(100%-2rem)]'>
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