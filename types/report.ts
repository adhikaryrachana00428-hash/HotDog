import { z } from 'zod';
import type { Architecture, EngineeringRelationship } from './architecture.js';
import type { LearningRoadmapPhase } from './learning.js';
import type { AdvisorPayload, Recommendation } from './recommendation.js';
import type { Technology } from './technology.js';

/** Wire pipeline progress stage identifiers (0–8). */
export type AnalysisProgressStage = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

/** Progress event emitted during analysis orchestration. */
export interface AnalysisProgress {
  stage: AnalysisProgressStage;
  status: string;
  pct: number;
}

export interface ReportMetrics {
  complexity: number;
  confidence: number;
  learningTime: string;
}

export interface ReportSummary {
  title: string;
  purpose: string;
  audience?: string;
  architecture?: string;
  observations?: string[];
  tags: string[];
  stats: {
    techCount: number;
    dependencyCount: number;
    apiCount: number;
    componentCount: number;
    opportunityCount: number;
    moduleCount: number;
  };
}

export interface ReportHealth {
  docQuality: number;
  archComplexity: number;
  learningDifficulty: number;
  maintainability: number;
  modernTech: number;
  opportunities: number;
}

export interface ConfidenceAssessment {
  recreationDifficulty: string;
  recreationDescription: string;
  missingProprietary: string;
  missingDescription: string;
  implementationEffort: string;
  implementationDescription: string;
}

export interface EngineeringDecision {
  title: string;
  impact: string;
  pros: string[];
  cons: string[];
}

export interface DevTool {
  icon: string;
  name: string;
  command: string;
  desc: string;
}

/**
 * Complete structured report returned by Wire orchestration.
 * This is the single source of truth for all frontend pages.
 */
export interface FinalReport {
  sessionId: string;
  url: string;
  repoName: string;
  primaryLanguage: string;
  langColor: string;
  metrics: ReportMetrics;
  summary: ReportSummary;
  health: ReportHealth;
  blueprint: Architecture;
  technologies: Technology[];
  relationships: EngineeringRelationship[];
  decisions: EngineeringDecision[];
  recommendations: Recommendation[];
  tools: DevTool[];
  roadmap: LearningRoadmapPhase[];
  advisor: AdvisorPayload;
  confidenceAssessment: ConfidenceAssessment;
  timestamp: string;
}

/** Raw output from Anakin before Wire processing. */
export interface ScrapedContext {
  success: boolean;
  url: string;
  scrapedAt: string;
  metadata: {
    repoName: string;
    primaryLanguage: string;
    folderStructure: string[];
    rawReadme: string;
  };
  markdown: string;
  html?: string;
  extractedJson?: Record<string, unknown>;
  githubMeta?: GitHubRepoMeta;
}

export interface GitHubRepoMeta {
  fullName: string;
  description: string;
  language: string;
  topics: string[];
  stars: number;
  defaultBranch: string;
  dependencyFiles: Record<string, string>;
}

/** Normalized content passed from Anakin service into Wire orchestrator. */
export interface NormalizedScrapedContent {
  url: string;
  scrapedAt: string;
  repoName: string;
  primaryLanguage: string;
  readme: string;
  markdown: string;
  folderStructure: string[];
  dependencyFiles: Record<string, string>;
  githubMeta?: GitHubRepoMeta;
  rawPayload: Record<string, unknown>;
}

export const AnalysisProgressSchema = z.object({
  stage: z.number().min(0).max(8),
  status: z.string(),
  pct: z.number().min(0).max(100),
});

