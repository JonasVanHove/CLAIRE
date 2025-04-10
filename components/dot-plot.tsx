"use client"

import { Card } from "@/components/ui/card"
import { useEffect, useRef } from "react"

interface DotPlotProps {
  title: string
}

export function DotPlot({ title }: DotPlotProps) {
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

    // Draw y-axis labels
    ctx.fillStyle = "#666"
    ctx.font = "12px Arial"
    ctx.textAlign = "right"

    const yLabels = ["100", "80", "60", "40", "20"]
    const yStep = (height - padding * 2) / (yLabels.length - 1)

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

    // Generate dot pattern data (simulating the image)
    const generateDotPattern = () => {
      const pattern = []
      const centerX = width / 2
      const centerY = height / 2
      const maxRadius = Math.min(width, height) / 3

      // Create a diamond-like pattern
      for (let y = -10; y <= 10; y++) {
        const rowWidth = 10 - Math.abs(y)
        for (let x = -rowWidth; x <= rowWidth; x++) {
          if (Math.random() > 0.2) {
            // Add some randomness
            pattern.push({
              x: centerX + x * 10,
              y: centerY + y * 10,
            })
          }
        }
      }

      return pattern
    }

    const dots = generateDotPattern()

    // Draw dots
    ctx.fillStyle = "#333"
    dots.forEach((dot) => {
      ctx.beginPath()
      ctx.arc(dot.x, dot.y, 3, 0, Math.PI * 2)
      ctx.fill()
    })
  }, [])

  return (
    <Card className="p-4">
      <div className="text-center font-medium mb-2">{title}</div>
      <canvas ref={canvasRef} width={300} height={200} className="w-full h-auto" />
    </Card>
  )
}
