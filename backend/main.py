"""FastAPI application exposing pipeline analysis."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from schemas import Pipeline, PipelineStats
from services.graph import is_dag

# The Vite dev server; both spellings appear depending on how the browser
# resolves localhost.
ALLOWED_ORIGINS = ['http://localhost:3000', 'http://127.0.0.1:3000']

app = FastAPI(title='Pipeline Builder API')

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_methods=['GET', 'POST'],
    allow_headers=['*'],
)


@app.get('/')
def read_root():
    return {'Ping': 'Pong'}


@app.post('/pipelines/parse', response_model=PipelineStats)
def parse_pipeline(pipeline: Pipeline) -> PipelineStats:
    """Count the submitted graph and report whether it is acyclic."""
    return PipelineStats(
        num_nodes=len(pipeline.nodes),
        num_edges=len(pipeline.edges),
        is_dag=is_dag(
            (node.id for node in pipeline.nodes),
            ((edge.source, edge.target) for edge in pipeline.edges),
        ),
    )
