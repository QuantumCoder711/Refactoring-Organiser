import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { X, ChevronDown, Loader2, CircleCheck, XIcon } from 'lucide-react';
import { CountrySelect, StateSelect } from 'react-country-state-city';
import 'react-country-state-city/dist/react-country-state-city.css';
import useExtrasStore from '@/store/extrasStore';
import useICPStore from '@/store/icpStore';
import useAuthStore from '@/store/authStore';
import { appDomain } from '@/constants';
import axios from 'axios';
import { toast } from 'sonner';

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
  options: { id: number; name: string }[];
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

  const handleOptionSelect = (optionName: string) => {
    if (!value.includes(optionName)) {
      onValueChange([...value, optionName]);
    }
    setSearchTerm('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    onValueChange(value.filter(item => item !== tagToRemove));
  };

  const filteredOptions = options.filter(option =>
    option.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    !value.includes(option.name)
  );

  return (
    <div className="flex flex-col gap-2 w-full" ref={dropdownRef}>
      <Label className="font-semibold">
        {label} {required && <span className="text-red-500">*</span>}
      </Label>

      {/* Selected Tags */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {value.map((item) => (
            <Badge key={item} variant="secondary" className="flex items-center gap-1">
              <span className="capitalize">{item}</span>
              <X
                className="h-3 w-3 cursor-pointer hover:text-red-500"
                onClick={() => handleRemoveTag(item)}
              />
            </Badge>
          ))}
        </div>
      )}

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
          <div className="absolute z-50 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-y-auto">
            {loading ? (
              <div className="p-3 text-center">
                <Loader2 className="h-4 w-4 animate-spin mx-auto" />
              </div>
            ) : filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <div
                  key={option.id}
                  className="px-3 py-2 hover:bg-gray-100 cursor-pointer capitalize"
                  onClick={() => handleOptionSelect(option.name)}
                >
                  {option.name}
                </div>
              ))
            ) : (
              <div className="px-3 py-2 text-gray-500">No options found</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
});