export const FinalReportSchema = z.object({
  sessionId: z.string(),
  url: z.string().url(),
  repoName: z.string(),
  primaryLanguage: z.string(),
  langColor: z.string(),
  metrics: z.object({
    complexity: z.number(),
    confidence: z.number(),
    learningTime: z.string(),
  }),
  summary: z.object({
    title: z.string(),
    purpose: z.string(),
    audience: z.string().optional(),
    architecture: z.string().optional(),
    observations: z.array(z.string()).optional(),
    tags: z.array(z.string()),
    stats: z.object({
      techCount: z.number(),
      dependencyCount: z.number(),
      apiCount: z.number(),
      componentCount: z.number(),
      opportunityCount: z.number(),
      moduleCount: z.number(),
    }),
  }),
  health: z.object({
    docQuality: z.number(),
    archComplexity: z.number(),
    learningDifficulty: z.number(),
    maintainability: z.number(),
    modernTech: z.number(),
    opportunities: z.number(),
  }),
  blueprint: z.object({
    layers: z.array(z.object({
      name: z.string(),
      nodes: z.array(z.object({
        icon: z.string(),
        name: z.string(),
        desc: z.string(),
      })),
    })),
    flows: z.array(z.string()),
    communicationSummary: z.string().optional(),
  }),
  technologies: z.array(z.object({
    key: z.string(),
    name: z.string(),
    cat: z.string(),
    catDisplay: z.string(),
    role: z.string(),
    insight: z.string(),
  }).passthrough()),
  relationships: z.array(z.object({
    label: z.string(),
    from: z.string(),
    to: z.string(),
    detail: z.string(),
  })),
  decisions: z.array(z.object({
    title: z.string(),
    impact: z.string(),
    pros: z.array(z.string()),
    cons: z.array(z.string()),
  })),
  recommendations: z.array(z.object({
    title: z.string(),
    type: z.string(),
    body: z.string(),
    effort: z.string(),
    benefit: z.string(),
  })),
  tools: z.array(z.object({
    icon: z.string(),
    name: z.string(),
    command: z.string(),
    desc: z.string(),
  })),
  roadmap: z.array(z.object({
    title: z.string(),
    duration: z.string(),
    dependsOn: z.array(z.string()).optional(),
    items: z.array(z.string()),
  })),
  advisor: z.object({
    health: z.record(z.object({ score: z.number(), desc: z.string() })),
    techRecommendations: z.array(z.object({
      current: z.string(),
      suggested: z.string(),
      why: z.string(),
      benefits: z.array(z.string()),
      tradeoffs: z.array(z.string()),
      difficulty: z.string(),
      whenNot: z.string().optional(),
      confidence: z.number(),
    })),
    hiddenTools: z.array(z.object({
      name: z.string(),
      desc: z.string(),
      why: z.string(),
      cat: z.string(),
      curve: z.string(),
      link: z.string().optional(),
    })),
    opportunities: z.object({
      performance: z.array(z.object({ why: z.string(), impact: z.string(), effort: z.string() })).optional(),
      security: z.array(z.object({ why: z.string(), impact: z.string(), effort: z.string() })).optional(),
      codeQuality: z.array(z.object({ why: z.string(), impact: z.string(), effort: z.string() })).optional(),
    }),
    futureEvolution: z.array(z.object({ title: z.string(), why: z.string() })),
  }),
  confidenceAssessment: z.object({
    recreationDifficulty: z.string(),
    recreationDescription: z.string(),
    missingProprietary: z.string(),
    missingDescription: z.string(),
    implementationEffort: z.string(),
    implementationDescription: z.string(),
  }),
  timestamp: z.string(),
});

type MutableFinalReport = FinalReport & Record<string, unknown>;

function fallbackText(value: unknown, fallback: string): string {
  return typeof value === 'string' && value.trim() ? value : fallback;
}

