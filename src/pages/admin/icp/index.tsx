import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { appDomain } from '@/constants';
import GoBack from '@/components/GoBack';

import { Button } from '@/components/ui/button';
import { useDropzone } from 'react-dropzone';
import { FileUp, FileText } from 'lucide-react';
import enhancedCustomSoundex from './helpers';
import * as XLSX from 'xlsx';

interface ListData {
    country: string;
    state: string;
    skill: string;
    company: string;
    industry: string;
    designation: string;
    employeeSize: string;
    priority: string;
    _id: string;
}

const fetchICPList = async (userId: string, token: string) => {
    try {
        const response = await axios.post(`${appDomain}/api/marketing/user/getUploadedICPData`, { userId }, {
            headers: {
                'Content-Type': 'application/json',
                'x-access-token': token,
            }
        });
        return response.data.result.data[0].list;
    } catch (error) {
        console.error('Error fetching ICP list:', error);
        return [];
    }
}
const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiNjZiNGM3MjhhYjIwZjFiM2FkNDQ5N2Y4IiwiZW1haWwiOiJ2YWx1ZUBrbG91dC5jbHViIiwicm9sZSI6InByZW1pdW0iLCJpYXQiOjE3NTc0MDExMzksImV4cCI6MTc1ODAwNTkzOX0.SEX9EU53YtpetjJZuIQVlKcZ6YyH4IXPzx0AVyiZshI";
const userId = "66b4c728ab20f1b3ad4497f8";

