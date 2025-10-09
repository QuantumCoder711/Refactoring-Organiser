import { Bar, BarChart, CartesianGrid, LabelList, XAxis } from "recharts"

import {
    Card,
    CardContent,
    CardFooter,
} from "@/components/ui/card"
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart";

const chartConfig = {
    attendees: {
        label: "Attendees",
        color: "#0071E3",
    },
} satisfies ChartConfig

export function BarChartComponent(props: { hoursArray: { hour: string, totalCheckins: number }[] }) {
    const chartData = props.hoursArray.map((hourData) => {
        return { hours: hourData.hour, attendees: hourData.totalCheckins };
    });

    return (
        <Card className="bg-transparent shadow-none border-none">
            <CardContent className="overflow-y-scroll">
                <ChartContainer config={chartConfig} className="min-h-96 max-w-fit">
                    <BarChart
                        accessibilityLayer
                        data={chartData}
                        margin={{
                            top: 20,
                            bottom: 20,
                            left: 20,
                            right: 20,
                        }}
                    >
                        <CartesianGrid vertical={false} />
                        <XAxis
                            dataKey="hours"
                            tickLine={false}
                            tickMargin={10}
                            axisLine={false}
                            interval={0}
                            angle={-45}
                            textAnchor="end"
                            height={60}
                        />
                        <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent hideLabel />}
                        />
                        <Bar dataKey="attendees" className="fill-primary" radius={8}>
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
