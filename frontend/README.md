# Frontend

Pipeline builder UI built with [Vite](https://vite.dev/), [React](https://react.dev/), [React Flow](https://reactflow.dev/) (`@xyflow/react`), [Zustand](https://zustand.docs.pmnd.rs/), [TanStack Query](https://tanstack.com/query), and [Tailwind CSS](https://tailwindcss.com/).

## Requirements

Node.js 20.19+ or 22.12+ (Vite 8). Verified on Node 24.

## Setup

```bash
npm install
cp .env.example .env   # optional; defaults to http://localhost:8000
```

## Available scripts

### `npm run dev`

Starts the dev server on [http://localhost:3000](http://localhost:3000) with hot module replacement. `npm start` is an alias.

### `npm run build`

Produces an optimized production bundle in `dist/`.

### `npm run preview`

Serves the contents of `dist/` locally to sanity-check a production build.

### `npm run lint`

Runs ESLint using the flat config in `eslint.config.js`.

### `npm run typecheck`

Runs `tsc --noEmit`. `npm run build` runs it first and fails the build on any
type error.

## Project layout

```
index.html                    Vite entry point
public/                       Static assets copied verbatim into the build
src/
  main.tsx                    React root
  App.tsx                     App shell and layout
  components/                 Shared, domain-free UI
    ErrorBoundary.tsx         Catches render errors below the root
    ui/
      Button.tsx  Checkbox.tsx  Dialog.tsx  Field.tsx  Icon.tsx
      Input.tsx   Select.tsx    Spinner.tsx  Textarea.tsx
      controlStyles.ts        Class string shared by the text form controls
      index.ts                Public surface of the UI layer
  constants/
    icons.ts                  Name-to-Lucide registry behind the Icon component
  hooks/
    useAutosizeTextarea.ts    Grows a textarea to fit its content
    useMediaQuery.ts          Subscribes to a media query
  lib/
    cn.ts                     Tailwind-aware class merging
    apiClient.ts              Axios client: base URL, JSON, error messages
  features/
    pipeline/
      index.ts                Public surface of the feature
      PipelineCanvas.tsx      React Flow canvas and drop handling
      store.ts                Zustand store holding nodes, edges, run logs
      types.ts                Shared node, edge, and stats types
      constants.ts            Grid size and edge defaults
      api/
        parsePipeline.ts      POST /pipelines/parse
      hooks/
        useSubmitPipeline.ts  Submit lifecycle: validation, API call, dialog state
        useParsePipelineMutation.ts  TanStack Query mutation for parsePipeline
        usePersistPipeline.ts Saves and restores the graph in localStorage
        useAppSettings.ts     Persisted UI preferences
      lib/
        parseVariables.ts     Extracts {{variable}} names
        isDag.ts              DAG cycle detection (Kahn's algorithm)
        analyzePipeline.ts    Local node/edge counts and DAG check
        validatePipeline.ts     Validation errors, warnings, and connection rules
        nodeWidth.ts          Width for nodes that grow with their text
        persistPipeline.ts    Serialises the graph for localStorage
        persistSettings.ts    Serialises the settings for localStorage
      components/
        NodePalette.tsx       Palette, generated from the node registry
        NodePaletteItem.tsx   Individual palette item
        CanvasToolbar.tsx     Canvas-level actions
        InspectorPanel.tsx    Validation issues and the run log
        AppSettingsMenu.tsx   Global UI preferences
        PipelineSubmit.tsx    Submit button and result dialog
        PipelineStatus.tsx    Node and edge counts
      edges/
        PipelineEdge.tsx      The edge renderer, with its delete affordance
        index.tsx             Builds the edgeTypes map
      nodes/
        nodeConfigs.ts        Merged registry of every node type
        configs/              One file per category, plus shared helpers
          types.ts            NodeConfig, NodeFieldDef, NodeHandleDef
          helpers.ts          input/output/variableInput handle builders
          io.ts  ai.ts  logic.ts  data.ts  utility.ts
        categories.ts         Palette sections and the colours they carry
        BaseNode.tsx          Renders any node from its config
        NodeField.tsx         Renders a field descriptor with its control
        NodeHandle.tsx        One handle plus its label, spaced automatically
        NodeHeaderActions.tsx Expand, reset, and delete buttons
        index.tsx             Builds the nodeTypes map and palette list
  styles/
    index.css                 Tailwind entry, design tokens, base styles
```

## Architecture

Three layers, with dependencies pointing one way only:

- `components/`, `hooks/`, `lib/` — reusable and domain-free. These may not
  import anything from `features/`.
- `features/<name>/` — domain logic. Everything outside a feature imports it
  through its barrel (`@/features/pipeline`), never a file inside it.
- `App.tsx` — composition only.

Both rules are enforced by `no-restricted-imports` in `eslint.config.js`, so a
violation fails `npm run lint` rather than relying on discipline.

## Adding a node type

Add one entry to the config file for its category under `nodes/configs/`; they
are merged into one registry by `nodeConfigs.ts`. It will render on the canvas
and appear in the palette automatically; no new component or registration is
needed.

```ts
export const logicNodes = defineNodes('logic', {
  myNode: {
    title: 'My Node',
    icon: 'wand',
    subtitle: 'What it does',
    handles: [input('in'), output('out')],
    fields: [{ name: 'label', label: 'Label', kind: 'text', initial: '' }],
  },
});
```

A config requires `title`, `icon`, and `handles`, and accepts optional
`subtitle`, `fields`, `width`, and `growWith`. The category is set once via
`defineNodes('logic', …)` and applied to every entry in the file. Handles are spaced
evenly down their side of the node, so no manual offsets are needed.

`icon` is a key into the registry in `constants/icons.ts` rather than an
imported component, which keeps the configs free of JSX imports. Add the icon
there first if it is not already listed.

`input()` and `output()` from `configs/helpers.ts` fill in the position and
default the label to the id, so a config never spells out a `Position`.

`defineNodes(category, nodes)` names one of the sections in `categories.ts` and
decides the node's header colour, its icon tint in the palette, and its dot in
the minimap. A node never picks its own colours.

`handles` and `width` may each be a function of the node's `data`, which is how
the text node works: every `{{variable}}` in its template becomes an input
handle, and the node widens to fit its longest line. Removing a variable also
removes any edge that was attached to it, handled in `store.ts`. A node whose
handles depend on data must let React Flow recompute their positions;
`BaseNode.tsx` does that once for every node type via `useUpdateNodeInternals`.

Field `kind` covers `text`, `textarea`, `select`, `number`, `decimal`,
`toggle`, and `checkbox`; a `textarea` may set `autoSize` to grow with its
content, and any field may set `isRequired` to show the asterisk and be checked
by the inspector. To add another kind, add a branch in `FieldControl.tsx` and
every node type can use it.

The twelve bundled node types exist to exercise this: `filter` and `httpRequest`
branch to two sources, `math` merges two targets, `knowledgeBase` uses the
number and checkbox fields, `text` derives its handles from its content, and
`note` declares no handles at all.

## Text node variables

Typing a valid JavaScript variable name in double curly brackets adds a matching
input handle on the left of the text node. `parseVariables.ts` is the only place
that decides what counts: the name must match the identifier grammar and must
not be a reserved word, so `{{ input }}` creates a handle while `{{ a.b }}`,
`{{ 1st }}`, `{{ class }}`, and an unclosed `{{` do not.

Those handles are namespaced `var:<name>` by `variableInput()`, because a
template is free to write `{{output}}` and that must not collide with a
statically declared `output` handle on the same node. The label stays the bare
variable name, so the prefix is invisible on the canvas.

## Submit

Submit sends the current graph to `POST /pipelines/parse` via
`api/parsePipeline.ts` and `hooks/useSubmitPipeline.ts`. Results (node count,
edge count, and whether the graph is a DAG) appear in a dialog. The backend
must be running; set `VITE_API_BASE_URL` in `.env` if it is not on
`http://localhost:8000`.

Client-side validation runs before the request. `lib/analyzePipeline.ts` is
still used locally by the inspector to flag cycles, but Submit always uses the
backend response.

## Conventions

Component files are PascalCase and use the `.tsx` extension, which Vite requires
for JSX; plain modules stay `.ts`. There is no test runner wired up yet, so
`npm run lint` and `npm run typecheck` are the checks that must pass.

## Styling

Tailwind CSS v4, configured entirely in `styles/index.css` with no JS config
file. Design tokens live in the `@theme` block, so adding `--color-brand` there
makes `bg-brand`, `text-brand`, and `border-brand` available everywhere. The
`--color-cat-*` tokens are the node category colours; their hex values are
repeated in `categories.ts` because the minimap writes an SVG `fill` attribute,
which cannot resolve a CSS variable.

Note the import order in that file: React Flow's stylesheet is imported *after*
Tailwind and inside `@layer base`. This is required. It lets utility classes
override React Flow's defaults, and it keeps Tailwind's Preflight reset from
stripping the styling off the canvas control buttons.
