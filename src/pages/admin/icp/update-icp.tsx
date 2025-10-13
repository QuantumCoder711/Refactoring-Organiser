// update-icp.tsx

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { X, ChevronDown, Loader2, CircleCheck, XIcon, Check } from 'lucide-react';
import { CountrySelect, StateSelect, GetCountries } from 'react-country-state-city';
import 'react-country-state-city/dist/react-country-state-city.css';
import useExtrasStore from '@/store/extrasStore';
import useICPStore, { PreferencesPayload } from '@/store/icpStore';
import useAuthStore from '@/store/authStore';
import { appDomain } from '@/constants';
import axios from 'axios';
import { toast } from 'sonner';
import GoBack from '@/components/GoBack';
import { useParams, useNavigate } from 'react-router-dom';
import Wave from '@/components/Wave';

interface Company {
    company_name: string;
    designation: string[];
    priority: "P1" | "P2" | "P3" | "P4";
    employee_size: string;
    industry: string;
}

interface ICPData {
    sheet_name: string;
    country_name: string;
    state_name: string;
    company: Company[];
}

interface FetchedCompany {
    _id: string;
    company: string;
    industry: string;
    companySize: string;
}

// Custom Multi-Select Component
const MultiSelectDropdown = React.memo(({
    label,
    value,
    onValueChange,
    placeholder,
    options,
    required = false,
    onSearch,
    loading = false,
}: {
    label: string;
    value: string[];
    onValueChange: (value: string[]) => void;
    placeholder: string;
    options: { id: number; name: string; value?: string }[];
    required?: boolean;
    onSearch?: (term: string) => void;
    loading?: boolean;
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const term = e.target.value;
        setSearchTerm(term);
        if (onSearch) {
            onSearch(term);
        }
    };

    const handleOptionSelect = (option: { name: string; value?: string }) => {
        const valueToUse = option.value || option.name;
        if (!value.includes(valueToUse)) {
            onValueChange([...value, valueToUse]);
        } else {
            onValueChange(value.filter(item => item !== valueToUse));
        }
        setSearchTerm('');
    };

    const handleRemoveTag = (tagToRemove: string) => {
        onValueChange(value.filter(item => item !== tagToRemove));
    };

    const filteredOptions = options.filter(option =>
        option.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        !value.includes(option.name)
    );

    return (
        <div className="flex flex-col gap-2 w-full" ref={dropdownRef}>
            <Label className="font-semibold">
                {label} {required && <span className="text-secondary">*</span>}
            </Label>

            <div className="relative">
                <Input
                    type="text"
                    value={searchTerm}
                    onChange={handleInputChange}
                    onFocus={() => setIsOpen(true)}
                    placeholder={placeholder}
                    className="w-full capitalize bg-white h-12 text-base pr-10"
                />
                <ChevronDown
                    className={`absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 opacity-50 transition-transform cursor-pointer ${isOpen ? 'rotate-180' : ''
                        }`}
                    onClick={() => setIsOpen(!isOpen)}
                />

                {isOpen && (
                    <div className="absolute z-50 w-full mt-1 bg-muted/50 backdrop-blur-2xl border border-accent rounded-md shadow-lg max-h-60 overflow-y-auto">
                        {loading ? (
                            <div className="p-3 text-center">
                                <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                            </div>
                        ) : filteredOptions.length > 0 ? (
                            filteredOptions.map((option) => (
                                <div
                                    key={option.id}
                                    className={`px-3 py-2 cursor-pointer hover:bg-accent flex items-center justify-between text-sm option`}
                                    onClick={() => handleOptionSelect(option)}
                                >
                                    {option.name}
                                    {value.includes(option.value || option.name) && <Check className="size-4 text-secondary" />}
                                </div>
                            ))
                        ) : searchTerm ? (
                            <div
                                className="px-3 py-2 cursor-pointer hover:bg-background/50 text-sm font-medium"
                                onClick={() => handleOptionSelect({ name: searchTerm })}
                            >
                                {searchTerm}
                            </div>
                        ) : (
                            <div className="px-3 py-2 text-accent-foreground text-sm">No options found</div>
                        )}
                    </div>
                )}
            </div>

            {/* Selected Tags */}
            {value.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-2">
                    {value.map((item) => (
                        <Badge key={item} variant="secondary" className="group flex items-center gap-1">
                            <span className="capitalize">{item === "10000-1000000000" ? "More than 10,000" : item}</span>
                            <button
                                onClick={() => handleRemoveTag(item)}
                                className="focus:outline-none"
                            >
                                <X className="h-3 w-3 cursor-pointer group-hover:text-red-500" />
                            </button>
                        </Badge>
                    ))}
                </div>
            )}
        </div>
    );
});

