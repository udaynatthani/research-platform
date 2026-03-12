import { useEffect, useRef } from 'react'
import * as d3 from 'd3'

const TYPE_COLORS = {
  HYPOTHESIS:  '#9333ea',
  FINDING:     '#3b82f6',
  TOPIC:       '#22c55e',
  OBSERVATION: '#f97316',
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
    defs.append('marker').attr('id','arrow').attr('viewBox','0 -5 10 10')
      .attr('refX', 22).attr('refY', 0).attr('markerWidth', 6).attr('markerHeight', 6)
      .attr('orient','auto').append('path').attr('d','M0,-5L10,0L0,5').attr('fill','#94a3b8')
    const g = svg.append('g')
    svg.call(d3.zoom().scaleExtent([0.2,3]).on('zoom', e => g.attr('transform', e.transform)))
    const nodeData = nodes.map(n => ({ ...n, x: width/2 + (Math.random()-.5)*300, y: height/2 + (Math.random()-.5)*300 }))
    const idMap = Object.fromEntries(nodeData.map(n => [n.id, n]))
    const linkData = (links || []).map(l => ({
      ...l,
      source: idMap[l.sourceNodeId || l.sourceId || l.source] || l.sourceNodeId || l.sourceId || l.source,
      target: idMap[l.targetNodeId || l.targetId || l.target] || l.targetNodeId || l.targetId || l.target,
    })).filter(l => l.source && l.target)
    simRef.current = d3.forceSimulation(nodeData)
      .force('link', d3.forceLink(linkData).id(d=>d.id).distance(130))
      .force('charge', d3.forceManyBody().strength(-280))
      .force('center', d3.forceCenter(width/2, height/2))
      .force('collision', d3.forceCollide(36))
    const lineG = g.append('g')
    const line = lineG.selectAll('line').data(linkData).join('line')
      .attr('stroke','#94a3b8').attr('stroke-width',1.5).attr('marker-end','url(#arrow)')
    const lineLbl = lineG.selectAll('text').data(linkData).join('text')
      .attr('text-anchor','middle').attr('font-size','10').attr('fill','#64748b')
      .attr('font-family','DM Sans,sans-serif').text(d => d.relationshipType || d.type || '')
    const nodeG = g.append('g').selectAll('g').data(nodeData).join('g')
      .attr('cursor','pointer')
      .call(d3.drag()
        .on('start',(e,d)=>{ if(!e.active) simRef.current.alphaTarget(.3).restart(); d.fx=d.x; d.fy=d.y })
        .on('drag', (e,d)=>{ d.fx=e.x; d.fy=e.y })
        .on('end',  (e,d)=>{ if(!e.active) simRef.current.alphaTarget(0); d.fx=null; d.fy=null })
      )
      .on('click', (_,d) => !readOnly && onNodeClick?.(d))
    nodeG.append('circle').attr('r',18).attr('fill',d=>TYPE_COLORS[d.type]||'#64748b').attr('opacity',.85)
    nodeG.append('text').attr('dy',32).attr('text-anchor','middle').attr('fill','#374151')
      .attr('font-size','11').attr('font-family','DM Sans,sans-serif')
      .text(d=>(d.title||d.name||'').slice(0,18))
    simRef.current.on('tick', () => {
      line.attr('x1',d=>d.source.x).attr('y1',d=>d.source.y).attr('x2',d=>d.target.x).attr('y2',d=>d.target.y)
      lineLbl.attr('x',d=>(d.source.x+d.target.x)/2).attr('y',d=>(d.source.y+d.target.y)/2)
      nodeG.attr('transform',d=>`translate(${d.x},${d.y})`)
    })
    return () => simRef.current?.stop()
  }, [nodes.length, links.length])

  if (!nodes.length) return (
    <div className="flex items-center justify-center h-full text-slate-300">
      <p className="text-sm">No concept nodes yet</p>
    </div>
  )
  return <svg ref={svgRef} className="w-full h-full" />
}
