import '@xyflow/react/dist/style.css'
import {
  addEdge,
  Background,
  type Connection,
  ConnectionMode,
  Controls,
  type Edge,
  Handle,
  MarkerType,
  type Node,
  type NodeProps,
  Position,
  ReactFlow,
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
  useReactFlow,
} from '@xyflow/react'
import clsx from 'clsx'
import { Box, Boxes, Cloud, Database, HardDrive, type LucideIcon, Monitor, Network, Plug, Radio, Server, ShieldHalf, Zap } from 'lucide-react'
import { useCallback, useEffect, useId, useState } from 'react'
import { type InterviewDict, useInterviewT } from './strings'
import { isDark } from '../lib/theme'
import { useProgress } from '../store'
import type { DesignBoard as Board } from './types'

type BlockKind = keyof InterviewDict['board']['blocks']

/** Building blocks of a front end architecture diagram. */
const blocks: Record<BlockKind, { icon: LucideIcon; color: string }> = {
  view: { icon: Monitor, color: '#8b5cf6' },
  component: { icon: Box, color: '#a855f7' },
  store: { icon: Boxes, color: '#ec4899' },
  data: { icon: Network, color: '#f97316' },
  cache: { icon: Zap, color: '#eab308' },
  worker: { icon: ShieldHalf, color: '#14b8a6' },
  storage: { icon: HardDrive, color: '#0ea5e9' },
  cdn: { icon: Cloud, color: '#38bdf8' },
  bff: { icon: Plug, color: '#22c55e' },
  api: { icon: Server, color: '#6366f1' },
  socket: { icon: Radio, color: '#f43f5e' },
  thirdParty: { icon: Database, color: '#64748b' },
}
const kinds = Object.keys(blocks) as BlockKind[]

type BlockNodeType = Node<{ kind: BlockKind; label: string; kindLabel: string }, 'block'>

const sides = [Position.Top, Position.Right, Position.Bottom, Position.Left]

function BlockNode({ data, selected }: NodeProps<BlockNodeType>) {
  const meta = blocks[data.kind] ?? blocks.component
  const Icon = meta.icon
  return (
    <div className={clsx('flex min-w-36 items-center gap-2 rounded-2xl border-2 bg-surface px-3 py-2 shadow-md', selected ? 'border-brand-1' : 'border-line')}>
      <span className="rounded-lg p-1.5" style={{ background: `${meta.color}22`, color: meta.color }}>
        <Icon size={18} aria-hidden />
      </span>
      <span className="leading-tight">
        <span className="block text-[10px] font-semibold uppercase tracking-wide text-muted">{data.kindLabel}</span>
        <span className="block text-sm font-semibold text-ink">{data.label}</span>
      </span>
      {sides.map((p) => (
        <Handle key={`${p}-s`} id={`${p}-s`} type="source" position={p} className="!size-2.5 !border-surface !bg-muted" />
      ))}
      {sides.map((p) => (
        <Handle key={`${p}-t`} id={`${p}-t`} type="target" position={p} className="!size-2.5 !opacity-0" />
      ))}
    </div>
  )
}

const nodeTypes = { block: BlockNode }
const edgeDefaults = { markerEnd: { type: MarkerType.ArrowClosed }, labelBgPadding: [6, 3] as [number, number], labelBgBorderRadius: 6 }

const toNodes = (board: Board, names: Record<BlockKind, string>): BlockNodeType[] =>
  board.nodes.map((n) => {
    const kind = (n.type in blocks ? n.type : 'component') as BlockKind
    return { id: n.id, type: 'block', position: { x: n.x, y: n.y }, data: { kind, label: n.label, kindLabel: names[kind] } }
  })
const toEdges = (board: Board): Edge[] => board.edges.map((e) => ({ ...e, ...edgeDefaults }))

