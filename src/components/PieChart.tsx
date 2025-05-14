import * as React from "react"
import { Label, Pie, PieChart } from "recharts"

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

const colors: string[] = [
  "hsl(210, 20%, 50%)", // slate-500
  "hsl(0, 0%, 50%)", // gray-500
  "hsl(240, 5%, 50%)", // zinc-500
  "hsl(0, 0%, 50%)", // neutral-500
  "hsl(30, 6%, 50%)", // stone-500
  "hsl(0, 100%, 50%)", // red-500
  "hsl(30, 100%, 50%)", // orange-500
  "hsl(45, 100%, 50%)", // amber-500
  "hsl(60, 100%, 50%)", // yellow-500
  "hsl(90, 100%, 50%)", // lime-500
  "hsl(120, 100%, 50%)", // green-500
  "hsl(150, 100%, 50%)", // emerald-500
  "hsl(180, 100%, 50%)", // teal-500
  "hsl(210, 100%, 50%)", // cyan-500
  "hsl(240, 100%, 50%)", // sky-500
  "hsl(270, 100%, 50%)", // blue-500
  "hsl(300, 100%, 50%)", // indigo-500
  "hsl(330, 100%, 50%)", // violet-500
  "hsl(360, 100%, 50%)", // purple-500
  "hsl(30, 100%, 50%)", // fuchsia-500
  "hsl(60, 100%, 50%)", // pink-500
  "hsl(90, 100%, 50%)" // rose-500
];

const chartData = [
  { browser: "chrome", visitors: 275, fill: colors[13] },
  { browser: "safari", visitors: 200, fill: colors[6] },
]

const chartConfig = {
  visitors: {
    label: "Visitors",
  },
  chrome: {
    label: "Chrome",
    color: "hsl(var(--chart-1))",
  },
  safari: {
    label: "Safari",
    color: "hsl(var(--chart-2))",
  },
  firefox: {
    label: "Firefox",
    color: "hsl(var(--chart-3))",
  },
  edge: {
    label: "Edge",
    color: "hsl(var(--chart-4))",
  },
  other: {
    label: "Other",
    color: "hsl(var(--chart-5))",
  },
} satisfies ChartConfig

export function PieChartComponent() {
  const totalVisitors = React.useMemo(() => {
    return chartData.reduce((acc, curr) => acc + curr.visitors, 0)
  }, [])

  return (
    <Card className="flex flex-col bg-transparent border-none shadow-none">
      <CardHeader className="items-center pb-0">
        <CardTitle className="text-center text-xl">Total Attendees</CardTitle>
        {/* <CardDescription>January - June 2024</CardDescription> */}
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto -mt-5 aspect-square max-h-[276px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={chartData}
              dataKey="visitors"
              nameKey="browser"
              innerRadius={60}
              strokeWidth={5}
            >
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className="fill-foreground text-3xl font-bold"
                        >
                          {totalVisitors.toLocaleString()}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className="fill-muted-foreground"
                        >
                          Visitors
                        </tspan>
                      </text>
                    )
                  }
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        
      </CardFooter>
    </Card>
  )
}