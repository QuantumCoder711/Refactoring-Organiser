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
  "hsl(210, 100%, 50%)", // cyan-500
  "hsl(30, 100%, 50%)", // orange-500
];

const chartConfig = {
  visitors: {
    label: "Attendees",
  },
  checkedIn: {
    label: "Checked In",
    color: colors[0],
  },
  nonCheckedIn: {
    label: "Non Checked In",
    color: colors[1],
  },
} satisfies ChartConfig

export function PieChartComponent(props: { checkedInUsers: number; nonCheckedInUsers: number }) {
  const chartData = [
    { status: "Checked In", visitors: props.checkedInUsers, fill: colors[0] },
    { status: "Non Checked In", visitors: props.nonCheckedInUsers, fill: colors[1] },
  ]

  const totalVisitors = React.useMemo(() => {
    return chartData.reduce((acc, curr) => acc + curr.visitors, 0)
  }, [chartData])

  return (
    <Card className="flex flex-col bg-transparent border-none shadow-none">
      <CardHeader className="items-center pb-0">
        <CardTitle className="text-center text-xl">Total Attendees</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto -mt-5 aspect-square max-h-[276px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent />}
            />
            <Pie
              data={chartData}
              dataKey="visitors"
              nameKey="status"
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
                          className="fill-foreground text-2xl font-bold"
                        >
                          {props.checkedInUsers}/{totalVisitors.toLocaleString()}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className="fill-muted-foreground"
                        >
                          CheckIn's
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