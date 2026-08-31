# Pipeline Builder

A visual pipeline builder: drag node types onto a canvas, wire them together,
and submit the graph for analysis.

- `frontend/` — Vite + React + React Flow + Zustand + TanStack Query + Tailwind.
  See [frontend/README.md](frontend/README.md).
- `backend/` — FastAPI service that counts a submitted pipeline and reports
  whether it is a directed acyclic graph.

## Demo

https://github.com/user-attachments/assets/8cffd8c0-17cf-4d2e-87bc-716e801b481f



## Running it

Use two terminals. Both the frontend and backend must be running for Submit to
work.

```bash
# Terminal 1
cd frontend
npm install
cp .env.example .env   # optional; defaults to http://localhost:8000
npm run dev            # http://localhost:3000
```

```bash
# Terminal 2
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

## Checks

There is no test suite. Before submitting or deploying, run:

```bash
cd frontend && npm run lint && npm run typecheck && npm run build
```

## How Submit works

Clicking **Submit** sends the current nodes and edges to the backend
`POST /pipelines/parse` endpoint. The response is shown in a dialog with:

- node count
- edge count
- whether the graph is a valid DAG

The flow is implemented in
[frontend/src/features/pipeline/hooks/useSubmitPipeline.ts](frontend/src/features/pipeline/hooks/useSubmitPipeline.ts)
and [frontend/src/features/pipeline/api/parsePipeline.ts](frontend/src/features/pipeline/api/parsePipeline.ts).
DAG detection on the server lives in
[backend/services/graph.py](backend/services/graph.py).

Client-side validation runs first; Submit is blocked while the inspector
reports errors (for example, an invalid `{{ variable }}` in a text node).

`analyzePipeline.ts` still exists for local DAG checks in the inspector, but
Submit always uses the backend.

## API

`POST /pipelines/parse`

```jsonc
// request
{ "nodes": [{ "id": "customInput-1", "type": "customInput" }],
  "edges": [{ "id": "e1", "source": "customInput-1", "target": "llm-1" }] }

// response
{ "num_nodes": 1, "num_edges": 1, "is_dag": true }
```

Extra keys on a node or edge are ignored, so the frontend can extend a node's
`data` without breaking the endpoint.

Configure the backend URL with `VITE_API_BASE_URL` in `frontend/.env`
(default: `http://localhost:8000`).
