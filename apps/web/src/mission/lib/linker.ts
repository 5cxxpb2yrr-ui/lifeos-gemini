import type { Goal, LifeData, LinkRecord, LinkSourceType, LinkTargetType, Project } from '../types';

export const slugify = (s: string) => s.trim().toLowerCase().replace(/[^a-z0-9]+/g, ' ').replace(/\s+/g, ' ').trim();

export function listLinksFor(data: LifeData, sourceType: LinkSourceType, sourceId: string): LinkRecord[] {
  return data.links.filter((link) => link.sourceType === sourceType && link.sourceId === sourceId);
}

export function getLinkedProjects(data: LifeData, sourceType: LinkSourceType, sourceId: string): Project[] {
  const targets = listLinksFor(data, sourceType, sourceId).filter((link) => link.targetType === 'project');
  return targets.map((link) => data.projects.find((project) => project.id === link.targetId)).filter(Boolean) as Project[];
}

export function getLinkedGoals(data: LifeData, sourceType: LinkSourceType, sourceId: string): Goal[] {
  const targets = listLinksFor(data, sourceType, sourceId).filter((link) => link.targetType === 'goal');
  return targets.map((link) => data.goals.find((goal) => goal.id === link.targetId)).filter(Boolean) as Goal[];
}

export function addLink(data: LifeData, sourceType: LinkSourceType, sourceId: string, targetType: LinkTargetType, targetId: string, now = new Date()): LifeData {
  if (!sourceId || !targetId) return data;
  if (data.links.some((link) => link.sourceType === sourceType && link.sourceId === sourceId && link.targetType === targetType && link.targetId === targetId)) {
    return data;
  }
  return {
    ...data,
    links: [
      ...data.links,
      { id: `link_${now.getTime().toString(36)}_${Math.random().toString(36).slice(2, 6)}`, sourceType, sourceId, targetType, targetId, createdAt: now.toISOString(), updatedAt: now.toISOString() },
    ],
  };
}

export function removeLink(data: LifeData, sourceType: LinkSourceType, sourceId: string, targetType: LinkTargetType, targetId: string): LifeData {
  return {
    ...data,
    links: data.links.filter((link) => !(link.sourceType === sourceType && link.sourceId === sourceId && link.targetType === targetType && link.targetId === targetId)),
  };
}

export function findProjectByTitle(data: LifeData, title: string): Project | undefined {
  const value = slugify(title);
  return data.projects.find((project) => slugify(project.title) === value);
}

export function findGoalByTitle(data: LifeData, title: string): Goal | undefined {
  const value = slugify(title);
  return data.goals.find((goal) => slugify(goal.title) === value);
}
