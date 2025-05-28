// POC DotPlot component for a semester using D3.js-like logic, but in React
import React from "react"

type Dot = { x: number; y: number }

function generateDotPattern(): Dot[] {
  const dots: Dot[] = []
  for (let y = -10; y <= 10; y++) {
    const rowWidth = 10 - Math.abs(y)
    for (let x = -rowWidth; x <= rowWidth; x++) {
      if (Math.random() > 0.2) {
        dots.push({
          x: x,
          y: 50 + y * 2 + Math.random() * 10 - 5,
        })
      }
    }
  }
  return dots
}

export const PocDotPlot: React.FC<{ width?: number; height?: number }> = ({ width = 300, height = 200 }) => {
  const margin = { top: 20, right: 20, bottom: 30, left: 40 }
  const innerWidth = width - margin.left - margin.right
  const innerHeight = height - margin.top - margin.bottom
  const xScale = (x: number) => ((x + 10) / 20) * innerWidth
  const yScale = (y: number) => innerHeight - ((y - 0) / 100) * innerHeight
  const dots = React.useMemo(() => generateDotPattern(), [])

  return (
    <svg width={width} height={height} className="dot-plot">
      <g transform={`translate(${margin.left},${margin.top})`}>
        {/* Y axis grid lines */}
        {[20, 40, 60, 80, 100].map((tick) => (
          <g key={tick}>
            <line x1={0} x2={innerWidth} y1={yScale(tick)} y2={yScale(tick)} stroke="#ece6f0" strokeDasharray="2 2" />
            <text x={-8} y={yScale(tick) + 4} fontSize={12} fill="#49454f" textAnchor="end">{tick}</text>
          </g>
        ))}
        {/* Dots */}
        {dots.map((d, i) => (
          <circle
            key={i}
            cx={xScale(d.x)}
            cy={yScale(d.y)}
            r={3}
            fill="#49454f"
            opacity={0.8}
          />
        ))}
      </g>
    </svg>
  )
}
