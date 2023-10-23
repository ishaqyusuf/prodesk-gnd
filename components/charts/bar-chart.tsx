"use client";
import { BarChartProps } from "@/lib/chart";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts";
interface Props {
    data: BarChartProps[];
}
export default function BarChartComponent({ data }: Props) {
    return (
        <ResponsiveContainer width="100%" height={250}>
            <BarChart data={data}>
                <XAxis
                    dataKey="name"
                    stroke="#8884d8"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                />
                <YAxis
                    stroke="#8884d8"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={value => `$${value}`}
                />
                <Bar dataKey="total" fill="#8884d8" radius={[4, 4, 0, 0]} />
            </BarChart>
        </ResponsiveContainer>
    );
}
