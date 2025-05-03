"use client"

import { useState, useMemo } from "react"
import { FileText, PenTool, BookOpen, MessageSquare, ChevronDown, ChevronRight } from "lucide-react"
import type { Activity } from "@/data/student-data"
import { useUI } from "@/contexts/ui-context"

interface SubjectActivitiesTabProps {
  subject: string
  activities: Activity[]
  isLoading: boolean
  semester?: number // Optional semester filter
}

// This component displays activities for a subject, typically 4-8 activities per semester
// The count should accurately reflect what's in the database and match the dashboard selection
export function SubjectActivitiesTab({ subject, activities, isLoading, semester }: SubjectActivitiesTabProps) {
  const [expandedNotes, setExpandedNotes] = useState<string | null>(null)
  const [expandedActivities, setExpandedActivities] = useState<string[]>([])
  const [showAllActivities, setShowAllActivities] = useState(false)
  const { language, hideNonCompleted } = useUI()

  // Add a new state for tracking the current sort method
  // Update the state type to include direction
  const [sortMethod, setSortMethod] = useState<{
    category: "date" | "performance" | "category" | "title"
    direction: "asc" | "desc"
  }>({ category: "date", direction: "desc" })

  // Update the sorting logic to handle different sort methods
  const sortedActivities = useMemo(() => {
    const activitiesToSort = [...activities] // Create a copy to avoid modifying the original array

    const filteredActivities = activitiesToSort.filter((activity) => {
      const matchesSubject = activity.subjectId === subject
      const matchesSemester = semester ? activity.semester === semester : true

      // Filter out non-completed or non-evaluated activities when hideNonCompleted is true
      const shouldShow = !hideNonCompleted || (activity.completed && activity.evaluated)

      return matchesSubject && matchesSemester && shouldShow
    })

    // Create a sorted array based on the current sort method
    let sorted: Activity[] = []

    switch (sortMethod.category) {
      case "date":
        sorted = filteredActivities.sort((a, b) => {
          const comparison = new Date(b.date).getTime() - new Date(a.date).getTime()
          return sortMethod.direction === "desc" ? comparison : -comparison
        })
        break
      case "performance":
        sorted = filteredActivities.sort((a, b) => {
          // Sort by score percentage
          const aPerformance = a.evaluated ? a.score / a.maxScore : -1
          const bPerformance = b.evaluated ? b.score / b.maxScore : -1
          const comparison = aPerformance - bPerformance
          return sortMethod.direction === "asc" ? comparison : -comparison
        })
        break
      case "category":
        // Sort by type (examen, toets, taak)
        sorted = filteredActivities.sort((a, b) => {
          const typeOrder = { examen: 1, toets: 2, taak: 3 }
          const comparison =
            (typeOrder[a.type as keyof typeof typeOrder] || 4) - (typeOrder[b.type as keyof typeof typeOrder] || 4)
          return sortMethod.direction === "asc" ? comparison : -comparison
        })
        break
      case "title":
        // Sort alphabetically by title
        sorted = filteredActivities.sort((a, b) => {
          const comparison = a.title.localeCompare(b.title)
          return sortMethod.direction === "asc" ? comparison : -comparison
        })
        break
      default:
        sorted = filteredActivities
    }

    return sorted
  }, [activities, subject, semester, sortMethod, hideNonCompleted])

  // Use the sorted activities directly
  const filteredActivities = sortedActivities

  // Count exams separately
  const examCount = filteredActivities.filter((a) => a.type === "examen").length
  const regularActivities = filteredActivities.filter((a) => a.type !== "examen").length

  // Determine how many activities to display
  const displayedActivities = filteredActivities

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "toets":
        return <PenTool className="h-4 w-4 text-amber-500" />
      case "taak":
        return <FileText className="h-4 w-4 text-green-500" />
      case "examen":
        return <BookOpen className="h-4 w-4 text-red-500" />
      default:
        return <FileText className="h-4 w-4 text-gray-500" />
    }
  }

  const getActivityTypeLabel = (type: string) => {
    switch (type) {
      case "toets":
        return language === "en" ? "Test" : "Toets"
      case "taak":
        return language === "en" ? "Assignment" : "Taak"
      case "examen":
        return language === "en" ? "Exam" : "Examen"
      default:
        return type.charAt(0).toUpperCase() + type.slice(1)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString(language === "en" ? "en-US" : "nl-BE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  }

  const getSemesterLabel = (semester: number) => {
    return language === "en" ? `Semester ${semester}` : `Semester ${semester}`
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
        return language === "en" ? "Below personal average" : "Onder persoonlijk gemiddelde"
      case "boven":
        return language === "en" ? "Above personal average" : "Boven persoonlijk gemiddelde"
      default:
        return language === "en" ? "Around personal average" : "Rond persoonlijk gemiddelde"
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

  // Add translations for sorting options
  const translations = {
    en: {
      activitiesFor: "Activities for",
      semester: "Semester",
      of: "of",
      activity: "activity",
      activities: "activities",
      including: "including",
      exam: "exam",
      exams: "exams",
      noActivitiesFound: "No activities found for",
      inSemester: "in semester",
      showMore: "Show all",
      showLess: "Show fewer activities",
      date: "Date",
      score: "Score",
      notEvaluated: "Not yet evaluated",
      notCompleted: "Not yet completed",
      classAverage: "Class average",
      hideNote: "Hide note",
      showNote: "Show note",
      competencies: "Competencies",
      sortBy: "Sort by",
      chronology: "Date",
      performance: "Performance",
      category: "Category",
      title: "Title",
      ascending: "Ascending",
      descending: "Descending",
    },
    nl: {
      activitiesFor: "Activiteiten voor",
      semester: "Semester",
      of: "van",
      activity: "activiteit",
      activities: "activiteiten",
      including: "inclusief",
      exam: "examens",
      exams: "examens",
      noActivitiesFound: "Geen activiteiten gevonden voor",
      inSemester: "in semester",
      showMore: "Toon alle",
      showLess: "Toon minder activiteiten",
      date: "Datum",
      score: "Score",
      notEvaluated: "Nog niet geëvalueerd",
      notCompleted: "Nog niet afgelegd",
      classAverage: "Klasgemiddelde",
      hideNote: "Verberg notitie",
      showNote: "Toon notitie",
      competencies: "Competenties",
      sortBy: "Sorteer op",
      chronology: "Datum",
      performance: "Prestatie",
      category: "Categorie",
      title: "Titel",
      ascending: "Oplopend",
      descending: "Aflopend",
    },
  }

  // Get translations based on current language
  const t = translations[language]

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  // Add the sorting UI to the component return
  return (
    <div className="p-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
          {t.activitiesFor} {subject}
          {semester ? ` - ${t.semester} ${semester}` : ""}
        </h3>

        <div className="flex items-center mt-2 md:mt-0">
          <span className="text-sm text-gray-500 dark:text-gray-400 mr-2">{t.sortBy}:</span>
          <div className="flex flex-wrap gap-1">
            {[
              { id: "date", label: t.chronology },
              { id: "performance", label: t.performance },
              { id: "category", label: t.category },
            ].map((option) => (
              <button
                key={option.id}
                onClick={() => {
                  setSortMethod((prev) => ({
                    category: option.id as "date" | "performance" | "category" | "title",
                    // If selecting the same category, toggle direction, otherwise default to desc
                    direction: prev.category === option.id ? (prev.direction === "asc" ? "desc" : "asc") : "desc",
                  }))
                }}
                className={`px-2 py-1 text-xs rounded-md transition-colors flex items-center gap-1 ${
                  sortMethod.category === option.id
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                }`}
              >
                {option.label}
                {sortMethod.category === option.id && (
                  <ChevronDown
                    className={`h-3 w-3 transition-transform ${sortMethod.direction === "asc" ? "rotate-180" : ""}`}
                  />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {filteredActivities.length === 0 ? (
        <div className="text-center text-gray-500 dark:text-gray-400 py-8">
          {hideNonCompleted
            ? language === "en"
              ? "No evaluated activities found. Try disabling the 'Hide non-evaluated' filter."
              : "Geen geëvalueerde activiteiten gevonden. Probeer het filter 'Verberg niet-geëvalueerde' uit te schakelen."
            : semester
              ? `${t.noActivitiesFound} ${subject} ${t.inSemester} ${semester}.`
              : `${t.noActivitiesFound} ${subject}.`}
        </div>
      ) : (
        <div className="space-y-2">
          {displayedActivities.map((activity, index) => (
            <div
              key={activity.id}
              className="bg-white dark:bg-gray-750 rounded-md p-2 shadow-sm border border-gray-200 dark:border-gray-700 relative"
            >
              {/* Activity number badge - moved to left side */}
              <div className="absolute top-2 left-2 w-5 h-5 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-xs font-medium text-gray-700 dark:text-gray-300">
                {index + 1}
              </div>

              <div className="flex items-start justify-between pl-6">
                <div className="flex items-start gap-2">
                  <div className="w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mt-1">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div>
                    <div className="flex items-center">
                      <span className="font-medium text-xs text-gray-700 dark:text-gray-300">
                        {getActivityTypeLabel(activity.type)}
                      </span>
                    </div>
                    <div className="text-sm text-gray-800 dark:text-gray-200 font-medium">{activity.title}</div>
                    <div className="flex flex-wrap gap-x-2 gap-y-0.5 mt-0.5 text-xs">
                      <div className="text-gray-500 dark:text-gray-400">
                        {t.date}: {formatDate(activity.date)}
                      </div>
                      <div className="text-gray-500 dark:text-gray-400">{getSemesterLabel(activity.semester)}</div>
                      <button
                        onClick={() => toggleActivityExpansion(activity.id)}
                        className="text-blue-500 dark:text-blue-400 hover:underline flex items-center gap-1"
                      >
                        <span>{t.competencies}:</span>
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
                  <div className="text-xs font-medium text-gray-700 dark:text-gray-300">{t.score}</div>
                  <div
                    className={`text-base font-bold ${
                      activity.evaluated ? getScoreColor(activity.score, activity.maxScore) : "text-gray-400"
                    }`}
                  >
                    {activity.evaluated
                      ? `${activity.score}/${activity.maxScore}`
                      : activity.completed
                        ? t.notEvaluated
                        : t.notCompleted}
                  </div>

                  {activity.evaluated && (
                    <div className="text-xs mt-1 text-gray-500 dark:text-gray-400">
                      {t.classAverage}: {activity.classDistribution.average.toFixed(1)}/{activity.maxScore}
                    </div>
                  )}
                </div>
              </div>

              {activity.evaluated && (
                <div className="mt-2 pl-6">
                  <div className="relative h-1 bg-gray-200 dark:bg-gray-600 rounded-full mb-1 w-1/2">
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

                  <div className="text-xs">
                    <div className={getRelativePerformanceColor(activity.relativePerformance)}>
                      {getRelativePerformanceText(activity.relativePerformance)}
                    </div>
                  </div>
                </div>
              )}

              {/* Expanded competency details */}
              {expandedActivities.includes(activity.id) && (
                <div className="mt-1 pt-1 border-t border-gray-200 dark:border-gray-600">
                  <div className="bg-gray-50 dark:bg-gray-700 p-1.5 rounded-md">
                    <h4 className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {language === "en" ? "Linked competencies" : "Gekoppelde competenties"}
                    </h4>

                    {/* In a real implementation, this would map over an array of competencies */}
                    {/* For now, we'll simulate having 1-3 competencies */}
                    {(() => {
                      // Mock data - in a real implementation, this would come from the activity
                      const mockCompetencies = [
                        {
                          id: activity.competencyId,
                          title: activity.competencyId.startsWith("COMP")
                            ? language === "en"
                              ? "Can analyze and solve complex problems"
                              : "Kan complexe problemen analyseren en oplossen"
                            : language === "en"
                              ? "Can apply mathematical techniques in physical contexts"
                              : "Kan wiskundige technieken toepassen in fysische contexten",
                        },
                      ]

                      // Add some mock additional competencies based on the activity ID to simulate variation
                      if (activity.id.includes("1") || activity.id.includes("3")) {
                        mockCompetencies.push({
                          id: "COMP-002",
                          title:
                            language === "en"
                              ? "Can communicate effectively in different contexts"
                              : "Kan effectief communiceren in verschillende contexten",
                        })
                      }

                      if (activity.id.includes("2") || activity.id.includes("5")) {
                        mockCompetencies.push({
                          id: "COMP-007",
                          title:
                            language === "en"
                              ? "Can think creatively and innovate"
                              : "Kan creatief denken en innoveren",
                        })
                      }

                      return mockCompetencies.length > 0 ? (
                        <ul className="space-y-2">
                          {mockCompetencies.map((comp, index) => (
                            <li key={comp.id} className="text-sm text-gray-600 dark:text-gray-300">
                              <div className="flex items-start gap-2">
                                <div className="font-medium min-w-[30px]">{index + 1}.</div>
                                <div>
                                  <span className="font-medium">{comp.id}</span> - {comp.title}
                                </div>
                              </div>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                          {language === "en"
                            ? "No competencies linked to this activity."
                            : "Geen competenties gekoppeld aan deze activiteit."}
                        </p>
                      )
                    })()}
                  </div>
                </div>
              )}

              {activity.notes && (
                <div className="mt-1 pt-1 border-t border-gray-200 dark:border-gray-600">
                  <button
                    onClick={() => setExpandedNotes(expandedNotes === activity.id ? null : activity.id)}
                    className="flex items-center text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                  >
                    <MessageSquare className="h-3 w-3 mr-1" />
                    {expandedNotes === activity.id ? t.hideNote : t.showNote}
                  </button>

                  {expandedNotes === activity.id && (
                    <div className="mt-1 text-xs text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 p-2 rounded">
                      {activity.notes}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
