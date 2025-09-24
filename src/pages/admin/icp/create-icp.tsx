/**
 * ICP Creation Page with Advanced Company Fetching
 *
 * This component implements a comprehensive solution for fetching companies based on:
 * - Multiple industries (multi-select)
 * - Multiple employee size ranges (multi-select)
 * - Automatic pagination handling
 * - Duplicate removal across combinations
 * - Real-time progress tracking
 *
 * Key Features:
 * 1. fetchAllCompaniesForCombination: Handles pagination for single industry/size combination
 * 2. fetchAllCompaniesByCombinations: Processes all combinations and removes duplicates
 * 3. Real-time results display with editable priorities
 * 4. Batch ICP creation from fetched results
 *
 * API Response Format Expected:
 * {
 *   "status": true,
 *   "data": {
 *     "companies": [...],
 *     "totalCompanies": number
 *   }
 * }
 */

import React, { useRef, useState } from 'react';
import useExtrasStore from '@/store/extrasStore';
import useICPStore from '@/store/icpStore';
import { useEffect } from 'react';
import { Input } from '@/components/ui/input';
import axios from 'axios';
import { appDomain } from '@/constants';

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

interface Company {
  company_name: string;
  designation: string;
  priority: string;
  employee_size: string;
  industry: string;
}

interface MasterData {
  user_id: number;
  sheet_name: string;
  employee_size: string;
  company: Company[];
  state_name: string;
  country_name: string;
}


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

