"use client"

import { TrendingUp } from "lucide-react"
import { Bar, BarChart, CartesianGrid, LabelList, XAxis } from "recharts"

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
const chartData = [
    { month: "January", desktop: 186 },
    { month: "February", desktop: 305 },
    { month: "March", desktop: 237 },
    { month: "April", desktop: 73 },
    { month: "May", desktop: 209 },
    { month: "June", desktop: 214 },
    { month: "July", desktop: 250 },
    { month: "August", desktop: 280 },
    { month: "September", desktop: 320 },
    { month: "October", desktop: 290 },
    { month: "November", desktop: 310 },
    { month: "December", desktop: 350 },
]

const chartConfig = {
    desktop: {
        label: "Desktop",
        color: "#0071E3",
    },
} satisfies ChartConfig

export function BarChartComponent() {
    return (
        <Card className="bg-transparent shadow-none border-none">
            {/* <CardHeader>
                <CardTitle>Bar Chart - Label</CardTitle>
                <CardDescription>January - June 2024</CardDescription>
            </CardHeader> */}
            <CardContent>
                <ChartContainer config={chartConfig}>
                    <BarChart
                        accessibilityLayer
                        data={chartData}
                        margin={{
                            top: 20,
                        }}
                    >
                        <CartesianGrid vertical={false} />
                        <XAxis
                            dataKey="month"
                            tickLine={false}
                            tickMargin={10}
                            axisLine={false}
                            tickFormatter={(value) => value.slice(0, 3)}
                        />
                        <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent hideLabel />}
                        />
                        <Bar dataKey="desktop" fill="var(--color-desktop)" radius={8}>
                            <LabelList
                                position="top"
                                offset={12}
                                className="fill-foreground"
                                fontSize={12}
                            />
                        </Bar>
                    </BarChart>
                </ChartContainer>
            </CardContent>
            <CardFooter className="flex-col items-center gap-2 text-sm">
                <p>Time Hours</p>
            </CardFooter>
        </Card>
    )
}