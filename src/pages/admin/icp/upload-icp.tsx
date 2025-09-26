import GoBack from '@/components/GoBack';
import Wave from '@/components/Wave';
import useAuthStore from '@/store/authStore';
import useICPStore from '@/store/icpStore';
import React, { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import * as XLSX from 'xlsx';
import { Download, Upload as UploadIcon } from 'lucide-react';
import { Card } from "@/components/ui/card";

const UploadICP: React.FC = () => {
    const { user } = useAuthStore(state => state);
    const { loading, getICPSheets, uploadICPSheet } = useICPStore(state => state);

    const [sheetName, setSheetName] = useState("");
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [nameError, setNameError] = useState<string | null>(null);
    const [fileError, setFileError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        if (user) getICPSheets(user.id as number);
    }, [user, getICPSheets]);

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
            if(res?.status === 401) {
                toast(res.message || 'Invalid Header. Please check the sample file.', {
                    className: "!bg-red-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2"
                });

                return;
            }
            toast(res && 'message' in res ? res.message || 'Uploaded successfully' : 'Uploaded successfully', {
                className: "!bg-green-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2"
            });
            setSheetName("");
            setSelectedFile(null);
            if (fileInputRef.current) fileInputRef.current.value = '';
        } catch (err: any) {
            toast(err?.message || 'Failed to upload ICP', {
                className: "!bg-red-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2"
            });
        } finally {
            setUploading(false);
        }
    };

    const downloadSampleFile = () => {
        const sampleData = [
            {
                company_name: 'Flipkart',
                designation: 'CTO',
                priority: 'P3',
                country_name: "India",
                state_name: "Banglore",
                employee_size: "10000+ people"
            },
            {
                company_name: 'Google',
                designation: 'CEO, Marketing Director',
                priority: 'P1',
                country_name: "USA",
                state_name: "Texas",
                employee_size: "10000+ people"
            }
        ];

        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(sampleData);
        XLSX.utils.book_append_sheet(wb, ws, 'Sample Sheet');
        XLSX.writeFile(wb, 'sample_sheet.xlsx');
    };

    if (loading) return <Wave />;

    return (
        <div className="space-y-6">
            <div className='flex items-center justify-between gap-3'>
                <div className='flex items-center gap-3'>
                    <GoBack />
                    <h1 className='text-xl font-semibold'>ICP</h1>
                </div>

                <Button className='btn' onClick={downloadSampleFile}>
                    <Download className="mr-2 h-4 w-4" /> Download Sample
                </Button>
            </div>

            <Card className="p-6 max-w-xl mx-auto">
                <h2 className="text-lg font-semibold mb-6">Upload ICP</h2>
                <div className="space-y-4">
                    <div>
                        <Label htmlFor="sheetName">Name</Label>
                        <Input
                            id="sheetName"
                            placeholder="Enter sheet name"
                            value={sheetName}
                            className='mt-2'
                            onChange={(e) => { 
                                setSheetName(e.target.value); 
                                if (e.target.value.trim()) setNameError(null); 
                            }}
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
                    <div className="flex justify-end pt-2">
                        <Button 
                            onClick={handleUpload} 
                            disabled={uploading} 
                            className='btn w-full sm:w-auto'
                        >
                            <UploadIcon className="mr-2 h-4 w-4" />
                            {uploading ? 'Uploading…' : 'Upload ICP'}
                        </Button>
                    </div>
                </div>
            </Card>
        </div>
    )
}

export default UploadICP;