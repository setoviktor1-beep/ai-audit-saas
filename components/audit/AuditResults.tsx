'use client';

import { useState } from 'react';
import { Download } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface AuditResultsProps {
  jobId: string;
  results: any;
}

export function AuditResults({ jobId, results }: AuditResultsProps) {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async (format: 'json' | 'yaml') => {
    setDownloading(true);
    try {
      const response = await fetch(`/api/audit/results/${jobId}?format=${format}`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `audit_${jobId}.${format}`;
      a.click();
    } finally {
      setDownloading(false);
    }
  };

  const { summary, modules } = results;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Audit Summary</CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => handleDownload('json')} disabled={downloading}>
              <Download className="mr-2 h-4 w-4" />
              JSON
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleDownload('yaml')} disabled={downloading}>
              <Download className="mr-2 h-4 w-4" />
              YAML
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="text-center p-4 rounded-lg bg-primary/10">
              <p className="text-4xl font-bold text-primary">{summary.overall_score}</p>
              <p className="text-sm text-gray-600">Overall Score</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-gray-100">
              <p className="text-4xl font-bold">{summary.total_issues}</p>
              <p className="text-sm text-gray-600">Total Issues</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-red-50">
              <p className="text-4xl font-bold text-red-600">{summary.critical + summary.high}</p>
              <p className="text-sm text-gray-600">Critical/High</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-green-50">
              <p className="text-4xl font-bold text-green-600">{summary.modules_completed}</p>
              <p className="text-sm text-gray-600">Modules Complete</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Module Results</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue={modules?.[0]?.id}>
            <TabsList className="flex-wrap h-auto">
              {modules?.map((module: any) => (
                <TabsTrigger key={module.id} value={module.id} className="gap-2">
                  {module.name}
                  {module.score !== undefined && <Badge variant="secondary">{module.score}</Badge>}
                </TabsTrigger>
              ))}
            </TabsList>

            {modules?.map((module: any) => (
              <TabsContent key={module.id} value={module.id} className="mt-6">
                {module.results ? (
                  <div className="space-y-6">
                    {module.results.scores && (
                      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {Object.entries(module.results.scores).map(([key, value]: [string, any]) => (
                          <div key={key} className="p-4 rounded-lg border">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium capitalize">{key.replace(/_/g, ' ')}</span>
                              <span className="font-bold">
                                {value.score}/{value.max}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600">{value.justification}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-500">No results available</p>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
