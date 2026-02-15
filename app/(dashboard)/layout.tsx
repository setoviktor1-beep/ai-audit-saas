import { requireUser } from '@/lib/auth/getUser';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { Toaster } from '@/components/ui/toaster';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireUser();

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 p-8">
        <div className="max-w-6xl mx-auto">{children}</div>
      </main>
      <Toaster />
    </div>
  );
}
