import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { cn } from "@/lib/utils";

// Define the type for chart data items
interface ChartDataItem {
  label: string;
  count: number;
}

// Define props interface for the component
interface HorizontalBarChartProps {
  chartData: ChartDataItem[];
  title?: string;
  bgColor?: string;
}

export function HorizontalBarChartComponent({ chartData, title = "Total Attendees by Company", bgColor }: HorizontalBarChartProps) {

  const maxCount = Math.max(...chartData.map((data) => data.count));

  return (
    <Card className="bg-transparent shadow-none border-none w-full">
      <CardHeader className="px-4 sm:px-6">
        <CardTitle className="text-center text-lg sm:text-xl">{title}</CardTitle>
        {/* <CardDescription className="text-center">January - June 2024</CardDescription> */}
      </CardHeader>
      <CardContent className="h-fit px-4 sm:px-6">
        <div className="flex flex-col gap-3 sm:gap-4">
          {chartData.map((item, index) => (
            <div key={index} className='flex flex-col sm:flex-row sm:gap-3 gap-2 items-stretch sm:items-center'>
              <p 
                className='cursor-default font-semibold text-xs sm:text-sm text-left truncate max-w-full sm:max-w-40 w-full px-1 sm:px-0'
                title={item.label}
              >
                {item.label}
              </p>
              <div className="flex items-center gap-2 sm:flex-1">
                <div
                  className={cn(
                    `h-6 rounded-sm grid font-sans font-semibold place-content-center bg-brand-primary text-white p-1 min-w-[40px] sm:min-w-[50px] text-xs sm:text-sm`,
                    bgColor
                  )}
                  style={{
                    width: `${(item.count / maxCount) * 100}%`,
                    maxWidth: '100%'
                  }}
                >
                  {item.count}
                </div>
                {/* Optional: Show percentage on larger screens */}
                <span className="hidden sm:inline text-xs text-muted-foreground min-w-[40px]">
                  {maxCount > 0 ? `${Math.round((item.count / maxCount) * 100)}%` : '0%'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}