"use client"

import { useState } from "react"
import { X, FileText, BookOpen, PenTool, ArrowLeft, MessageSquare } from "lucide-react"
import type { Activity } from "@/data/student-data"
import { useUI } from "@/contexts/ui-context"

interface CompetencyActivityDetailProps {
  competencyId: string
  competencyTitle: string
  activities: Activity[]
  onBack: () => void
  onClose: () => void
}

export function CompetencyActivityDetail({
  competencyId,
  competencyTitle,
  activities,
  onBack,
  onClose,
}: CompetencyActivityDetailProps) {
  const [expandedNotes, setExpandedNotes] = useState<string | null>(null)
  const { hideNonCompleted } = useUI()

  // Sorteer activiteiten op datum (nieuwste eerst)
  const sortedActivities = Array.isArray(activities)
    ? [...activities].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    : []

  // Filter activities based on the hideNonCompleted setting
  const filteredActivities = hideNonCompleted
    ? sortedActivities.filter((activity) => activity.completed && activity.evaluated)
    : sortedActivities

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "toets":
        return <PenTool className="h-4 w-4 text-blue-500" />
      case "taak":
        return <FileText className="h-4 w-4 text-green-500" />
      case "examen":
        return <BookOpen className="h-4 w-4 text-red-500" />
      default:
        return <FileText className="h-4 w-4 text-gray-500" />
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("nl-BE", { day: "2-digit", month: "2-digit", year: "numeric" })
  }

  const getScoreColor = (score: number, maxScore: number) => {
    const percentage = (score / maxScore) * 100
    if (percentage < 50) return "text-red-500"
    if (percentage < 70) return "text-amber-500"
    return "text-green-500"
  }

  const getRelativePerformanceText = (performance: string) => {
    switch (performance) {
      case "onder":
        return "Onder persoonlijk gemiddelde"
      case "boven":
        return "Boven persoonlijk gemiddelde"
      default:
        return "Rond persoonlijk gemiddelde"
    }
  }

  const getRelativePerformanceColor = (performance: string) => {
    switch (performance) {
      case "onder":
        return "text-red-500"
      case "boven":
        return "text-green-500"
      default:
        return "text-gray-500"
    }
  }

  // Function to get activity type label
  const getActivityTypeLabel = (type: string) => {
    switch (type) {
      case "toets":
        return "TOETS"
      case "taak":
        return "TAAK"
      case "examen":
        return "EXAMEN"
      default:
        return type.toUpperCase()
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="relative">
        <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={onBack}
            className="p-1 rounded-full bg-white dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600"
            aria-label="Terug"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>

          <h3 className="font-medium text-gray-900 dark:text-gray-100 text-center flex-1 truncate px-2">
            {competencyId} {competencyTitle}
          </h3>

          <button
            onClick={onClose}
            className="p-1 rounded-full bg-white dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600"
            aria-label="Sluiten"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-3">
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-3">
            {!Array.isArray(activities) || activities.length === 0
              ? "Geen activiteiten gevonden voor deze competentie."
              : `${activities.length} activiteit${activities.length !== 1 ? "en" : ""} voor deze competentie:`}
            {hideNonCompleted && activities.length > filteredActivities.length && (
              <span className="ml-2 text-amber-500 dark:text-amber-400">
                (alleen afgeronde en geëvalueerde activiteiten worden getoond)
              </span>
            )}
          </div>

          <div className="space-y-4 max-h-[400px] overflow-y-auto">
            {filteredActivities.length === 0 ? (
              <div className="text-center text-gray-500 dark:text-gray-400 py-4">
                {hideNonCompleted
                  ? "Geen afgeronde en geëvalueerde activiteiten gevonden."
                  : "Geen activiteiten gevonden."}
              </div>
            ) : (
              filteredActivities.map((activity) => {
                // Determine if the activity is inactive (not completed or not evaluated)
                const isInactive = !activity.completed || !activity.evaluated

                return (
                  <div
                    key={activity.id}
                    className={`border rounded-md overflow-hidden ${
                      isInactive
                        ? "border-gray-300 dark:border-gray-600 opacity-75"
                        : "border-gray-300 dark:border-gray-700"
                    }`}
                  >
                    <div
                      className={`flex items-center justify-between p-2 ${
                        isInactive ? "bg-gray-100 dark:bg-gray-800" : "bg-gray-50 dark:bg-gray-700"
                      } border-b dark:border-gray-600`}
                    >
                      <div className="flex items-center gap-2">
                        {getActivityIcon(activity.type)}
                        <span className="font-medium text-xs uppercase text-gray-500 dark:text-gray-400 mr-1">
                          {getActivityTypeLabel(activity.type)}:
                        </span>
                        <span
                          className={`font-medium text-sm ${
                            isInactive ? "text-gray-500 dark:text-gray-400" : "text-gray-700 dark:text-gray-200"
                          }`}
                        >
                          {activity.title}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{formatDate(activity.date)}</div>
                    </div>

                    <div className={`p-3 ${isInactive ? "bg-gray-50 dark:bg-gray-800" : ""}`}>
                      {activity.evaluated ? (
                        <div className="flex flex-col gap-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600 dark:text-gray-300">Score:</span>
                            <span className={`font-medium ${getScoreColor(activity.score, activity.maxScore)}`}>
                              {activity.score}/{activity.maxScore}
                            </span>
                          </div>

                          <div className="h-2 w-full bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                            <div
                              className={`h-full ${activity.score / activity.maxScore < 0.5 ? "bg-red-500" : activity.score / activity.maxScore < 0.7 ? "bg-amber-500" : "bg-green-500"}`}
                              style={{ width: `${(activity.score / activity.maxScore) * 100}%` }}
                            />
                          </div>

                          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                            <span>Klas: {activity.classDistribution.min.toFixed(1)}</span>
                            <span>Gem: {activity.classDistribution.average.toFixed(1)}</span>
                            <span>Max: {activity.classDistribution.max.toFixed(1)}</span>
                          </div>

                          <div className={`text-xs mt-1 ${getRelativePerformanceColor(activity.relativePerformance)}`}>
                            {getRelativePerformanceText(activity.relativePerformance)}
                          </div>
                        </div>
                      ) : activity.completed ? (
                        <div className="text-sm text-amber-500 dark:text-amber-400">
                          Afgelegd maar nog niet geëvalueerd
                        </div>
                      ) : (
                        <div className="text-sm text-gray-500 dark:text-gray-400">Nog niet afgelegd</div>
                      )}

                      {activity.notes && (
                        <div className="mt-2">
                          <button
                            onClick={() => setExpandedNotes(expandedNotes === activity.id ? null : activity.id)}
                            className="flex items-center text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                          >
                            <MessageSquare className="h-3 w-3 mr-1" />
                            {expandedNotes === activity.id ? "Verberg notitie" : "Toon notitie"}
                          </button>

                          {expandedNotes === activity.id && (
                            <div className="mt-1 text-xs text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 p-2 rounded">
                              {activity.notes}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
