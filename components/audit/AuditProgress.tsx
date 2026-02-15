'use client';

import { useEffect, useState } from 'react';
import { CheckCircle, Clock, Loader2, XCircle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Module {
  module_id: string;
  module_name: string;
  status: string;
  score?: number;
}

interface AuditProgressProps {
  jobId: string;
  initialStatus: string;
  initialModules: Module[];
  onComplete?: () => void;
}

export function AuditProgress({ jobId, initialStatus, initialModules, onComplete }: AuditProgressProps) {
  const [status, setStatus] = useState(initialStatus);
  const [modules, setModules] = useState(initialModules);
  const [progressPercent, setProgressPercent] = useState(0);

  useEffect(() => {
    if (status === 'completed' || status === 'failed') {
      onComplete?.();
      return;
    }

    const interval = setInterval(async () => {
      try {
        const response = await fetch(`/api/audit/status/${jobId}`);
        const data = await response.json();

        setStatus(data.status);
        setModules(data.modules);
        setProgressPercent(data.progressPercent);

        if (data.status === 'completed' || data.status === 'failed') {
          onComplete?.();
          clearInterval(interval);
        }
      } catch (error) {
        console.error('Failed to fetch status:', error);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [jobId, status, onComplete]);

  const getStatusIcon = (moduleStatus: string) => {
    switch (moduleStatus) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'processing':
        return <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />;
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-400" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Audit Progress</span>
          <Badge
            className={
              status === 'completed'
                ? 'bg-green-100 text-green-800'
                : status === 'failed'
                  ? 'bg-red-100 text-red-800'
                  : 'bg-blue-100 text-blue-800'
            }
          >
            {status}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Overall Progress</span>
            <span>{progressPercent}%</span>
          </div>
          <Progress value={progressPercent} />
        </div>
        <div className="space-y-3">
          {modules.map((module) => (
            <div key={module.module_id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
              <div className="flex items-center gap-3">
                {getStatusIcon(module.status)}
                <span className="font-medium">{module.module_name}</span>
              </div>
              {module.score !== undefined && <span className="font-bold">{module.score}/100</span>}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
