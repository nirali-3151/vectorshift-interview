"""Graph analysis for submitted pipelines.

Mirror of frontend/src/features/pipeline/lib/isDag.ts — keep algorithms in sync.
"""

from collections import defaultdict, deque
from collections.abc import Iterable


def is_dag(node_ids: Iterable[str], edges: Iterable[tuple[str, str]]) -> bool:
    """Return True when the directed graph contains no cycles.

    Kahn's algorithm: repeatedly remove a node that has no remaining incoming
    edges. If every node can be removed the graph is acyclic; whatever is left
    behind belongs to a cycle.
    """
    nodes = set(node_ids)
    outgoing: dict[str, list[str]] = defaultdict(list)
    indegree: dict[str, int] = dict.fromkeys(nodes, 0)

    counted: set[tuple[str, str]] = set()
    for source, target in edges:
        # An edge naming a node that was not submitted cannot form a cycle
        # among the nodes we do know about.
        if source not in nodes or target not in nodes:
            continue
        # A duplicate edge does not change reachability, but counting it twice
        # would leave a residual indegree and report a cycle that is not there.
        if (source, target) in counted:
            continue

        counted.add((source, target))
        outgoing[source].append(target)
        indegree[target] += 1

    # A self-loop gives its node an indegree it can never shed, so it is
    # correctly reported as a cycle.
    queue = deque(node for node in nodes if indegree[node] == 0)
    removed = 0

    while queue:
        node = queue.popleft()
        removed += 1
        for neighbour in outgoing[node]:
            indegree[neighbour] -= 1
            if indegree[neighbour] == 0:
                queue.append(neighbour)

    return removed == len(nodes)
