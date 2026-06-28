export async function runRoadmapAgent(context) {
    const technologies = context.technologyDiscovery?.technologies || [];
    return {
        roadmap: [
            {
                title: 'Foundation — Stack Overview',
                duration: '~1 week',
                dependsOn: [],
                items: technologies.length > 0
                    ? technologies.slice(0, 2).map(tech => `Understand ${tech.name} in the repository context`)
                    : ['Understand the repository architecture and entry points', 'Trace the main data and UI flows'],
            },
            {
                title: 'Production Readiness',
                duration: '~1 week',
                dependsOn: ['Foundation — Stack Overview'],
                items: ['Add testing, linting, and observability', 'Document deployment and operational boundaries'],
            },
        ],
    };
}
//# sourceMappingURL=index.js.map