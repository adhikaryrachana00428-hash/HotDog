/**
 * Shared JSON contract for engineering intelligence data consumed by the frontend and backend.
 * This schema is designed to be the single source of truth for dashboard, report, advisor,
 * knowledge-card, and architecture experiences.
 */
/**
 * Categories used to group technologies in the UI and analysis output.
 */
export type TechnologyCategory = 'frontend' | 'backend' | 'database' | 'auth' | 'deployment' | 'devtools' | 'language' | 'other';
/**
 * High-level project intelligence payload that can be rendered by any frontend page.
 */
export interface Project {
    /** Stable identifier for the analyzed repository. */
    id?: string;
    /** Human-readable repository name. */
    name: string;
    /** Canonical repository URL. */
    repositoryUrl?: string;
    /** Primary implementation language. */
    primaryLanguage?: string;
    /** Optional short description of the repository. */
    description?: string;
    /** Concise summary of the engineering assessment. */
    summary?: string;
    /** Tags used for filtering and grouping. */
    tags?: string[];
    /** Quality and complexity measurements for the project. */
    metrics?: ProjectMetrics;
    /** High-level maintainability and maturity indicators. */
    health?: ProjectHealth;
    /** Reconstructed architecture blueprint. */
    architecture?: Architecture;
    /** Detected technologies and their rich knowledge cards. */
    technologies?: Technology[];
    /** Relationships between components, services, or technologies. */
    relationships?: Relationship[];
    /** Prioritized engineering recommendations. */
    recommendations?: Recommendation[];
    /** Developer tools surfaced by the analysis. */
    hiddenTools?: HiddenTool[];
    /** Ordered learning roadmap for the repository. */
    roadmap?: LearningNode[];
    /** Confidence and reproducibility assessment. */
    confidence?: ConfidenceReport;
    /** Additional project metadata for UI rendering and integrations. */
    metadata?: ProjectMetadata;
}
/**
 * Numerical metrics for the overall project assessment.
 */
export interface ProjectMetrics {
    /** Estimated complexity of the repository. */
    complexity: number;
    /** Confidence in the generated intelligence. */
    confidence: number;
    /** Expected learning time for the repository. */
    learningTime: string;
}
/**
 * High-level health signals that summarize the engineering maturity of the project.
 */
export interface ProjectHealth {
    /** Quality of the repository documentation. */
    documentationQuality: number;
    /** Perceived architectural complexity. */
    architectureComplexity: number;
    /** Learning difficulty for a new engineer. */
    learningDifficulty: number;
    /** Maintainability of the codebase. */
    maintainability: number;
    /** Modernity of the technology stack. */
    modernTech: number;
    /** Number of notable improvement opportunities. */
    opportunities: number;
}
/**
 * Additional metadata used by the UI and analytics integrations.
 */
export interface ProjectMetadata {
    /** Timestamp of the most recent analysis run. */
    lastAnalyzedAt: string;
    /** Source of the analysis payload. */
    source?: 'wire' | 'heuristic' | 'manual' | 'scraper';
    /** Optional session identifier for debugging and traceability. */
    sessionId?: string;
    /** Extension point for future metadata fields. */
    [key: string]: unknown;
}
/**
 * A detected technology in the repository and its supporting documentation.
 */
export interface Technology {
    /** Stable identifier used for UI lookups and references. */
    id?: string;
    /** Display name of the technology. */
    name: string;
    /** Semantic category used for grouping and filtering. */
    category?: TechnologyCategory | string;
    /** User-facing category label rendered by the UI. */
    displayCategory?: string;
    /** Short role of the technology in the system. */
    role?: string;
    /** One-line rationale for why it matters in the project. */
    insight?: string;
    /** Optional icon text shown in compact cards. */
    logoText?: string;
    /** Optional CSS class used by the UI for branding. */
    logoClass?: string;
    /** Rich knowledge card for deeper explainability. */
    knowledgeCard?: KnowledgeCard;
    /** Compatibility alias for the older pipeline shape. */
    key?: string;
    /** Compatibility alias for the older pipeline shape. */
    cat?: TechnologyCategory | string;
    /** Compatibility alias for the older pipeline shape. */
    catDisplay?: string;
    /** Compatibility alias for the older pipeline shape. */
    whatItIs?: string;
    /** Compatibility alias for the older pipeline shape. */
    whyExists?: string;
    /** Compatibility alias for the older pipeline shape. */
    whyProjectUses?: string;
    /** Compatibility alias for the older pipeline shape. */
    advantages?: string[];
    /** Compatibility alias for the older pipeline shape. */
    limitations?: string[];
    /** Compatibility alias for the older pipeline shape. */
    alternatives?: string[];
    /** Compatibility alias for the older pipeline shape. */
    analogy?: string;
    /** Compatibility alias for the older pipeline shape. */
    learnNext?: string[];
}
/**
 * Rich knowledge content used by the knowledge-card experience.
 */
