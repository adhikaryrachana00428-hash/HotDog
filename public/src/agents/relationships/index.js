export async function runRelationshipAgent(context) {
    const { scraped } = context;
    const technologies = context.technologyDiscovery?.technologies || [];
    const architecture = context.architecture?.architecture;
    const relationships = technologies.length > 0
        ? [
            {
                id: 'relationship-1',
                label: 'Integrates with',
                from: technologies[0]?.name || 'App Layer',
                to: technologies[Math.min(1, technologies.length - 1)]?.name || 'Data Layer',
                detail: architecture?.communicationSummary || 'The application layer coordinates data access and UI rendering through the detected stack.',
            },
        ]
        : [
            {
                id: 'relationship-2',
                label: 'Layer communication',
                from: 'Client Experience',
                to: 'Application Core',
                detail: `Repository data flows from client interactions to the core logic of ${scraped.repoName}.`,
            },
        ];
    return { relationships };
}
//# sourceMappingURL=index.js.map