const UpdateICP: React.FC = () => {
    const { designations, industries, getDesignations, getIndustries } = useExtrasStore();
    const { icpMetaData, updateICP, loading: storeLoading, getICPSheets, getICPExcelSheets } = useICPStore();
    const { user } = useAuthStore();
    const { sheetName } = useParams<{ sheetName: string }>();
    const navigate = useNavigate();

    useEffect(() => {
        if (user) getICPSheets(user.id as number);
    }, [user, getICPSheets]);

    // Find the sheet metadata from icpMetaData
    const sheetMeta = icpMetaData?.find((meta: PreferencesPayload) => meta.sheet_name === sheetName);

    const [formData, setFormData] = useState<ICPData>({
        sheet_name: sheetName || '',
        country_name: '',
        state_name: '',
        company: [],
    });

    const [formFields, setFormFields] = useState({
        designations: [] as string[],
        employeeSizes: [] as string[],
        industries: [] as string[],
        priority: 'P4' as 'P1' | 'P2' | 'P3' | 'P4',
    });

    const [resultCompanies, setResultCompanies] = useState<Company[]>([]);
    const [countryId, setCountryId] = useState<string | number | null>(null);
    const [loading, setLoading] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);

    const employeeOptions = [
        { display: '0-10', value: '0-10' },
        { display: '10-50', value: '10-50' },
        { display: '50-100', value: '50-100' },
        { display: '100-500', value: '100-500' },
        { display: '500-1000', value: '500-1000' },
        { display: '1000-5000', value: '1000-5000' },
        { display: '5000-10000', value: '5000-10000' },
        { display: 'More than 10, 000', value: '10000-1000000000' }
    ];

    // Pre-fill form with existing preferences data
    useEffect(() => {
        const initializeForm = async () => {
            if (sheetMeta && !isInitialized) {
                try {
                    // Get the full sheet data including rows
                    const sheetData = await getICPExcelSheets(sheetName as string);
                    const activeSheet = sheetData[0];

                    if (activeSheet && activeSheet.sheetRows.length > 0) {
                        // Use preferences if available, otherwise extract from sheet rows
                        let preferencesData = sheetMeta.preferences?.[0];

                        if (preferencesData) {
                            // Use preferences data
                            setFormData({
                                sheet_name: sheetName || '',
                                country_name: preferencesData.country_name || '',
                                state_name: preferencesData.state_name || '',
                                company: [],
                            });

                            setFormFields({
                                designations: preferencesData.designation || [],
                                employeeSizes: preferencesData.employee_size || [],
                                industries: preferencesData.industry || [],
                                priority: 'P4',
                            });
                        } else {
                            // Fallback: Extract from sheet rows (original logic)
                            const firstRow = activeSheet.sheetRows[0];

                            // Extract unique values from sheet rows
                            const validEmployeeSizeValues = new Set(employeeOptions.map(opt => opt.value));
                            const uniqueEmployeeSizes = Array.from(
                                new Set(
                                    activeSheet.sheetRows
                                        .map((row: any) => row.employee_size)
                                        .filter((size: string) => size && validEmployeeSizeValues.has(size))
                                )
                            );

                            const uniqueIndustries = Array.from(
                                new Set(activeSheet.sheetRows.map((row: any) => row.industry).filter(Boolean))
                            );

                            const uniqueDesignations = Array.from(
                                new Set(activeSheet.sheetRows.flatMap((row: any) => row.designation).filter(Boolean))
                            );

                            setFormData({
                                sheet_name: sheetName || '',
                                country_name: firstRow.country_name || '',
                                state_name: firstRow.state_name || '',
                                company: [],
                            });

                            setFormFields({
                                designations: uniqueDesignations,
                                employeeSizes: uniqueEmployeeSizes,
                                industries: uniqueIndustries,
                                priority: 'P4',
                            });
                        }

                        // Pre-populate results table with existing company data
                        const existingCompanies: Company[] = activeSheet.sheetRows.map((row: any) => ({
                            company_name: row.companyname,
                            designation: row.designation,
                            priority: row.priority as "P1" | "P2" | "P3" | "P4",
                            employee_size: row.employee_size,
                            industry: row.industry,
                        }));

                        setResultCompanies(existingCompanies);

                        // Find and set country ID for pre-filling country/state selects
                        const countryName = preferencesData?.country_name || activeSheet.sheetRows[0]?.country_name;
                        if (countryName) {
                            GetCountries().then((countries: any[]) => {
                                const matchedCountry = countries.find(
                                    (c: any) => c.name.toLowerCase() === countryName.toLowerCase()
                                );
                                if (matchedCountry) {
                                    setCountryId(matchedCountry.id);
                                }
                            });
                        }

                        setIsInitialized(true);
                    }
                } catch (error) {
                    console.error('Error initializing form:', error);
                    toast("Failed to load ICP data", {
                        className: "!bg-red-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
                        icon: <XIcon className='size-5' />
                    });
                }
            }
        };

        initializeForm();
    }, [sheetMeta, sheetName, isInitialized, getICPExcelSheets]);

    useEffect(() => {
        getDesignations('');
        getIndustries('');
    }, []);

    // Fetch companies based on current filters (industries and employee sizes)
    const fetchCompanies = async () => {
        if (formFields.industries.length === 0 || formFields.employeeSizes.length === 0) {
            return;
        }

        try {
            const response = await axios.post(
                `${appDomain}/api/mapping/v1/company-master/get-companies-by-industry-and-size`,
                {
                    industries: formFields.industries,
                    employeeSize: formFields.employeeSizes,
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            );

            if (response.data.status && response.data.data && response.data.data.length > 0) {
                const newCompanies: Company[] = response.data.data.map((company: FetchedCompany) => ({
                    company_name: company.company,
                    designation: formFields.designations,
                    priority: formFields.priority,
                    employee_size: company.companySize,
                    industry: company.industry,
                }));

                // Merge with existing companies, avoiding duplicates by company name
                setResultCompanies(prev => {
                    const existingNames = new Set(prev.map(c => c.company_name.toLowerCase()));
                    const uniqueNew = newCompanies.filter(c => !existingNames.has(c.company_name.toLowerCase()));
                    return [...prev, ...uniqueNew];
                });
            }
        } catch (error) {
            console.error('Error fetching companies:', error);
            toast("Failed to fetch companies", {
                className: "!bg-red-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
                icon: <XIcon className='size-5' />
            });
        }
    };

    // Fetch companies when industries or employee sizes change
    useEffect(() => {
        if (isInitialized) {
            fetchCompanies();
        }
    }, [formFields.industries, formFields.employeeSizes, isInitialized]);

    const handleFieldChange = (field: keyof typeof formFields, value: any) => {
        // Determine removed tags compared to previous state
        const prevValues = formFields[field] as any;
        const isArrayField = Array.isArray(prevValues) && Array.isArray(value);
        if (isArrayField) {
            const removed: string[] = (prevValues as string[]).filter(v => !(value as string[]).includes(v));
            if (removed.length > 0) {
                setResultCompanies(prev => {
                    let updated = prev;
                    if (field === 'industries') {
                        updated = prev.filter(c => !removed.includes(c.industry));
                    } else if (field === 'employeeSizes') {
                        updated = prev.filter(c => !removed.includes(c.employee_size));
                    } else if (field === 'designations') {
                        // Remove any company that contains any removed designation
                        updated = prev.filter(c => c.designation.every(d => !removed.includes(d)))
                            .map(c => ({ ...c, designation: value }));
                    }
                    return updated;
                });
            } else if (field === 'designations') {
                // Only additions occurred: update designation array on companies
                setResultCompanies(prev => prev.map(c => ({ ...c, designation: value })));
            }
        }
        setFormFields(prev => ({ ...prev, [field]: value }));
    };

    const handleDesignationSearch = async (term: string) => {
        await getDesignations(term);
    };

    const handleIndustrySearch = async (term: string) => {
        await getIndustries(term);
    };

    const handleUpdateICP = async () => {
        if (!formData.sheet_name.trim()) {
            toast.error('Please enter a sheet name');
            return;
        }

        if (!formData.country_name.trim()) {
            toast.error('Please select a country');
            return;
        }

        if (formFields.designations.length === 0) {
            toast.error('Please select at least one job title');
            return;
        }

        if (formFields.industries.length === 0) {
            toast.error('Please select at least one industry');
            return;
        }

        if (formFields.employeeSizes.length === 0) {
            toast.error('Please select at least one employee size');
            return;
        }

        if (resultCompanies.length === 0) {
            toast.error('No companies to save. Please add companies first.');
            return;
        }

        setLoading(true);

        try {
            // Update all companies with current designations
            const companiesWithUpdatedDesignations = resultCompanies.map(company => ({
                ...company,
                designation: formFields.designations
            }));

            const icpData = {
                sheet_name: sheetName,
                country_name: formData.country_name,
                state_name: formData.state_name || '',
                company: companiesWithUpdatedDesignations,
                user_id: user?.id as number,
                preferences: {
                    employee_size: formFields.employeeSizes,
                    industry: formFields.industries,
                    designation: formFields.designations,
                    country_name: formData.country_name,
                    state_name: formData.state_name || ''
                }
            };

            const result = await updateICP(icpData);
            if (result.success) {
                toast(result.message || "ICP data updated successfully!", {
                    className: "!bg-green-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
                    icon: <CircleCheck className='size-5' />
                });
                navigate('/icp/saved');
            } else {
                toast(result.message || "Something Went Wrong", {
                    className: "!bg-red-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
                    icon: <XIcon className='size-5' />
                });
            }
        } catch (error) {
            console.error('Error updating ICP data:', error);
            toast("Failed to update ICP data", {
                className: "!bg-red-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
                icon: <XIcon className='size-5' />
            });
        } finally {
            setLoading(false);
        }
    };

    if (storeLoading || !sheetMeta) {
        return <Wave />;
    }

    return (
        <div>
            <div className='flex gap-5'>
                <GoBack />
                <h3 className='text-xl font-semibold capitalize'>{sheetName?.split("_")[0].split("-").join(" ")}</h3>
            </div>
            <div className="max-w-6xl mx-auto p-6 space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Update ICP</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Job Title */}
                            <MultiSelectDropdown
                                label="Job Title"
                                value={formFields.designations}
                                onValueChange={(val) => handleFieldChange('designations', val)}
                                placeholder="Type or select job titles"
                                options={designations.map((d, idx) => ({ id: idx + 1, name: d.designation }))}
                                onSearch={handleDesignationSearch}
                                required
                            />

                            {/* Employee Size */}
                            <MultiSelectDropdown
                                label="Employee Size"
                                value={formFields.employeeSizes}
                                onValueChange={(val) => handleFieldChange('employeeSizes', val)}
                                placeholder="Select employee sizes"
                                options={employeeOptions.map((size, idx) => ({ id: idx + 1, name: size.display, value: size.value }))}
                                required
                            />

                            {/* Industry */}
                            <MultiSelectDropdown
                                label="Industry"
                                value={formFields.industries}
                                onValueChange={(val) => handleFieldChange('industries', val)}
                                placeholder="Type or select industries"
                                options={industries.map((i, idx) => ({ id: idx + 1, name: String(i) }))}
                                onSearch={handleIndustrySearch}
                                required
                            />

                            {/* Priority */}
                            <div hidden className="flex flex-col gap-2">
                                <Label className="font-semibold w-full">
                                    Priority <span className="text-secondary">*</span>
                                </Label>
                                <Select
                                    value={formFields.priority}
                                    onValueChange={(val) => handleFieldChange('priority', val as 'P1' | 'P2' | 'P3' | 'P4')}
                                >
                                    <SelectTrigger className="!h-12 w-full">
                                        <SelectValue placeholder="Select priority" className='h-12' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {['P1', 'P2', 'P3', 'P4'].map(p => (
                                            <SelectItem key={p} value={p}>{p}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Country */}
                            <div className="flex flex-col gap-2">
                                <Label className="font-semibold">
                                    Country <span className="text-secondary">*</span>
                                </Label>
                                <div className="relative">
                                    <CountrySelect
                                        value={formData.country_name}
                                        placeHolder="Select Country"
                                        onChange={(val: any) => {
                                            setCountryId(val?.id ?? null);
                                            setFormData(prev => ({
                                                ...prev,
                                                country_name: val?.name || '',
                                                state_name: ''
                                            }));
                                        }}
                                        inputClassName="
    w-full h-12 px-4 text-base
    !bg-background
    rounded-md
    border border-input
    placeholder:text-muted-foreground
    focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2
    transition-colors
    dark:bg-popover dark:text-popover-foreground
  "
                                        containerClassName="w-full"
                                    />
                                </div>
                            </div>

                            {/* State */}
                            <div className="flex flex-col gap-2">
                                <Label className="font-semibold">State</Label>
                                <div className="relative">
                                    <StateSelect
                                        countryid={countryId as any}
                                        placeHolder={countryId ? 'Select State' : 'Select country first'}
                                        onChange={(val: any) => setFormData(prev => ({ ...prev, state_name: val?.name || '' }))}
                                        inputClassName="
    w-full h-12 px-4 text-base
    !bg-background
    rounded-md
    border border-input
    placeholder:text-muted-foreground
    focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2
    transition-colors
    dark:bg-popover dark:text-popover-foreground
  "
                                        containerClassName="w-full"
                                        disabled={!countryId}
                                    />
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Update Button */}
                <div className="flex justify-end gap-3">
                    <Button
                        variant="outline"
                        onClick={() => navigate('/icp/saved')}
                        className="cursor-pointer"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleUpdateICP}
                        className="w-full md:w-auto btn"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Updating ICP Data...
                            </>
                        ) : (
                            'Update ICP'
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default UpdateICP;