function normalizeTechnology(technology: Technology, index: number): Technology {
  const key = fallbackText(technology.key || technology.id, `technology-${index + 1}`)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  const cat = fallbackText(technology.cat || technology.category, 'other');
  const catDisplay = fallbackText(technology.catDisplay || technology.displayCategory, cat);
  const role = fallbackText(technology.role, `${technology.name} is used by this project.`);
  const insight = fallbackText(technology.insight || technology.whyProjectUses, `${technology.name} was detected in the analyzed engineering context.`);
  const knowledge = technology.knowledgeCard;

  return {
    ...technology,
    id: technology.id || key,
    key,
    cat,
    category: technology.category || cat,
    catDisplay,
    displayCategory: technology.displayCategory || catDisplay,
    role,
    insight,
    logoText: technology.logoText || technology.name.slice(0, 2).toUpperCase(),
    logoClass: technology.logoClass || 'tc-logo--dark',
    whatItIs: fallbackText(technology.whatItIs || knowledge?.whatItIs, role),
    whyExists: fallbackText(technology.whyExists || knowledge?.whyExists, `${technology.name} exists to solve a specific engineering need in its ecosystem.`),
    whyProjectUses: fallbackText(technology.whyProjectUses || knowledge?.whyProjectUses || technology.insight, insight),
    advantages: technology.advantages?.length ? technology.advantages : knowledge?.advantages || ['Improves implementation clarity'],
    limitations: technology.limitations?.length ? technology.limitations : knowledge?.limitations || ['Requires correct configuration and team familiarity'],
    alternatives: technology.alternatives?.length ? technology.alternatives : knowledge?.alternatives || ['Evaluate equivalent ecosystem tools'],
    analogy: fallbackText(technology.analogy || knowledge?.analogy, `${technology.name} is a specialized tool in the project workflow.`),
    learnNext: technology.learnNext?.length ? technology.learnNext : knowledge?.learnNext || [`Study ${technology.name} fundamentals`],
  };
}

export function normalizeFinalReport(report: FinalReport): FinalReport {
  const normalized = report as MutableFinalReport;

  normalized.technologies = (report.technologies || []).map(normalizeTechnology);
  normalized.blueprint = {
    ...report.blueprint,
    layers: (report.blueprint.layers || []).map(layer => ({
      ...layer,
      nodes: (layer.nodes || []).map((node, index) => ({
        ...node,
        id: node.id || `${layer.name}-${index}`.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        icon: node.icon || '⚙️',
        desc: fallbackText(node.desc || node.description, `${node.name} participates in the ${layer.name}.`),
        description: fallbackText(node.description || node.desc, `${node.name} participates in the ${layer.name}.`),
      })),
    })),
    flows: report.blueprint.flows || [],
  };

  normalized.relationships = (report.relationships || []).map((relationship, index) => ({
    ...relationship,
    id: relationship.id || `relationship-${index + 1}`,
    label: fallbackText(relationship.label, 'Communicates with'),
    from: fallbackText(relationship.from || relationship.sourceId, 'Source'),
    to: fallbackText(relationship.to || relationship.targetId, 'Target'),
    detail: fallbackText(relationship.detail || relationship.description, 'These parts exchange data or control flow in the analyzed system.'),
  }));

  normalized.recommendations = (report.recommendations || []).map((recommendation, index) => ({
    ...recommendation,
    id: recommendation.id || `recommendation-${index + 1}`,
    type: fallbackText(recommendation.type || recommendation.category, 'recommendation'),
    body: fallbackText(recommendation.body || recommendation.summary || recommendation.rationale, 'Review this recommendation before production use.'),
    benefit: fallbackText(recommendation.benefit || recommendation.impact, 'Improves project quality.'),
    effort: fallbackText(recommendation.effort, 'Medium'),
  }));

  normalized.tools = (report.tools || []).map(tool => ({
    ...tool,
    icon: tool.icon || '🛠️',
    desc: fallbackText(tool.desc, `${tool.name} helps with engineering workflow.`),
    command: fallbackText(tool.command, 'See tool documentation'),
  }));

  normalized.roadmap = (report.roadmap || []).map(phase => ({
    ...phase,
    duration: fallbackText(phase.duration, 'TBD'),
    dependsOn: phase.dependsOn || [],
    items: phase.items || [],
  }));

  normalized.summary = {
    ...report.summary,
    tags: report.summary.tags || [],
    stats: {
      ...report.summary.stats,
      techCount: normalized.technologies.length,
      opportunityCount: normalized.recommendations.length,
      moduleCount: normalized.roadmap.length,
    },
  };

  return normalized as FinalReport;
}

export function validateFinalReport(report: FinalReport): FinalReport {
  const normalized = normalizeFinalReport(report);
  const result = FinalReportSchema.safeParse(normalized);
  if (!result.success) {
    const issues = result.error.issues.map(issue => `${issue.path.join('.')}: ${issue.message}`).join('; ');
    throw new Error(`EngineeringReport schema validation failed: ${issues}`);
  }
  return result.data as unknown as FinalReport;
}