function Canvas({ board, onChange }: { board: Board; onChange: (b: Board) => void }) {
  const t = useInterviewT().board
  const theme = useProgress((s) => s.theme)
  const [systemDark] = useState(() => typeof matchMedia !== 'undefined' && matchMedia('(prefers-color-scheme: dark)').matches)
  const [nodes, setNodes, onNodesChange] = useNodesState<BlockNodeType>(toNodes(board, t.blocks))
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>(toEdges(board))
  const { screenToFlowPosition } = useReactFlow()
  const helpId = useId()

  // The board is saved into the session a moment after the last change.
  useEffect(() => {
    const timer = setTimeout(
      () =>
        onChange({
          notes: board.notes,
          nodes: nodes.map((n) => ({ id: n.id, type: n.data.kind, label: n.data.label, x: Math.round(n.position.x), y: Math.round(n.position.y) })),
          edges: edges.map((e) => ({ id: e.id, source: e.source, target: e.target, label: typeof e.label === 'string' && e.label ? e.label : undefined })),
        }),
      300,
    )
    return () => clearTimeout(timer)
    // board.notes changes are saved by the notes panel itself
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodes, edges])

  const onConnect = useCallback((c: Connection) => setEdges((es) => addEdge({ ...c, ...edgeDefaults }, es)), [setEdges])

  const add = (kind: BlockKind) => {
    const origin = screenToFlowPosition({ x: window.innerWidth * 0.15, y: window.innerHeight * 0.35 })
    const id = `${kind}-${crypto.randomUUID().slice(0, 4)}`
    // New blocks go into a free cell of a 3-column grid, so they never land on top of each other.
    const n = nodes.length
    const position = { x: origin.x + (n % 3) * 210, y: origin.y + Math.floor(n / 3) * 100 }
    setNodes((ns) => [...ns.map((x) => ({ ...x, selected: false })), { id, type: 'block', position, data: { kind, label: t.blocks[kind], kindLabel: t.blocks[kind] }, selected: true }])
  }

  const rename = (node: BlockNodeType) => {
    const label = window.prompt(t.rename, node.data.label)
    if (label?.trim()) setNodes((ns) => ns.map((x) => (x.id === node.id ? { ...x, data: { ...x.data, label: label.trim() } } : x)))
  }
  const relabel = (edge: Edge) => {
    const label = window.prompt(t.edgeLabel, typeof edge.label === 'string' ? edge.label : '')
    if (label !== null) setEdges((es) => es.map((x) => (x.id === edge.id ? { ...x, label: label.trim() } : x)))
  }

  return (
    <div className="flex h-full flex-col">
      <div role="toolbar" aria-label={t.diagram} className="flex flex-wrap gap-1 border-b border-line bg-surface p-2">
        {kinds.map((k) => {
          const Icon = blocks[k].icon
          return (
            <button
              key={k}
              type="button"
              onClick={() => add(k)}
              aria-label={t.add(t.blocks[k])}
              title={t.add(t.blocks[k])}
              className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-ink hover:bg-surface-2"
            >
              <Icon size={14} aria-hidden style={{ color: blocks[k].color }} />
              {t.blocks[k]}
            </button>
          )
        })}
      </div>
      <p id={helpId} className="border-b border-line bg-surface-2 px-3 py-1.5 text-xs text-muted">
        {t.help}
      </p>
      <div
        className="min-h-0 flex-1"
        aria-describedby={helpId}
        onKeyDown={(e) => {
          // Keyboard rename: Enter on a selected block.
          if (e.key !== 'Enter' || (e.target as HTMLElement).tagName === 'BUTTON') return
          const node = nodes.find((n) => n.selected)
          if (node) rename(node)
        }}
      >
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          connectionMode={ConnectionMode.Loose}
          onNodeDoubleClick={(_, n) => rename(n)}
          onEdgeDoubleClick={(_, e) => relabel(e)}
          deleteKeyCode={['Backspace', 'Delete']}
          fitView
          fitViewOptions={{ maxZoom: 1, padding: 0.3 }}
          colorMode={isDark(theme, systemDark) ? 'dark' : 'light'}
        >
          <Background gap={20} />
          <Controls />
        </ReactFlow>
      </div>
    </div>
  )
}

const noteKeys = ['r', 'a', 'd', 'i', 'o'] as const

function Notes({ board, onChange }: { board: Board; onChange: (b: Board) => void }) {
  const t = useInterviewT().board
  const [notes, setNotes] = useState(board.notes)
  useEffect(() => {
    const timer = setTimeout(() => onChange({ ...board, notes }), 300)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notes])
  return (
    <div className="grid h-full content-start gap-3 overflow-y-auto p-3">
      {noteKeys.map((k) => (
        <label key={k} className="grid gap-1 text-sm font-semibold">
          {t.noteLabels[k]}
          <textarea
            value={notes[k] ?? ''}
            onChange={(e) => setNotes((n) => ({ ...n, [k]: e.target.value }))}
            rows={3}
            className="resize-y rounded-xl border border-line bg-surface p-2 font-normal outline-none focus:border-brand-1"
          />
        </label>
      ))}
    </div>
  )
}

/** The design round's board: a block diagram and RADIO notes, both sent to the interviewer. */
export function DesignBoard({ board, onChange }: { board: Board; onChange: (b: Board) => void }) {
  const t = useInterviewT().board
  const [tab, setTab] = useState<'diagram' | 'notes'>('diagram')
  const tabsId = useId()
  return (
    <section aria-label={t.title} className="flex h-full min-h-[28rem] flex-col overflow-hidden rounded-2xl border border-line bg-canvas">
      <div role="tablist" className="flex gap-1 border-b border-line bg-surface p-1.5">
        {(['diagram', 'notes'] as const).map((k) => (
          <button
            key={k}
            role="tab"
            id={`${tabsId}-${k}`}
            aria-selected={tab === k}
            aria-controls={`${tabsId}-${k}-panel`}
            onClick={() => setTab(k)}
            className={clsx('rounded-lg px-3 py-1.5 text-sm font-semibold', tab === k ? 'bg-brand text-white' : 'text-muted hover:text-ink')}
          >
            {t[k]}
          </button>
        ))}
      </div>
      <div role="tabpanel" id={`${tabsId}-${tab}-panel`} aria-labelledby={`${tabsId}-${tab}`} className="min-h-0 flex-1">
        {tab === 'diagram' ? (
          <ReactFlowProvider>
            <Canvas board={board} onChange={onChange} />
          </ReactFlowProvider>
        ) : (
          <Notes board={board} onChange={onChange} />
        )}
      </div>
    </section>
  )
}
