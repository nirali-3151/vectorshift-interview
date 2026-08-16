"""Request and response models for the pipeline API."""

from pydantic import BaseModel, ConfigDict, Field


class Node(BaseModel):
    """A node as React Flow serialises it.

    Extra keys are ignored so the frontend can grow a node's data without
    breaking this endpoint.
    """

    model_config = ConfigDict(extra='ignore')

    id: str
    type: str | None = None


class Edge(BaseModel):
    model_config = ConfigDict(extra='ignore')

    id: str | None = None
    source: str
    target: str


class Pipeline(BaseModel):
    nodes: list[Node] = Field(default_factory=list)
    edges: list[Edge] = Field(default_factory=list)


class PipelineStats(BaseModel):
    num_nodes: int
    num_edges: int
    is_dag: bool
