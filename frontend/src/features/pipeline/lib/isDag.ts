// isDag.ts
// Detects cycles in a directed graph using Kahn's algorithm.
// Mirror of backend/services/graph.py — keep algorithms in sync.
// --------------------------------------------------

import type { PipelineGraph } from '@/features/pipeline/types';

const edgeKey = (source: string, target: string) => `${source}\u0000${target}`;

// Kahn's algorithm: repeatedly remove a node with no remaining incoming edges.
// Whatever cannot be removed belongs to a cycle.
export const isDag = (
  nodes: PipelineGraph['nodes'],
  edges: PipelineGraph['edges']
): boolean => {
  const ids = new Set(nodes.map((node) => node.id));
  const outgoing = new Map<string, string[]>();
  const indegree = new Map<string, number>();

  for (const id of ids) {
    outgoing.set(id, []);
    indegree.set(id, 0);
  }

  const counted = new Set<string>();
  for (const { source, target } of edges) {
    // An edge naming a node that is not on the canvas cannot form a cycle
    // among the ones that are.
    if (!ids.has(source) || !ids.has(target)) continue;

    // A duplicate edge does not change reachability, but counting it twice
    // would leave a residual indegree and report a cycle that is not there.
    const key = edgeKey(source, target);
    if (counted.has(key)) continue;

    counted.add(key);
    outgoing.get(source)!.push(target);
    indegree.set(target, indegree.get(target)! + 1);
  }

  // A self-loop gives its node an indegree it can never shed, so it is
  // correctly reported as a cycle.
  const queue = [...ids].filter((id) => indegree.get(id) === 0);
  let removed = 0;

  while (queue.length > 0) {
    const id = queue.pop()!;
    removed += 1;

    for (const next of outgoing.get(id)!) {
      const remaining = indegree.get(next)! - 1;
      indegree.set(next, remaining);
      if (remaining === 0) queue.push(next);
    }
  }

  return removed === ids.size;
};
