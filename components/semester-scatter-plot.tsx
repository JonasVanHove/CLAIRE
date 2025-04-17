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
    const padding = 25
    const plotWidth = width - padding * 2
    const plotHeight = height - padding * 2

    // Define score range from 20 to 100
    const minScore = 20
    const maxScore = 100
    const scoreRange = maxScore - minScore

    // Define score buckets in steps of 10 (20-30, 30-40, etc.)
    const bucketSize = 10 // Each bucket is 10 points wide
    const numBuckets = scoreRange / bucketSize

    // Draw y-axis labels
    ctx.fillStyle = darkMode ? "#a0a0a0" : "#666"
    ctx.font = "10px Inter"
    ctx.textAlign = "right"

    // Draw labels at 20-point intervals
    for (let score = minScore; score <= maxScore; score += 20) {
      const normalizedScore = (score - minScore) / scoreRange
      const y = padding + plotHeight * (1 - normalizedScore)
      ctx.fillText(score.toString(), padding - 5, y + 3)

      // Draw light horizontal grid lines
      ctx.strokeStyle = darkMode ? "#333333" : "#e5e5e5"
      ctx.beginPath()
      ctx.moveTo(padding, y)
      ctx.lineTo(width - padding - 10, y)
      ctx.stroke()
    }

    // If no data or no selected student, draw empty chart with grid
    if (!data || data.length === 0 || !data.some((student) => student.isCurrentStudent)) {
      // Draw empty chart with grid only
      return
    }

    // Group students by score buckets
    const buckets = Array(numBuckets)
      .fill(0)
      .map(() => [])

    // Place each student in the appropriate bucket
    data.forEach((student) => {
      // Ensure score is within our range
      const clampedScore = Math.max(minScore, Math.min(maxScore, student.score))
      const bucketIndex = Math.floor((clampedScore - minScore) / bucketSize)
      if (bucketIndex >= 0 && bucketIndex < numBuckets) {
        buckets[bucketIndex].push(student)
      }
    })

    // Define the diamond pattern - how many dots should be in each row
    // This creates a diamond shape with more dots in the middle rows
    const dotCounts = [1, 2, 3, 5, 7, 8, 7, 5, 3, 2, 1] // Diamond pattern for 8 buckets

    // Calculate the dot size based on available space
    const dotSize = 6.5 // Significantly larger dots for better visibility
    const dotSpacing = 4 // Increased spacing to accommodate larger dots

    // Find which bucket contains the current student
    const currentStudentBucket = buckets.findIndex((bucket) => bucket.some((student) => student.isCurrentStudent))

    // Draw dots for each bucket
    buckets.forEach((bucket, bucketIndex) => {
      if (bucket.length === 0) return

      // Calculate y position for this bucket
      const bucketScore = minScore + bucketIndex * bucketSize + bucketSize / 2
      const normalizedScore = (bucketScore - minScore) / scoreRange
      const y = padding + plotHeight * (1 - normalizedScore)

      // Get ideal number of dots for this row in the diamond pattern
      const idealDotCount = dotCounts[Math.min(bucketIndex, dotCounts.length - 1)]

      // Determine how many dots to actually draw (either all students or max for diamond pattern)
      const dotsToShow = Math.min(bucket.length, idealDotCount)

      // Calculate total width needed for this row
      const rowWidth = dotsToShow * (dotSize * 2 + dotSpacing) - dotSpacing

      // Center the row
      const startX = width / 2 - rowWidth / 2

      // Highlight the entire bucket if it contains the selected student
      if (bucketIndex === currentStudentBucket) {
        // Draw a highlight background for this bucket
        ctx.fillStyle = darkMode ? "rgba(100, 150, 230, 0.2)" : "rgba(65, 105, 225, 0.15)"
        ctx.beginPath()
        ctx.rect(
          padding,
          y - (bucketSize * plotHeight) / scoreRange / 2,
          plotWidth,
          (bucketSize * plotHeight) / scoreRange,
        )
        ctx.fill()
      }

      // Draw non-current student dots first
      let currentStudentIndex = -1
      bucket.forEach((student, index) => {
        if (student.isCurrentStudent) {
          currentStudentIndex = index
          return // Skip current student for now
        }

        // Only draw up to the ideal dot count for this row
        if (index >= idealDotCount) return

        // Calculate x position with even spacing
        const xPos = startX + index * (dotSize * 2 + dotSpacing) + dotSize

        // Draw the dot
        ctx.beginPath()
        ctx.arc(xPos, y, dotSize, 0, Math.PI * 2)

        // Use accent color for other students
        ctx.fillStyle = darkMode ? `rgba(73, 69, 79, 0.9)` : `rgba(73, 69, 79, 0.9)`
        ctx.fill()
      })

      // Draw the current student if they're in this bucket
      if (currentStudentIndex !== -1 && currentStudentIndex < idealDotCount) {
        // Calculate x position with even spacing
        const xPos = startX + currentStudentIndex * (dotSize * 2 + dotSpacing) + dotSize

        // Draw the current student dot
        ctx.beginPath()
        ctx.arc(xPos, y, dotSize + 1.5, 0, Math.PI * 2)
        ctx.fillStyle = "#3b82f6" // Change to blue color
        ctx.fill()

        // Add a border to make it stand out more
        ctx.strokeStyle = darkMode ? "#333333" : "#ffffff"
        ctx.lineWidth = 1.5
        ctx.stroke()
      }
    })
  }, [data, darkMode])

  return (
    <Card className="p-2 dark:bg-gray-800 dark:border-gray-700">
      <div className="text-xs font-medium mb-1 dark:text-gray-200 text-center">{title}</div>
      <canvas ref={canvasRef} width={240} height={120} className="w-full h-auto max-w-full mx-auto" />
    </Card>
  )
}