const ICP: React.FC = () => {
    const [listData, setListData] = useState<ListData[]>([]);
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [companyHighestScore, setCompanyHighestScore] = useState(0);
    const [matchedCompanyCount, setMatchedCompanyCount] = useState(0);
    const [companyList, setCompanyList] = useState<string[]>([]);
    const [matchedCompanyAndDesignation, setMatchedCompanyAndDesignation] = useState<string[]>([]);
    const [companyWithDesignationScore, setCompanyWithDesignationScore] = useState(0);
    const [uploadedICPData, setUploadedICPData] = useState<Array<{ priority: string; company: string; designation: string }>>([]);


    useEffect(() => {
        fetchICPList(userId, token).then(res => {
            // setUploadedICPData(res);
            setListData(res)
        });
    }, []);

    const onDrop = useCallback((acceptedFiles: File[]) => {
        const file = acceptedFiles[0];
        if (!file) return;
        setError(null);
        setUploadedFile(file);
    }, []);


    // Alias to use fetched list data in matching functions
    const data = uploadedICPData;

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        onDropRejected: () => setError('Only Excel files (.xlsx, .xls) are allowed.'),
        accept: {
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
            'application/vnd.ms-excel': ['.xls']
        },
        maxFiles: 1
    });

    const handleCompare = async () => {
        if (!uploadedFile) return;
        try {
            setLoading(true);
            const arrayBuffer = await uploadedFile.arrayBuffer();
            const bytes = new Uint8Array(arrayBuffer);
            const workbook = XLSX.read(bytes, { type: 'array' });
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];
            const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][];

            if (!rows || rows.length === 0) {
                setError('Uploaded file is empty.');
                return;
            }

            const headers = (rows[0] || []).map((h: any) => String(h ?? '').trim());
            const dataRows = rows.slice(1);

            const objects = dataRows.map((row) => {
                const obj: Record<string, any> = {};
                headers.forEach((h, idx) => {
                    obj[h || `Column_${idx + 1}`] = (row as any[])[idx];
                });
                return obj;
            });

            const mapped = objects.map((o) => ({
                company: String(o.company ?? o.Company ?? o.COMPANY ?? '').trim(),
                designation: String(o.designation ?? o.Designation ?? o.DESIGNATION ?? '').trim(),
                priority: String(o.priority ?? o.Priority ?? o.PRIORITY ?? '').trim(),
            })).filter(x => x.company || x.designation || x.priority);

            setUploadedICPData(mapped as Array<{ priority: string; company: string; designation: string }>);

            // Defer compare to ensure state is updated
            setTimeout(() => {
                companyCompare();
                companyWithDesignationMatch();
            }, 0);
        } catch (e) {
            console.error('Failed to read Excel file:', e);
            setError('Failed to read Excel file.');
        } finally {
            setLoading(false);
        }
    }

    const companyCompare = () => {
        // alert('running company compare');
        const matchedData: string[] = [];
        let matchCount = 0;
        let companyScore = 0;
        const p1Score = 5;
        const p2Score = 3;
        const p3Score = 1;
        listData.forEach((uploadItem) => {
            if (uploadItem.priority.toLowerCase() === "p1") {
                companyScore = companyScore + p1Score;
            } else if (uploadItem.priority.toLowerCase() === "p2") {
                companyScore = companyScore + p2Score;
            } else if (uploadItem.priority.toLowerCase() === "p3") {
                companyScore = companyScore + p3Score;
            }
            data.forEach((item) => {
                if (enhancedCustomSoundex(uploadItem.company) === enhancedCustomSoundex(item.company)) {
                    // matchedData.push(uploadItem.company);
                    let companyName = item.company.toLowerCase();
                    matchedData.push(companyName);
                    matchCount++;
                }
            })
        })
        setLoading(false);
        // Remove duplicates
        const uniqueMatchedData = [...new Set(matchedData)];
        setCompanyHighestScore(companyScore)
        setMatchedCompanyCount(uniqueMatchedData.length)
        setCompanyList(uniqueMatchedData)
    }

    const companyWithDesignationMatch = () => {
        // alert('running companyWithDesignationMatch')
        const matched: string[] = [];
        let matchCount = 0;
        let securedScore = 0;
        let priorityScore = 0;
        listData.forEach((uploadItem) => {
            if (uploadItem.priority.toLowerCase() === "p1") {
                priorityScore = 5;
            } else if (uploadItem.priority.toLowerCase() === "p2") {
                priorityScore = 3;
            } else if (uploadItem.priority.toLowerCase() === "p3") {
                priorityScore = 1;
            } else {
                priorityScore = 0;
            }

            // console.log(data)
            data.forEach((item) => {
                if (enhancedCustomSoundex(uploadItem.company) === enhancedCustomSoundex(item.company)) {
                    const uploadDesignation = uploadItem.designation.split(', ');

                    for (let i = 0; i < uploadDesignation.length; i++) {
                        const word = uploadDesignation[i].toLowerCase();
                        const sentence = item.designation.toLowerCase();
                        const matchedWord = sentence.indexOf(word);


                        if (matchedWord > -1) {

                            if (word === "ceo" || word === "cgo" || word === "coo" || word === "cfo" || word === "cio" || word === "cto" || word === "cmo" || word === "chro" || word === "cpo" || word === "cro" || word === "cco" || word === "cdo" || word === "cco" || word === "clo" || word === "cino" || word === "cso" || word === "cxo" || word === "cdo" || word === "cso" || word === "cao" || word === "cco" || word === "ciso" || word === "chief executive officer" || word === "chief growth officer" || word === "chief operating officer" || word === "chief financial officer" || word === "chief information officer" || word === "chief technology officer" || word === "chief marketing officer" || word === "chief human Resources officer" || word === "chief product officer" || word === "chief revenue officer" || word === "chief customer officer" || word === "chief data officer" || word === "chief compliance officer" || word === "chief risk officer" || word === "chief legal officer" || word === "chief innovation officer" || word === "chief strategy officer" || word === "chief experience officer" || word === "chief digital officer" || word === "chief sustainability officer" || word === "chief analytics officer" || word === "chief communications officer" || word === "chief security officer" || word === "chief information security officer") {
                                const score = 5;
                                securedScore = securedScore + priorityScore + score;
                            } else if (word === "vice president" || word === "vp") {
                                const score = 4;
                                securedScore = securedScore + priorityScore + score;
                            } else if (word === "director" || word === "general manager" || word === "gm" || word === "head") {
                                const score = 3;
                                securedScore = securedScore + priorityScore + score;
                            } else if (word === "manager") {
                                const score = 2;
                                securedScore = securedScore + priorityScore + score;
                            } else {
                                const score = 1;
                                securedScore = securedScore + priorityScore + score;
                            }
                            matched.push(`${item.company}---`);
                            matched.push(`${item.designation}, `);
                            matchCount++
                        }
                    }
                }
            })
        })
        setLoading(false);
        setMatchedCompanyAndDesignation(matched);
        setCompanyWithDesignationScore(securedScore)
    }

    const matchedDesignations = matchedCompanyAndDesignation
        .filter((_, idx) => idx % 2 === 1)
        .map((s) => String(s).replace(/,\s*$/, ''));

    return (
        <div>
            <div className='flex items-center gap-3 justify-between'>
                <div className='flex items-center gap-3'>
                    <GoBack />
                    <h1 className='text-xl font-semibold'>Compare your ICP</h1>
                </div>

                <Button className='btn'>Upload New File</Button>
            </div>

            <div className="mt-6">
                <div className="w-[690px] p-7 rounded-[10px] mx-auto">
                    <div
                        {...getRootProps()}
                        className={`border group duration-300 hover:border-brand-primary border-brand-light-gray shadow-blur rounded-lg bg-white p-6 cursor-pointer transition-colors ${isDragActive ? 'border-brand-secondary bg-brand-secondary/10' : 'border-gray-300'}`}

                    >
                        <input {...getInputProps()} />
                        <div className="flex flex-col items-center justify-center gap-2 text-center">
                            <FileUp width={24} className="group-hover:stroke-brand-primary duration-300" />
                            {isDragActive ? (
                                <p className="text-brand-secondary font-medium">Drop the file here...</p>
                            ) : (
                                <>
                                    <p className="text-lg"><span className="text-brand-primary font-semibold">Click Here</span> to Upload your File or Drag</p>
                                    <p>Supported file: <span className="font-semibold">.xlsx, .xls</span></p>
                                </>
                            )}
                            {uploadedFile && (
                                <div className="mt-4 flex items-center gap-2 p-2 bg-gray-100 rounded-md w-full">
                                    <FileText className="size-5 text-brand-secondary" />
                                    <span className="text-sm font-medium truncate">{uploadedFile.name}</span>
                                    <span className="text-xs text-gray-500">({(uploadedFile.size / (1024 * 1024)).toFixed(2)} MB)</span>
                                </div>
                            )}
                            {error && (
                                <p className="mt-2 text-sm text-red-600">{error}</p>
                            )}
                        </div>
                    </div>

                    <div className="mt-9 flex justify-center">

                        {/* <div className="mt-10">
                    <h2 className="text-lg font-semibold mb-3">Your ICP Data</h2>
                    {listData && listData.length > 0 ? (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableCaption>Total: {listData.length}</TableCaption>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Company</TableHead>
                                        <TableHead>Designation</TableHead>
                                        <TableHead>Industry</TableHead>
                                        <TableHead>Employees</TableHead>
                                        <TableHead>Priority</TableHead>
                                        <TableHead>Country</TableHead>
                                        <TableHead>State</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {listData.map((row) => (
                                        <TableRow key={row._id}>
                                            <TableCell className="font-medium">{row.company}</TableCell>
                                            <TableCell>{row.designation}</TableCell>
                                            <TableCell>{row.industry}</TableCell>
                                            <TableCell>{row.employeeSize}</TableCell>
                                            <TableCell>{row.priority}</TableCell>
                                            <TableCell>{row.country}</TableCell>
                                            <TableCell>{row.state}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    ) : (
                        <p className="text-sm text-muted-foreground">No data found.</p>
                    )}
                </div> */}

                        <Button
                            onClick={handleCompare}
                            disabled={!uploadedFile || loading}
                            className="btn !bg-brand-secondary !text-white w-[200px] h-9"
                        >
                            {loading ? 'Comparing...' : 'Compare'}
                        </Button>
                    </div>

                    <div className="mt-8 space-y-3">
                        <h3 className="text-base font-semibold">Comparison Results</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="p-3 rounded-md border bg-white">
                                <div className="text-xs text-muted-foreground">Total companies</div>
                                <div className="text-lg font-semibold">{listData.length}</div>
                            </div>
                            <div className="p-3 rounded-md border bg-white">
                                <div className="text-xs text-muted-foreground">Companies matched</div>
                                <div className="text-lg font-semibold">{matchedCompanyCount}</div>
                            </div>
                            <div className="p-3 rounded-md border bg-white md:col-span-2">
                                <div className="text-xs text-muted-foreground">Score</div>
                                <div className="text-lg font-semibold">{(companyWithDesignationScore / ((listData.length * 5) + companyHighestScore)) * 100} %</div>
                            </div>
                        </div>
                        <div className="p-3 rounded-md border bg-white">
                            <div className="text-xs text-muted-foreground mb-1">Matched Company Names</div>
                            <div className="text-sm break-words capitalize">{companyList.length ? companyList.join(', ') : '-'}</div>
                        </div>
                        <div className="p-3 rounded-md border bg-white">
                            <div className="text-xs text-muted-foreground mb-1">Designations</div>
                            <div className="text-sm break-words capitalize">{matchedDesignations.length ? matchedDesignations.join(', ') : '-'}</div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    )
}

export default ICP;
