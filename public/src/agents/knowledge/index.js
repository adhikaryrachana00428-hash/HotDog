export async function runKnowledgeAgent(context) {
    const { scraped } = context;
    const technologies = context.technologyDiscovery?.technologies || [];
    const enriched = technologies.map((tech) => ({
        ...tech,
        whatItIs: tech.whatItIs || `${tech.name} is part of the repository's implementation stack.`,
        whyExists: tech.whyExists || `It exists to solve common engineering problems in ${scraped.repoName}.`,
        whyProjectUses: tech.whyProjectUses || `It is used in this project because ${scraped.primaryLanguage} and repository conventions favor it.`,
        advantages: tech.advantages || ['Improves development velocity', 'Encodes engineering best practices'],
        limitations: tech.limitations || ['May introduce additional learning overhead'],
        alternatives: tech.alternatives || ['Other ecosystem options may be viable'],
        analogy: tech.analogy || 'A practical tool that makes the system easier to build and maintain.',
        learnNext: tech.learnNext || [`Learn the fundamentals of ${tech.name}`],
        problemSolved: `Solves common implementation and scaling concerns for ${tech.name}.`,
        howItWorks: `It works by providing a structured abstraction for ${(tech.role ?? tech.whatItIs ?? tech.name).toLowerCase()}.`,
        whyUsedInThisProject: `It is a strong fit for ${scraped.repoName} because the repository structure and dependencies indicate a modern engineering workflow.`,
        tradeOffs: ['May add complexity', 'Requires team familiarity'],
        modernAlternatives: tech.alternatives || ['Evaluate newer ecosystem alternatives'],
        beginnerExplanation: `A beginner-friendly way to think about ${tech.name} is as a building block that simplifies implementation.`,
        intermediateExplanation: `At an intermediate level, ${tech.name} helps align development patterns, boundaries, and reusable interfaces.`,
        advancedExplanation: `At an advanced level, ${tech.name} shapes system performance, extensibility, and operational characteristics.`,
        realWorldAnalogy: `${tech.name} is like a specialized tool in a well-equipped workshop.`,
        commonMistakes: ['Overusing it without clear boundaries', 'Skipping validation and observability'],
        relatedTechnologies: [tech.cat ?? tech.category ?? 'General', 'TypeScript', 'APIs'],
        learnNextRecommendations: [`Study ${tech.name} in context`, 'Practice an end-to-end example'],
    }));
    return { technologies: enriched };
}
//# sourceMappingURL=index.js.map