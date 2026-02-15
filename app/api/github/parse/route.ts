import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { parseGitHubRepo } from '@/lib/audit/parser';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { url, auditType } = await request.json();

    if (!url || !auditType) {
      return NextResponse.json({ error: 'URL and audit type required' }, { status: 400 });
    }

    if (!url.includes('github.com')) {
      return NextResponse.json({ error: 'Only GitHub repositories are supported' }, { status: 400 });
    }

    const result = await parseGitHubRepo(url, auditType);

    return NextResponse.json({
      repoName: result.repoName,
      fileCount: result.fileCount,
      totalSize: result.totalSize,
      files: result.files.map((f) => ({ path: f.path, size: f.size })),
    });
  } catch (error) {
    console.error('GitHub parse error:', error);
    return NextResponse.json({ error: 'Failed to parse repository' }, { status: 500 });
  }
}
