"use client"

import { Card } from "@/components/ui/card"
import { useUI } from "@/contexts/ui-context"
import { useState, useEffect, useRef } from "react"
import { CompetencyDetail } from "./competency-detail"
import { generateMockCompetencies } from "@/data/student-data"

interface SubjectCardProps {
  subject: string
  percentage: number
  competencies: string
  activities: number
  distribution: number[] // Array of values representing the class distribution
  studentBucket: number // The bucket where the student falls
  status?: "success" | "warning" | "danger"
  compact?: boolean
  isActive?: boolean
  className?: string
  semester?: number // Add semester parameter
}

export function SubjectCard({
  subject,
  percentage,
  competencies,
  activities,
  distribution,
  studentBucket,
  status = "success",
  compact = false,
  isActive = true,
  className = "",
  semester,
}: SubjectCardProps) {
  const { hideNonCompleted, showCharts, showWarnings } = useUI()
  const [isExpanded, setIsExpanded] = useState(false)
  const modalRef = useRef<HTMLDivElement>(null)

  // Parse competencies string (format: "17/21")
  const [achieved, total] = competencies.split("/").map(Number)

  // Close modal when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setIsExpanded(false)
      }
    }

    if (isExpanded) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isExpanded])

  // Als hideNonCompleted is ingeschakeld en de activiteiten zijn 0, verberg de kaart
  if (hideNonCompleted && activities === 0) {
    return null
  }

  // Als showWarnings is uitgeschakeld en de status is warning of danger, toon dan success
  const displayStatus = !showWarnings && (status === "warning" || status === "danger") ? "success" : status

  // Determine color based on status
  const getStatusColor = () => {
    switch (displayStatus) {
      case "danger":
        return "bg-red-500 dark:bg-red-500"
      case "warning":
        return "bg-amber-500 dark:bg-amber-500"
      default:
        return "bg-green-500 dark:bg-green-500"
    }
  }

  // Format percentage to match the screenshot (no decimal places)
  const formattedPercentage = Math.round(percentage) + "%"

  // Bepaal de achtergrondkleur op basis van status
  const getBgColor = () => {
    switch (displayStatus) {
      case "danger":
        return "bg-red-50 dark:bg-red-900/10"
      case "warning":
        return "bg-amber-50 dark:bg-amber-900/10"
      default:
        return "bg-green-50 dark:bg-green-900/10"
    }
  }

  // Bepaal de cursor op basis van isActive
  const cursorClass = isActive ? "cursor-pointer" : "cursor-default"

  // Functie om de kaart te openen, alleen als isActive true is
  const handleCardClick = () => {
    if (isActive) {
      setIsExpanded(true)
    }
  }

  return (
    <>
      <Card
        className={`overflow-hidden ${getBgColor()} border-gray-200 dark:border-gray-700 ${cursorClass} hover:shadow-md transition-shadow ${className}`}
        onClick={handleCardClick}
      >
        <div className="bg-white dark:bg-gray-800 mx-1 my-1 rounded-sm">
          <div className="flex justify-between items-center p-2 pb-1">
            <div className="font-medium text-gray-900 dark:text-gray-100">{subject}</div>
            <div className="font-medium text-gray-900 dark:text-gray-100">{Math.round((achieved / total) * 100)}%</div>
          </div>

          <div className="px-2 text-xs text-right text-gray-500 dark:text-gray-400 mb-1">
            {competencies} competenties
          </div>

          <div className="relative">
            {/* Kleurlijnen voor score categorieën */}
            <div className="absolute bottom-0 left-2 right-2 h-0.5 flex">
              <div className="bg-red-500 h-full flex-[10]"></div>
              <div className="bg-amber-500 h-full flex-[4]"></div>
              <div className="bg-green-500 h-full flex-[6]"></div>
            </div>

            {/* Staafdiagram - volledige klasweergave */}
            <div className="h-12 px-2 flex items-end gap-0.5">
              {distribution.map((value, index) => {
                // Calculate the maximum value in the distribution for proper scaling
                const maxValue = Math.max(...distribution)
                // Scale the height based on the maximum value to ensure full representation
                const heightPercentage = maxValue > 0 ? (value / maxValue) * 100 : 0

                return (
                  <div
                    key={index}
                    className={`flex-1 ${index === studentBucket ? getStatusColor() : "bg-gray-300 dark:bg-gray-600"} rounded-sm`}
                    style={{ height: `${heightPercentage}%` }}
                    title={`${index * 5}-${(index + 1) * 5}%: ${value} leerlingen`}
                  />
                )
              })}
            </div>
          </div>
        </div>

        <div className="px-2 text-xs text-gray-500 dark:text-gray-400 text-center leading-6 pb-0 mb-0">
          {activities} activiteiten
        </div>
      </Card>

      {isExpanded && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-5xl max-h-[90vh] overflow-hidden" ref={modalRef}>
            <CompetencyDetail
              subject={subject}
              percentage={percentage}
              competencies={generateMockCompetencies(subject)}
              totalCompetencies={total}
              achievedCompetencies={achieved}
              onClose={() => setIsExpanded(false)}
              distribution={distribution}
              studentBucket={studentBucket}
              activitiesCount={activities} // Pass the total activities count
              semester={semester} // Pass the semester number
            />
          </div>
        </div>
      )}
    </>
  )
}
