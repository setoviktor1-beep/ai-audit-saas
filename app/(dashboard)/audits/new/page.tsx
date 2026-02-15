import { AuditForm } from '@/components/audit/AuditForm';

export const dynamic = 'force-dynamic';

export default function NewAuditPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">New Audit</h1>
        <p className="text-gray-600">Start a new code or landing page audit</p>
      </div>

      <AuditForm />
    </div>
  );
}
