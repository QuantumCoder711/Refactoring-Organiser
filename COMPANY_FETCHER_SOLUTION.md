# Company Fetcher Solution

## Overview

This solution implements a comprehensive function that fetches all companies based on arrays of industries and employee sizes with automatic pagination handling. The implementation is designed to handle large datasets efficiently while avoiding duplicates and providing real-time progress tracking.

## Key Features

### 1. Multi-Combination Fetching
- Supports arrays of industries and employee sizes
- Automatically generates all combinations (industry × employee_size)
- Fetches companies for each combination independently

### 2. Automatic Pagination Handling
- Loops through all pages until no more data is available
- Uses the API's `totalCompanies` field to determine when to stop
- Handles edge cases where `totalCompanies` might be missing

### 3. Duplicate Removal
- Uses a Set to track seen companies by ID or name
- Ensures no duplicate entries in the final dataset
- Maintains data integrity across multiple API calls

### 4. Error Handling & Resilience
- Graceful error handling for individual combinations
- Continues processing even if some combinations fail
- Configurable retry logic with exponential backoff
- Detailed error reporting and logging

### 5. Progress Tracking
- Real-time progress updates during fetching
- Shows current combination being processed
- Tracks total progress and companies found
- Provides feedback to users during long operations

## Implementation Files

### 1. `src/pages/admin/icp/create-icp.tsx`
Main implementation with UI integration:
- Multi-select form fields for industries and employee sizes
- Real-time results display in editable tables
- Priority assignment and company management
- Batch ICP creation from fetched results

### 2. `src/utils/companyFetcher.ts`
Reusable utility functions:
- `fetchAllCompaniesForCombination()` - Single combination fetching
- `fetchAllCompaniesByCombinations()` - Multi-combination processing
- TypeScript interfaces for type safety
- Configurable options for error handling and progress tracking

## API Integration

### Expected API Response Format
```json
{
  "status": true,
  "data": {
    "companies": [
      {
        "_id": "67e65760bfdb42e9e5010887",
        "profileUrl": "https://www.linkedin.com/company/testhouse-ltd",
        "company": "testhouse",
        "website": "https://www.testhouse.net",
        "industry": "IT",
        "companySize": "201-500",
        "headquarters": "London, United Kingdom",
        "overview": "...",
        "mappedTo": [],
        "companyLogo": "",
        "news": []
      }
    ],
    "totalCompanies": 2
  },
  "message": "All Companies"
}
```

### API Endpoint
```
GET ${appDomain}/api/mapping/v1/company-master/all-company
```

### Query Parameters
- `page`: Page number (1-based)
- `search`: Search term (empty for all)
- `industry`: Industry filter
- `employeeSize`: Employee size filter
- `logo`: Logo parameter (set to "undefined")

## Usage Examples

### Basic Usage
```typescript
const industries = ['IT', 'Healthcare'];
const employeeSizes = ['10-50', '50-100'];

const companies = await fetchAllCompaniesByCombinations(industries, employeeSizes);
console.log(`Fetched ${companies.length} unique companies`);
```

### Advanced Usage with Progress Tracking
```typescript
const companies = await fetchAllCompaniesByCombinations(industries, employeeSizes, {
  onProgress: (progress) => {
    console.log(`Processing: ${progress.currentCombination}`);
    console.log(`Progress: ${progress.processedCombinations}/${progress.totalCombinations}`);
    setProgressState(progress);
  },
  onError: (error, combination) => {
    console.error(`Error fetching ${combination}:`, error.message);
    toast.error(`Failed to fetch data for ${combination}`);
  },
  maxRetries: 3,
  retryDelay: 1000
});
```

## Performance Considerations

### 1. Combination Explosion
- Be mindful of the number of combinations (industries × employee_sizes)
- Consider batching or user confirmation for large combinations
- Example: 10 industries × 8 employee sizes = 80 API calls

### 2. Rate Limiting
- Implement delays between requests if needed
- Monitor API response times and adjust accordingly
- Consider implementing request queuing for very large datasets

### 3. Memory Usage
- Large datasets may consume significant memory
- Consider streaming or chunked processing for very large results
- Implement pagination in the UI for displaying results

## Error Scenarios Handled

1. **Network Failures**: Automatic retry with exponential backoff
2. **Invalid API Responses**: Graceful handling of malformed data
3. **Partial Failures**: Continue processing other combinations
4. **Empty Results**: Handle cases where no companies match criteria
5. **Timeout Issues**: Configurable timeout and retry logic

## Future Enhancements

1. **Caching**: Implement result caching to avoid redundant API calls
2. **Background Processing**: Move heavy operations to web workers
3. **Export Functionality**: Add CSV/Excel export for large datasets
4. **Advanced Filtering**: Add more granular filtering options
5. **Batch Operations**: Support for bulk operations on fetched data

## Testing Recommendations

1. Test with various combination sizes (1×1, 5×5, 10×8)
2. Test error scenarios (network failures, invalid responses)
3. Test with empty result sets
4. Performance testing with large datasets
5. UI responsiveness during long operations

## Dependencies

- `axios`: HTTP client for API requests
- `react`: UI framework
- `@/constants`: Application constants (appDomain)
- `@/components/ui/*`: UI components (shadcn/ui)
- `sonner`: Toast notifications

This solution provides a robust, scalable approach to fetching company data with comprehensive error handling and user feedback.
