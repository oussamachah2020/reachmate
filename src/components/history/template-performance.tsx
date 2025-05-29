import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, ExternalLink, FileText } from "lucide-react";
import { TemplatePerformance as TemplatePerformanceType } from "@/types/history";

interface TemplatePerformanceProps {
  templates: TemplatePerformanceType[];
  isLoading?: boolean;
}

export function TemplatePerformance({ templates, isLoading }: TemplatePerformanceProps) {
  const useTemplate = (templateId: string) => {
    window.location.href = `/compose?template=${templateId}`;
  };

  if (isLoading) {
    return (
      <Card className="shadow-none">
        <CardHeader>
          <CardTitle>Template Performance</CardTitle>
          <CardDescription>Loading template insights...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-24  rounded animate-pulse"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-none">
      <CardHeader>
        <CardTitle>Template Performance</CardTitle>
        <CardDescription>
          See which templates are performing best and driving engagement
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {templates.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="text-lg font-medium">No template data yet</p>
              <p className="text-sm">
                Create templates to see performance insights
              </p>
            </div>
          ) : (
            templates.map((template) => (
              <div
                key={template.templateId}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold ">{template.subject}</h3>
                        {template.trend === "up" && (
                          <TrendingUp className="h-4 w-4 text-green-600" />
                        )}
                        {template.trend === "down" && (
                          <TrendingDown className="h-4 w-4 text-red-600" />
                        )}
                        {template.category && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ">
                            {template.category}
                          </span>
                        )}
                      </div>
                      <p className="text-sm  mt-1">
                        Last used:{" "}
                        {new Date(template.lastUsed).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mt-3 text-sm">
                    <div>
                      <span className="">Times Used:</span>
                      <span className="ml-2 font-semibold">
                        {template.totalSent}
                      </span>
                    </div>
                    <div>
                      <span className="">Open Rate:</span>
                      <span className="ml-2 font-semibold text-green-600">
                        {template.openRate}%
                      </span>
                    </div>
                    <div>
                      <span className="">Reply Rate:</span>
                      <span className="ml-2 font-semibold text-blue-600">
                        {template.replyRate}%
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => useTemplate(template.templateId)}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Use Template
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}