"use client"

import { useState, useEffect, useRef } from "react"
import { X, FileText, PenTool, BookOpen, ChevronDown, ChevronRight, FileX } from "lucide-react"
import type { Competency } from "@/data/student-data"
import { SubjectActivitiesTab } from "./subject-activities-tab"
import { useUI } from "@/contexts/ui-context"
import { api } from "@/services/api"
import { useStudent } from "@/contexts/student-context"
import type { Activity } from "@/data/student-data"

interface CompetencyDetailProps {
  subject: string
  percentage: number
  competencies: Competency[]
  totalCompetencies: number
  achievedCompetencies: number
  onClose: () => void
  distribution: number[]
  studentBucket: number
  activitiesCount: number
  semester?: number // Add semester parameter
}

export function CompetencyDetail({
  subject,
  percentage,
  competencies,
  totalCompetencies,
  achievedCompetencies,
  onClose,
  distribution,
  studentBucket,
  activitiesCount,
  semester,
}: CompetencyDetailProps) {
  const [expandedCompetencies, setExpandedCompetencies] = useState<string[]>([])
  const [expandedNotes, setExpandedNotes] = useState<string | null>(null)
  const [hoveredBar, setHoveredBar] = useState<number | null>(null)
  const [activeTab] = useState<"competencies" | "activities">("competencies")
  const modalRef = useRef<HTMLDivElement>(null)
  const { language } = useUI()

  // Update the CompetencyDetail component to use the API service for activities
  // Add this at the beginning of the component:
  const { selectedStudent } = useStudent()
  const [activities, setActivities] = useState<Activity[]>([])
  const [isLoadingActivities, setIsLoadingActivities] = useState(false)

  // Add a translation function for competency titles
  // This should be added near the beginning of the CompetencyDetail function component, after the existing variables
  const translateCompetencyTitle = (title: string) => {
    // Only translate if we're in Dutch mode and the title appears to be in English
    if (language === "nl") {
      // Common competency title translations
      const competencyTranslations: Record<string, string> = {
        "Competency 1 for": "Competentie 1 voor",
        "Competency 2 for": "Competentie 2 voor",
        "Competency 3 for": "Competentie 3 voor",
        "Competency 4 for": "Competentie 4 voor",
        "Competency 5 for": "Competentie 5 voor",
        "Can analyze and solve complex problems": "Kan complexe problemen analyseren en oplossen",
        "Can communicate effectively in different contexts": "Kan effectief communiceren in verschillende contexten",
        "Can think and evaluate critically": "Kan kritisch denken en evalueren",
        "Can work in a team": "Kan samenwerken in teamverband",
        "Can use technology effectively": "Kan technologie effectief gebruiken",
        "Can learn independently and reflect": "Kan zelfstandig leren en reflecteren",
        "Can think creatively and innovate": "Kan creatief denken en innoveren",
        "Can gather, analyze and interpret information": "Kan informatie verzamelen, analyseren en interpreteren",
        "Can reason and act ethically": "Kan ethisch redeneren en handelen",
        "Can plan and organize": "Kan plannen en organiseren",
      }

      // Check if we have a direct translation
      if (competencyTranslations[title]) {
        return competencyTranslations[title]
      }

      // Check for partial matches (for competency titles that include subject names)
      for (const [engPhrase, dutchPhrase] of Object.entries(competencyTranslations)) {
        if (title.includes(engPhrase)) {
          return title.replace(engPhrase, dutchPhrase)
        }
      }
    }

    // Return original title if no translation found or not in Dutch mode
    return title
  }

  // Add this function after the translateCompetencyTitle function
  const translateCompetencyId = (id: string) => {
    // Only translate if we're in Dutch mode
    if (language === "nl") {
      // Common ID prefixes that might need translation
      const idTranslations: Record<string, string> = {
        COMP: "COMP", // Keep the same
        C: "C", // Keep the same
        Competency: "Competentie",
        Comp: "Comp", // Keep the same
        Skill: "Vaardigheid",
        Knowledge: "Kennis",
        Attitude: "Houding",
      }

      // Check for direct matches with prefixes
      for (const [engPrefix, dutchPrefix] of Object.entries(idTranslations)) {
        if (id.startsWith(engPrefix)) {
          // Replace only the prefix part, keep numbers and other characters
          return id.replace(engPrefix, dutchPrefix)
        }
      }
    }

    // Return original ID if no translation needed or not in Dutch mode
    return id
  }

  // Fetch activities when the component mounts
  useEffect(() => {
    const fetchActivities = async () => {
      if (!selectedStudent || activeTab !== "activities") return

      setIsLoadingActivities(true)
      try {
        // Voeg semester parameter toe aan de API call
        const response = await api.getSubjectActivities(
          selectedStudent,
          subject,
          semester, // Voeg semester parameter toe
        )
        setActivities(response.activities)
      } catch (error) {
        console.error("Error fetching activities:", error)
      } finally {
        setIsLoadingActivities(false)
      }
    }

    fetchActivities()
  }, [selectedStudent, subject, semester, activeTab])

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

  // We no longer need this effect since we're fetching in the onClick handler
  // This prevents duplicate fetching
  useEffect(() => {
    // Only run on initial mount to set up activities if needed
    if (activeTab === "activities" && activities.length === 0 && !isLoadingActivities && selectedStudent) {
      setIsLoadingActivities(true)
      api
        .getSubjectActivities(selectedStudent, subject, semester)
        .then((response) => {
          // Only use activities from the database that match our parameters
          setActivities(
            response.activities.filter(
              (activity) => activity.subjectId === subject && (semester ? activity.semester === semester : true),
            ),
          )
        })
        .catch((error) => {
          console.error("Error fetching activities:", error)
        })
        .finally(() => {
          setIsLoadingActivities(false)
        })
    }
  }, [])

  // Sort competencies by status first (not-achieved, partially-achieved, achieved)
  // and then by ID for better organization
  const sortedCompetencies = [...competencies].sort((a, b) => {
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

  // For each competency, sort its activities by performance (worst to best)
  sortedCompetencies.forEach((competency) => {
    competency.activities.sort((a, b) => {
      const aPerformance = a.score / a.maxScore
      const bPerformance = b.score / b.maxScore
      return aPerformance - bPerformance // Sort from lowest to highest
    })
  })

  // Update the CompetencyDetail component to accurately display activity counts
  // Get all activities across all competencies, but filter to only include activities for this subject
  // and limit to a reasonable number (6-7 per subject)
  const allActivities = competencies
    .flatMap((comp) =>
      comp.activities.filter(
        (activity) => activity.subjectId === subject && (semester ? activity.semester === semester : true),
      ),
    )
    .slice(0, 7)

  // Count exams separately
  const examCount = allActivities.filter((a) => a.type === "examen").length
  const regularActivities = allActivities.filter((a) => a.type !== "examen").length

  // Ensure the number of activities matches what we expect
  useEffect(() => {
    if (allActivities.length !== activitiesCount) {
      console.warn(`Activity count mismatch: expected ${activitiesCount}, got ${allActivities.length}`)
    }
  }, [allActivities.length, activitiesCount])

  // Update the getActivityIcon function to accept the entire activity object instead of just the type
  const getActivityIcon = (activity: Activity) => {
    // Determine the color based on the activity's score
    let colorClass = "text-gray-500" // Default color

    if (activity.evaluated) {
      const scorePercentage = (activity.score / activity.maxScore) * 100
      if (scorePercentage < 50) {
        colorClass = "text-red-500"
      } else if (scorePercentage < 70) {
        colorClass = "text-amber-500"
      } else {
        colorClass = "text-green-500"
      }
    } else if (activity.completed) {
      colorClass = "text-amber-400" // For completed but not evaluated
    } else {
      colorClass = "text-gray-400" // For not completed
    }

    // Return the appropriate icon with the determined color
    switch (activity.type) {
      case "toets":
        return <PenTool className={`h-5 w-5 ${colorClass}`} />
      case "taak":
        return <FileText className={`h-5 w-5 ${colorClass}`} />
      case "examen":
        return <BookOpen className={`h-5 w-5 ${colorClass}`} />
      default:
        return <FileText className={`h-5 w-5 ${colorClass}`} />
    }
  }

  // Update the background color of the icon container to match the result
  const getIconBackgroundColor = (activity: Activity) => {
    if (!activity.evaluated) return "bg-gray-100 dark:bg-gray-700"

    const scorePercentage = (activity.score / activity.maxScore) * 100
    if (scorePercentage < 50) {
      return "bg-red-100 dark:bg-red-900/20"
    } else if (scorePercentage < 70) {
      return "bg-amber-100 dark:bg-amber-900/20"
    } else {
      return "bg-green-100 dark:bg-green-900/20"
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

  const getPerformanceCategory = (score: number, maxScore: number) => {
    const percentage = (score / maxScore) * 100
    if (percentage < 50) return language === "en" ? "Insufficient" : "Onvoldoende"
    if (percentage < 70) return language === "en" ? "Good" : "Goed"
    return language === "en" ? "Excellent" : "Uitstekend"
  }

  const getPerformanceColor = (category: string) => {
    switch (category) {
      case "Onvoldoende":
      case "Insufficient":
        return "bg-red-500"
      case "Goed":
      case "Good":
        return "bg-amber-500"
      case "Uitstekend":
      case "Excellent":
        return "bg-green-500"
      default:
        return "bg-gray-500"
    }
  }

  const getPerformanceRange = (category: string) => {
    switch (category) {
      case "Onvoldoende":
      case "Insufficient":
        return "2 - 7"
      case "Goed":
      case "Good":
        return "10 - 13,5"
      case "Uitstekend":
      case "Excellent":
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
    return date.toLocaleDateString(language === "en" ? "en-US" : "nl-BE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  }

  // Translations
  const translations = {
    en: {
      position: "Position relative to class group",
      completed: "completed",
      activities: "activities",
      ofWhich: "of which",
      exam: "exam",
      exams: "exams",
      inSemester: "in semester",
      competencies: "Competencies",
      activities: "Activities",
      students: "students",
      notAchieved: "Not achieved",
      partiallyAchieved: "Partially achieved",
      achieved: "Achieved",
      noActivities: "No activities found for this competency.",
      completedButNotEvaluated: "Completed but not yet evaluated",
      notCompleted: "Not yet completed",
      score: "Score",
      class: "Class",
      min: "Min",
      avg: "Avg",
      max: "Max",
      hideNote: "Hide note",
      showNote: "Show note",
      linkedCompetencies: "Linked competencies",
      noCompetenciesLinked: "No competencies linked to this activity.",
    },
    nl: {
      position: "Positie ten opzichte van klasgroep",
      completed: "voltooid",
      activities: "activiteiten",
      ofWhich: "waarvan",
      exam: "examen",
      exams: "examens",
      inSemester: "in semester",
      competencies: "Competenties",
      activities: "Activiteiten",
      students: "leerlingen",
      notAchieved: "Niet behaald",
      partiallyAchieved: "Gedeeltelijk behaald",
      achieved: "Behaald",
      noActivities: "Geen activiteiten gevonden voor deze competentie.",
      completedButNotEvaluated: "Afgelegd maar nog niet geëvalueerd",
      notCompleted: "Nog niet afgelegd",
      score: "Score",
      class: "Klas",
      min: "Gem",
      avg: "Gem",
      max: "Max",
      hideNote: "Verberg notitie",
      showNote: "Toon notitie",
      linkedCompetencies: "Gekoppelde competenties",
      noCompetentiesLinked: "Geen competenties gekoppeld aan deze activiteit.",
    },
  }

  // Get translations based on current language
  const t = translations[language]

  return (
    <div
      ref={modalRef}
      className="bg-white dark:bg-gray-800 rounded-md shadow-lg overflow-hidden max-h-[90vh] flex flex-col w-full"
    >
      {/* Header */}
      <div
        className={`py-2 px-4 flex items-center justify-between border-b border-gray-200 dark:border-gray-700 shadow-sm ${
          (achievedCompetencies / totalCompetencies) * 100 < 50
            ? "bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-900/30"
            : (achievedCompetencies / totalCompetencies) * 100 < 70
              ? "bg-gradient-to-r from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-900/30"
              : "bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-900/30"
        }`}
      >
        <h2
          className={`text-lg font-semibold px-2 py-0.5 rounded-md ${
            (achievedCompetencies / totalCompetencies) * 100 < 50
              ? "text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-900/20"
              : (achievedCompetencies / totalCompetencies) * 100 < 70
                ? "text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-900/20"
                : "text-green-700 dark:text-green-300 bg-green-50 dark:bg-green-900/20"
          }`}
        >
          {subject}
        </h2>
        <div className="flex items-center gap-3">
          <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
            {activitiesCount} {activitiesCount === 1 ? t.activities.slice(0, -1) : t.activities}
            {examCount > 0 ? `, ${t.ofWhich} ${examCount} ${examCount === 1 ? t.exam : t.exams}` : ""}
            {semester ? ` ${t.inSemester} ${semester}` : ""}
          </span>
          <button
            onClick={onClose}
            className="p-0.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors duration-150"
            aria-label="Sluiten"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Distribution chart */}
      <div className="p-4 pb-0">
        <p className="text-center text-sm text-gray-600 dark:text-gray-300 mb-2">{t.position}</p>

        <div className="relative mb-1">
          <div className="h-16 flex items-end gap-0.5">
            {distribution.map((value, index) => {
              const maxValue = Math.max(...distribution)
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
                  title={`${scoreRange}: ${value} ${t.students}`}
                >
                  {hoveredBar === index && (
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 px-2 py-1 bg-black text-white text-xs rounded whitespace-nowrap z-10">
                      {scoreRange}: {value} {t.students}
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
          {Math.round((achievedCompetencies / totalCompetencies) * 100)}% {t.completed}
        </h3>
        <p className="text-base text-gray-700 dark:text-gray-300">
          {achievedCompetencies} {language === "en" ? "of" : "van de"} {totalCompetencies}{" "}
          {language === "en" ? "competencies achieved" : "competenties behaald"}
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-700">
        <div className="px-4 py-2 text-sm font-medium border-b-2 border-green-500 text-green-600 dark:text-green-400">
          {t.competencies}
        </div>
      </div>

      {/* Content based on active tab */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {activeTab === "competencies" ? (
          // Competencies list
          <div className="border-t border-gray-200 dark:border-gray-700">
            {sortedCompetencies.length > 0 ? (
              sortedCompetencies.map((competency, index) => (
                <div key={competency.id} className="border-b border-gray-200 dark:border-gray-700 last:border-b-0">
                  {/* Competency header */}
                  <div
                    className={`flex items-start p-3 ${
                      competency.activities.length > 0
                        ? "cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-750"
                        : "cursor-default"
                    } transition-colors duration-150 ${
                      competency.status === "not-achieved" ? "bg-red-50 dark:bg-red-900/10" : ""
                    }`}
                    onClick={() => competency.activities.length > 0 && toggleCompetency(competency.id)}
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
                          <span className="font-bold">{translateCompetencyId(competency.id)}</span>{" "}
                          {translateCompetencyTitle(competency.title)}
                        </div>

                        <div className="flex items-center gap-2">
                          {competency.activities.length > 0 ? (
                            <div className="flex-shrink-0 bg-gray-100 dark:bg-gray-700 rounded-full w-6 h-6 flex items-center justify-center text-xs font-medium text-gray-700 dark:text-gray-300 group-hover:bg-gray-200 dark:group-hover:bg-gray-600 transition-colors duration-150">
                              {competency.activities.length}
                            </div>
                          ) : (
                            <div className="text-xs italic text-gray-500 dark:text-gray-400">
                              {language === "en" ? "No activities" : "Geen activiteiten"}
                            </div>
                          )}

                          {competency.activities.length > 0 ? (
                            expandedCompetencies.includes(competency.id) ? (
                              <ChevronDown className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                            ) : (
                              <ChevronRight className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                            )
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Activities list (expanded) */}
                  {expandedCompetencies.includes(competency.id) && competency.activities.length > 0 && (
                    <div className="px-3 pb-3 animate-in fade-in duration-200">
                      <div className="space-y-6">
                        {competency.activities
                          .slice()
                          .sort((a, b) => {
                            // Sort activities based on competency status
                            const aScore = a.score / a.maxScore
                            const bScore = b.score / b.maxScore

                            if (competency.status === "achieved") {
                              // For achieved competencies, show best activities first
                              return bScore - aScore
                            } else if (competency.status === "not-achieved") {
                              // For not-achieved competencies, show worst activities first
                              return aScore - bScore
                            } else {
                              // For partially-achieved, show activities around the threshold
                              const aDistanceFrom70 = Math.abs(aScore * 100 - 70)
                              const bDistanceFrom70 = Math.abs(bScore * 100 - 70)
                              return aDistanceFrom70 - bDistanceFrom70
                            }
                          })
                          .map((activity, activityIndex) => {
                            // Determine performance category
                            const performanceCategory = getPerformanceCategory(activity.score, activity.maxScore)
                            const performanceColor = getPerformanceColor(performanceCategory)
                            const performanceRange = getPerformanceRange(performanceCategory)

                            // Determine student count based on category
                            let studentCount = 0
                            if (performanceCategory === "Onvoldoende" || performanceCategory === "Insufficient") {
                              studentCount = activity.classDistribution.lowPerformers
                            } else if (performanceCategory === "Goed" || performanceCategory === "Good") {
                              studentCount = activity.classDistribution.mediumPerformers
                            } else {
                              studentCount = activity.classDistribution.highPerformers
                            }

                            // Determine if the activity is inactive (not completed or not evaluated)
                            const isInactive = !activity.completed || !activity.evaluated

                            return (
                              <div
                                key={activity.id}
                                className={`rounded-md p-2 hover:shadow-sm transition-shadow duration-200 border relative mb-2 ${
                                  isInactive
                                    ? "bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700 opacity-75"
                                    : "bg-gray-50 dark:bg-gray-750 border-transparent hover:border-gray-200 dark:hover:border-gray-600"
                                }`}
                              >
                                {/* Activity number badge - moved to left side and made smaller */}
                                <div className="absolute top-2 left-2 w-5 h-5 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center text-xs font-medium text-gray-700 dark:text-gray-300">
                                  {activityIndex + 1}
                                </div>

                                <div className="flex items-start justify-between mb-1 pl-6">
                                  <div className="flex items-center gap-1">
                                    <div
                                      className={`w-8 h-8 rounded-full ${getIconBackgroundColor(activity)} flex items-center justify-center`}
                                    >
                                      {getActivityIcon(activity)}
                                    </div>
                                    <div>
                                      <div className="flex items-center">
                                        <span className="font-medium text-xs text-gray-700 dark:text-gray-300">
                                          {getActivityTypeLabel(activity.type)}
                                        </span>
                                      </div>
                                      <span className="text-xs text-gray-600 dark:text-gray-400">{activity.title}</span>
                                      <div className="text-xs text-gray-500 dark:text-gray-400">
                                        {language === "en" ? "Date" : "Datum"}: {formatDate(activity.date)} |{" "}
                                        {language === "en" ? "Semester" : "Semester"} {activity.semester}
                                      </div>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-1">
                                    <div className="text-right">
                                      <div className="text-xs font-medium text-gray-700 dark:text-gray-300">
                                        {t.score}
                                      </div>
                                      <div
                                        className={`text-base font-bold ${
                                          !activity.evaluated
                                            ? "text-gray-500"
                                            : activity.score / activity.maxScore < 0.5
                                              ? "text-red-500"
                                              : activity.score / activity.maxScore < 0.7
                                                ? "text-amber-500"
                                                : "text-green-500"
                                        }`}
                                      >
                                        {activity.evaluated ? `${activity.score}/${activity.maxScore}` : "-"}
                                      </div>
                                    </div>

                                    {/* Performance indicator - simplified bar chart */}
                                    <div className="flex flex-col items-end ml-2">
                                      <div className="flex items-end h-8 gap-1">
                                        {/* Low performers bar (red) */}
                                        <div className="flex flex-col items-center">
                                          <div
                                            className="w-4 bg-red-500 rounded-t-sm"
                                            style={{
                                              height: `${Math.min(24, Math.max(5, activity.classDistribution.lowPerformers))}px`,
                                              opacity:
                                                performanceCategory === "Onvoldoende" ||
                                                performanceCategory === "Insufficient"
                                                  ? 1
                                                  : 0.5,
                                            }}
                                          ></div>
                                          {performanceCategory === "Onvoldoende" ||
                                          performanceCategory === "Insufficient" ? (
                                            <div className="w-0 h-0 border-l-3 border-r-3 border-t-3 border-t-black border-l-transparent border-r-transparent mt-0.5"></div>
                                          ) : null}
                                        </div>

                                        {/* Medium performers bar (amber) */}
                                        <div className="flex flex-col items-center">
                                          <div
                                            className="w-4 bg-amber-500 rounded-t-sm"
                                            style={{
                                              height: `${Math.min(24, Math.max(5, activity.classDistribution.mediumPerformers))}px`,
                                              opacity:
                                                performanceCategory === "Goed" || performanceCategory === "Good"
                                                  ? 1
                                                  : 0.5,
                                            }}
                                          ></div>
                                          {performanceCategory === "Goed" || performanceCategory === "Good" ? (
                                            <div className="w-0 h-0 border-l-3 border-r-3 border-t-3 border-t-black border-l-transparent border-r-transparent mt-0.5"></div>
                                          ) : null}
                                        </div>

                                        {/* High performers bar (green) */}
                                        <div className="flex flex-col items-center">
                                          <div
                                            className="w-4 bg-green-500 rounded-t-sm"
                                            style={{
                                              height: `${Math.min(24, Math.max(5, activity.classDistribution.highPerformers))}px`,
                                              opacity:
                                                performanceCategory === "Uitstekend" ||
                                                performanceCategory === "Excellent"
                                                  ? 1
                                                  : 0.5,
                                            }}
                                          ></div>
                                          {performanceCategory === "Uitstekend" ||
                                          performanceCategory === "Excellent" ? (
                                            <div className="w-0 h-0 border-l-3 border-r-3 border-t-3 border-t-black border-l-transparent border-r-transparent mt-0.5"></div>
                                          ) : null}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                {activity.evaluated ? (
                                  <>
                                    {/* Progress bar */}
                                    <div className="relative h-1.5 bg-gray-200 dark:bg-gray-600 rounded-full mb-1 group overflow-hidden">
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
                                      {getRelativePerformanceText(activity.relativePerformance)}
                                    </div>
                                  </>
                                ) : null}

                                {!activity.evaluated && activity.completed && (
                                  <div className="text-xs text-amber-500 dark:text-amber-400 mt-1">
                                    {t.completedButNotEvaluated}
                                  </div>
                                )}

                                {!activity.completed && (
                                  <div className="text-xs text-gray-500 dark:text-gray-400">{t.notCompleted}</div>
                                )}
                              </div>
                            )
                          })}
                      </div>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="p-6 text-center h-64 flex flex-col items-center justify-center">
                <div className="mb-4 text-gray-500 dark:text-gray-400">
                  <FileX className="mx-auto h-16 w-16" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                  {language === "en"
                    ? "No competencies found for this subject"
                    : "Geen competenties gevonden voor dit vak"}
                </h3>
              </div>
            )}
          </div>
        ) : (
          // Activities tab
          <SubjectActivitiesTab
            subject={subject}
            activities={activities}
            isLoading={isLoadingActivities}
            semester={semester} // Voeg semester parameter toe
          />
        )}
      </div>
    </div>
  )
}
