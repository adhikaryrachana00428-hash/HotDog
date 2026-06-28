import type { AdvisorPayload, Recommendation } from '../../types/recommendation.js';
import type { Architecture, EngineeringRelationship } from '../../types/architecture.js';
import type { LearningRoadmapPhase } from '../../types/learning.js';
import type { ConfidenceAssessment, FinalReport, NormalizedScrapedContent, ReportMetrics } from '../../types/report.js';
import type { Technology } from '../../types/technology.js';
export interface AgentContext {
    scraped: NormalizedScrapedContent;
    sessionId: string;
    planner?: PlannerAgentOutput;
    technologyDiscovery?: TechnologyAgentOutput;
    architecture?: ArchitectureAgentOutput;
    knowledge?: KnowledgeAgentOutput;
    relationships?: RelationshipAgentOutput;
    advisor?: AdvisorAgentOutput;
    roadmap?: RoadmapAgentOutput;
    confidence?: ConfidenceAgentOutput;
    report?: ReportAgentOutput;
}
export interface PlannerAgentOutput {
    projectType: string;
    analysisPlan: string[];
    priority: string[];
    missingContext: string[];
}
export interface TechnologyAgentOutput {
    technologies: Technology[];
    detectedDependencies: string[];
}
export interface ArchitectureAgentOutput {
    architecture: Architecture;
    componentRelationships: Array<{
        name: string;
        role: string;
    }>;
}
export interface KnowledgeAgentOutput {
    technologies: Technology[];
}
export interface RelationshipAgentOutput {
    relationships: EngineeringRelationship[];
}
export interface AdvisorAgentOutput {
    advisor: AdvisorPayload;
    recommendations: Recommendation[];
    tools: Array<{
        icon: string;
        name: string;
        command: string;
        desc: string;
    }>;
}
export interface RoadmapAgentOutput {
    roadmap: LearningRoadmapPhase[];
}
export interface ConfidenceAgentOutput {
    confidenceAssessment: ConfidenceAssessment;
    metrics: ReportMetrics;
}
export interface ReportAgentOutput {
    report: FinalReport;
}
//# sourceMappingURL=types.d.ts.map