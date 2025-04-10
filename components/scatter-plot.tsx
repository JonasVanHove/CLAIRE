"use client"

import { useEffect, useRef } from "react"

interface ScatterPlotProps {
  data: {
    score: number
    isCurrentStudent?: boolean
  }[]
  className?: string
}

export function ScatterPlot({ data, className = "" }: ScatterPlotProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Set up dimensions
    const width = canvas.width
    const height = canvas.height
    const padding = 40
    const plotWidth = width - padding * 2
    const plotHeight = height - padding * 2

    // Draw y-axis labels
    ctx.fillStyle = "#666"
    ctx.font = "12px Inter"
    ctx.textAlign = "right"

    const yLabels = ["100", "80", "60", "40", "20"]
    const yStep = plotHeight / (yLabels.length - 1)

    yLabels.forEach((label, i) => {
      const y = padding + i * yStep
      ctx.fillText(label, padding - 10, y + 4)

      // Draw light horizontal grid lines
      ctx.strokeStyle = "#e5e5e5"
      ctx.beginPath()
      ctx.moveTo(padding, y)
      ctx.lineTo(width - padding, y)
      ctx.stroke()
    })

    // If no data, show placeholder dots
    if (!data || data.length === 0) {
      // Generate some placeholder data
      const placeholderData = Array.from({ length: 40 }, () => ({
        score: Math.random() * 60 + 20, // Random score between 20 and 80
        isCurrentStudent: false,
      }))

      // Mark one as current student
      placeholderData[Math.floor(placeholderData.length / 2)].isCurrentStudent = true

      drawDots(placeholderData)
    } else {
      drawDots(data)
    }

    function drawDots(dotsData: { score: number; isCurrentStudent?: boolean }[]) {
      // Calculate x positions with a natural distribution
      const centerX = padding + plotWidth / 2
      const xSpread = plotWidth * 0.8 // Use 80% of the plot width for the spread

      dotsData.forEach((point, index) => {
        // Convert score to y position (100 at top, 0 at bottom)
        const yPos = padding + plotHeight - (plotHeight * point.score) / 100

        // Create a bell curve-like distribution on x-axis
        // More dots in the middle, fewer at the edges
        const normalizedPos = (index / dotsData.length) * 2 - 1 // -1 to 1
        const xOffset = Math.sin(normalizedPos * Math.PI) * (xSpread / 2)
        const xPos = centerX + xOffset + (Math.random() * 10 - 5) // Add small random jitter

        // Draw the dot
        ctx.beginPath()
        ctx.arc(xPos, yPos, point.isCurrentStudent ? 5 : 3, 0, Math.PI * 2)

        if (point.isCurrentStudent) {
          ctx.fillStyle = "#000"
        } else {
          // Vary the opacity slightly for visual interest
          const opacity = 0.7 + Math.random() * 0.3
          ctx.fillStyle = `rgba(102, 102, 102, ${opacity})`
        }

        ctx.fill()
      })
    }
  }, [data])

  return (
    <div className={className}>
      <canvas ref={canvasRef} width={500} height={300} className="w-full h-auto" />
    </div>
  )
}