const CreateICP: React.FC = () => {
  const id = useAuthStore(state => state?.user?.id);
  const { designations, companies, getCompanies, getDesignations } = useExtrasStore(state => state);

  const [formData, setFormData] = useState({
    sheet_name: '',
    employee_size: [] as string[], // Changed to array for multiple selections
    designation: [] as string[],
    company_name: [] as string[],
    state_name: '',
    country_name: 'India',
    industry_name: [] as string[], // Changed to array for multiple selections
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

  const [masterData, setMasterData] = useState<MasterData[]>([]);

  useEffect(() => {
    getCompanies('');
    getDesignations('');
  }, []);

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    console.log(name, value);
  };

  /**
   * Fetches all companies with pagination for a specific industry and employee size combination
   * @param industry - The industry to filter by
   * @param employeeSize - The employee size range to filter by
   * @returns Promise<any[]> - Array of all companies for the given combination
   */
  const fetchAllCompaniesForCombination = async (industry: string, employeeSize: string) => {
    const companies: any[] = [];
    let page = 1;
    let hasMoreData = true;

    try {
      while (hasMoreData) {
        const response = await axios.get(
          `${appDomain}/api/mapping/v1/company-master/all-company?page=${page}&search=&industry=${encodeURIComponent(industry)}&employeeSize=${encodeURIComponent(employeeSize)}&logo=undefined`
        );

        const responseData = response.data;

        if (responseData.status && responseData.data && responseData.data.companies) {
          const pageCompanies = responseData.data.companies;
          companies.push(...pageCompanies);

          // Check if we have more data to fetch
          const totalCompanies = responseData.data.totalCompanies || 0;
          const currentCompaniesCount = companies.length;

          if (currentCompaniesCount >= totalCompanies || pageCompanies.length === 0) {
            hasMoreData = false;
          } else {
            page++;
          }
        } else {
          hasMoreData = false;
        }
      }
    } catch (error) {
      console.error(`Error fetching companies for industry: ${industry}, employeeSize: ${employeeSize}`, error);
      throw error;
    }

    return companies;
  };

  /**
   * Fetches companies for all combinations of industries and employee sizes
   * Handles pagination automatically and removes duplicates
   * @param industries - Array of industry names to search
   * @param employeeSizes - Array of employee size ranges to search
   * @returns Promise<any[]> - Array of unique companies from all combinations
   *
   * Example usage:
   * const industries = ['IT', 'Healthcare', 'Finance'];
   * const employeeSizes = ['10-50', '50-100', '100-500'];
   * const companies = await fetchAllCompaniesByCombinations(industries, employeeSizes);
   */
  const fetchAllCompaniesByCombinations = async (industries: string[], employeeSizes: string[]) => {
    const masterData: any[] = [];
    const seenCompanies = new Set<string>(); // To avoid duplicates
    let totalCombinations = industries.length * employeeSizes.length;
    let processedCombinations = 0;

    try {
      for (const industry of industries) {
        for (const employeeSize of employeeSizes) {
          console.log(`Fetching companies for Industry: ${industry}, Employee Size: ${employeeSize}`);

          try {
            const companies = await fetchAllCompaniesForCombination(industry, employeeSize);

            // Filter out duplicates based on company ID or name
            const uniqueCompanies = companies.filter(company => {
              const companyKey = company._id || company.company;
              if (seenCompanies.has(companyKey)) {
                return false;
              }
              seenCompanies.add(companyKey);
              return true;
            });

            masterData.push(...uniqueCompanies);
            processedCombinations++;

            console.log(`Processed ${processedCombinations}/${totalCombinations} combinations. Found ${uniqueCompanies.length} new companies.`);
          } catch (error) {
            console.error(`Failed to fetch companies for ${industry} - ${employeeSize}:`, error);
            processedCombinations++;
            // Continue with next combination even if one fails
          }
        }
      }
    } catch (error) {
      console.error('Error in fetchAllCompaniesByCombinations:', error);
      throw error;
    }

    return masterData;
  };

  const handleSearchICP = async () => {
    setMasterData([]);
    // Validation: all fields mandatory
    const isValid = Boolean(
      formData.sheet_name.trim() &&
      formData.employee_size.length > 0 &&
      formData.designation.length > 0 &&
      formData.company_name.length > 0 &&
      formData.country_name.trim() &&
      formData.state_name.trim() &&
      formData.industry_name.length > 0
    );

    if (!isValid) {
      console.warn('Please fill all required fields before proceeding.');
      toast.error('Please fill all required fields before proceeding.', {
        className: "!bg-red-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
        icon: <XIcon className='size-5' />
      });
      return;
    }

    try {
      // Show loading toast
      toast.info('Fetching companies data...', {
        className: "!bg-blue-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2"
      });

      // Use the arrays from form data for multiple industries and employee sizes
      const industries = formData.industry_name.map(i => i.trim()).filter(Boolean);
      const employeeSizes = formData.employee_size.map(e => e.trim()).filter(Boolean);

      const allCompanies = await fetchAllCompaniesByCombinations(industries, employeeSizes);

      console.log(`Total unique companies fetched: ${allCompanies.length}`);
      console.log(`Fetched companies: ${allCompanies}`);

      // Update master data state
      setMasterData(prevData => {
        const newMasterData = [...prevData];

        // Create a new entry for this search
        const newEntry: MasterData = {
          user_id: id as number,
          sheet_name: formData.sheet_name.trim(),
          employee_size: formData.employee_size.join(', '), // Join array for display
          company: allCompanies.map(company => ({
            company_name: company.company || '',
            designation: formData.designation.join(', '),
            priority: 'P4', // Default priority
            employee_size: company.companySize || formData.employee_size.join(', '),
            industry: company.industry || formData.industry_name.join(', ')
          })),
          state_name: formData.state_name.trim(),
          country_name: formData.country_name.trim()
        };

        newMasterData.push(newEntry);
        return newMasterData;
      });

      console.log("The all companies data is:", allCompanies);

      toast.success(`Successfully fetched ${allCompanies.length} companies!`, {
        className: "!bg-green-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
        icon: <CircleCheck className='size-5' />
      });

      // Optionally, you can now proceed with creating the ICP
      // Uncomment the following code if you want to automatically create ICP after fetching
      /*
      const payload = {
        sheet_name: formData.sheet_name.trim(),
        employee_size: formData.employee_size.join(', '),
        designation: formData.designation.map(d => d.trim()).filter(Boolean),
        company_name: allCompanies.map(c => c.company).filter(Boolean),
        state_name: formData.state_name.trim(),
        country_name: formData.country_name.trim(),
        priority: allCompanies.map(() => 'P4'), // Default priority for all
        user_id: id
      };

      const { success, message } = await useICPStore.getState().createICP(payload);
      if (success) {
        toast.success(message || "ICP created successfully", {
          className: "!bg-green-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
          icon: <CircleCheck className='size-5' />
        });
      } else {
        toast.error(message || "Error creating ICP", {
          className: "!bg-red-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
          icon: <XIcon className='size-5' />
        });
      }
      */

    } catch (error) {
      console.error('Error in handleSearchICP:', error);
      toast.error("Failed to fetch companies data", {
        className: "!bg-red-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
        icon: <XIcon className='size-5' />
      });
    }
  };

  const isFormComplete = Boolean(
    formData.sheet_name.trim() &&
    formData.employee_size.length > 0 &&
    formData.designation.length > 0 &&
    formData.company_name.length > 0 &&
    formData.country_name.trim() &&
    formData.state_name.trim() &&
    formData.industry_name.length > 0
  );

  return (
    <div className="w-full">
      <div className='flex items-center gap-3 mb-6'>
        <GoBack />
        <h1 className='text-xl font-semibold'>Create ICP</h1>
      </div>

      <Card className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Sheet Name */}
          <div className="flex flex-col gap-2">
            <Label className="font-semibold">Sheet Name <span className="text-brand-secondary">*</span></Label>
            <Input
              name="sheet_name"
              value={formData.sheet_name}
              onChange={handleChange}
              placeholder="Enter sheet name"
              className="!h-12 text-base"
            />
          </div>
          
          {/* Industry Name (multi-select) */}
          <CustomComboBox
            label="Industry Name"
            isMulti
            value={formData.industry_name}
            onValueChange={(val) => setFormData(prev => ({ ...prev, industry_name: Array.isArray(val) ? val : (val ? [val] : []) }))}
            placeholder="Type or select industry"
            options={[
              { id: 1, name: 'IT' },
              { id: 2, name: 'Healthcare' },
              { id: 3, name: 'Finance' },
              { id: 4, name: 'Manufacturing' },
              { id: 5, name: 'Education' },
              { id: 6, name: 'Retail' },
              { id: 7, name: 'Consulting' },
              { id: 8, name: 'Real Estate' },
              { id: 9, name: 'Automotive' },
              { id: 10, name: 'Energy' }
            ]}
            required
          />

          {/* Employee Size (multi-select) */}
          <CustomComboBox
            label="Employee Size"
            isMulti
            value={formData.employee_size}
            onValueChange={(val) => setFormData(prev => ({ ...prev, employee_size: Array.isArray(val) ? val : (val ? [val] : []) }))}
            placeholder="Select employee size ranges"
            options={employeeOptions.map((opt, index) => ({ id: index + 1, name: opt }))}
            required
          />

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
        {/* 
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
        )} */}

        <div className="pt-4 flex justify-end">
          <Button onClick={handleSearchICP} disabled={!isFormComplete} className="px-6 btn">Search</Button>
        </div>
      </Card>

      {/* Results Table */}
      {masterData.length > 0 && (
        <Card className="p-6 mt-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Fetched Companies</h2>
            <div className="text-sm text-gray-600">
              Total: {masterData.reduce((total, entry) => total + entry.company.length, 0)} companies
            </div>
          </div>

          <div className="space-y-6">
            {masterData.map((entry, entryIndex) => (
              <div key={entryIndex} className="border rounded-lg p-4">
                <div className="mb-3">
                  <h3 className="font-medium text-base">{entry.sheet_name}</h3>
                  <p className="text-sm text-gray-600">
                    {entry.country_name}, {entry.state_name} | Employee Size: {entry.employee_size}
                  </p>
                </div>

                <div className="overflow-x-auto rounded-md border bg-white">
                  <table className="min-w-full text-sm">
                    <thead className="bg-gray-50 text-gray-700">
                      <tr>
                        <th className="text-left px-4 py-3 font-semibold">Company Name</th>
                        <th className="text-left px-4 py-3 font-semibold">Industry</th>
                        <th className="text-left px-4 py-3 font-semibold">Employee Size</th>
                        <th className="text-left px-4 py-3 font-semibold">Designations</th>
                        <th className="text-left px-4 py-3 font-semibold">Priority</th>
                        <th className="text-left px-4 py-3 font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {entry.company.map((company, companyIndex) => (
                        <tr key={companyIndex} className="border-t hover:bg-gray-50">
                          <td className="px-4 py-3 capitalize font-medium">{company.company_name}</td>
                          <td className="px-4 py-3 capitalize">{company.industry}</td>
                          <td className="px-4 py-3">{company.employee_size}</td>
                          <td className="px-4 py-3 capitalize">{company.designation}</td>
                          <td className="px-4 py-3">
                            <Select
                              value={company.priority}
                              onValueChange={(v) => {
                                setMasterData(prevData => {
                                  const newData = [...prevData];
                                  newData[entryIndex].company[companyIndex].priority = v as 'P1' | 'P2' | 'P3' | 'P4';
                                  return newData;
                                });
                              }}
                            >
                              <SelectTrigger className="input !h-9 text-sm w-20">
                                <SelectValue placeholder="P4" />
                              </SelectTrigger>
                              <SelectContent>
                                {['P1', 'P2', 'P3', 'P4'].map(p => (
                                  <SelectItem key={p} value={p} className="cursor-pointer">{p}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </td>
                          <td className="px-4 py-3">
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => {
                                setMasterData(prevData => {
                                  const newData = [...prevData];
                                  newData[entryIndex].company.splice(companyIndex, 1);
                                  return newData;
                                });
                              }}
                              className="h-8 px-3 text-xs"
                            >
                              <X className="size-3" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {entry.company.length > 0 && (
                  <div className="mt-4 flex justify-end">
                    <Button
                      onClick={async () => {
                        try {
                          const payload = {
                            sheet_name: entry.sheet_name,
                            employee_size: entry.employee_size,
                            designation: entry.company.map(c => c.designation).filter(Boolean),
                            company_name: entry.company.map(c => c.company_name).filter(Boolean),
                            state_name: entry.state_name,
                            country_name: entry.country_name,
                            priority: entry.company.map(c => c.priority),
                            user_id: entry.user_id
                          };

                          const { success, message } = await useICPStore.getState().createICP(payload);
                          if (success) {
                            toast.success(message || "ICP created successfully", {
                              className: "!bg-green-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
                              icon: <CircleCheck className='size-5' />
                            });
                            // Remove this entry from masterData after successful creation
                            setMasterData(prevData => prevData.filter((_, index) => index !== entryIndex));
                          } else {
                            toast.error(message || "Error creating ICP", {
                              className: "!bg-red-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
                              icon: <XIcon className='size-5' />
                            });
                          }
                        } catch (error) {
                          toast.error("Failed to create ICP", {
                            className: "!bg-red-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
                            icon: <XIcon className='size-5' />
                          });
                        }
                      }}
                      className="px-6 btn"
                    >
                      Create ICP ({entry.company.length} companies)
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );

}

export default CreateICP;