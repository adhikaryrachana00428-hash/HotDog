import { validateFinalReport } from '../../../types/report.js';
import { runPlannerAgent } from '../planner/index.js';
import { runTechnologyAgent } from '../technology/index.js';
import { runArchitectureAgent } from '../architecture/index.js';
import { runKnowledgeAgent } from '../knowledge/index.js';
import { runRelationshipAgent } from '../relationships/index.js';
import { runAdvisorAgent } from '../advisor/index.js';
import { runRoadmapAgent } from '../roadmap/index.js';
import { runConfidenceAgent } from '../confidence/index.js';
export async function runReportAgent(context) {
    const { scraped } = context;
    const planner = context.planner || (await runPlannerAgent(context));
    context.planner = planner;
    const technology = context.technologyDiscovery || (await runTechnologyAgent(context));
    context.technologyDiscovery = technology;
    const architecture = context.architecture || (await runArchitectureAgent(context));
    context.architecture = architecture;
    const knowledge = context.knowledge || (await runKnowledgeAgent(context));
    context.knowledge = knowledge;
    const relationships = context.relationships || (await runRelationshipAgent(context));
    context.relationships = relationships;
    const advisor = context.advisor || (await runAdvisorAgent(context));
    context.advisor = advisor;
    const roadmap = context.roadmap || (await runRoadmapAgent(context));
    context.roadmap = roadmap;
    const confidence = context.confidence || (await runConfidenceAgent(context));
    context.confidence = confidence;
    const report = {
        sessionId: context.sessionId,
        url: scraped.url,
        repoName: scraped.repoName,
        primaryLanguage: scraped.primaryLanguage,
        langColor: '#3178C6',
        metrics: confidence.metrics,
        summary: {
            title: `${scraped.repoName} Engineering Intelligence Report`,
            purpose: planner.projectType,
            audience: 'Engineering teams and contributors',
            architecture: architecture.architecture.communicationSummary,
            observations: planner.analysisPlan,
            tags: ['ai', 'engineering-intelligence', 'report'],
            stats: {
                techCount: technology.technologies.length,
                dependencyCount: Object.keys(scraped.dependencyFiles).length,
                apiCount: Math.max(1, technology.technologies.length - 1),
                componentCount: architecture.componentRelationships.length,
                opportunityCount: advisor.recommendations.length,
                moduleCount: roadmap.roadmap.length,
            },
        },
        health: {
            docQuality: scraped.readme ? 84 : 62,
            archComplexity: confidence.metrics.complexity,
            learningDifficulty: Math.min(90, 40 + technology.technologies.length * 4),
            maintainability: 82,
            modernTech: 82,
            opportunities: advisor.recommendations.length,
        },
        blueprint: architecture.architecture,
        technologies: knowledge.technologies,
        relationships: relationships.relationships,
        decisions: [
            {
                title: 'Architecture direction',
                impact: 'High',
                pros: ['Clear layered structure', 'Good fit for iterative delivery'],
                cons: ['May require more explicit interfaces over time'],
            },
        ],
        recommendations: advisor.recommendations,
        tools: advisor.tools,
        roadmap: roadmap.roadmap,
        advisor: advisor.advisor,
        confidenceAssessment: confidence.confidenceAssessment,
        timestamp: new Date().toISOString(),
    };
    return { report: validateFinalReport(report) };
}
//# sourceMappingURL=index.js.map