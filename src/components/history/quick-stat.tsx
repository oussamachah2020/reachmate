import { Card, CardContent } from "@/components/ui/card";
import { Mail, Eye, Reply, Target, TrendingUp } from "lucide-react";
import { QuickStats as QuickStatsType } from "@/types/history";

interface QuickStatsProps {
  stats: QuickStatsType;
  isLoading?: boolean;
}

export function QuickStats({ stats, isLoading }: QuickStatsProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-5">
        {[...Array(5)].map((_, i) => (
          <Card key={i} className="shadow-none">
            <CardContent className="p-4">
              <div className="h-16  rounded animate-pulse"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-5">
      <Card className="shadow-none">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium ">Total Sent</p>
              <p className="text-2xl font-bold">{stats.totalSent}</p>
            </div>
            <Mail className="h-8 w-8 text-blue-600" />
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-none">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium ">Opened</p>
              <p className="text-2xl font-bold">{stats.totalOpened}</p>
            </div>
            <Eye className="h-8 w-8 text-green-600" />
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-none">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium ">Replied</p>
              <p className="text-2xl font-bold">{stats.totalReplied}</p>
            </div>
            <Reply className="h-8 w-8 text-purple-600" />
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-none">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium ">Open Rate</p>
              <p className="text-2xl font-bold">{stats.openRate.toFixed(1)}%</p>
            </div>
            <Target className="h-8 w-8 text-orange-600" />
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-none">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium ">Reply Rate</p>
              <p className="text-2xl font-bold">
                {stats.replyRate.toFixed(1)}%
              </p>
            </div>
            <TrendingUp className="h-8 w-8 text-red-600" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
