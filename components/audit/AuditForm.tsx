'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Github, Loader2, AlertCircle } from 'lucide-react';
import { useCredits } from '@/lib/hooks/useCredits';
import { CODE_MODULES, LANDING_MODULES, AuditType, calculateCreditsCost } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ModuleSelector } from './ModuleSelector';

export function AuditForm() {
  const router = useRouter();
  const { balance, loading: creditsLoading } = useCredits();
  const [auditType, setAuditType] = useState<AuditType>('code');
  const [sourceUrl, setSourceUrl] = useState('');
  const [selectedModules, setSelectedModules] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const modules = auditType === 'code' ? CODE_MODULES : LANDING_MODULES;
  const creditsCost = calculateCreditsCost(selectedModules, auditType);
  const hasEnoughCredits = balance >= creditsCost;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!sourceUrl) return setError('Please enter a GitHub repository URL');
    if (selectedModules.length === 0) return setError('Please select at least one module');
    if (!hasEnoughCredits) return setError('Insufficient credits. Please purchase more credits.');

    setLoading(true);

    try {
      const response = await fetch('/api/audit/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sourceUrl, auditType, selectedModules }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to create audit');

      router.push(`/audits/${data.jobId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <Alert className="border-destructive bg-destructive/10">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Audit Type</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs
            value={auditType}
            onValueChange={(v) => {
              setAuditType(v as AuditType);
              setSelectedModules([]);
            }}
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="code">Code Audit</TabsTrigger>
              <TabsTrigger value="landing">Landing Page</TabsTrigger>
            </TabsList>
            <TabsContent value="code" className="mt-4">
              <p className="text-sm text-gray-600">Comprehensive analysis of your codebase.</p>
            </TabsContent>
            <TabsContent value="landing" className="mt-4">
              <p className="text-sm text-gray-600">Analyze your landing page SEO and performance.</p>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Source</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="sourceUrl">GitHub Repository URL</Label>
            <div className="relative flex-1">
              <Github className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="sourceUrl"
                type="url"
                placeholder="https://github.com/owner/repo"
                value={sourceUrl}
                onChange={(e) => setSourceUrl(e.target.value)}
                className="pl-10"
                required
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Select Modules</CardTitle>
        </CardHeader>
        <CardContent>
          <ModuleSelector modules={modules} selected={selectedModules} onChange={setSelectedModules} />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Total Cost</p>
              <p className="text-2xl font-bold text-primary">{creditsCost} credits</p>
              {!creditsLoading && (
                <p className={`text-sm ${hasEnoughCredits ? 'text-gray-500' : 'text-red-500'}`}>
                  Your balance: {balance} credits
                </p>
              )}
            </div>
            <Button type="submit" size="lg" disabled={loading || selectedModules.length === 0 || !hasEnoughCredits}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Start Audit
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
