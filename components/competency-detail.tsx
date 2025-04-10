/**
 * CompetencyDetail Component
 *
 * In a production environment, this component would fetch data from a database:
 * - Subject competencies would be fetched based on the subject ID
 * - Activities would be fetched based on the competency ID
 * - All data would be stored in a relational database with proper relationships:
 *   - Subjects have many Competencies
 *   - Competencies have many Activities
 *   - Students have completed/evaluated Activities
 *   - Competencies are stored per student, allowing activities from different subjects to reference the same competency
 *
 * The current implementation uses mock data for demonstration purposes.
 */
"use client"

import { useState, useEffect, useRef } from "react"
import { X, FileText, PenTool, BookOpen, Download, ChevronDown, ChevronRight, MessageSquare } from "lucide-react"
import { SubjectActivitiesTab } from "./subject-activities-tab"
import { useCompetencies, useActivities, useClassDistribution } from "@/hooks/use-data"
import { useStudent } from "@/contexts/student-context"

interface CompetencyDetailProps {
  subject: string
  percentage: number
  totalCompetencies: number
  achievedCompetencies: number
  onClose: () => void
  semester?: number
}

export function CompetencyDetail({
  subject,
  percentage,
  totalCompetencies,
  achievedCompetencies,
  onClose,
  semester,
}: CompetencyDetailProps) {
  const { selectedStudent, selectedClass } = useStudent()
  const [expandedCompetencies, setExpandedCompetencies] = useState<string[]>([])
  const [expandedNotes, setExpandedNotes] = useState<string | null>(null)
  const [hoveredBar, setHoveredBar] = useState<number | null>(null)
  const [activeTab, setActiveTab] = useState<"competencies" | "activities">("competencies")
  const modalRef = useRef<HTMLDivElement>(null)

  // Gebruik de data hooks om data op te halen
  const { competencies, loading: loadingCompetencies } = useCompetencies(selectedStudent, subject)
  const { activities, loading: loadingActivities } = useActivities(selectedStudent, subject, semester)
  const {
    distribution,
    studentBucket,
    loading: loadingDistribution,
  } = useClassDistribution(selectedClass, subject, semester || 1)

  // Add this useEffect hook to handle clicks outside the modal
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [onClose])

  // Sort competencies by status first (not-achieved, partially-achieved, achieved)
  // and then by ID for better organization
  const sortedCompetencies = [...(competencies || [])].sort((a, b) => {
    // First sort by status
    const statusOrder = {
      "not-achieved": 0,
      "partially-achieved": 1,
      achieved: 2,
    }

    const statusComparison = statusOrder[a.status] - statusOrder[b.status]

    // If status is the same, sort by ID
    if (statusComparison === 0) {
      // Extract numeric part from ID if possible
      const aId = a.id.match(/\d+/)?.[0] || a.id
      const bId = b.id.match(/\d+/)?.[0] || b.id
      return aId.localeCompare(bId)
    }

    return statusComparison
  })

  // Update the CompetencyDetail component to accurately display activity counts
  // Get all activities across all competencies, but filter to only include activities for this subject
  // and limit to a reasonable number (6-7 per subject)
  // const allActivities = competencies
  //   .flatMap((comp) =>
  //     comp.activities.filter(
  //       (activity) => activity.subjectId === subject && (semester ? activity.semester === semester : true),
  //     ),
  //   )
  //   .slice(0, 7)

  // Count exams separately
  // const examCount = allActivities.filter((a) => a.type === "examen").length
  // const regularActivities = allActivities.filter((a) => a.type !== "examen").length

  // Ensure the number of activities matches what we expect
  // useEffect(() => {
  //   if (allActivities.length !== activitiesCount) {
  //     console.warn(`Activity count mismatch: expected ${activitiesCount}, got ${allActivities.length}`)
  //   }
  // }, [allActivities.length, activitiesCount])

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

  const getPerformanceCategory = (score: number, maxScore: number) => {
    const percentage = (score / maxScore) * 100
    if (percentage < 50) return "Onvoldoende"
    if (percentage < 70) return "Goed"
    return "Uitstekend"
  }

  const getPerformanceColor = (category: string) => {
    switch (category) {
      case "Onvoldoende":
        return "bg-red-500"
      case "Goed":
        return "bg-amber-500"
      case "Uitstekend":
        return "bg-green-500"
      default:
        return "bg-gray-500"
    }
  }

  const getPerformanceRange = (category: string) => {
    switch (category) {
      case "Onvoldoende":
        return "2 - 7"
      case "Goed":
        return "10 - 13,5"
      case "Uitstekend":
        return "7 - 10"
      default:
        return ""
    }
  }

  const toggleCompetency = (competencyId: string) => {
    setExpandedCompetencies((prev) =>
      prev.includes(competencyId) ? prev.filter((id) => id !== competencyId) : [...prev, competencyId],
    )
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("nl-BE", { day: "2-digit", month: "2-digit", year: "numeric" })
  }

  return (
    <div
      ref={modalRef}
      className="bg-white dark:bg-gray-800 rounded-md shadow-lg overflow-hidden max-h-[90vh] flex flex-col w-full"
    >
      {/* Header */}
      <div className="p-4 flex items-center justify-between border-b border-gray-200 dark:border-gray-700 bg-green-100 dark:bg-green-900/20">
        <h2 className="text-xl font-medium text-gray-900 dark:text-gray-100">{subject}</h2>
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
            {activities.length} {activities.length === 1 ? "activiteit" : "activiteiten"}
            {activities.filter((a) => a.type === "examen").length > 0
              ? `, waarvan ${activities.filter((a) => a.type === "examen").length} ${activities.filter((a) => a.type === "examen").length === 1 ? "examen" : "examens"}`
              : ""}
            {semester ? ` in semester ${semester}` : ""}
          </span>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors duration-150"
            aria-label="Sluiten"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Toon loading state of data */}
      {loadingCompetencies || loadingActivities || loadingDistribution ? (
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-gray-100 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">Gegevens laden...</p>
        </div>
      ) : (
        <>
          {/* Distribution chart */}
          <div className="p-4 pb-0">
            <p className="text-center text-sm text-gray-600 dark:text-gray-300 mb-2">
              Positie ten opzichte van klasgroep
            </p>

            <div className="relative mb-1">
              <div className="h-16 flex items-end gap-0.5">
                {distribution?.map((value, index) => {
                  const maxValue = Math.max(...(distribution || []))
                  const heightPercentage = maxValue > 0 ? (value / maxValue) * 100 : 0
                  const scoreRange = `${index * 5}-${(index + 1) * 5}%`
                  const isStudentBar = index === studentBucket

                  return (
                    <div
                      key={index}
                      className={`flex-1 ${
                        isStudentBar ? "bg-green-500" : "bg-gray-300 dark:bg-gray-500"
                      } rounded-sm transition-all duration-150 cursor-pointer relative`}
                      style={{ height: `${heightPercentage}%` }}
                      onMouseEnter={() => setHoveredBar(index)}
                      onMouseLeave={() => setHoveredBar(null)}
                      title={`${scoreRange}: ${value} leerlingen`}
                    >
                      {hoveredBar === index && (
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 px-2 py-1 bg-black text-white text-xs rounded whitespace-nowrap z-10">
                          {scoreRange}: {value} leerlingen
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>

              {/* Color bar below chart */}
              <div className="h-2 w-full flex mt-1">
                <div className="bg-red-500 h-full" style={{ width: "50%" }}></div>
                <div className="bg-amber-500 h-full" style={{ width: "20%" }}></div>
                <div className="bg-green-500 h-full" style={{ width: "30%" }}></div>
              </div>

              {/* Percentage markers */}
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                <span>0%</span>
                <span>50%</span>
                <span>70%</span>
                <span>100%</span>
              </div>
            </div>
          </div>

          {/* Completion percentage */}
          <div className="px-4 pt-2 pb-4 text-center">
            <h3 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              {Math.round((achievedCompetencies / totalCompetencies) * 100)}% voltooid
            </h3>
            <p className="text-base text-gray-700 dark:text-gray-300">
              {achievedCompetencies} van de {totalCompetencies} competenties behaald
            </p>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-200 dark:border-gray-700">
            <button
              className={`px-4 py-2 text-sm font-medium ${
                activeTab === "competencies"
                  ? "border-b-2 border-green-500 text-green-600 dark:text-green-400"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
              onClick={() => setActiveTab("competencies")}
            >
              Competenties
            </button>
            <button
              className={`px-4 py-2 text-sm font-medium ${
                activeTab === "activities"
                  ? "border-b-2 border-green-500 text-green-600 dark:text-green-400"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
              onClick={() => setActiveTab("activities")}
            >
              Activiteiten ({activities.length})
            </button>
          </div>

          {/* Content based on active tab */}
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {activeTab === "competencies" ? (
              // Competencies list
              <div className="border-t border-gray-200 dark:border-gray-700">
                {sortedCompetencies.map((competency, index) => (
                  <div key={competency.id} className="border-b border-gray-200 dark:border-gray-700 last:border-b-0">
                    {/* Competency header */}
                    <div
                      className={`flex items-start p-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors duration-150 ${
                        competency.status === "not-achieved" ? "bg-red-50 dark:bg-red-900/10" : ""
                      }`}
                      onClick={() => toggleCompetency(competency.id)}
                    >
                      <div
                        className={`flex-shrink-0 mt-0.5 w-5 h-5 rounded-full flex items-center justify-center ${
                          competency.status === "not-achieved"
                            ? "bg-red-100 text-red-500"
                            : competency.status === "partially-achieved"
                              ? "bg-amber-100 text-amber-500"
                              : "bg-green-100 text-green-500"
                        }`}
                      >
                        {competency.status === "not-achieved" && <X className="h-3 w-3" />}
                        {competency.status === "partially-achieved" && <div className="w-2 h-0.5 bg-amber-500" />}
                        {competency.status === "achieved" && <div className="w-2 h-2 bg-green-500 rounded-full" />}
                      </div>

                      <div className="ml-3 flex-1">
                        <div className="flex items-start justify-between">
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-100 group-hover:text-gray-700 dark:group-hover:text-gray-300">
                            <span className="font-bold">{competency.id}</span> {competency.title}
                          </div>

                          <div className="flex items-center gap-2">
                            {competency.activities?.length > 0 && (
                              <div className="flex-shrink-0 bg-gray-100 dark:bg-gray-700 rounded-full w-6 h-6 flex items-center justify-center text-xs font-medium text-gray-700 dark:text-gray-300 group-hover:bg-gray-200 dark:group-hover:bg-gray-600 transition-colors duration-150">
                                {competency.activities.length}
                              </div>
                            )}

                            {expandedCompetencies.includes(competency.id) ? (
                              <ChevronDown className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                            ) : (
                              <ChevronRight className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Activities list (expanded) */}
                    {expandedCompetencies.includes(competency.id) && competency.activities?.length > 0 && (
                      <div className="px-3 pb-3">
                        <div className="space-y-6">
                          {competency.activities.map((activity, activityIndex) => {
                            // Determine performance category
                            const performanceCategory = getPerformanceCategory(activity.score, activity.maxScore)
                            const performanceColor = getPerformanceColor(performanceCategory)
                            const performanceRange = getPerformanceRange(performanceCategory)

                            // Determine student count based on category
                            let studentCount = 0
                            if (performanceCategory === "Onvoldoende") {
                              studentCount = activity.classDistribution.lowPerformers
                            } else if (performanceCategory === "Goed") {
                              studentCount = activity.classDistribution.mediumPerformers
                            } else {
                              studentCount = activity.classDistribution.highPerformers
                            }

                            return (
                              <div
                                key={activity.id}
                                className="bg-gray-50 dark:bg-gray-750 rounded-md p-3 hover:shadow-md transition-shadow duration-200 border border-transparent hover:border-gray-200 dark:hover:border-gray-600 relative"
                              >
                                {/* Activity number badge - moved to left side */}
                                <div className="absolute top-3 left-3 w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center text-xs font-medium text-gray-700 dark:text-gray-300">
                                  {activityIndex + 1}
                                </div>

                                <div className="flex items-start justify-between mb-2 pl-8">
                                  <div className="flex items-center gap-2">
                                    <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                                      {getActivityIcon(activity.type)}
                                    </div>
                                    <div>
                                      <div className="flex items-center">
                                        <span className="font-medium text-gray-700 dark:text-gray-300">
                                          {getActivityTypeLabel(activity.type)}
                                        </span>
                                      </div>
                                      <span className="text-sm text-gray-600 dark:text-gray-400">{activity.title}</span>
                                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                        Datum: {formatDate(activity.date)} | Semester {activity.semester}
                                      </div>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-2">
                                    <div className="text-right">
                                      <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Score</div>
                                      <div
                                        className={`text-lg font-bold ${
                                          activity.score / activity.maxScore < 0.5
                                            ? "text-red-500"
                                            : activity.score / activity.maxScore < 0.7
                                              ? "text-amber-500"
                                              : "text-green-500"
                                        }`}
                                      >
                                        {activity.score}/{activity.maxScore}
                                      </div>
                                    </div>

                                    {/* Performance indicator - vertical bar with category */}
                                    <div className="flex flex-col items-end ml-4">
                                      <div className="flex items-center">
                                        <div className={`w-1 h-16 ${performanceColor}`}></div>
                                        <div className="ml-1">
                                          <div
                                            className={`text-xs font-medium ${
                                              performanceCategory === "Onvoldoende"
                                                ? "text-red-500"
                                                : performanceCategory === "Goed"
                                                  ? "text-amber-500"
                                                  : "text-green-500"
                                            }`}
                                          >
                                            {performanceCategory}
                                          </div>
                                          <div className="text-xs text-gray-500 dark:text-gray-400">
                                            {performanceRange}
                                          </div>
                                          <div className="text-xs text-gray-500 dark:text-gray-400">
                                            {studentCount} studenten
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                {activity.evaluated && (
                                  <>
                                    {/* Progress bar */}
                                    <div className="relative h-2 bg-gray-200 dark:bg-gray-600 rounded-full mb-2 group overflow-hidden">
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

                                      {/* Personal average marker */}
                                      <div
                                        className="absolute top-0 bottom-0 w-0.5 bg-black dark:bg-white"
                                        style={{
                                          left: `${
                                            activity.relativePerformance === "onder"
                                              ? (activity.score / activity.maxScore) * 100 + 10
                                              : (activity.score / activity.maxScore) * 100 - 10
                                          }%`,
                                        }}
                                      />
                                    </div>

                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                      Situering: {getRelativePerformanceText(activity.relativePerformance)}
                                    </div>

                                    {/* Notes section */}
                                    {activity.notes && (
                                      <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-600">
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation()
                                            setExpandedNotes(expandedNotes === activity.id ? null : activity.id)
                                          }}
                                          className="flex items-center text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors duration-150"
                                        >
                                          <MessageSquare className="h-3 w-3 mr-1" />
                                          {expandedNotes === activity.id ? "Verberg notitie" : "Toon notitie"}
                                        </button>

                                        {expandedNotes === activity.id && (
                                          <div className="mt-1 text-xs text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 p-2 rounded">
                                            {activity.notes}
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  </>
                                )}

                                {!activity.evaluated && activity.completed && (
                                  <div className="text-xs text-amber-500 dark:text-amber-400">
                                    Afgelegd maar nog niet geëvalueerd
                                  </div>
                                )}

                                {!activity.completed && (
                                  <div className="text-xs text-gray-500 dark:text-gray-400">Nog niet afgelegd</div>
                                )}
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              // Activities tab
              <SubjectActivitiesTab
                subject={subject}
                activities={activities}
                semester={semester} // Pass the current semester from props instead of hardcoding
              />
            )}
          </div>
        </>
      )}

      {/* Download button */}
      <div className="p-3 border-t border-gray-200 dark:border-gray-700 flex justify-end">
        <button
          className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-white bg-blue-500 rounded-md hover:bg-blue-600 transition-colors duration-150"
          title="Download rapport"
        >
          <Download className="h-4 w-4" />
          <span>Download rapport</span>
        </button>
      </div>
    </div>
  )
}
