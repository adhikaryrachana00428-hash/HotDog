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
export declare const AnalysisProgressSchema: z.ZodObject<{
    stage: z.ZodNumber;
    status: z.ZodString;
    pct: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    stage: number;
    status: string;
    pct: number;
}, {
    stage: number;
    status: string;
    pct: number;
}>;
export declare const FinalReportSchema: z.ZodObject<{
    sessionId: z.ZodString;
    url: z.ZodString;
    repoName: z.ZodString;
    primaryLanguage: z.ZodString;
    langColor: z.ZodString;
    metrics: z.ZodObject<{
        complexity: z.ZodNumber;
        confidence: z.ZodNumber;
        learningTime: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        complexity: number;
        confidence: number;
        learningTime: string;
    }, {
        complexity: number;
        confidence: number;
        learningTime: string;
    }>;
    summary: z.ZodObject<{
        title: z.ZodString;
        purpose: z.ZodString;
        audience: z.ZodOptional<z.ZodString>;
        architecture: z.ZodOptional<z.ZodString>;
        observations: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        tags: z.ZodArray<z.ZodString, "many">;
        stats: z.ZodObject<{
            techCount: z.ZodNumber;
            dependencyCount: z.ZodNumber;
            apiCount: z.ZodNumber;
            componentCount: z.ZodNumber;
            opportunityCount: z.ZodNumber;
            moduleCount: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            techCount: number;
            dependencyCount: number;
            apiCount: number;
            componentCount: number;
            opportunityCount: number;
            moduleCount: number;
        }, {
            techCount: number;
            dependencyCount: number;
            apiCount: number;
            componentCount: number;
            opportunityCount: number;
            moduleCount: number;
        }>;
    }, "strip", z.ZodTypeAny, {
        title: string;
        purpose: string;
        tags: string[];
        stats: {
            techCount: number;
            dependencyCount: number;
            apiCount: number;
            componentCount: number;
            opportunityCount: number;
            moduleCount: number;
        };
        audience?: string | undefined;
        architecture?: string | undefined;
        observations?: string[] | undefined;
    }, {
        title: string;
        purpose: string;
        tags: string[];
        stats: {
            techCount: number;
            dependencyCount: number;
            apiCount: number;
            componentCount: number;
            opportunityCount: number;
            moduleCount: number;
        };
        audience?: string | undefined;
        architecture?: string | undefined;
        observations?: string[] | undefined;
    }>;
    health: z.ZodObject<{
        docQuality: z.ZodNumber;
        archComplexity: z.ZodNumber;
        learningDifficulty: z.ZodNumber;
        maintainability: z.ZodNumber;
        modernTech: z.ZodNumber;
        opportunities: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        docQuality: number;
        archComplexity: number;
        learningDifficulty: number;
        maintainability: number;
        modernTech: number;
        opportunities: number;
    }, {
        docQuality: number;
        archComplexity: number;
        learningDifficulty: number;
        maintainability: number;
        modernTech: number;
        opportunities: number;
    }>;
    blueprint: z.ZodObject<{
        layers: z.ZodArray<z.ZodObject<{
            name: z.ZodString;
            nodes: z.ZodArray<z.ZodObject<{
                icon: z.ZodString;
                name: z.ZodString;
                desc: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                name: string;
                icon: string;
                desc: string;
            }, {
                name: string;
                icon: string;
                desc: string;
            }>, "many">;
        }, "strip", z.ZodTypeAny, {
            name: string;
            nodes: {
                name: string;
                icon: string;
                desc: string;
            }[];
        }, {
            name: string;
            nodes: {
                name: string;
                icon: string;
                desc: string;
            }[];
        }>, "many">;
        flows: z.ZodArray<z.ZodString, "many">;
        communicationSummary: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        layers: {
            name: string;
            nodes: {
                name: string;
                icon: string;
                desc: string;
            }[];
        }[];
        flows: string[];
        communicationSummary?: string | undefined;
    }, {
        layers: {
            name: string;
            nodes: {
                name: string;
                icon: string;
                desc: string;
            }[];
        }[];
        flows: string[];
        communicationSummary?: string | undefined;
    }>;
    technologies: z.ZodArray<z.ZodObject<{
        key: z.ZodString;
        name: z.ZodString;
        cat: z.ZodString;
        catDisplay: z.ZodString;
        role: z.ZodString;
        insight: z.ZodString;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        key: z.ZodString;
        name: z.ZodString;
        cat: z.ZodString;
        catDisplay: z.ZodString;
        role: z.ZodString;
        insight: z.ZodString;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        key: z.ZodString;
        name: z.ZodString;
        cat: z.ZodString;
        catDisplay: z.ZodString;
        role: z.ZodString;
        insight: z.ZodString;
    }, z.ZodTypeAny, "passthrough">>, "many">;
    relationships: z.ZodArray<z.ZodObject<{
        label: z.ZodString;
        from: z.ZodString;
        to: z.ZodString;
        detail: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        label: string;
        from: string;
        to: string;
        detail: string;
    }, {
        label: string;
        from: string;
        to: string;
        detail: string;
    }>, "many">;
    decisions: z.ZodArray<z.ZodObject<{
        title: z.ZodString;
        impact: z.ZodString;
        pros: z.ZodArray<z.ZodString, "many">;
        cons: z.ZodArray<z.ZodString, "many">;
    }, "strip", z.ZodTypeAny, {
        title: string;
        impact: string;
        pros: string[];
        cons: string[];
    }, {
        title: string;
        impact: string;
        pros: string[];
        cons: string[];
    }>, "many">;
    recommendations: z.ZodArray<z.ZodObject<{
        title: z.ZodString;
        type: z.ZodString;
        body: z.ZodString;
        effort: z.ZodString;
        benefit: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        type: string;
        title: string;
        body: string;
        effort: string;
        benefit: string;
    }, {
        type: string;
        title: string;
        body: string;
        effort: string;
        benefit: string;
    }>, "many">;
    tools: z.ZodArray<z.ZodObject<{
        icon: z.ZodString;
        name: z.ZodString;
        command: z.ZodString;
        desc: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        name: string;
        icon: string;
        desc: string;
        command: string;
    }, {
        name: string;
        icon: string;
        desc: string;
        command: string;
    }>, "many">;
    roadmap: z.ZodArray<z.ZodObject<{
        title: z.ZodString;
        duration: z.ZodString;
        dependsOn: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        items: z.ZodArray<z.ZodString, "many">;
    }, "strip", z.ZodTypeAny, {
        title: string;
        duration: string;
        items: string[];
        dependsOn?: string[] | undefined;
    }, {
        title: string;
        duration: string;
        items: string[];
        dependsOn?: string[] | undefined;
    }>, "many">;
    advisor: z.ZodObject<{
        health: z.ZodRecord<z.ZodString, z.ZodObject<{
            score: z.ZodNumber;
            desc: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            desc: string;
            score: number;
        }, {
            desc: string;
            score: number;
        }>>;
        techRecommendations: z.ZodArray<z.ZodObject<{
            current: z.ZodString;
            suggested: z.ZodString;
            why: z.ZodString;
            benefits: z.ZodArray<z.ZodString, "many">;
            tradeoffs: z.ZodArray<z.ZodString, "many">;
            difficulty: z.ZodString;
            whenNot: z.ZodOptional<z.ZodString>;
            confidence: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            confidence: number;
            current: string;
            suggested: string;
            why: string;
            benefits: string[];
            tradeoffs: string[];
            difficulty: string;
            whenNot?: string | undefined;
        }, {
            confidence: number;
            current: string;
            suggested: string;
            why: string;
            benefits: string[];
            tradeoffs: string[];
            difficulty: string;
            whenNot?: string | undefined;
        }>, "many">;
        hiddenTools: z.ZodArray<z.ZodObject<{
            name: z.ZodString;
            desc: z.ZodString;
            why: z.ZodString;
            cat: z.ZodString;
            curve: z.ZodString;
            link: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            name: string;
            desc: string;
            cat: string;
            why: string;
            curve: string;
            link?: string | undefined;
        }, {
            name: string;
            desc: string;
            cat: string;
            why: string;
            curve: string;
            link?: string | undefined;
        }>, "many">;
        opportunities: z.ZodObject<{
            performance: z.ZodOptional<z.ZodArray<z.ZodObject<{
                why: z.ZodString;
                impact: z.ZodString;
                effort: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                impact: string;
                effort: string;
                why: string;
            }, {
                impact: string;
                effort: string;
                why: string;
            }>, "many">>;
            security: z.ZodOptional<z.ZodArray<z.ZodObject<{
                why: z.ZodString;
                impact: z.ZodString;
                effort: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                impact: string;
                effort: string;
                why: string;
            }, {
                impact: string;
                effort: string;
                why: string;
            }>, "many">>;
            codeQuality: z.ZodOptional<z.ZodArray<z.ZodObject<{
                why: z.ZodString;
                impact: z.ZodString;
                effort: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                impact: string;
                effort: string;
                why: string;
            }, {
                impact: string;
                effort: string;
                why: string;
            }>, "many">>;
        }, "strip", z.ZodTypeAny, {
            security?: {
                impact: string;
                effort: string;
                why: string;
            }[] | undefined;
            performance?: {
                impact: string;
                effort: string;
                why: string;
            }[] | undefined;
            codeQuality?: {
                impact: string;
                effort: string;
                why: string;
            }[] | undefined;
        }, {
            security?: {
                impact: string;
                effort: string;
                why: string;
            }[] | undefined;
            performance?: {
                impact: string;
                effort: string;
                why: string;
            }[] | undefined;
            codeQuality?: {
                impact: string;
                effort: string;
                why: string;
            }[] | undefined;
        }>;
        futureEvolution: z.ZodArray<z.ZodObject<{
            title: z.ZodString;
            why: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            title: string;
            why: string;
        }, {
            title: string;
            why: string;
        }>, "many">;
    }, "strip", z.ZodTypeAny, {
        health: Record<string, {
            desc: string;
            score: number;
        }>;
        opportunities: {
            security?: {
                impact: string;
                effort: string;
                why: string;
            }[] | undefined;
            performance?: {
                impact: string;
                effort: string;
                why: string;
            }[] | undefined;
            codeQuality?: {
                impact: string;
                effort: string;
                why: string;
            }[] | undefined;
        };
        techRecommendations: {
            confidence: number;
            current: string;
            suggested: string;
            why: string;
            benefits: string[];
            tradeoffs: string[];
            difficulty: string;
            whenNot?: string | undefined;
        }[];
        hiddenTools: {
            name: string;
            desc: string;
            cat: string;
            why: string;
            curve: string;
            link?: string | undefined;
        }[];
        futureEvolution: {
            title: string;
            why: string;
        }[];
    }, {
        health: Record<string, {
            desc: string;
            score: number;
        }>;
        opportunities: {
            security?: {
                impact: string;
                effort: string;
                why: string;
            }[] | undefined;
            performance?: {
                impact: string;
                effort: string;
                why: string;
            }[] | undefined;
            codeQuality?: {
                impact: string;
                effort: string;
                why: string;
            }[] | undefined;
        };
        techRecommendations: {
            confidence: number;
            current: string;
            suggested: string;
            why: string;
            benefits: string[];
            tradeoffs: string[];
            difficulty: string;
            whenNot?: string | undefined;
        }[];
        hiddenTools: {
            name: string;
            desc: string;
            cat: string;
            why: string;
            curve: string;
            link?: string | undefined;
        }[];
        futureEvolution: {
            title: string;
            why: string;
        }[];
    }>;
    confidenceAssessment: z.ZodObject<{
        recreationDifficulty: z.ZodString;
        recreationDescription: z.ZodString;
        missingProprietary: z.ZodString;
        missingDescription: z.ZodString;
        implementationEffort: z.ZodString;
        implementationDescription: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        recreationDifficulty: string;
        recreationDescription: string;
        missingProprietary: string;
        missingDescription: string;
        implementationEffort: string;
        implementationDescription: string;
    }, {
        recreationDifficulty: string;
        recreationDescription: string;
        missingProprietary: string;
        missingDescription: string;
        implementationEffort: string;
        implementationDescription: string;
    }>;
    timestamp: z.ZodString;
}, "strip", z.ZodTypeAny, {
    sessionId: string;
    url: string;
    repoName: string;
    primaryLanguage: string;
    langColor: string;
    metrics: {
        complexity: number;
        confidence: number;
        learningTime: string;
    };
    summary: {
        title: string;
        purpose: string;
        tags: string[];
        stats: {
            techCount: number;
            dependencyCount: number;
            apiCount: number;
            componentCount: number;
            opportunityCount: number;
            moduleCount: number;
        };
        audience?: string | undefined;
        architecture?: string | undefined;
        observations?: string[] | undefined;
    };
    health: {
        docQuality: number;
        archComplexity: number;
        learningDifficulty: number;
        maintainability: number;
        modernTech: number;
        opportunities: number;
    };
    blueprint: {
        layers: {
            name: string;
            nodes: {
                name: string;
                icon: string;
                desc: string;
            }[];
        }[];
        flows: string[];
        communicationSummary?: string | undefined;
    };
    technologies: z.objectOutputType<{
        key: z.ZodString;
        name: z.ZodString;
        cat: z.ZodString;
        catDisplay: z.ZodString;
        role: z.ZodString;
        insight: z.ZodString;
    }, z.ZodTypeAny, "passthrough">[];
    relationships: {
        label: string;
        from: string;
        to: string;
        detail: string;
    }[];
    decisions: {
        title: string;
        impact: string;
        pros: string[];
        cons: string[];
    }[];
    recommendations: {
        type: string;
        title: string;
        body: string;
        effort: string;
        benefit: string;
    }[];
    tools: {
        name: string;
        icon: string;
        desc: string;
        command: string;
    }[];
    roadmap: {
        title: string;
        duration: string;
        items: string[];
        dependsOn?: string[] | undefined;
    }[];
    advisor: {
        health: Record<string, {
            desc: string;
            score: number;
        }>;
        opportunities: {
            security?: {
                impact: string;
                effort: string;
                why: string;
            }[] | undefined;
            performance?: {
                impact: string;
                effort: string;
                why: string;
            }[] | undefined;
            codeQuality?: {
                impact: string;
                effort: string;
                why: string;
            }[] | undefined;
        };
        techRecommendations: {
            confidence: number;
            current: string;
            suggested: string;
            why: string;
            benefits: string[];
            tradeoffs: string[];
            difficulty: string;
            whenNot?: string | undefined;
        }[];
        hiddenTools: {
            name: string;
            desc: string;
            cat: string;
            why: string;
            curve: string;
            link?: string | undefined;
        }[];
        futureEvolution: {
            title: string;
            why: string;
        }[];
    };
    confidenceAssessment: {
        recreationDifficulty: string;
        recreationDescription: string;
        missingProprietary: string;
        missingDescription: string;
        implementationEffort: string;
        implementationDescription: string;
    };
    timestamp: string;
}, {
    sessionId: string;
    url: string;
    repoName: string;
    primaryLanguage: string;
    langColor: string;
    metrics: {
        complexity: number;
        confidence: number;
        learningTime: string;
    };
    summary: {
        title: string;
        purpose: string;
        tags: string[];
        stats: {
            techCount: number;
            dependencyCount: number;
            apiCount: number;
            componentCount: number;
            opportunityCount: number;
            moduleCount: number;
        };
        audience?: string | undefined;
        architecture?: string | undefined;
        observations?: string[] | undefined;
    };
    health: {
        docQuality: number;
        archComplexity: number;
        learningDifficulty: number;
        maintainability: number;
        modernTech: number;
        opportunities: number;
    };
    blueprint: {
        layers: {
            name: string;
            nodes: {
                name: string;
                icon: string;
                desc: string;
            }[];
        }[];
        flows: string[];
        communicationSummary?: string | undefined;
    };
    technologies: z.objectInputType<{
        key: z.ZodString;
        name: z.ZodString;
        cat: z.ZodString;
        catDisplay: z.ZodString;
        role: z.ZodString;
        insight: z.ZodString;
    }, z.ZodTypeAny, "passthrough">[];
    relationships: {
        label: string;
        from: string;
        to: string;
        detail: string;
    }[];
    decisions: {
        title: string;
        impact: string;
        pros: string[];
        cons: string[];
    }[];
    recommendations: {
        type: string;
        title: string;
        body: string;
        effort: string;
        benefit: string;
    }[];
    tools: {
        name: string;
        icon: string;
        desc: string;
        command: string;
    }[];
    roadmap: {
        title: string;
        duration: string;
        items: string[];
        dependsOn?: string[] | undefined;
    }[];
    advisor: {
        health: Record<string, {
            desc: string;
            score: number;
        }>;
        opportunities: {
            security?: {
                impact: string;
                effort: string;
                why: string;
            }[] | undefined;
            performance?: {
                impact: string;
                effort: string;
                why: string;
            }[] | undefined;
            codeQuality?: {
                impact: string;
                effort: string;
                why: string;
            }[] | undefined;
        };
        techRecommendations: {
            confidence: number;
            current: string;
            suggested: string;
            why: string;
            benefits: string[];
            tradeoffs: string[];
            difficulty: string;
            whenNot?: string | undefined;
        }[];
        hiddenTools: {
            name: string;
            desc: string;
            cat: string;
            why: string;
            curve: string;
            link?: string | undefined;
        }[];
        futureEvolution: {
            title: string;
            why: string;
        }[];
    };
    confidenceAssessment: {
        recreationDifficulty: string;
        recreationDescription: string;
        missingProprietary: string;
        missingDescription: string;
        implementationEffort: string;
        implementationDescription: string;
    };
    timestamp: string;
}>;
export declare function normalizeFinalReport(report: FinalReport): FinalReport;
export declare function validateFinalReport(report: FinalReport): FinalReport;
//# sourceMappingURL=report.d.ts.map