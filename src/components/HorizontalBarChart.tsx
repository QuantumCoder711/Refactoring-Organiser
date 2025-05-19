import { TrendingUp } from "lucide-react"
import { Bar, BarChart, XAxis, YAxis } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

// Define the type for chart data items
interface ChartDataItem {
  label: string;
  count: number;
}

// Define props interface for the component
interface HorizontalBarChartProps {
  chartData: ChartDataItem[];
  title?: string;
}

export function HorizontalBarChartComponent({ chartData, title = "Total Attendees by Company" }: HorizontalBarChartProps) {

  const maxCount = Math.max(...chartData.map((data) => data.count));

  return (
    <Card className="bg-transparent shadow-none border-none">
      <CardHeader>
        <CardTitle className="text-center">{title}</CardTitle>
        {/* <CardDescription className="text-center">January - June 2024</CardDescription> */}
      </CardHeader>
      <CardContent className="h-fit">
        <div className="flex flex-col gap-3">
          {chartData.map((item, index) => (
            <div key={index} className='flex gap-[10px] items-center'>
              <p 
                className='cursor-default font-semibold max-w-40 w-full text-ellipsis overflow-hidden text-nowrap text-right'
                title={item.label}
              >
                {item.label}
              </p>
              <div
                className={`h-6 rounded-sm grid font-sans min-w-fit font-semibold place-content-center bg-brand-primary text-center text-white p-1`}
                style={{
                  width: `${(item.count / maxCount) * 100 * 0.6}%`,
                }}
              >
                {item.count}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card >
  )
}
