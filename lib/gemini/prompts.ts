import { AuditType } from '@/types';

export interface PromptVariables {
  SOURCE_PATH: string;
  OUTPUT_PATH: string;
  DATE: string;
  SOURCE_CONTENT: string;
}

const BASE_OUTPUT = `Return JSON with: audit, date, source_path, overall_score (0-100), summary(total_issues, critical, high, medium, low), scores, issues, recommendations(immediate, short_term, long_term).`;

export const CODE_PROMPTS: Record<string, string> = {
  code_quality: `Audit code quality. ${BASE_OUTPUT}`,
  security: `Audit security risks. ${BASE_OUTPUT}`,
  deployment: `Audit deployment readiness. ${BASE_OUTPUT}`,
  architecture: `Audit architecture quality. ${BASE_OUTPUT}`,
  ux_frontend: `Audit UX/frontend quality. ${BASE_OUTPUT}`,
  monetization: `Audit payment and monetization implementation. ${BASE_OUTPUT}`,
  ai_integration: `Audit AI integration and safety. ${BASE_OUTPUT}`,
};

export const LANDING_PROMPTS: Record<string, string> = {
  seo: `Audit SEO quality. ${BASE_OUTPUT}`,
  performance: `Audit performance quality. ${BASE_OUTPUT}`,
  ui_ux: `Audit UI/UX quality. ${BASE_OUTPUT}`,
  accessibility: `Audit accessibility quality. ${BASE_OUTPUT}`,
  conversion: `Audit conversion quality. ${BASE_OUTPUT}`,
  technical: `Audit technical quality. ${BASE_OUTPUT}`,
};

export function getPrompt(moduleId: string, type: AuditType): string | null {
  const prompts = type === 'code' ? CODE_PROMPTS : LANDING_PROMPTS;
  return prompts[moduleId] || null;
}

export function fillPromptVariables(prompt: string, variables: PromptVariables): string {
  return `${prompt}\n\nSource: ${variables.SOURCE_PATH}\nDate: ${variables.DATE}\n\nFiles:\n${variables.SOURCE_CONTENT}`;
}
