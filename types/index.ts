export type AuditType = 'code' | 'landing';
export type AuditStatus = 'pending' | 'processing' | 'completed' | 'failed';
export type ModuleStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface AuditModule {
  id: string;
  name: string;
  category: AuditType;
  priority: number;
  credits: number;
  estimatedTokens: number;
  dependencies: string[];
  description: string;
}

export interface AuditJob {
  id: string;
  userId: string;
  status: AuditStatus;
  sourceType: 'github' | 'zip';
  sourceUrl?: string;
  sourceName: string;
  auditType: AuditType;
  selectedModules: string[];
  creditsCost: number;
  progress: Record<string, ModuleStatus>;
  errorMessage?: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

export interface AuditResult {
  id: string;
  jobId: string;
  moduleId: string;
  moduleName: string;
  status: ModuleStatus;
  score?: number;
  results?: AuditResultData;
  tokensUsed?: number;
  processingTimeMs?: number;
  createdAt: string;
}

export interface AuditResultData {
  audit: string;
  date: string;
  source_path: string;
  overall_score: number;
  summary: {
    total_issues: number;
    critical: number;
    warning?: number;
    high?: number;
    medium?: number;
    low?: number;
    info?: number;
  };
  scores: Record<string, { score: number; max: number; justification: string }>;
  issues: AuditIssue[];
  recommendations?: {
    immediate?: string[];
    short_term?: string[];
    long_term?: string[];
  };
}

export interface AuditIssue {
  id: string;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info' | 'warning';
  category: string;
  title: string;
  description: string;
  file?: string;
  line?: number;
  suggestion?: string;
  code_snippet?: string;
  fix?: string;
}

export interface UserCredits {
  id: string;
  userId: string;
  balance: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreditTransaction {
  id: string;
  userId: string;
  amount: number;
  type: 'purchase' | 'usage' | 'refund' | 'bonus';
  description?: string;
  stripePaymentId?: string;
  auditJobId?: string;
  createdAt: string;
}

export interface PricingPackage {
  id: string;
  name: string;
  priceCents: number;
  credits: number;
  stripePriceId?: string;
  features: {
    maxModules?: number;
    reaudit?: boolean;
    description?: string;
  };
  isActive: boolean;
}

export const CODE_MODULES: AuditModule[] = [
  {
    id: 'code_quality',
    name: 'Code Quality',
    category: 'code',
    priority: 1,
    credits: 10,
    estimatedTokens: 8000,
    dependencies: [],
    description: 'Naming, DRY, functions, error handling, TypeScript',
  },
  {
    id: 'security',
    name: 'Security',
    category: 'code',
    priority: 1,
    credits: 15,
    estimatedTokens: 12000,
    dependencies: [],
    description: 'Secrets, auth, injection, XSS, API security',
  },
  {
    id: 'deployment',
    name: 'Deployment',
    category: 'code',
    priority: 2,
    credits: 10,
    estimatedTokens: 8000,
    dependencies: [],
    description: 'Documentation, CI/CD, monitoring, legal',
  },
  {
    id: 'architecture',
    name: 'Architecture',
    category: 'code',
    priority: 2,
    credits: 12,
    estimatedTokens: 10000,
    dependencies: ['code_quality'],
    description: 'Structure, layers, components, scalability',
  },
  {
    id: 'ux_frontend',
    name: 'UX & Frontend',
    category: 'code',
    priority: 3,
    credits: 12,
    estimatedTokens: 10000,
    dependencies: [],
    description: 'Accessibility, responsive, states',
  },
  {
    id: 'monetization',
    name: 'Monetization',
    category: 'code',
    priority: 3,
    credits: 12,
    estimatedTokens: 10000,
    dependencies: ['security'],
    description: 'Payments, webhooks, balance, race conditions',
  },
  {
    id: 'ai_integration',
    name: 'AI Integration',
    category: 'code',
    priority: 2,
    credits: 15,
    estimatedTokens: 12000,
    dependencies: [],
    description: 'Prompts, safety, injection testing, costs',
  },
  {
    id: 'seo_integration',
    name: 'SEO Integration',
    category: 'code',
    priority: 2,
    credits: 10,
    estimatedTokens: 9000,
    dependencies: [],
    description: 'Metadata, robots, sitemap, structured data, and social preview tags',
  },
];

export const LANDING_MODULES: AuditModule[] = [
  {
    id: 'seo',
    name: 'SEO',
    category: 'landing',
    priority: 1,
    credits: 8,
    estimatedTokens: 6000,
    dependencies: [],
    description: 'Meta tags, structured data, headings',
  },
  {
    id: 'performance',
    name: 'Performance',
    category: 'landing',
    priority: 1,
    credits: 8,
    estimatedTokens: 6000,
    dependencies: [],
    description: 'Assets, images, Core Web Vitals',
  },
  {
    id: 'ui_ux',
    name: 'UI/UX',
    category: 'landing',
    priority: 2,
    credits: 8,
    estimatedTokens: 6000,
    dependencies: ['seo'],
    description: 'Visual hierarchy, colors, responsive',
  },
  {
    id: 'accessibility',
    name: 'Accessibility',
    category: 'landing',
    priority: 2,
    credits: 10,
    estimatedTokens: 8000,
    dependencies: ['ui_ux'],
    description: 'WCAG 2.1 AA compliance',
  },
  {
    id: 'conversion',
    name: 'Conversion',
    category: 'landing',
    priority: 3,
    credits: 8,
    estimatedTokens: 6000,
    dependencies: ['ui_ux'],
    description: 'CTA, trust signals, friction',
  },
  {
    id: 'technical',
    name: 'Technical',
    category: 'landing',
    priority: 1,
    credits: 8,
    estimatedTokens: 6000,
    dependencies: [],
    description: 'Validation, security, links',
  },
];

export function getModules(type: AuditType): AuditModule[] {
  return type === 'code' ? CODE_MODULES : LANDING_MODULES;
}

export function calculateCreditsCost(modules: string[], type: AuditType): number {
  const allModules = getModules(type);
  return modules.reduce((sum, id) => {
    const mod = allModules.find((m) => m.id === id);
    return sum + (mod?.credits || 0);
  }, 0);
}