const CreateICP: React.FC = () => {
  const { designations, industries, getDesignations, getIndustries } = useExtrasStore();
  const { createICP } = useICPStore();
  const { token } = useAuthStore();

  const [formData, setFormData] = useState<ICPData>({
    sheet_name: '',
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

  const [countryId, setCountryId] = useState<string | number | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetchedCompanies, setFetchedCompanies] = useState<FetchedCompany[]>([]);

  const employeeOptions = [
    '0-10', '10-50', '50-100', '100-500',
    '500-1000', '1000-5000', '5000-10000', 'more than 10,000'
  ];

  useEffect(() => {
    getDesignations('');
    getIndustries('');
  }, []);

  const handleFieldChange = (field: keyof typeof formFields, value: any) => {
    setFormFields(prev => ({ ...prev, [field]: value }));
  };

  const handleDesignationSearch = async (term: string) => {
    await getDesignations(term);
  };

  const handleIndustrySearch = async (term: string) => {
    await getIndustries(term);
  };

  const fetchCompaniesByIndustryAndSize = async () => {
    if (formFields.industries.length === 0 || formFields.employeeSizes.length === 0) {
      toast.error('Please select at least one industry and employee size');
      return;
    }

    setLoading(true);
    try {
      const app = "https://app.klout.club";
      const response = await axios.post(
        `${app}/api/mapping/v1/company-master/get-companies-by-industry-and-size`,
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

      if (response.data.status && response.data.data) {
        setFetchedCompanies(response.data.data);
        toast.success(`Found ${response.data.totalData} companies`);
      } else {
        toast.error('No companies found for the selected criteria');
      }
    } catch (error) {
      console.error('Error fetching companies:', error);
      toast.error('Failed to fetch companies');
    } finally {
      setLoading(false);
    }
  };

  const generateICPData = async () => {
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

    if (fetchedCompanies.length === 0) {
      toast.error('Please fetch companies first');
      return;
    }

    const icpData: ICPData = {
      sheet_name: formData.sheet_name.trim(),
      country_name: formData.country_name,
      state_name: formData.state_name || '',
      company: fetchedCompanies.map(company => ({
        company_name: company.company,
        designation: formFields.designations,
        priority: formFields.priority,
        employee_size: company.companySize,
        industry: company.industry,
      })),
    };

    // Ask user if they want to save the ICP data
    // const shouldSave = window.confirm(
    //   `ICP data generated successfully with ${icpData.company.length} companies!\n\nWould you like to save this ICP to your account?`
    // );
    try {
      setLoading(true);
      const result = await createICP(icpData);
      if (result.success) {
        // Reset form after successful save
        toast(result.message || "ICP data saved successfully!", {
          className: "!bg-green-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
          icon: <CircleCheck className='size-5' />
        });
        setFormData({
          sheet_name: '',
          country_name: '',
          state_name: '',
          company: [],
        });
        setFormFields({
          designations: [],
          employeeSizes: [],
          industries: [],
          priority: 'P4',
        });
        setFetchedCompanies([]);
        setCountryId(null);
      } else {
        toast(result.message || "Something Went Wrong", {
          className: "!bg-red-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
          icon: <XIcon className='size-5' />
        });
      }
    } catch (error) {
      toast("Something Went Wrong", {
        className: "!bg-red-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
        icon: <XIcon className='size-5' />
      });
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = Boolean(
    formData.sheet_name.trim() &&
    formData.country_name.trim() &&
    formFields.designations.length > 0 &&
    formFields.industries.length > 0 &&
    formFields.employeeSizes.length > 0
  );

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Create ICP</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Sheet Name */}
          <div className="flex flex-col gap-2">
            <Label className="font-semibold">
              Sheet Name <span className="text-red-500">*</span>
            </Label>
            <Input
              value={formData.sheet_name}
              onChange={(e) => setFormData(prev => ({ ...prev, sheet_name: e.target.value }))}
              placeholder="Enter sheet name"
              className="h-12"
            />
          </div>

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
              options={employeeOptions.map((size, idx) => ({ id: idx + 1, name: size }))}
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
            <div className="flex flex-col gap-2">
              <Label className="font-semibold w-full">
                Priority <span className="text-red-500">*</span>
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
                Country <span className="text-red-500">*</span>
              </Label>
              <CountrySelect
                placeHolder="Select Country"
                onChange={(val: any) => {
                  setCountryId(val?.id ?? null);
                  setFormData(prev => ({
                    ...prev,
                    country_name: val?.name || '',
                    state_name: ''
                  }));
                }}
                inputClassName="!h-12 !text-base !bg-white"
                containerClassName="!w-full"
              />
            </div>

            {/* State */}
            <div className="flex flex-col gap-2">
              <Label className="font-semibold">State</Label>
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

          {/* Fetch Companies Button */}
          <div className="flex justify-center">
            <Button
              onClick={fetchCompaniesByIndustryAndSize}
              disabled={loading || formFields.industries.length === 0 || formFields.employeeSizes.length === 0}
              className="w-full md:w-auto btn"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Fetching Companies...
                </>
              ) : (
                'Fetch Companies'
              )}
            </Button>
          </div>

          {/* Fetched Companies Display */}
          {/* {fetchedCompanies.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Fetched Companies ({fetchedCompanies.length})</CardTitle>
                <div className="text-sm text-gray-600 mt-2">
                  <p><strong>Selected Job Titles:</strong> {formFields.designations.join(', ')}</p>
                  <p><strong>Priority:</strong> {formFields.priority}</p>
                  <p><strong>Location:</strong> {formData.country_name}{formData.state_name ? `, ${formData.state_name}` : ''}</p>
                </div>
              </CardHeader>
              <CardContent>
                <div className="max-h-60 overflow-y-auto">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                    {fetchedCompanies.slice(0, 50).map((company, idx) => (
                      <div key={idx} className="p-2 border rounded text-sm">
                        <div className="font-medium capitalize">{company.company}</div>
                        <div className="text-gray-600 text-xs">{company.industry}</div>
                        <div className="text-gray-500 text-xs">{company.companySize}</div>
                      </div>
                    ))}
                  </div>
                  {fetchedCompanies.length > 50 && (
                    <div className="text-center text-gray-500 text-sm mt-2">
                      ... and {fetchedCompanies.length - 50} more companies
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )} */}

          {/* Generate ICP Button */}
          <div className="flex justify-end">
            <Button
              onClick={generateICPData}
              disabled={!isFormValid || fetchedCompanies.length === 0 || loading}
              className="w-full md:w-auto btn"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving ICP Data...
                </>
              ) : (
                'Generate & Save ICP Data'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateICP;
