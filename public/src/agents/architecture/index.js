export async function runArchitectureAgent(context) {
    const { scraped } = context;
    const technologies = context.technologyDiscovery?.technologies || [];
    const hasFrontend = technologies.some(tech => tech.cat === 'frontend');
    const hasBackend = technologies.some(tech => tech.cat === 'backend');
    const hasDatabase = technologies.some(tech => tech.cat === 'database');
    const hasAuth = technologies.some(tech => tech.cat === 'auth');
    const layers = [
        {
            name: 'Client Layer',
            nodes: [{ id: 'client-layer', name: 'Web Client', kind: 'client', description: 'User-facing experience and interactions', desc: 'User-facing experience and interactions', icon: '🌐' }],
        },
    ];
    if (hasAuth) {
        layers.push({
            name: 'Identity Layer',
            nodes: [{ id: 'identity-layer', name: 'Authentication', kind: 'auth', description: 'Session and access management', desc: 'Session and access management', icon: '🔐' }],
        });
    }
    layers.push({
        name: 'Application Layer',
        nodes: [{ id: 'application-layer', name: scraped.repoName, kind: 'application', description: 'Domain logic and request orchestration', desc: 'Domain logic and request orchestration', icon: '⚙️' }],
    });
    if (hasDatabase) {
        layers.push({
            name: 'Data Layer',
            nodes: [{ id: 'data-layer', name: 'Persisted Data', kind: 'database', description: 'Durable storage and query layer', desc: 'Durable storage and query layer', icon: '🗄️' }],
        });
    }
    const flows = [
        'Client requests enter through the presentation layer.',
        'Application logic coordinates services and domain workflows.',
        'Persisted data and caches support stateful behavior and performance.',
    ];
    return {
        architecture: {
            layers,
            flows,
            communicationSummary: 'The repository follows a layered architecture in which user experience, identity, application logic, and data storage collaborate through explicit interfaces.',
        },
        componentRelationships: [{ name: 'Client UI', role: 'Entry point for user interactions' }, { name: 'Core Application', role: 'Business logic and orchestration' }],
    };
}
//# sourceMappingURL=index.js.map