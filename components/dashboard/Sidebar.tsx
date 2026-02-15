'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, FileSearch, CreditCard, Settings, Plus, Coins } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCredits } from '@/lib/hooks/useCredits';
import { UserMenu } from '@/components/auth/UserMenu';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Audits', href: '/audits', icon: FileSearch },
  { name: 'Credits', href: '/credits', icon: CreditCard },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { balance, loading } = useCredits();

  return (
    <div className="flex flex-col w-64 bg-white border-r">
      <div className="p-6 border-b">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <FileSearch className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-lg">AI Audit</span>
        </Link>
      </div>

      <div className="p-4">
        <Link
          href="/audits/new"
          className="flex items-center justify-center gap-2 w-full py-2 px-4 bg-primary text-white rounded-lg hover:bg-primary/90 transition"
        >
          <Plus className="w-4 h-4" />
          New Audit
        </Link>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition',
                isActive ? 'bg-primary/10 text-primary font-medium' : 'text-gray-600 hover:bg-gray-100'
              )}
            >
              <item.icon className="w-5 h-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t">
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2">
            <Coins className="w-5 h-5 text-yellow-500" />
            <span className="text-sm text-gray-600">Credits</span>
          </div>
          <span className="font-bold">{loading ? '...' : balance}</span>
        </div>
      </div>

      <div className="p-4 border-t">
        <UserMenu />
      </div>
    </div>
  );
}