export interface KnowledgeCard {
    /** Identifier of the related technology. */
    technologyId: string;
    /** Human-friendly technology title. */
    title: string;
    /** What the technology is. */
    whatItIs: string;
    /** Why the technology exists. */
    whyExists: string;
    /** Why the current project uses it. */
    whyProjectUses: string;
    /** Benefits that make it valuable. */
    advantages: string[];
    /** Known constraints or trade-offs. */
    limitations: string[];
    /** Common alternatives worth considering. */
    alternatives: string[];
    /** Mental model analogy for onboarding. */
    analogy: string;
    /** Suggested next learning steps. */
    learnNext: string[];
    /** Compatibility alias for the older UI shape. */
    key?: string;
    /** Compatibility alias for the older UI shape. */
    name?: string;
    /** Compatibility alias for the older UI shape. */
    category?: string;
    /** Compatibility alias for the older UI shape. */
    logoText?: string;
    /** Compatibility alias for the older UI shape. */
    logoClass?: string;
}
/**
 * A relationship between two components, services, or technologies.
 */
export interface Relationship {
    /** Stable identifier for the relationship. */
    id?: string;
    /** Source component or technology identifier. */
    sourceId?: string;
    /** Target component or technology identifier. */
    targetId?: string;
    /** Label shown in the UI. */
    label?: string;
    /** Description of the interaction or dependency. */
    description?: string;
    /** Compatibility alias for the older graph shape. */
    from?: string;
    /** Compatibility alias for the older graph shape. */
    to?: string;
    /** Compatibility alias for the older graph shape. */
    detail?: string;
}
/**
 * Compatibility type for the existing architecture relationship shape.
 */
export interface EngineeringRelationship extends Relationship {
}
/**
 * Reconstructed architecture blueprint for the project.
 */
export interface Architecture {
    /** Nodes in the blueprint diagram. */
    nodes?: ArchitectureNode[];
    /** Directed connections between blueprint nodes. */
    edges?: ArchitectureEdge[];
    /** Narrative summary of the architecture. */
    summary?: string;
    /** Optional communication-oriented summary. */
    communicationSummary?: string;
    /** Compatibility alias for older report consumers. */
    layers?: ArchitectureLayer[];
    /** Compatibility alias for older report consumers. */
    flows?: string[];
}
/**
 * A logical layer in the architecture blueprint such as client, application, or data.
 */
export interface ArchitectureLayer {
    /** Layer name shown to users. */
    name: string;
    /** Nodes contained in this layer. */
    nodes: ArchitectureNode[];
}
/**
 * A single node in the architecture blueprint.
 */
export interface ArchitectureNode {
    /** Unique node identifier. */
    id?: string;
    /** Human-readable node label. */
    name: string;
    /** Type of node such as service, client, database, or queue. */
    kind?: string;
    /** Brief description of the node. */
    description?: string;
    /** Optional icon string for UI rendering. */
    icon?: string;
    /** Optional related technology identifier. */
    technologyId?: string;
    /** Compatibility alias for the older blueprint shape. */
    desc?: string;
}
/**
 * A directed edge between architecture nodes.
 */
export interface ArchitectureEdge {
    /** Unique edge identifier. */
    id: string;
    /** Source node identifier. */
    sourceId: string;
    /** Target node identifier. */
    targetId: string;
    /** Label for the flow. */
    label: string;
    /** Human-readable explanation of the flow. */
    description: string;
    /** Relative strength of the dependency. */
    strength?: 'low' | 'medium' | 'high' | string;
}
/**
 * A prioritized recommendation for engineering improvements.
 */
export interface Recommendation {
    /** Stable identifier for the recommendation. */
    id?: string;
    /** Title of the recommendation. */
    title: string;
    /** Semantic category for the recommendation. */
    category?: 'upgrade' | 'additive' | 'security' | 'performance' | string;
    /** Short summary of the proposed action. */
    summary?: string;
    /** Why the recommendation should be pursued. */
    rationale?: string;
    /** Relative implementation effort. */
    effort?: string;
    /** Expected impact if the recommendation is implemented. */
    impact?: string;
    /** Priority level for ordering and display. */
    priority?: 'low' | 'medium' | 'high' | string;
    /** Optional related technology identifiers. */
    relatedTechnologyIds?: string[];
    /** Optional related hidden tool identifiers. */
    relatedHiddenToolIds?: string[];
    /** Compatibility alias for the older pipeline shape. */
    type?: 'upgrade' | 'additive' | 'security' | 'performance' | string;
    /** Compatibility alias for the older pipeline shape. */
    body?: string;
    /** Compatibility alias for the older pipeline shape. */
    benefit?: string;
}
/**
 * A developer tool surfaced by the advisor or analysis workflow.
 */
