import React, { useEffect, useState, useCallback, useMemo } from 'react';
import axios from 'axios';
import { appDomain } from '@/constants';
import GoBack from '@/components/GoBack';

import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { useDropzone } from 'react-dropzone';
import { FileUp, FileText } from 'lucide-react';
type EncodingMap = Record<string, string>;

function customSoundex(name: string): string {
    if (!name) return '';
    name = name.toUpperCase();
    const encodingMap: EncodingMap = {
        B: '1', F: '1', P: '1', V: '1',
        C: '2', G: '2', J: '2', K: '2', Q: '2', S: '2', X: '2', Z: '2',
        D: '3', T: '3',
        L: '4',
        M: '5', N: '5',
        R: '6'
    };
    const separators: string[] = ['A', 'E', 'I', 'O', 'U', 'H', 'W', 'Y'];
    const getEncodedChar = (char: string): string => encodingMap[char] || '';
    let encodedName: string = name[0];
    let prevCode: string = getEncodedChar(name[0]);
    for (let i = 1; i < name.length; i++) {
        const char: string = name[i];
        const code: string = getEncodedChar(char);
        if (separators.includes(char)) {
            prevCode = '';
            continue;
        }
        if (code && code !== prevCode) {
            encodedName += code;
        }
        prevCode = code;
    }
    encodedName = encodedName.substring(0, 1) + encodedName.substring(1).replace(/[^0-9]/g, '');
    encodedName = encodedName.padEnd(4, '0').substring(0, 4);
    return encodedName;
}

function hashName(name: string): number {
    if (!name) return 0;
    const words: string[] = name
        .split(/\s+/)
        .filter(word => !["AND", "THE", "OF", "INC", "LTD", "LLC", "CORP", "COMPANY", "PVT"].includes(word.toUpperCase()))
        .map(word => word.toLowerCase())
        .sort();
    const hash = words.reduce((acc: number, word: string) => {
        return acc + word.split('').reduce((charAcc: number, char: string) => charAcc + char.charCodeAt(0), 0);
    }, 0);
    return hash;
}

