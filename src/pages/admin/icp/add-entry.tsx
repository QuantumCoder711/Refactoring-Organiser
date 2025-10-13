import React, { useRef, useState } from 'react';
import useExtrasStore from '@/store/extrasStore';
import useICPStore from '@/store/icpStore';
import { useEffect } from 'react';
import { Input } from '@/components/ui/input';

import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, Check, ChevronDown, CircleCheck, XIcon } from 'lucide-react';
import { CountrySelect, StateSelect } from 'react-country-state-city';
import 'react-country-state-city/dist/react-country-state-city.css';
import { toast } from 'sonner';
import useAuthStore from '@/store/authStore';
import GoBack from '@/components/GoBack';
import { useParams } from 'react-router-dom';

// Custom Combo Box Component (enhanced to support multi-select, keeps existing styles)
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
    const inputRef = useRef<HTMLInputElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const selectedValues = Array.isArray(value) ? value : [];

    const filteredOptions = options
        .filter(option => option.name.toLowerCase().includes(searchTerm.toLowerCase()))
        .filter(option => !isMulti || !selectedValues.some(v => v.toLowerCase() === option.name.toLowerCase()));

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const term = e.target.value;
        if (!isMulti) {
            setInputValue(term);
            onValueChange(term);
        }
        setSearchTerm(term);
        setIsOpen(true);
        setSelectedIndex(-1);
        onSearch?.(term);
    };

    const addValue = (name: string) => {
        if (!isMulti) {
            setInputValue(name);
            onValueChange(name);
        } else {
            const exists = selectedValues.some(v => v.toLowerCase() === name.toLowerCase());
            if (!exists) onValueChange([...selectedValues, name]);
        }
        setSearchTerm('');
        setIsOpen(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
    };

    const removeValue = (name: string) => {
        if (isMulti) {
            onValueChange(selectedValues.filter(v => v.toLowerCase() !== name.toLowerCase()));
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (isOpen) {
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setSelectedIndex(prev => (prev < filteredOptions.length - 1 ? prev + 1 : prev));
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setSelectedIndex(prev => (prev > 0 ? prev - 1 : prev));
            } else if (e.key === 'Enter') {
                e.preventDefault();
                if (selectedIndex >= 0 && selectedIndex < filteredOptions.length) {
                    addValue(filteredOptions[selectedIndex].name);
                } else if (searchTerm) {
                    addValue(searchTerm);
                }
            }
        } else if (e.key === 'Enter' && searchTerm) {
            addValue(searchTerm);
        }
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
                setSearchTerm('');
                setSelectedIndex(-1);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (!isMulti && typeof value === 'string') setInputValue(value);
    }, [value, isMulti]);

    useEffect(() => {
        if (selectedIndex >= 0 && dropdownRef.current) {
            const selectedOption = dropdownRef.current.querySelectorAll('.option')[selectedIndex] as HTMLElement;
            selectedOption?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }, [selectedIndex]);

    return (
        <div className="flex gap-2 flex-col w-full" ref={dropdownRef}>
            <Label className="font-semibold">
                {label} {required && <span className="text-brand-secondary">*</span>}
            </Label>
            <div className="relative">

                <div className="relative">
                    <Input
                        ref={inputRef}
                        type="text"
                        value={isMulti ? searchTerm : inputValue}
                        onChange={handleInputChange}
                        onKeyDown={handleKeyDown}
                        onFocus={() => setIsOpen(true)}
                        placeholder={placeholder}
                        className="w-full capitalize bg-white !h-12 text-base pr-10"
                    />
                    <ChevronDown
                        className={`absolute right-3 top-1/2 transform -translate-y-1/2 size-4 opacity-50 transition-transform cursor-pointer ${isOpen ? 'rotate-180' : ''}`}
                        onClick={() => {
                            setIsOpen(!isOpen);
                            inputRef.current?.focus();
                        }}
                    />
                </div>

                {/* Selected tags for multi */}
                {isMulti && selectedValues.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                        {selectedValues.map((val) => (
                            <Badge key={val} variant="secondary" className="flex items-center gap-1 px-2 py-1 rounded-full">
                                <span className="capitalize">{val}</span>
                                <button type="button" onClick={() => removeValue(val)} className="hover:text-red-600">
                                    <X className="size-3 cursor-pointer" />
                                </button>
                            </Badge>
                        ))}
                    </div>
                )}

                {isOpen && (
                    <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
                        {filteredOptions.length > 0 ? (
                            filteredOptions.map((option, index) => (
                                <div
                                    key={option.id}
                                    className={`px-3 py-2 cursor-pointer hover:bg-gray-50 flex items-center justify-between text-sm ${selectedIndex === index ? 'bg-gray-100' : ''} option`}
                                    onClick={() => addValue(option.name)}
                                >
                                    <span className="capitalize">{option.name}</span>
                                    {!isMulti && typeof value === 'string' && value === option.name && (
                                        <Check className="size-4 text-brand-secondary" />
                                    )}
                                </div>
                            ))
                        ) : searchTerm ? (
                            <div
                                className="px-3 py-2 cursor-pointer hover:bg-gray-50 text-sm font-medium"
                                onClick={() => addValue(searchTerm)}
                            >
                                {searchTerm}
                            </div>
                        ) : (
                            <div className="px-3 py-2 text-gray-500 text-sm">No options found</div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
});

const AddEntry: React.FC = () => {
    const id = useAuthStore(state => state?.user?.id);
    const { sheetName } = useParams<{ sheetName: string }>();
    const { designations, companies, getCompanies, getDesignations } = useExtrasStore(state => state);

    const [formData, setFormData] = useState({
        sheet_name: sheetName as string,
        employee_size: '',
        designation: [] as string[],
        company_name: [] as string[],
        state_name: '',
        country_name: '',
    });
    const [countryId, setCountryId] = useState<string | number | null>(null);
    const employeeOptions = [
        '0-10',
        '10-50',
        '50-100',
        '100-500',
        '500-1000',
        '1000-5000',
        '5000-10000',
        'more than 10,000',
    ];
    const [rowPriorities, setRowPriorities] = useState<Record<string, 'P1' | 'P2' | 'P3' | 'P4'>>({});
    useEffect(() => {
        setRowPriorities(prev => {
            const next: Record<string, 'P1' | 'P2' | 'P3' | 'P4'> = {};
            formData.company_name.forEach(name => {
                next[name] = prev[name] ?? 'P4';
            });
            return next;
        });
    }, [formData.company_name]);

    useEffect(() => {
        getCompanies();
        getDesignations();
    }, []);

    const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        console.log(name, value);
    };

    const handleCreateSheet = async () => {
        // Validation: all fields mandatory
        const isValid = Boolean(
            formData.sheet_name.trim() &&
            formData.employee_size &&
            formData.designation.length > 0 &&
            formData.company_name.length > 0 &&
            formData.country_name.trim() &&
            formData.state_name.trim()
        );

        if (!isValid) {
            console.warn('Please fill all required fields before proceeding.');
            return;
        }

        const payload = {
            sheet_name: formData.sheet_name.trim(),
            employee_size: formData.employee_size.trim(),
            designation: formData.designation.map(d => d.trim()).filter(Boolean),
            company_name: formData.company_name.map(c => c.trim()).filter(Boolean),
            state_name: formData.state_name.trim(),
            country_name: formData.country_name.trim(),
            priority: formData.company_name.map(company => rowPriorities[company] ?? 'P4'),
            user_id: id
        };

        try {
            const { success, message } = await useICPStore.getState().addICPEntry(payload, id as number);
            if (success) {
                toast.success(message || "Entry added successfully", {
                    className: "!bg-green-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
                    icon: <CircleCheck className='size-5' />
                });
            } else {
                toast.error(message || "Error adding entry", {
                    className: "!bg-red-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
                    icon: <XIcon className='size-5' />
                });
            }
        } catch (error) {
            toast.error("Failed to add entry", {
                className: "!bg-red-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2"
            });
        }
    };

    const isFormComplete = Boolean(
        formData.sheet_name.trim() &&
        formData.employee_size &&
        formData.designation.length > 0 &&
        formData.company_name.length > 0 &&
        formData.country_name.trim() &&
        formData.state_name.trim()
    );

    return (
        <div className="w-full">
            <div className='flex items-center gap-3 mb-6'>
                <GoBack />
                <h1 className='text-xl font-semibold capitalize'>{sheetName?.split("_")[0]}</h1>
            </div>

            <Card className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Sheet Name */}
                    <div hidden className="flex flex-col gap-2">
                        <Label className="font-semibold">Sheet Name <span className="text-brand-secondary">*</span></Label>
                        <Input
                            name="sheet_name"
                            value={formData.sheet_name}
                            onChange={handleChange}
                            placeholder="Enter sheet name"
                            className="!h-12 text-base"
                        />
                    </div>

                    {/* Employee Size (single select) */}
                    <div className="flex flex-col gap-2 w-full">
                        <Label className="font-semibold">Employee Size <span className="text-brand-secondary">*</span></Label>
                        <Select value={formData.employee_size} onValueChange={(v) => setFormData(prev => ({ ...prev, employee_size: v }))}>
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

                    {/* Designations (CustomComboBox multi) */}
                    <CustomComboBox
                        label="Job Title"
                        isMulti
                        value={formData.designation}
                        onValueChange={(val) => setFormData(prev => ({ ...prev, designation: Array.isArray(val) ? val : (val ? [val] : []) }))}
                        placeholder="Type or select job title"
                        options={designations.map((d, index) => ({ id: index + 1, name: d.designation }))}
                        onSearch={(term) => getDesignations(term)}
                        required
                    />

                    {/* Company Names (CustomComboBox multi) */}
                    <CustomComboBox
                        label="Company Name"
                        isMulti
                        value={formData.company_name}
                        onValueChange={(val) => setFormData(prev => ({ ...prev, company_name: Array.isArray(val) ? val : (val ? [val] : []) }))}
                        placeholder="Type or select company"
                        options={companies.map((c, index) => ({ id: index + 1, name: c.company }))}
                        onSearch={(term) => getCompanies(term)}
                        required
                    />

                    {/* Country */}
                    <div className="flex flex-col gap-2">
                        <Label className="font-semibold">Country <span className="text-brand-secondary">*</span></Label>
                        <CountrySelect
                            placeHolder="Select Country"
                            onChange={(val: any) => {
                                setCountryId(val?.id ?? null);
                                setFormData(prev => ({ ...prev, country_name: val?.name || '', state_name: '' }));
                            }}
                            inputClassName="!h-12 !text-base !bg-white"
                            containerClassName="!w-full"
                        />
                    </div>

                    {/* State */}
                    <div className="flex flex-col gap-2">
                        <Label className="font-semibold">State <span className="text-brand-secondary">*</span></Label>
                        <StateSelect
                            countryid={countryId as any}
                            placeHolder={countryId ? 'Select State' : 'Select country first'}
                            onChange={(val: any) => setFormData(prev => ({ ...prev, state_name: val?.name || '' }))}
                            inputClassName="!h-12 !text-base !bg-white"
                            containerClassName="!w-full"
                            disabled={!countryId}
                        />
                    </div>
                </div>

                {isFormComplete && (
                    <div className="pt-2">
                        <div className="overflow-x-auto rounded-md border bg-white">
                            <table className="min-w-full text-sm">
                                <thead className="bg-gray-50 text-gray-700">
                                    <tr>
                                        <th className="text-left px-4 py-3 font-semibold">Company Name</th>
                                        <th className="text-left px-4 py-3 font-semibold">Designations</th>
                                        <th className="text-left px-4 py-3 font-semibold">Country</th>
                                        <th className="text-left px-4 py-3 font-semibold">State</th>
                                        <th className="text-left px-4 py-3 font-semibold">Employee Size</th>
                                        <th className="text-left px-4 py-3 font-semibold">Priority</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {formData.company_name.map((company) => (
                                        <tr key={company} className="border-t">
                                            <td className="px-4 py-3 capitalize">{company}</td>
                                            <td className="px-4 py-3 capitalize">{formData.designation.join(', ')}</td>
                                            <td className="px-4 py-3 capitalize">{formData.country_name}</td>
                                            <td className="px-4 py-3 capitalize">{formData.state_name}</td>
                                            <td className="px-4 py-3">{formData.employee_size}</td>
                                            <td className="px-4 py-3">
                                                <Select
                                                    value={rowPriorities[company] ?? 'P4'}
                                                    onValueChange={(v) => setRowPriorities(prev => ({ ...prev, [company]: v as 'P1' | 'P2' | 'P3' | 'P4' }))}
                                                >
                                                    <SelectTrigger className="input !h-9 text-sm w-28">
                                                        <SelectValue placeholder="P4" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {['P1', 'P2', 'P3', 'P4'].map(p => (
                                                            <SelectItem key={p} value={p} className="cursor-pointer">{p}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                <div className="pt-4 flex justify-end">
                    <Button onClick={handleCreateSheet} disabled={!isFormComplete} className="px-6 btn">Create ICP</Button>
                </div>
            </Card>
        </div>
    );

}

export default AddEntry;