export interface HiddenTool {
    /** Stable identifier for the tool. */
    id?: string;
    /** Tool name. */
    name: string;
    /** Short description of what the tool does. */
    description?: string;
    /** Why the tool is useful for the project. */
    whyUseful?: string;
    /** Category of the tool. */
    category?: string;
    /** Expected learning curve for adoption. */
    learningCurve?: string;
    /** Optional link to docs or installation guidance. */
    link?: string;
    /** Compatibility alias for the older pipeline shape. */
    desc?: string;
    /** Compatibility alias for the older pipeline shape. */
    why?: string;
    /** Compatibility alias for the older pipeline shape. */
    cat?: string;
    /** Compatibility alias for the older pipeline shape. */
    curve?: string;
}
/**
 * A single milestone or learning checkpoint in the roadmap.
 */
export interface LearningNode {
    /** Stable identifier for the learning node. */
    id?: string;
    /** Title of the milestone or phase. */
    title: string;
    /** Summary of the milestone. */
    summary?: string;
    /** Estimated duration for the milestone. */
    duration?: string;
    /** Identifiers of prerequisites for this milestone. */
    dependsOn?: string[];
    /** Concrete learning items in the milestone. */
    items?: string[];
    /** Compatibility alias for the older roadmap shape. */
    description?: string;
}
/**
 * Confidence and reproducibility assessment for the generated report.
 */
export interface ConfidenceReport {
    /** Overall confidence score from 0 to 100. */
    overallScore?: number;
    /** Human-readable confidence level. */
    confidenceLevel?: 'low' | 'medium' | 'high' | string;
    /** Summary of the confidence assessment. */
    summary?: string;
    /** How difficult the project is to reproduce. */
    reproductionDifficulty?: string;
    /** Description of the reproduction challenge. */
    reproductionDescription?: string;
    /** Whether proprietary information is missing. */
    missingProprietary?: string;
    /** Description of the missing context. */
    missingDescription?: string;
    /** Estimated implementation effort. */
    implementationEffort?: string;
    /** Description of the implementation effort. */
    implementationDescription?: string;
    /** Observable signals supporting the confidence rating. */
    signals?: string[];
    /** Known risks that limit confidence. */
    risks?: string[];
    /** Compatibility alias for the older report shape. */
    recreationDifficulty?: string;
    /** Compatibility alias for the older report shape. */
    recreationDescription?: string;
}
/**
 * Final engineering report model delivered to the UI layer.
 */
export interface TechUpgradeRecommendation {
    /** Current technology in use. */
    current: string;
    /** Suggested replacement or enhancement. */
    suggested: string;
    /** Why the change is valuable. */
    why: string;
    /** Expected benefits. */
    benefits: string[];
    /** Trade-offs to evaluate. */
    tradeoffs: string[];
    /** Relative implementation difficulty. */
    difficulty: string;
    /** Optional guidance when the recommendation should not be used. */
    whenNot?: string;
    /** Estimated confidence of the recommendation. */
    confidence: number;
}
/** An opportunity item for the advisory section. */
export interface OpportunityItem {
    /** Why this opportunity matters. */
    why: string;
    /** Expected impact. */
    impact: string;
    /** Estimated effort. */
    effort: string;
}
/** Advisor payload used by the report and dashboard experience. */
export interface AdvisorPayload {
    /** Summary signals for the advisor health section. */
    health: Record<string, {
        score: number;
        desc: string;
    }>;
    /** Suggested technology upgrades. */
    techRecommendations: TechUpgradeRecommendation[];
    /** Developer tools surfaced by the advisor. */
    hiddenTools: HiddenTool[];
    /** Opportunity buckets for future work. */
    opportunities: {
        performance?: OpportunityItem[];
        security?: OpportunityItem[];
        codeQuality?: OpportunityItem[];
    };
    /** Future evolution suggestions. */
    futureEvolution: Array<{
        title: string;
        why: string;
    }>;
}
/** A milestone in the learning roadmap. */
export interface LearningRoadmapPhase {
    /** Phase title. */
    title: string;
    /** Estimated duration for the phase. */
    duration: string;
    /** Prerequisites for the phase. */
    dependsOn?: string[];
    /** Learning items inside the phase. */
    items: string[];
}
/** Final engineering report model delivered to the UI layer. */
export interface EngineeringReport extends Project {
    /** Unique analysis session identifier. */
    sessionId?: string;
    /** Timestamp when the report was generated. */
    generatedAt?: string;
    /** Version of the shared report schema. */
    schemaVersion?: string;
    /** Source of the analysis payload. */
    source?: 'wire' | 'heuristic' | 'manual' | 'scraper';
}
//# sourceMappingURL=schema.d.ts.map