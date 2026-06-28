export type { LearningNode } from './schema.js';

/** A phase in the dependency-aware learning roadmap. */
export interface LearningRoadmapPhase {
  title: string;
  duration: string;
  dependsOn?: string[];
  items: string[];
}
