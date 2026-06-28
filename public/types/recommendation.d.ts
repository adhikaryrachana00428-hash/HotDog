import type { HiddenTool } from './schema.js';
export type { Recommendation, HiddenTool } from './schema.js';
/** Suggested technology migration with reasoning. */
export interface TechUpgradeRecommendation {
    current: string;
    suggested: string;
    why: string;
    benefits: string[];
    tradeoffs: string[];
    difficulty: string;
    whenNot?: string;
    confidence: number;
}
export interface OpportunityItem {
    why: string;
    impact: string;
    effort: string;
}
/** Full advisor subtree from Wire Engineering Advisor Agent. */
export interface AdvisorPayload {
    health: Record<string, {
        score: number;
        desc: string;
    }>;
    techRecommendations: TechUpgradeRecommendation[];
    hiddenTools: HiddenTool[];
    opportunities: {
        performance?: OpportunityItem[];
        security?: OpportunityItem[];
        codeQuality?: OpportunityItem[];
    };
    futureEvolution: Array<{
        title: string;
        why: string;
    }>;
}
//# sourceMappingURL=recommendation.d.ts.map