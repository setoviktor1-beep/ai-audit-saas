'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

export function UserMenu() {
  const { user, loading, signOut } = useAuth();

  if (loading) {
    return <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse" />;
  }

  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <Button variant="ghost" asChild><Link href="/login">Sign in</Link></Button>
        <Button asChild><Link href="/register">Get Started</Link></Button>
      </div>
    );
  }

  const initials = user.email?.slice(0, 2).toUpperCase() || 'U';

  return (
    <div className="flex items-center justify-between gap-2">
      <div className="flex items-center gap-2 min-w-0">
        <Avatar className="h-8 w-8"><AvatarFallback>{initials}</AvatarFallback></Avatar>
        <div className="text-xs min-w-0">
          <p className="font-medium truncate">Account</p>
          <p className="text-muted-foreground truncate">{user.email}</p>
        </div>
      </div>
      <Button variant="ghost" onClick={signOut}>Sign out</Button>
    </div>
  );
}
