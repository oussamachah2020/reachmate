"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";

interface EmailTrendsData {
  date: string;
  sent: number;
  opened: number;
  responded: number;
}

interface EmailTrendsChartProps {
  data: EmailTrendsData[];
  selectedMetric: string;
  onMetricChange: (metric: string) => void;
  isLoading?: boolean;
}

const chartConfig = {
  sent: {
    label: "Sent",
    color: "hsl(142.1 76.2% 36.3%)", // green-600
  },
  opened: {
    label: "Opened",
    color: "hsl(142.1 70.6% 45.3%)", // green-500
  },
  responded: {
    label: "Responded",
    color: "hsl(138.5 76.5% 59.6%)", // green-400
  },
};

export function EmailTrendsChart({
  data,
  selectedMetric,
  onMetricChange,
  isLoading = false,
}: EmailTrendsChartProps) {
  if (isLoading) {
    return (
      <Card className="shadow-none">
        <CardHeader>
          <CardTitle>Email Performance Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] bg-muted/50 rounded animate-pulse flex items-center justify-center">
            <div className="text-muted-foreground">Loading chart...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const formattedData = data.map((item) => ({
    ...item,
    date: formatDate(item.date),
  }));

  return (
    <Card className="shadow-none">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Email Performance Trends</span>
          <Select value={selectedMetric} onValueChange={onMetricChange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sent">Sent</SelectItem>
              <SelectItem value="opened">Opened</SelectItem>
              <SelectItem value="responded">Responded</SelectItem>
            </SelectContent>
          </Select>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="min-h-[300px]">
          <AreaChart
            accessibilityLayer
            data={formattedData}
            margin={{
              left: 12,
              right: 12,
              top: 12,
              bottom: 12,
            }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="hsl(var(--muted-foreground))"
              strokeOpacity={0.3}
              vertical={false}
            />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tick={{
                fontSize: 12,
                fill: "hsl(var(--muted-foreground))",
              }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tick={{
                fontSize: 12,
                fill: "hsl(var(--muted-foreground))",
              }}
            />
            <ChartTooltip
              cursor={{
                stroke: "hsl(var(--muted-foreground))",
                strokeWidth: 1,
                strokeDasharray: "3 3",
              }}
              content={<ChartTooltipContent indicator="dot" />}
            />
            <Area
              dataKey={selectedMetric}
              type="natural"
              fill={`var(--color-${selectedMetric})`}
              fillOpacity={0.15}
              stroke={`var(--color-${selectedMetric})`}
              strokeWidth={2.5}
              dot={{
                fill: `var(--color-${selectedMetric})`,
                strokeWidth: 2,
                r: 4,
              }}
              activeDot={{
                r: 6,
                stroke: `var(--color-${selectedMetric})`,
                strokeWidth: 2,
                fill: "hsl(var(--background))",
              }}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
