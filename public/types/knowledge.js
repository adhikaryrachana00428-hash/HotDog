/** Convert a Technology record into a KnowledgeCard for the UI. */
export function technologyToKnowledgeCard(tech) {
    const roleText = tech.role ?? tech.whatItIs ?? tech.name;
    const insightText = tech.insight ?? tech.whyExists ?? tech.whyProjectUses ?? roleText;
    return {
        technologyId: tech.id ?? tech.key ?? tech.name,
        title: tech.name,
        whatItIs: roleText,
        whyExists: insightText,
        whyProjectUses: insightText,
        advantages: tech.advantages ?? [],
        limitations: tech.limitations ?? [],
        alternatives: tech.alternatives ?? [],
        analogy: tech.analogy ?? '',
        learnNext: tech.learnNext ?? [],
    };
}
//# sourceMappingURL=knowledge.js.map