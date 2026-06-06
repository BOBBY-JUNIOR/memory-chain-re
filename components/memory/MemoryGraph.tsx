'use client'

import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { CATEGORY_COLORS, CATEGORY_ICONS, type MemoryCategory } from '@/types'
import type { Memory } from '@/types'

interface Node {
  id: string
  x: number
  y: number
  memory: Memory
  radius: number
}

interface Edge {
  source: Node
  target: Node
  strength: number
}

function cosineSimilarity(a: string, b: string): number {
  // Simple word-overlap similarity for frontend graph (no embeddings needed here)
  const wordsA = new Set(a.toLowerCase().split(/\W+/).filter(w => w.length > 3))
  const wordsB = new Set(b.toLowerCase().split(/\W+/).filter(w => w.length > 3))
  const intersection = new Set([...wordsA].filter(w => wordsB.has(w)))
  const union = new Set([...wordsA, ...wordsB])
  return union.size === 0 ? 0 : intersection.size / union.size
}

const CAT_GLOW: Record<MemoryCategory, string> = {
  personal: '#a78bfa',
  business: '#2aa5ff',
  preferences: '#34d399',
  projects: '#fbbf24',
  learning: '#fb7185',
  general: '#64748b',
}

interface MemoryGraphProps {
  memories: Memory[]
}

export function MemoryGraph({ memories }: MemoryGraphProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const [nodes, setNodes] = useState<Node[]>([])
  const [edges, setEdges] = useState<Edge[]>([])
  const [selectedNode, setSelectedNode] = useState<Node | null>(null)
  const [dimensions, setDimensions] = useState({ width: 800, height: 500 })

  useEffect(() => {
    const updateSize = () => {
      if (svgRef.current) {
        const rect = svgRef.current.getBoundingClientRect()
        setDimensions({ width: rect.width || 800, height: rect.height || 500 })
      }
    }
    updateSize()
    window.addEventListener('resize', updateSize)
    return () => window.removeEventListener('resize', updateSize)
  }, [])

  useEffect(() => {
    if (memories.length === 0) return

    const { width, height } = dimensions
    const cx = width / 2
    const cy = height / 2

    // Category cluster positions
    const categories = [...new Set(memories.map(m => m.category))] as MemoryCategory[]
    const catPositions: Record<string, { x: number; y: number }> = {}
    categories.forEach((cat, i) => {
      const angle = (i / categories.length) * Math.PI * 2 - Math.PI / 2
      const r = Math.min(width, height) * 0.28
      catPositions[cat] = { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) }
    })

    // Build nodes
    const nodeList: Node[] = memories.slice(0, 40).map((mem, i) => {
      const base = catPositions[mem.category] ?? { x: cx, y: cy }
      const jitter = 60
      return {
        id: mem.id,
        x: base.x + (Math.random() - 0.5) * jitter,
        y: base.y + (Math.random() - 0.5) * jitter,
        memory: mem,
        radius: 6 + mem.importanceScore * 10,
      }
    })

    // Build edges (similarity > threshold)
    const edgeList: Edge[] = []
    const THRESHOLD = 0.15
    for (let i = 0; i < nodeList.length; i++) {
      for (let j = i + 1; j < nodeList.length; j++) {
        const sim = cosineSimilarity(nodeList[i].memory.content, nodeList[j].memory.content)
        if (sim > THRESHOLD) {
          edgeList.push({ source: nodeList[i], target: nodeList[j], strength: sim })
        }
        // Same category = weak edge
        if (nodeList[i].memory.category === nodeList[j].memory.category && sim <= THRESHOLD) {
          edgeList.push({ source: nodeList[i], target: nodeList[j], strength: 0.05 })
        }
      }
    }

    setNodes(nodeList)
    setEdges(edgeList.slice(0, 80)) // limit edges for perf
  }, [memories, dimensions])

  if (memories.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
        No memories to display in graph
      </div>
    )
  }

  return (
    <div className="relative h-full w-full">
      <svg ref={svgRef} className="w-full h-full" style={{ minHeight: '400px' }}>
        <defs>
          {Object.entries(CAT_GLOW).map(([cat, color]) => (
            <filter key={cat} id={`glow-${cat}`} x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          ))}
        </defs>

        {/* Edges */}
        {edges.map((edge, i) => (
          <line
            key={i}
            x1={edge.source.x}
            y1={edge.source.y}
            x2={edge.target.x}
            y2={edge.target.y}
            stroke="rgba(255,255,255,0.06)"
            strokeWidth={edge.strength > 0.2 ? 1.5 : 0.5}
            strokeOpacity={edge.strength * 0.8}
          />
        ))}

        {/* Nodes */}
        {nodes.map((node, i) => {
          const color = CAT_GLOW[node.memory.category as MemoryCategory] ?? '#64748b'
          const isSelected = selectedNode?.id === node.id
          return (
            <g
              key={node.id}
              transform={`translate(${node.x},${node.y})`}
              className="cursor-pointer"
              onClick={() => setSelectedNode(isSelected ? null : node)}
            >
              {/* Glow ring */}
              {isSelected && (
                <circle
                  r={node.radius + 6}
                  fill="none"
                  stroke={color}
                  strokeWidth={2}
                  strokeOpacity={0.6}
                  className="animate-pulse"
                />
              )}
              {/* Node circle */}
              <circle
                r={node.radius}
                fill={color}
                fillOpacity={0.2}
                stroke={color}
                strokeWidth={isSelected ? 2 : 1}
                strokeOpacity={0.8}
                filter={`url(#glow-${node.memory.category})`}
              />
              {/* Category emoji */}
              <text
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={node.radius * 0.9}
                style={{ userSelect: 'none' }}
              >
                {CATEGORY_ICONS[node.memory.category as MemoryCategory]}
              </text>
            </g>
          )
        })}
      </svg>

      {/* Selected node info */}
      {selectedNode && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute bottom-4 left-4 right-4 glass rounded-xl p-4 border border-white/10"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className={`text-xs px-2 py-0.5 rounded-lg border capitalize ${CATEGORY_COLORS[selectedNode.memory.category].bg} ${CATEGORY_COLORS[selectedNode.memory.category].text} ${CATEGORY_COLORS[selectedNode.memory.category].border}`}>
                  {CATEGORY_ICONS[selectedNode.memory.category]} {selectedNode.memory.category}
                </span>
                <span className="text-xs text-muted-foreground font-mono">
                  {Math.round(selectedNode.memory.importanceScore * 100)}% importance
                </span>
              </div>
              <p className="text-sm text-foreground/90">{selectedNode.memory.content}</p>
            </div>
            <button
              onClick={() => setSelectedNode(null)}
              className="text-muted-foreground hover:text-foreground text-xs shrink-0"
            >
              ✕
            </button>
          </div>
        </motion.div>
      )}

      {/* Legend */}
      <div className="absolute top-4 right-4 flex flex-col gap-1.5">
        {([...new Set(nodes.map(n => n.memory.category))] as MemoryCategory[]).map(cat => (
          <div key={cat} className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <div
              className="w-2.5 h-2.5 rounded-full"
              style={{ background: CAT_GLOW[cat], opacity: 0.8 }}
            />
            <span className="capitalize">{cat}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
