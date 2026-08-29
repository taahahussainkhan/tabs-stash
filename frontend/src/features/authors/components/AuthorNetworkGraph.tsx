import { useRef, useState, useEffect } from 'react'
import type { AuthorWithBooks } from '../api/authorsApi'

interface GraphNode {
    id: string
    type: 'author' | 'book'
    label: string
    data: any
    x: number
    y: number
    vx: number
    vy: number
}

interface Link {
    source: number // index
    target: number // index
}

interface AuthorNetworkGraphProps {
    data: AuthorWithBooks[]
}

export function AuthorNetworkGraph({ data }: AuthorNetworkGraphProps) {
    const containerRef = useRef<SVGSVGElement>(null)
    const [dimensions, setDimensions] = useState({ width: 800, height: 600 })
    const [nodes, setNodes] = useState<GraphNode[]>([])
    const [links, setLinks] = useState<Link[]>([])
    const [hoveredNode, setHoveredNode] = useState<number | null>(null)

    // Process data into nodes and links
    useEffect(() => {
        if (!data || data.length === 0) return

        const nodesList: GraphNode[] = []
        const linksList: Link[] = []
        const bookNodeMap = new Map<string, number>() // public_id -> index

        // Create Nodes
        data.forEach(authorWithBooks => {
            const authorIndex = nodesList.length
            nodesList.push({
                id: `author-${authorWithBooks.author.id}`,
                type: 'author',
                label: authorWithBooks.author.name,
                data: authorWithBooks.author,
                x: Math.random() * dimensions.width,
                y: Math.random() * dimensions.height,
                vx: 0,
                vy: 0
            })

            authorWithBooks.books.forEach(book => {
                let bookIndex: number
                if (bookNodeMap.has(book.public_id)) {
                    bookIndex = bookNodeMap.get(book.public_id)!
                } else {
                    bookIndex = nodesList.length
                    nodesList.push({
                        id: `book-${book.public_id}`,
                        type: 'book',
                        label: book.title,
                        data: book,
                        x: Math.random() * dimensions.width,
                        y: Math.random() * dimensions.height,
                        vx: 0,
                        vy: 0
                    })
                    bookNodeMap.set(book.public_id, bookIndex)
                }
                linksList.push({ source: authorIndex, target: bookIndex })
            })
        })

        setNodes(nodesList)
        setLinks(linksList)
    }, [data, dimensions.width, dimensions.height])

    // Simple Force Simulation
    useEffect(() => {
        if (nodes.length === 0) return

        let animationFrame: number
        const simulation = () => {
            setNodes(prevNodes => {
                const newNodes = prevNodes.map(n => ({ ...n }))

                // Repulsion
                for (let i = 0; i < newNodes.length; i++) {
                    for (let j = i + 1; j < newNodes.length; j++) {
                        const dx = newNodes[i].x - newNodes[j].x
                        const dy = newNodes[i].y - newNodes[j].y
                        const distance = Math.sqrt(dx * dx + dy * dy) || 1
                        if (distance < 300) {
                            const force = (300 - distance) / 1000
                            const fx = (dx / distance) * force
                            const fy = (dy / distance) * force
                            newNodes[i].vx += fx
                            newNodes[i].vy += fy
                            newNodes[j].vx -= fx
                            newNodes[j].vy -= fy
                        }
                    }
                }

                // Attraction (links)
                links.forEach(link => {
                    const source = newNodes[link.source]
                    const target = newNodes[link.target]
                    const dx = source.x - target.x
                    const dy = source.y - target.y
                    const distance = Math.sqrt(dx * dx + dy * dy) || 1
                    const force = (distance - 150) / 500
                    const fx = (dx / distance) * force
                    const fy = (dy / distance) * force
                    source.vx -= fx
                    source.vy -= fy
                    target.vx += fx
                    target.vy += fy
                })

                // Center attraction
                newNodes.forEach(node => {
                    const dx = dimensions.width / 2 - node.x
                    const dy = dimensions.height / 2 - node.y
                    node.vx += dx * 0.001
                    node.vy += dy * 0.001

                    // Apply velocity
                    node.x += node.vx
                    node.y += node.vy

                    // Friction
                    node.vx *= 0.9
                    node.vy *= 0.9

                    // Bounds
                    node.x = Math.max(20, Math.min(dimensions.width - 20, node.x))
                    node.y = Math.max(20, Math.min(dimensions.height - 20, node.y))
                })

                return newNodes
            })
            animationFrame = requestAnimationFrame(simulation)
        }

        animationFrame = requestAnimationFrame(simulation)
        return () => cancelAnimationFrame(animationFrame)
    }, [links, dimensions.width, dimensions.height, nodes.length === 0])

    const handleResize = () => {
        if (containerRef.current) {
            setDimensions({
                width: containerRef.current.clientWidth,
                height: 600
            })
        }
    }

    useEffect(() => {
        handleResize()
        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [])

    return (
        <div className="w-full bg-surface/20 rounded-3xl border border-white/5 overflow-hidden backdrop-blur-xl group">
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-semibold text-content-primary">Author & Book Relationship Map</h3>
                    <p className="text-sm text-content-muted">Authors and their bibliography in an interactive network</p>
                </div>
                <div className="flex gap-4 text-xs">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-accent shadow-[0_0_8px_rgba(226,161,140,0.4)]" />
                        <span className="text-content-secondary">Author</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-white/60 shadow-[0_0_8px_rgba(255,255,255,0.2)]" />
                        <span className="text-content-secondary">Book</span>
                    </div>
                </div>
            </div>

            <div className="relative h-[600px]">
                <svg
                    ref={containerRef}
                    className="w-full h-full cursor-grab active:cursor-grabbing"
                    viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
                >
                    <defs>
                        <filter id="glow">
                            <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
                            <feMerge>
                                <feMergeNode in="coloredBlur" />
                                <feMergeNode in="SourceGraphic" />
                            </feMerge>
                        </filter>
                        <linearGradient id="line-grad" gradientUnits="userSpaceOnUse">
                            <stop offset="0%" stopColor="var(--accent-primary)" stopOpacity="0.2" />
                            <stop offset="100%" stopColor="var(--accent-primary)" stopOpacity="0.2" />
                        </linearGradient>
                    </defs>

                    {/* Links */}
                    {links.map((link, i) => {
                        const source = nodes[link.source]
                        const target = nodes[link.target]
                        if (!source || !target) return null

                        const isHighlighted = hoveredNode === link.source || hoveredNode === link.target

                        return (
                            <line
                                key={`link-${link.source}-${link.target}-${i}`}
                                x1={source.x}
                                y1={source.y}
                                x2={target.x}
                                y2={target.y}
                                stroke="currentColor"
                                strokeWidth={isHighlighted ? 1.5 : 0.5}
                                className={`${isHighlighted ? 'text-accent-primary opacity-40' : 'text-white/5'} transition-all duration-300`}
                            />
                        )
                    })}

                    {/* Nodes */}
                    {nodes.map((node, i) => {
                        const isHovered = hoveredNode === i
                        const isConnected = hoveredNode !== null && links.some(l =>
                            (l.source === i && l.target === hoveredNode) ||
                            (l.target === i && l.source === hoveredNode)
                        )

                        const opacity = hoveredNode === null || isHovered || isConnected ? 1 : 0.15
                        const isAuthor = node.type === 'author'

                        return (
                            <g
                                key={node.id}
                                transform={`translate(${node.x},${node.y})`}
                                onMouseEnter={() => setHoveredNode(i)}
                                onMouseLeave={() => setHoveredNode(null)}
                                className="cursor-pointer transition-opacity duration-300"
                                style={{ opacity }}
                            >
                                <circle
                                    r={isAuthor ? (isHovered ? 16 : 12) : (isHovered ? 8 : 5)}
                                    className={`${isAuthor ? 'fill-accent' : 'fill-white/70'} shadow-xl transition-all duration-300`}
                                    filter={isHovered ? 'url(#glow)' : ''}
                                />
                                {(isAuthor || isHovered || isConnected) && (
                                    <text
                                        dy={isAuthor ? 32 : 20}
                                        textAnchor="middle"
                                        className={`text-[10px] pointer-events-none font-medium transition-all duration-300 ${isAuthor ? (isHovered ? 'fill-accent scale-110' : 'fill-content-primary') : 'fill-content-secondary'}`}
                                    >
                                        {node.label}
                                    </text>
                                )}
                            </g>
                        )
                    })}
                </svg>

                {hoveredNode !== null && nodes[hoveredNode] && (
                    <div className="absolute bottom-6 right-6 p-4 bg-surface/80 backdrop-blur-md border border-white/10 rounded-2xl animate-in fade-in slide-in-from-bottom-2 max-w-xs transition-all">
                        {nodes[hoveredNode].type === 'author' ? (
                            <>
                                <h4 className="font-bold text-accent">{nodes[hoveredNode].label}</h4>
                                <div className="mt-2 space-y-1">
                                    <p className="text-xs text-content-secondary">
                                        Author of {links.filter(l => l.source === hoveredNode).length} books in catalog
                                    </p>
                                    <p className="text-[10px] text-content-muted italic">
                                        Connections: {links.filter(l => l.source === hoveredNode || l.target === hoveredNode).length}
                                    </p>
                                </div>
                            </>
                        ) : (
                            <>
                                <h4 className="font-bold text-white">{nodes[hoveredNode].label}</h4>
                                <div className="mt-2 space-y-1">
                                    <p className="text-xs text-content-secondary">
                                        By {links.filter(l => l.target === hoveredNode).map(l => nodes[l.source].label).join(', ')}
                                    </p>
                                    {nodes[hoveredNode].data.publish_year && (
                                        <p className="text-[10px] text-content-muted">
                                            Published: {nodes[hoveredNode].data.publish_year}
                                        </p>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}
