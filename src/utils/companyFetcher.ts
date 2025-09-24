/**
 * Utility functions for fetching companies with pagination handling
 * 
 * This module provides reusable functions for fetching company data
 * from the API with automatic pagination and duplicate handling.
 */

import axios from 'axios';
import { appDomain } from '@/constants';

export interface CompanyData {
  _id: string;
  profileUrl?: string;
  company: string;
  website?: string;
  industry?: string;
  companySize?: string;
  headquarters?: string;
  overview?: string;
  mappedTo?: any[];
  companyLogo?: string;
  news?: any[];
}

export interface FetchProgress {
  currentCombination: string;
  processedCombinations: number;
  totalCombinations: number;
  companiesFound: number;
  uniqueCompanies: number;
}

export interface FetchOptions {
  onProgress?: (progress: FetchProgress) => void;
  onError?: (error: Error, combination: string) => void;
  maxRetries?: number;
  retryDelay?: number;
}

/**
 * Fetches all companies for a specific industry and employee size with pagination
 */
export const fetchAllCompaniesForCombination = async (
  industry: string,
  employeeSize: string,
  options: FetchOptions = {}
): Promise<CompanyData[]> => {
  const { maxRetries = 3, retryDelay = 1000 } = options;
  const companies: CompanyData[] = [];
  let page = 1;
  let hasMoreData = true;
  let retryCount = 0;

  while (hasMoreData) {
    try {
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
        
        // Reset retry count on successful request
        retryCount = 0;
      } else {
        hasMoreData = false;
      }
    } catch (error) {
      retryCount++;
      
      if (retryCount >= maxRetries) {
        const errorMessage = `Failed to fetch companies for industry: ${industry}, employeeSize: ${employeeSize} after ${maxRetries} retries`;
        const fetchError = new Error(errorMessage);
        
        if (options.onError) {
          options.onError(fetchError, `${industry} - ${employeeSize}`);
        }
        
        throw fetchError;
      }
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, retryDelay * retryCount));
    }
  }

  return companies;
};

/**
 * Fetches companies for all combinations of industries and employee sizes
 */
export const fetchAllCompaniesByCombinations = async (
  industries: string[],
  employeeSizes: string[],
  options: FetchOptions = {}
): Promise<CompanyData[]> => {
  const masterData: CompanyData[] = [];
  const seenCompanies = new Set<string>();
  const totalCombinations = industries.length * employeeSizes.length;
  let processedCombinations = 0;

  for (const industry of industries) {
    for (const employeeSize of employeeSizes) {
      const currentCombination = `${industry} - ${employeeSize}`;
      
      // Report progress
      if (options.onProgress) {
        options.onProgress({
          currentCombination,
          processedCombinations,
          totalCombinations,
          companiesFound: masterData.length,
          uniqueCompanies: seenCompanies.size
        });
      }
      
      try {
        const companies = await fetchAllCompaniesForCombination(industry, employeeSize, options);
        
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
        console.error(`Failed to fetch companies for ${currentCombination}:`, error);
        processedCombinations++;
        
        if (options.onError) {
          options.onError(error as Error, currentCombination);
        }
        
        // Continue with next combination even if one fails
      }
    }
  }

  // Final progress report
  if (options.onProgress) {
    options.onProgress({
      currentCombination: 'Completed',
      processedCombinations,
      totalCombinations,
      companiesFound: masterData.length,
      uniqueCompanies: seenCompanies.size
    });
  }

  return masterData;
};

/**
 * Example usage:
 * 
 * const industries = ['IT', 'Healthcare', 'Finance'];
 * const employeeSizes = ['10-50', '50-100', '100-500'];
 * 
 * const companies = await fetchAllCompaniesByCombinations(industries, employeeSizes, {
 *   onProgress: (progress) => {
 *     console.log(`Processing: ${progress.currentCombination}`);
 *     console.log(`Progress: ${progress.processedCombinations}/${progress.totalCombinations}`);
 *     console.log(`Unique companies found: ${progress.uniqueCompanies}`);
 *   },
 *   onError: (error, combination) => {
 *     console.error(`Error fetching ${combination}:`, error.message);
 *   },
 *   maxRetries: 3,
 *   retryDelay: 1000
 * });
 * 
 * console.log(`Total unique companies fetched: ${companies.length}`);
 */