function enhancedCustomSoundex(name: string): string {
    if (!name) return '';
    return customSoundex(name) + hashName(name).toString();
}

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
    const [showList, setShowList] = useState<boolean>(false);
    // Pagination state for ICP list
    const [itemsPerPage, setItemsPerPage] = useState<number>(10);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const paginatedICP = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return listData.slice(start, start + itemsPerPage);
    }, [listData, currentPage, itemsPerPage]);
    const totalPages = useMemo(() => Math.ceil(listData.length / itemsPerPage) || 1, [listData.length, itemsPerPage]);
    const handleItemsPerPageChange = (value: string) => { setItemsPerPage(Number(value)); setCurrentPage(1); };
    const handlePageChange = (page: number) => setCurrentPage(page);

    const [uploadedFile, setUploadedFile] = useState<File | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [companyHighestScore, setCompanyHighestScore] = useState(0);
    const [matchedCompanyCount, setMatchedCompanyCount] = useState(0);
    const [companyList, setCompanyList] = useState<string[]>([]);
    const [matchedDesignations, setMatchedDesignations] = useState<string[]>([]);
    const [companyWithDesignationScore, setCompanyWithDesignationScore] = useState(0);
    const [showResults, setShowResults] = useState(false);



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


            compareAll(listData, mapped);
            setShowResults(true);
        } catch (e) {
            console.error('Failed to read Excel file:', e);
            setError('Failed to read Excel file.');
        } finally {
            setLoading(false);
        }
    }

    const compareAll = (
        icpList: ListData[],
        uploaded: Array<{ priority: string; company: string; designation: string }>
    ) => {
        const priorityWeight: Record<string, number> = { p1: 5, p2: 3, p3: 1 };
        let maxCompanyScore = 0;
        const matchedCompanies = new Set<string>();
        let securedScore = 0;
        const matchedDesignationsAcc: string[] = [];

        const getRoleScore = (w: string): number => {
            const word = w.toLowerCase();
            const cSuite = new Set([
                'ceo', 'cgo', 'coo', 'cfo', 'cio', 'cto', 'cmo', 'chro', 'cpo', 'cro', 'cco', 'cdo', 'clo', 'cino', 'cso', 'cxo', 'cao', 'ciso',
                'chief executive officer', 'chief growth officer', 'chief operating officer', 'chief financial officer', 'chief information officer', 'chief technology officer', 'chief marketing officer', 'chief human resources officer', 'chief product officer', 'chief revenue officer', 'chief customer officer', 'chief data officer', 'chief compliance officer', 'chief risk officer', 'chief legal officer', 'chief innovation officer', 'chief strategy officer', 'chief experience officer', 'chief digital officer', 'chief sustainability officer', 'chief analytics officer', 'chief communications officer', 'chief security officer', 'chief information security officer'
            ]);
            if (cSuite.has(word)) return 5;
            if (word === 'vice president' || word === 'vp') return 4;
            if (word === 'director' || word === 'general manager' || word === 'gm' || word === 'head') return 3;
            if (word === 'manager') return 2;
            return 1;
        };

        for (const icp of icpList) {
            const pScore = priorityWeight[icp.priority?.toLowerCase?.() as string] ?? 0;
            maxCompanyScore += pScore;

            for (const up of uploaded) {
                if (enhancedCustomSoundex(icp.company) === enhancedCustomSoundex(up.company)) {
                    matchedCompanies.add(up.company.toLowerCase());

                    const sentence = String(up.designation || '').toLowerCase();
                    const words = String(icp.designation || '')
                        .toLowerCase()
                        .split(',')
                        .map(s => s.trim())
                        .filter(Boolean);

                    for (const w of words) {
                        if (sentence.indexOf(w) > -1) {
                            securedScore += pScore + getRoleScore(w);
                            matchedDesignationsAcc.push(up.designation);
                        }
                    }
                }
            }
        }

        setCompanyHighestScore(maxCompanyScore);
        setMatchedCompanyCount(matchedCompanies.size);
        setCompanyList(Array.from(matchedCompanies));
        setCompanyWithDesignationScore(securedScore);

        const uniqueDesignations = Array.from(new Set(
            matchedDesignationsAcc.map(s => String(s).replace(/,\s*$/, ''))
        ));


        setMatchedDesignations(uniqueDesignations);
    };

    const resetToUpload = () => {
        setShowResults(false);
        setUploadedFile(null);
        setError(null);
        setCompanyHighestScore(0);
        setMatchedCompanyCount(0);
        setCompanyList([]);
        setCompanyWithDesignationScore(0);
        setMatchedDesignations([]);
    };

    return (
        <div>
            <div className='flex items-center gap-3 justify-between'>
                <div className='flex items-center gap-3'>
                    <GoBack />
                    <h1 className='text-xl font-semibold'>Compare your ICP</h1>
                </div>

                <div className='flex items-center gap-3'>
                    <Button className='btn' onClick={resetToUpload}>Upload New File</Button>
                    <Button className='btn' onClick={() => setShowList(prev => !prev)}>{showList ? "Hide List" : "Show List"}</Button>
                </div>
            </div>

            <div className="mt-6">
                <div className="w-[690px] p-7 rounded-[10px] mx-auto">
                    {!showResults && (
                        <>
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
                                <Button
                                    onClick={handleCompare}
                                    disabled={!uploadedFile || loading}
                                    className="btn !bg-brand-secondary !text-white w-[200px] h-9"
                                >
                                    {loading ? 'Comparing...' : 'Compare'}
                                </Button>
                            </div>
                        </>
                    )}

                    <div hidden={!showResults} className="mt-8 space-y-3">
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


                {/* ICP List */}
                {showList && (
                    <div className='bg-brand-background rounded-lg p-5 mt-6 shadow-blur'>
                        <div className='flex w-full justify-between items-baseline mb-3'>
                            <div className='flex items-center w-full gap-2.5'>
                                <Select value={itemsPerPage.toString()} onValueChange={handleItemsPerPageChange}>
                                    <SelectTrigger className="rounded-sm !w-fit !max-h-[30px] border-1 border-brand-light-gray flex items-center justify-center text-sm">
                                        <SelectValue placeholder={`${itemsPerPage}/Page`} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {[10, 25, 50, 100].map(v => (
                                            <SelectItem key={v} value={v.toString()}>{v}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                <span className='font-medium text-sm'>Total Companies: {listData.length}</span>
                            </div>
                        </div>
                        
                        <Table>
                            <TableHeader className='bg-brand-light-gray !rounded-[10px]'>
                                <TableRow className='!text-base'>
                                    <TableHead className="text-left min-w-10 !px-2">Sr.No</TableHead>
                                    <TableHead className="text-left min-w-10 !px-2">Company</TableHead>
                                    <TableHead className="text-left min-w-10 !px-2">Designation</TableHead>
                                    <TableHead className="text-left min-w-10 !px-2">Priority</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {paginatedICP.map((item, index) => (
                                    <TableRow key={item._id}>
                                        <TableCell className="text-left min-w-10 font-medium">{(currentPage - 1) * itemsPerPage + index + 1}</TableCell>
                                        <TableCell className="text-left min-w-10 capitalize">{item.company}</TableCell>
                                        <TableCell className="text-left min-w-10 capitalize">{item.designation}</TableCell>
                                        <TableCell className="text-left min-w-10 capitalize">{item.priority}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>

                        {/* Pagination */}
                        <Pagination className='mt-[26px] flex justify-end'>
                            <PaginationContent>
                                <PaginationItem>
                                    <PaginationPrevious
                                        onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
                                        className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                                    />
                                </PaginationItem>

                                {/* Show first page */}
                                {totalPages > 0 && (
                                    <PaginationItem>
                                        <PaginationLink
                                            isActive={currentPage === 1}
                                            onClick={() => handlePageChange(1)}
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

                                {/* Show current page and adjacent pages */}
                                {totalPages > 1 && currentPage > 2 && (
                                    <PaginationItem>
                                        <PaginationLink
                                            onClick={() => handlePageChange(currentPage - 1)}
                                            className="cursor-pointer"
                                        >
                                            {currentPage - 1}
                                        </PaginationLink>
                                    </PaginationItem>
                                )}

                                {totalPages > 1 && currentPage > 1 && currentPage < totalPages && (
                                    <PaginationItem>
                                        <PaginationLink
                                            isActive={true}
                                            className="cursor-pointer"
                                        >
                                            {currentPage}
                                        </PaginationLink>
                                    </PaginationItem>
                                )}

                                {totalPages > 2 && currentPage < totalPages - 1 && (
                                    <PaginationItem>
                                        <PaginationLink
                                            onClick={() => handlePageChange(currentPage + 1)}
                                            className="cursor-pointer"
                                        >
                                            {currentPage + 1}
                                        </PaginationLink>
                                    </PaginationItem>
                                )}

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
                                            isActive={currentPage === totalPages}
                                            onClick={() => handlePageChange(totalPages)}
                                            className="cursor-pointer"
                                        >
                                            {totalPages}
                                        </PaginationLink>
                                    </PaginationItem>
                                )}

                                <PaginationItem>
                                    <PaginationNext
                                        onClick={() => currentPage < totalPages && handlePageChange(currentPage + 1)}
                                        className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                                    />
                                </PaginationItem>
                            </PaginationContent>
                        </Pagination>
                    </div>
                )}
            </div>
        </div>
    )
}

export default ICP;
