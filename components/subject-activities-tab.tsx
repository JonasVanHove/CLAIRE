"use client"

import { useState } from "react"
import { FileText, PenTool, BookOpen, MessageSquare, ChevronDown, ChevronRight } from "lucide-react"
import type { Activity } from "@/data/student-data"

interface SubjectActivitiesTabProps {
  subject: string
  activities: Activity[]
  semester?: number // Optional semester filter
}

// This component displays activities for a subject, typically 4-8 activities per semester
// The count should accurately reflect what's in the database and match the dashboard selection
export function SubjectActivitiesTab({ subject, activities, semester }: SubjectActivitiesTabProps) {
  const [expandedNotes, setExpandedNotes] = useState<string | null>(null)
  const [expandedActivities, setExpandedActivities] = useState<string[]>([])
  const [showAllActivities, setShowAllActivities] = useState(false)

  // Sort activities by date (newest first)
  const sortedActivities = [...activities].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  // Filter activities to ensure they belong to this subject and semester if specified
  const filteredActivities = sortedActivities.filter((activity) => {
    const matchesSubject = activity.subjectId === subject
    // Strict semester matching when semester is provided
    const matchesSemester = semester ? activity.semester === semester : true
    return matchesSubject && matchesSemester
  })

  // Count exams separately
  const examCount = filteredActivities.filter((a) => a.type === "examen").length
  const regularActivities = filteredActivities.filter((a) => a.type !== "examen").length

  // Determine how many activities to display
  const displayedActivities = showAllActivities ? filteredActivities : filteredActivities.slice(0, 6)

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "toets":
        return <PenTool className="h-5 w-5 text-amber-500" />
      case "taak":
        return <FileText className="h-5 w-5 text-green-500" />
      case "examen":
        return <BookOpen className="h-5 w-5 text-red-500" />
      default:
        return <FileText className="h-5 w-5 text-gray-500" />
    }
  }

  const getActivityTypeLabel = (type: string) => {
    switch (type) {
      case "toets":
        return "Toets"
      case "taak":
        return "Taak"
      case "examen":
        return "Examen"
      default:
        return type.charAt(0).toUpperCase() + type.slice(1)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("nl-BE", { day: "2-digit", month: "2-digit", year: "numeric" })
  }

  const getSemesterLabel = (semester: number) => {
    return `Semester ${semester}`
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

  const toggleActivityExpansion = (activityId: string) => {
    setExpandedActivities((prev) =>
      prev.includes(activityId) ? prev.filter((id) => id !== activityId) : [...prev, activityId],
    )
  }

  return (
    <div className="p-4">
      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
        Activiteiten voor {subject}
        {semester ? ` - Semester ${semester}` : ""}
        <span className="ml-2 text-sm font-normal text-gray-500 dark:text-gray-400">
          ({displayedActivities.length} van {filteredActivities.length}{" "}
          {filteredActivities.length === 1 ? "activiteit" : "activiteiten"}
          {examCount > 0 ? ` (inclusief ${examCount} ${examCount === 1 ? "examen" : "examens"})` : ""})
        </span>
      </h3>

      {filteredActivities.length === 0 ? (
        <div className="text-center text-gray-500 dark:text-gray-400 py-8">
          {semester
            ? `Geen activiteiten gevonden voor ${subject} in semester ${semester}.`
            : `Geen activiteiten gevonden voor ${subject}.`}
        </div>
      ) : (
        <div className="space-y-4">
          {displayedActivities.map((activity, index) => (
            <div
              key={activity.id}
              className="bg-white dark:bg-gray-750 rounded-md p-4 shadow-sm border border-gray-200 dark:border-gray-700 relative"
            >
              {/* Activity number badge - moved to left side */}
              <div className="absolute top-4 left-4 w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-sm font-medium text-gray-700 dark:text-gray-300">
                {index + 1}
              </div>

              <div className="flex items-start justify-between pl-10">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mt-1">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div>
                    <div className="flex items-center">
                      <span className="font-medium text-gray-700 dark:text-gray-300">
                        {getActivityTypeLabel(activity.type)}
                      </span>
                    </div>
                    <div className="text-base text-gray-800 dark:text-gray-200 font-medium">{activity.title}</div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-xs">
                      <div className="text-gray-500 dark:text-gray-400">Datum: {formatDate(activity.date)}</div>
                      <div className="text-gray-500 dark:text-gray-400">{getSemesterLabel(activity.semester)}</div>
                      <button
                        onClick={() => toggleActivityExpansion(activity.id)}
                        className="text-blue-500 dark:text-blue-400 hover:underline flex items-center gap-1"
                      >
                        <span>Competentie: {activity.competencyId}</span>
                        {expandedActivities.includes(activity.id) ? (
                          <ChevronDown className="h-3 w-3" />
                        ) : (
                          <ChevronRight className="h-3 w-3" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Score</div>
                  <div
                    className={`text-lg font-bold ${
                      activity.evaluated ? getScoreColor(activity.score, activity.maxScore) : "text-gray-400"
                    }`}
                  >
                    {activity.evaluated
                      ? `${activity.score}/${activity.maxScore}`
                      : activity.completed
                        ? "Nog niet geëvalueerd"
                        : "Niet afgelegd"}
                  </div>
                </div>
              </div>

              {activity.evaluated && (
                <div className="mt-3">
                  <div className="relative h-2 bg-gray-200 dark:bg-gray-600 rounded-full mb-2">
                    <div
                      className={`absolute h-full rounded-full ${
                        activity.score / activity.maxScore < 0.5
                          ? "bg-red-500"
                          : activity.score / activity.maxScore < 0.7
                            ? "bg-amber-500"
                            : "bg-green-500"
                      }`}
                      style={{ width: `${(activity.score / activity.maxScore) * 100}%` }}
                    />
                  </div>

                  <div className="flex justify-between text-xs">
                    <div className={getRelativePerformanceColor(activity.relativePerformance)}>
                      {getRelativePerformanceText(activity.relativePerformance)}
                    </div>
                    <div className="text-gray-500 dark:text-gray-400">
                      Klasgemiddelde: {activity.classDistribution.average.toFixed(1)}/{activity.maxScore}
                    </div>
                  </div>
                </div>
              )}

              {/* Expanded competency details */}
              {expandedActivities.includes(activity.id) && (
                <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                  <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-md">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Gekoppelde competentie
                    </h4>
                    <div className="text-sm text-gray-600 dark:text-gray-300">
                      <div className="flex items-start gap-2 mb-1">
                        <div className="font-medium min-w-[80px]">ID:</div>
                        <div>{activity.competencyId}</div>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="font-medium min-w-[80px]">Beschrijving:</div>
                        <div>
                          {/* This would come from the competency data in a real implementation */}
                          {activity.competencyId.startsWith("COMP")
                            ? "Globale competentie die in meerdere vakken wordt toegepast"
                            : "Vakspecifieke competentie voor " + subject}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activity.notes && (
                <div className="mt-3 pt-2 border-t border-gray-200 dark:border-gray-600">
                  <button
                    onClick={() => setExpandedNotes(expandedNotes === activity.id ? null : activity.id)}
                    className="flex items-center text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                  >
                    <MessageSquare className="h-3 w-3 mr-1" />
                    {expandedNotes === activity.id ? "Verberg notitie" : "Toon notitie"}
                  </button>

                  {expandedNotes === activity.id && (
                    <div className="mt-2 text-sm text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 p-3 rounded">
                      {activity.notes}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}

          {filteredActivities.length > 6 && (
            <div className="text-center mt-4">
              <button
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md text-sm font-medium transition-colors"
                onClick={() => setShowAllActivities(!showAllActivities)}
              >
                {showAllActivities ? "Toon minder activiteiten" : `Toon alle ${filteredActivities.length} activiteiten`}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
