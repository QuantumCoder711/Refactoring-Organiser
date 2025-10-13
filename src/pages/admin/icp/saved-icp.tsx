import GoBack from '@/components/GoBack';
import Wave from '@/components/Wave';
import useAuthStore from '@/store/authStore';
import useICPStore, { ICPSheet, PreferencesPayload } from '@/store/icpStore';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Card, CardAction, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Pagination, PaginationContent, PaginationItem, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import Dropzone from 'react-dropzone';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import * as XLSX from 'xlsx';

interface ComparedData {
    score: number,
    totalScore: number,
    data: { company: string, designation: string }[],
    percent: string
}

import { CircleCheck, Trash, Upload as UploadIcon, XIcon, Loader2, Edit } from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { appDomain } from '@/constants';

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
    const { icpMetaData, getICPExcelSheets, loading, getICPSheets, deleteICPSheet } = useICPStore(state => state);

    // Compare dialog state
    const [compareOpen, setCompareOpen] = useState(false);
    const [compareFile, setCompareFile] = useState<File | null>(null);
    const [selectedICPSheet, setSelectedICPSheet] = useState<string>('');
    const [comparing, setComparing] = useState<boolean>(false);
    // Preview dialog state
    const [openPreviewFor, setOpenPreviewFor] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [activeSheet, setActiveSheet] = useState<ICPSheet | null>(null);

    // Compared Data State
    const [comparedData, setComparedData] = useState<ComparedData | null>(null);

    useEffect(() => {
        if (user) {
            getICPSheets(user.id as number);
        }
    }, [user, getICPSheets]);

    // useEffect(()=>{
    //     getICPExcelSheets(openPreviewFor as string);
    // }, [getICPExcelSheets]);

    const totalPages = activeSheet ? Math.max(1, Math.ceil((activeSheet?.sheetRows?.length || 0) / ROWS_PER_PAGE)) : 1;
    const paginatedRows = activeSheet ? activeSheet.sheetRows?.slice((currentPage - 1) * ROWS_PER_PAGE, currentPage * ROWS_PER_PAGE) : [];
    const hasIndustry = Boolean(activeSheet?.sheetRows?.some((r: any) => r?.industry));

    const handlePreview = async (sheet_name: string) => {
        setOpenPreviewFor(sheet_name);
        setCurrentPage(1);
        const res = await getICPExcelSheets(sheet_name);
        setActiveSheet(res[0]);
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

    const handleCompareFiles = async () => {
        setComparing(true);
        if (!compareFile || !selectedICPSheet) {
            toast("Please select a file and an ICP sheet to compare", {
                className: "!bg-red-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
                icon: <XIcon className='size-5' />
            });
            return;
        }

        // Fetch the saved ICP sheet rows via API (do not rely on icpSheets state)
        const sheetData = await getICPExcelSheets(selectedICPSheet);
        const savedSheet = sheetData[0]?.sheetRows || [];
        if (!savedSheet || savedSheet.length === 0) {
            toast("Saved ICP sheet not found", {
                className: "!bg-red-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
                icon: <XIcon className='size-5' />
            });
            setComparing(false);
            return;
        }

        const savedSheetData = savedSheet.map((sheet) => {
            const company = String((sheet as any).companyname || (sheet as any).company_name || '').trim();
            const designationsArr = Array.isArray((sheet as any).designation)
                ? (sheet as any).designation.map((d: any) => String(d).trim())
                : String((sheet as any).designation || '')
                    .split(',')
                    .map((d: string) => d.trim())
                    .filter(Boolean);
            const priority = String((sheet as any).priority || '').trim();
            return {
                company_name: company,
                designations: designationsArr,
                priority,
            };
        });

        // console.log("The savedSheetData is: ", savedSheetData);

        // Generating the data of the excel file being uploded by the user.
        try {
            // Read the uploaded Excel file
            const arrayBuffer = await compareFile.arrayBuffer();
            const workbook = XLSX.read(arrayBuffer, { type: 'array' });

            // Get the first sheet
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];

            // Convert to JSON
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

            if (jsonData.length === 0) {
                toast("The uploaded file appears to be empty", {
                    className: "!bg-red-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
                    icon: <XIcon className='size-5' />
                });
                return;
            }

            // Get headers (first row)
            const headers = jsonData[0] as string[];

            // Find company_name and designation column indices
            const companyIndex = headers.findIndex(header =>
                header && header.toLowerCase().includes('company')
            );
            const designationIndex = headers.findIndex(header =>
                header && (header.toLowerCase().includes('designation') || header.toLowerCase().includes('job') || header.toLowerCase().includes('title'))
            );

            if (companyIndex === -1) {
                toast("Could not find company_name column in the uploaded file", {
                    className: "!bg-red-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
                    icon: <XIcon className='size-5' />
                });
                return;
            }

            if (designationIndex === -1) {
                toast("Could not find designation column in the uploaded file", {
                    className: "!bg-red-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
                    icon: <XIcon className='size-5' />
                });
                return;
            }

            // Extract data rows (skip header)
            const dataRows = jsonData.slice(1) as any[][];

            // Process the data into the required format
            const extractedData = dataRows
                .filter(row => row[companyIndex] && row[designationIndex]) // Filter out empty rows
                .map(row => {
                    const companyName = String(row[companyIndex] || '').trim();
                    const designationValue = String(row[designationIndex] || '').trim();

                    // Split designations by comma and clean them up
                    const designations = designationValue
                        .split(',')
                        .map(d => d.trim())
                        .filter(d => d.length > 0);

                    return {
                        company_name: companyName,
                        designations: designations
                    };
                })
                .filter(item => item.company_name && item.designations.length > 0); // Final filter

            // Api Hit and sending extractedData and savedSheetData
            const response = await axios.post(`${appDomain}/api/mapping/v1/icp/compare-icp`, {
                uploadedSheetData: savedSheetData,
                compareSheetData: extractedData
            }, {
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (response.data.status) {
                toast.success(response.data.message || "Files compared successfully", {
                    className: "!bg-green-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
                    icon: <CircleCheck className='size-5' />
                });
                const dataToSave = {
                    data: response.data.data,
                    score: response.data.score,
                    totalScore: response.data.totalScore,
                    percent: response.data.percent
                }
                setComparedData(dataToSave);
            }

            // toast(`Successfully extracted ${extractedData.length} records from the file`, {
            //     className: "!bg-green-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
            //     icon: <CircleCheck className='size-5' />
            // });

        } catch (error) {
            console.error('Error reading file:', error);
            toast("Error reading the uploaded file. Please check the file format.", {
                className: "!bg-red-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
                icon: <XIcon className='size-5' />
            });
        } finally {
            setComparing(false);
        }
    }

    if (loading) return <Wave />;

    return (
        <div>
            <div className='flex items-center justify-between gap-3'>
                <div className='flex items-center gap-3'>
                    <GoBack />
                    <h1 className='text-xl font-semibold'>ICP</h1>
                </div>
                <div className='flex items-center gap-3'>
                    <Button variant="outline" onClick={() => setCompareOpen(true)}>
                        Compare
                    </Button>
                </div>
            </div>

            {/* Compare ICP Dialog */}
            <Dialog open={compareOpen} onOpenChange={(open) => {
                if (!open) {
                    setCompareOpen(false);
                    setCompareFile(null);
                    setSelectedICPSheet('');
                    setComparedData(null);
                }
            }}>
                <DialogContent className="sm:max-w-3xl max-h-[85vh] overflow-hidden overflow-y-auto grid grid-rows-[auto,auto,1fr,auto]">
                    <DialogHeader className="shrink-0">
                        <DialogTitle>Compare ICP</DialogTitle>
                    </DialogHeader>

                    {comparedData && <Button className='btn !h-10 max-w-fit flex justify-self-end' onClick={() => { setCompareFile(null); setComparedData(null); }}>Upload New</Button>}

                    {/* Static form area (always visible) */}
                    <div hidden={comparedData ? true : false} className="space-y-4 mt-5 shrink-0">
                        <div>
                            <Label>Select ICP sheet to compare against</Label>
                            <div className="mt-2">
                                <Select value={selectedICPSheet} onValueChange={setSelectedICPSheet}>
                                    <SelectTrigger className='cursor-pointer'>
                                        <SelectValue placeholder="Select ICP sheet" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {icpMetaData?.map(m => (
                                            <SelectItem key={m.sheet_name} value={m.sheet_name} className='capitalize cursor-pointer'>
                                                {m.sheet_name.split("_")[0].split("-").join(" ")}
                                            </SelectItem>
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
                    </div>

                    {/* Results area (scrolls independently if long) */}
                    <div hidden={!comparedData} className="min-h-0 mt-4 overflow-auto">
                        <div className="border rounded-md p-4 space-y-4">
                            <div className="flex items-end gap-4">
                                <div className="text-3xl font-semibold">{comparedData?.score}</div>
                                <div className="text-muted-foreground">match score</div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                                <div className="rounded-md bg-sky-100 p-3">
                                    <div className="text-xs text-muted-foreground">Companies matched</div>
                                    <div className="font-medium">{comparedData?.data.length}</div>
                                </div>
                                <div className="rounded-md bg-yellow-100 p-3">
                                    <div className="text-xs text-muted-foreground">Secured score</div>
                                    <div className="font-medium">{comparedData?.score}</div>
                                </div>
                                <div className="rounded-md bg-purple-100 p-3">
                                    <div className="text-xs text-muted-foreground">Percentage</div>
                                    <div className="font-medium">{comparedData?.percent}</div>
                                </div>
                            </div>
                            <div>
                                <div className="text-sm font-medium mb-2">Matched breakdown</div>
                                <div className="border rounded-md">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className='bg-muted hover:bg-muted'>
                                                <TableHead>Company</TableHead>
                                                <TableHead className='text-center'>Designation</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {comparedData?.data?.map((m, i) => (
                                                <TableRow key={i} className='capitalize'>
                                                    <TableCell className='font-medium'>{m.company}</TableCell>
                                                    <TableCell className='text-muted-foreground text-center'>{m.designation ? m.designation : "-"}</TableCell>
                                                </TableRow>
                                            ))}
                                            {comparedData?.data?.length === 0 && (
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

                    <DialogFooter className="shrink-0">
                        <Button variant="outline" onClick={() => {
                            setCompareOpen(false);
                            setCompareFile(null);
                            setSelectedICPSheet('');
                        }} className='cursor-pointer'>Close</Button>
                        {!comparedData && <Button
                            disabled={!compareFile || !selectedICPSheet}
                            onClick={handleCompareFiles}
                            className='bg-brand-primary hover:bg-brand-primary-dark duration-300 transition-colors'>
                            {comparing ? <span className='flex items-center gap-x-2'>Comparing <Loader2 className="animate-spin" /></span> : 'Compare'}
                        </Button>}
                    </DialogFooter>
                </DialogContent>
            </Dialog>


            <div className='mt-6 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6'>
                {icpMetaData ? icpMetaData?.map((metaData: PreferencesPayload) => {
                    const meta = formatUploadedOn(metaData.sheet_name);
                    return (
                        <Card key={metaData.sheet_name} className='relative transition-shadow hover:shadow-md'>
                            <CardHeader className='flex flex-col'>
                                <CardTitle className='text-base sm:text-lg capitalize break-words line-clamp-2'>{meta.name.split("_")[0].split("-").join(" ")}</CardTitle>
                                <CardDescription>{meta.uploadedOn ? `Uploaded on ${meta.uploadedOn}` : '—'}</CardDescription>
                                <CardAction className='flex gap-2 mt-3'>
                                    <Dialog open={openPreviewFor === metaData.sheet_name} onOpenChange={(o) => { if (o) { handlePreview(metaData.sheet_name); } else { setOpenPreviewFor(null); } }}>
                                        {!(metaData.preferences && metaData.preferences.length > 0 && metaData.preferences[0].designation) && <DialogTrigger asChild>
                                            <Button variant="outline" size="sm">Preview</Button>
                                        </DialogTrigger>}
                                        <DialogContent className='sm:max-w-5xl max-h-[80vh] w-[calc(100%-2rem)] overflow-y-auto'>
                                            <DialogHeader>
                                                <DialogTitle className='capitalize flex justify-between items-center mt-5'>
                                                    {activeSheet?.sheet_name?.split("").find((char: string) => char === '_') ? activeSheet?.sheet_name?.split("_")[0] : activeSheet?.sheet_name}
                                                    {/* <Link to={`/icp/add-entry/${activeSheet?.sheet_name}`}><Button variant="outline" size="sm" className='cursor-pointer'>Add Entry</Button></Link> */}
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
                                                            <TableHead className='w-[140px]'>Employee Size</TableHead>
                                                            <TableHead className='w-[120px]'>Priority</TableHead>
                                                            {/* <TableHead className='w-[120px]'>Actions</TableHead> */}
                                                        </TableRow>
                                                    </TableHeader>
                                                    <TableBody>
                                                        {paginatedRows?.map((row, idx) => (
                                                            <TableRow key={(row as any).uuid || idx} className='capitalize'>
                                                                <TableCell className='font-medium'>{(row as any).companyname}</TableCell>
                                                                <TableCell className='text-muted-foreground'>
                                                                    {Array.isArray((row as any).designation)
                                                                        ? ((row as any).designation as any[]).map(d => String(d)).join(', ')
                                                                        : String((row as any).designation || '')
                                                                            .split(',')
                                                                            .map((d: string) => d.trim())
                                                                            .filter(Boolean)
                                                                            .join(', ') || '-'}
                                                                </TableCell>
                                                                <TableCell>{(row as any).country_name}</TableCell>
                                                                <TableCell>{(row as any).state_name}</TableCell>
                                                                <TableCell>{(row as any).employee_size}</TableCell>
                                                                <TableCell>{(row as any).priority}</TableCell>
                                                                {/* <TableCell className="space-x-2">
                                                                    <Button variant="outline" size="sm" className="cursor-pointer" onClick={() => openEditEntry(row, ((currentPage - 1) * ROWS_PER_PAGE) + idx)}>Edit</Button>
                                                                </TableCell> */}
                                                            </TableRow>
                                                        ))}
                                                        {paginatedRows?.length === 0 && (
                                                            <TableRow>
                                                                <TableCell colSpan={hasIndustry ? 8 : 7} className='text-center text-muted-foreground'>No entries found</TableCell>
                                                            </TableRow>
                                                        )}
                                                    </TableBody>
                                                </Table>
                                            </div>

                                            {activeSheet && (activeSheet?.sheetRows?.length || 0) > ROWS_PER_PAGE && (
                                                <Pagination className='mt-4'>
                                                    <PaginationContent>
                                                        <PaginationItem>
                                                            <PaginationPrevious
                                                                onClick={(e) => { e.preventDefault(); setCurrentPage(p => Math.max(1, p - 1)); }}
                                                                className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                                                                href="#"
                                                            />
                                                        </PaginationItem>
                                                        <PaginationItem>
                                                            <span className='px-3 py-2 text-sm text-muted-foreground'>Page {currentPage} of {totalPages}</span>
                                                        </PaginationItem>
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
                                                <AlertDialogAction className='cursor-pointer bg-destructive text-white' onClick={() => handleDelete(metaData.sheet_name)}>
                                                    Delete
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </CardAction>
                            </CardHeader>
                            {(metaData.preferences && metaData.preferences.length > 0 && metaData.preferences[0].designation) && <div className='block absolute right-2 top-2'>
                                <Link to={`/icp/update-sheet/${metaData.sheet_name}`} className='p-2 bg-brand-primary hover:bg-brand-primary-dark duration-300 rounded-full text-white block'>
                                    <Edit size={16} className='text-foreground'/>
                                </Link>
                            </div>}
                            {/* <CardContent>
                                <div className='text-sm text-muted-foreground'>
                                    {metaData.length} entries
                                </div>
                            </CardContent> */}
                        </Card>
                    );
                }) : (
                    <div className='text-center text-muted-foreground w-full h-full col-span-full'>
                        No ICP sheets found.
                    </div>
                )}
            </div>
        </div>
    )
}

export default SavedICP;