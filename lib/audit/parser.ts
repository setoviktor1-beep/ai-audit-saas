import { Octokit } from '@octokit/rest';

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

interface ParsedFile {
  path: string;
  content: string;
  size: number;
}

interface ParseResult {
  files: ParsedFile[];
  totalSize: number;
  fileCount: number;
  repoName: string;
}

const CODE_EXTENSIONS = [
  '.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs', '.py', '.go', '.java', '.rs', '.css', '.scss',
  '.json', '.yaml', '.yml', '.md', '.html', '.sql', '.graphql', '.sh', '.env.example', '.gitignore',
];

const LANDING_EXTENSIONS = ['.html', '.htm', '.css', '.js'];

const SKIP_DIRS = ['node_modules', '.git', 'dist', 'build', '.next', 'coverage'];
const MAX_FILE_SIZE = 100 * 1024;

export async function parseGitHubRepo(repoUrl: string, auditType: 'code' | 'landing'): Promise<ParseResult> {
  const match = repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
  if (!match) throw new Error('Invalid GitHub URL');

  const owner = match[1];
  const repo = match[2].replace('.git', '');

  const { data: repoData } = await octokit.repos.get({ owner, repo });

  const { data: treeData } = await octokit.git.getTree({
    owner,
    repo,
    tree_sha: repoData.default_branch,
    recursive: 'true',
  });

  const extensions = auditType === 'code' ? CODE_EXTENSIONS : LANDING_EXTENSIONS;
  const files: ParsedFile[] = [];
  let totalSize = 0;

  const relevantBlobs = treeData.tree.filter((item) => {
    if (item.type !== 'blob' || !item.path) return false;
    if (item.path.split('/').some((part) => SKIP_DIRS.includes(part))) return false;

    const ext = '.' + item.path.split('.').pop()?.toLowerCase();
    return extensions.includes(ext) || item.path === 'Dockerfile' || item.path === 'Makefile';
  });

  for (const blob of relevantBlobs.slice(0, 50)) {
    if (!blob.path || !blob.sha) continue;
    if (blob.size && blob.size > MAX_FILE_SIZE) continue;

    try {
      const { data: fileData } = await octokit.git.getBlob({ owner, repo, file_sha: blob.sha });
      const content = Buffer.from(fileData.content, 'base64').toString('utf-8');
      files.push({ path: blob.path, content, size: content.length });
      totalSize += content.length;
    } catch (error) {
      console.warn(`Failed to fetch ${blob.path}:`, error);
    }
  }

  return { files, totalSize, fileCount: files.length, repoName: `${owner}/${repo}` };
}

export function formatFilesForPrompt(files: { path: string; content: string }[]): string {
  return files.map((f) => `### FILE: ${f.path}\n\`\`\`\n${f.content}\n\`\`\``).join('\n\n');
}
