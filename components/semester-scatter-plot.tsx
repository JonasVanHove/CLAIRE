"use client"

import { useEffect, useRef } from "react"
import { Card } from "@/components/ui/card"
import { useUI } from "@/contexts/ui-context"

interface ScatterPlotProps {
  title: string
  data: {
    name: string
    score: number
    isCurrentStudent: boolean
  }[]
  className?: string
}

export function SemesterScatterPlot({ title, data, className = "" }: ScatterPlotProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { darkMode } = useUI()

  useEffect(() => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set up high-resolution canvas
    const dpr = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()

    // Set the canvas size for higher resolution
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr

    // Scale the context to ensure correct drawing operations
    ctx.scale(dpr, dpr)

    // Set the CSS size
    canvas.style.width = `${rect.width}px`
    canvas.style.height = `${rect.height}px`

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Set up dimensions
    const width = rect.width
    const height = rect.height
    const paddingX = 40 // Increased horizontal padding for labels
    const paddingTop = 15 // Reduced top padding
    const paddingBottom = 15 // Reduced bottom padding
    const plotWidth = width - paddingX * 2
    const plotHeight = height - paddingTop - paddingBottom

    // Draw y-axis labels
    ctx.fillStyle = darkMode ? "#a0a0a0" : "#666"
    ctx.font = "11px Inter" // Slightly larger font
    ctx.textAlign = "right"

    const yLabels = ["100", "80", "60", "40", "20"]
    const yStep = plotHeight / (yLabels.length - 1)

    yLabels.forEach((label, i) => {
      const y = paddingTop + i * yStep
      ctx.fillText(label, paddingX - 8, y + 3) // Increased spacing between labels and plot

      // Draw light horizontal grid lines
      ctx.strokeStyle = darkMode ? "#333333" : "#e5e5e5"
      ctx.beginPath()
      ctx.moveTo(paddingX, y)
      ctx.lineTo(width - paddingX - 15, y) // Make lines end 15px earlier on the right
      ctx.stroke()
    })

    // If no data, show placeholder dots
    if (!data || data.length === 0) {
      return
    }

    // Calculate x positions with a natural distribution
    const centerX = paddingX + plotWidth / 2
    const xSpread = plotWidth * 0.8 // Use 80% of the plot width for the spread

    // Sort data by score to ensure consistent positioning
    const sortedData = [...data].sort((a, b) => a.score - b.score)

    // Draw non-current student dots first
    sortedData.forEach((point, index) => {
      if (point.isCurrentStudent) return // Skip current student for now

      // Convert score to y position (100 at top, 0 at bottom)
      const yPos = paddingTop + plotHeight - (plotHeight * point.score) / 100

      // Create a bell curve-like distribution on x-axis
      // More dots in the middle, fewer at the edges
      const normalizedPos = (index / sortedData.length) * 2 - 1 // -1 to 1
      const xOffset = Math.sin(normalizedPos * Math.PI) * (xSpread / 2)
      const xPos = centerX + xOffset + (Math.random() * 4 - 2) // Add small random jitter

      // Draw the dot
      ctx.beginPath()
      ctx.arc(xPos, yPos, 3, 0, Math.PI * 2)

      // Vary the opacity slightly for visual interest
      const opacity = 0.7 + Math.random() * 0.3
      ctx.fillStyle = darkMode ? `rgba(100, 149, 237, ${opacity})` : `rgba(65, 105, 225, ${opacity})`
      ctx.fill()
    })

    // Now draw the current student dot on top
    const currentStudent = sortedData.find((point) => point.isCurrentStudent)
    if (currentStudent) {
      // Find the position of the current student in the sorted array
      const index = sortedData.findIndex((point) => point.isCurrentStudent)

      // Convert score to y position (100 at top, 0 at bottom)
      const yPos = paddingTop + plotHeight - (plotHeight * currentStudent.score) / 100

      // Create a bell curve-like distribution on x-axis
      const normalizedPos = (index / sortedData.length) * 2 - 1 // -1 to 1
      const xOffset = Math.sin(normalizedPos * Math.PI) * (xSpread / 2)
      const xPos = centerX + xOffset

      // Draw the current student dot
      ctx.beginPath()
      ctx.arc(xPos, yPos, 5, 0, Math.PI * 2)
      ctx.fillStyle = "#49454F" // Gebruik de gevraagde kleur
      ctx.fill()

      // Add a border to make it stand out more
      ctx.strokeStyle = darkMode ? "#333333" : "#ffffff"
      ctx.lineWidth = 1.5
      ctx.stroke()
    }
  }, [data, darkMode])

  return (
    <Card className="p-2 dark:bg-gray-800 dark:border-gray-700">
      <div className="text-xs font-medium mb-0.5 dark:text-gray-200 text-center">{title}</div>
      <div className="flex justify-center items-center">
        <canvas ref={canvasRef} width={320} height={120} className="w-[320px] h-[120px] max-w-full" />
      </div>
    </Card>
  )
}
