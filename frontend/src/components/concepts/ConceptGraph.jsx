import { useEffect, useRef } from 'react'
import * as d3 from 'd3'

const TYPE_COLORS = {
  HYPOTHESIS:  ['#a855f7', '#7e22ce'], // Purple
  FINDING:     ['#3b82f6', '#1d4ed8'], // Blue
  TOPIC:       ['#10b981', '#047857'], // Emerald
  OBSERVATION: ['#f59e0b', '#b45309'], // Amber
}

export default function ConceptGraph({ nodes = [], links = [], onNodeClick, readOnly = false }) {
  const svgRef = useRef(null)
  const simRef = useRef(null)

  useEffect(() => {
    if (!svgRef.current || !nodes.length) return
    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()
    const { width, height } = svgRef.current.getBoundingClientRect()

    const defs = svg.append('defs')
    
    // Arrow marker
    defs.append('marker').attr('id','arrow').attr('viewBox','0 -5 10 10')
      .attr('refX', 28).attr('refY', 0).attr('markerWidth', 6).attr('markerHeight', 6)
      .attr('orient','auto').append('path').attr('d','M0,-5L10,0L0,5').attr('fill','#94a3b8')

    // Glow filter
    const filter = defs.append('filter').attr('id', 'glow').attr('x', '-50%').attr('y', '-50%').attr('width', '200%').attr('height', '200%')
    filter.append('feGaussianBlur').attr('stdDeviation', '3').attr('result', 'blur')
    filter.append('feComposite').attr('in', 'SourceGraphic').attr('in2', 'blur').attr('operator', 'over')

    // Gradients for each type
    Object.entries(TYPE_COLORS).forEach(([type, colors]) => {
      const grad = defs.append('radialGradient').attr('id', `grad-${type}`).attr('cx', '30%').attr('cy', '30%').attr('r', '70%')
      grad.append('stop').attr('offset', '0%').attr('stop-color', colors[0])
      grad.append('stop').attr('offset', '100%').attr('stop-color', colors[1])
    })

    const g = svg.append('g')
    const zoom = d3.zoom().scaleExtent([0.1, 4]).on('zoom', e => g.attr('transform', e.transform))
    svg.call(zoom)

    const nodeData = nodes.map(n => ({ ...n, x: width/2 + (Math.random()-.5)*400, y: height/2 + (Math.random()-.5)*400 }))
    const idMap = Object.fromEntries(nodeData.map(n => [n.id, n]))
    const linkData = (links || []).map(l => ({
      ...l,
      source: idMap[l.sourceNodeId || l.sourceId || l.source] || l.sourceNodeId || l.sourceId || l.source,
      target: idMap[l.targetNodeId || l.targetId || l.target] || l.targetNodeId || l.targetId || l.target,
    })).filter(l => l.source && l.target)

    simRef.current = d3.forceSimulation(nodeData)
      .force('link', d3.forceLink(linkData).id(d=>d.id).distance(180))
      .force('charge', d3.forceManyBody().strength(-600))
      .force('center', d3.forceCenter(width/2, height/2))
      .force('collision', d3.forceCollide(60))

    const linkGroup = g.append('g').attr('class', 'links')
    const nodeGroup = g.append('g').attr('class', 'nodes')

    // Links
    const link = linkGroup.selectAll('.link-container').data(linkData).join('g').attr('class', 'link-container')
    
    const linkLine = link.append('line')
      .attr('stroke', '#cbd5e1')
      .attr('stroke-width', 2)
      .attr('marker-end', 'url(#arrow)')
      .attr('stroke-dasharray', d => d.relationshipType ? '5,5' : 'none')
    
    const linkText = link.append('text')
      .attr('text-anchor', 'middle')
      .attr('font-size', '10')
      .attr('fill', '#94a3b8')
      .attr('font-family', 'Poppins, sans-serif')
      .attr('font-weight', '600')
      .text(d => d.relationshipType || d.type || '')

    // Nodes
    const node = nodeGroup.selectAll('.node').data(nodeData).join('g').attr('class', 'node')
      .attr('cursor', 'pointer')
      .call(d3.drag()
        .on('start', (e, d) => { if(!e.active) simRef.current.alphaTarget(0.3).restart(); d.fx = d.x; d.fy = d.y })
        .on('drag', (e, d) => { d.fx = e.x; d.fy = e.y })
        .on('end', (e, d) => { if(!e.active) simRef.current.alphaTarget(0); d.fx = null; d.fy = null })
      )
      .on('click', (_, d) => !readOnly && onNodeClick?.(d))
      .on('mouseenter', (e, d) => {
        // Highlighting neighbors
        const neighbors = new Set([d.id])
        linkData.forEach(l => {
          if (l.source.id === d.id) neighbors.add(l.target.id)
          if (l.target.id === d.id) neighbors.add(l.source.id)
        })

        node.transition().duration(200).style('opacity', n => neighbors.has(n.id) ? 1 : 0.15)
        link.transition().duration(200).style('opacity', l => l.source.id === d.id || l.target.id === d.id ? 1 : 0.05)
        
        d3.select(e.currentTarget).select('circle')
          .transition().duration(250)
          .attr('r', 24)
          .style('filter', 'url(#glow)')
      })
      .on('mouseleave', (e) => {
        node.transition().duration(200).style('opacity', 1)
        link.transition().duration(200).style('opacity', 1)
        d3.select(e.currentTarget).select('circle')
          .transition().duration(250)
          .attr('r', 20)
          .style('filter', null)
      })

    node.append('circle')
      .attr('r', 20)
      .attr('fill', d => `url(#grad-${d.type})`)
      .attr('stroke', '#fff')
      .attr('stroke-width', 2)
      .style('box-shadow', '0 4px 12px rgba(0,0,0,0.1)')

    const label = node.append('g').attr('transform', 'translate(0, 36)')
    
    label.append('rect')
      .attr('x', d => -((d.title || '').length * 3.5 + 8))
      .attr('y', -10)
      .attr('width', d => (d.title || '').length * 7 + 16)
      .attr('height', 20)
      .attr('rx', 10)
      .attr('fill', 'white')
      .attr('fill-opacity', 0.8)
      .attr('stroke', '#f1f5f9')
      .attr('stroke-width', 1)

    label.append('text')
      .attr('text-anchor', 'middle')
      .attr('fill', '#334155')
      .attr('font-size', '11')
      .attr('font-family', 'Poppins, sans-serif')
      .attr('font-weight', '600')
      .text(d => d.title || d.name || '')

    simRef.current.on('tick', () => {
      linkLine.attr('x1', d => d.source.x).attr('y1', d => d.source.y).attr('x2', d => d.target.x).attr('y2', d => d.target.y)
      linkText.attr('x', d => (d.source.x + d.target.x) / 2).attr('y', d => (d.source.y + d.target.y) / 2 - 8)
      node.attr('transform', d => `translate(${d.x},${d.y})`)
    })

    return () => simRef.current?.stop()
  }, [nodes.length, links.length])

  if (!nodes.length) return (
    <div className="flex items-center justify-center h-full text-slate-300">
      <p className="text-sm font-display">No concept nodes yet</p>
    </div>
  )
  return <svg ref={svgRef} className="w-full h-full" />
}

