"use client"

import { SubjectCard } from "@/components/subject-card"
import { ProgressHeader } from "@/components/progress-header"
import { StudentSelector } from "@/components/student-selector"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChevronDown, User, FileText, Calendar, CheckCircle2, XCircle, AlertTriangle } from "lucide-react"
import { SemesterScatterPlot } from "@/components/semester-scatter-plot"
import { useStudent } from "@/contexts/student-context"
import { useMemo, useState, useRef, useEffect } from "react"
import {
  getStudentData,
  isStudentAtRisk,
  getAtRiskReason,
  getStudentCompetencyIssues,
  getStudentProfileImage,
  getClassDistributionForSubject,
  getStudentAttendance,
  getStudentIndividualGoal,
  getTotalCompetencies,
  getStudentSemesterData,
} from "@/data/student-data"
import { UIProvider, useUI } from "@/contexts/ui-context"
import { SettingsMenu } from "@/components/settings-menu"
import Image from "next/image"
import { Progress } from "@/components/ui/progress"
import { InfoPopup } from "@/components/info-popup"
// Add the import for the API service at the top of the file
import { api } from "@/services/api"

export default function Dashboard() {
  return (
    <UIProvider>
      <DashboardContent />
    </UIProvider>
  )
}

// Add translations object inside the DashboardContent component
function DashboardContent() {
  const { selectedStudent, selectedClass } = useStudent()
  const [showNotes, setShowProfile] = useState(false)
  const [showProfile, setShowNotes] = useState(false)
  const { compactView, darkMode, language } = useUI()
  const [activeSemester, setActiveSemester] = useState<string>("semester1")
  const profileRef = useRef<HTMLDivElement>(null)
  const notesRef = useRef<HTMLDivElement>(null)

  // Add a state for the threshold value - default to 85%
  const [attendanceThreshold, setAttendanceThreshold] = useState(85)
  // Add a state for the individual goal - default to the value from the data
  const [individualGoal, setIndividualGoal] = useState(() => getStudentIndividualGoal(selectedStudent))
  const [isSaving, setIsSaving] = useState(false)
  const [isSavingGoal, setIsSavingGoal] = useState(false)
  const thresholdInputRef = useRef<HTMLInputElement>(null)
  const goalInputRef = useRef<HTMLInputElement>(null)

  // State for tracking if student is above their average
  const [isAboveAverage, setIsAboveAverage] = useState(false)

  // Get the competency percentage
  const { achieved, total } = getTotalCompetencies(selectedStudent)
  const percentage = (achieved / total) * 100

  // Add translations
  const translations = {
    en: {
      noStudentSelected: "No student selected",
      selectStudent: "Select a student using the search field above to view semester data.",
      positioning: "Positioning relative to fellow students",
      positioningFrom: "Positioning relative to fellow students from",
      eachDot: "Each dot represents a student.",
      coloredDot: "The colored dot is",
      semester: "Semester",
      clickTab: "Click on the tab above to view this semester",
      profile: "Profile of",
      notes: "Notes for",
      noNotes: "No notes found for this student.",
      withinTarget: "Within target",
      attendance: "Attendance",
      meetsThreshold: "meets the threshold",
      goodAttendance: "The student has good attendance and meets the minimum requirements.",
      authorized: "Authorized",
      unauthorized: "Unauthorized",
      attentionPoints: "Attention points",
      attendanceBelow: "Attendance is below the threshold",
      studentMustAttend: "The student needs better attendance to meet the minimum requirements.",
      criticalAttendance: "The student has critically low attendance that requires urgent attention.",
      competencyIssues: "Competency issues:",
      needsGuidance: "This student needs extra guidance.",
      status: "Status",
      passed: "Passed",
      evaluationNeeded: "Evaluation needed",
      statusCalculation: "Status calculation:",
      competencies: "Competencies",
      goal: "goal",
      personalAverage: "Personal average",
      passedStatus:
        'The "Passed" status is awarded when the student meets all criteria: competency goal, attendance threshold, and personal average.',
      individualGoalExplanation:
        'The individual goal is tailored to the student\'s capabilities and progress. Students are considered "at risk" when they perform below their personal goal.',
      mainSubjects: "Main subjects",
      enrolledSince: "Enrolled since",
      schoolYears: "School years",
      grade: "Grade",
      year: "year",
      attendanceThreshold: "Attendance:",
      save: "Save",
      saving: "Saving...",
      enterValidValue: "Enter a valid value between 50 and 100",
      thresholdSaved: "Attendance threshold saved!",
      errorSaving: "An error occurred while saving",
      minimumAttendance: "Minimum attendance percentage for students",
      individualGoal: "Individual goal:",
      personalGoal: "Personal goal for this student",
      schoolYear: "School year",
    },
    nl: {
      noStudentSelected: "Geen leerling geselecteerd",
      selectStudent: "Selecteer een leerling via het zoekveld bovenaan om de semestergegevens te bekijken.",
      positioning: "Positionering ten opzichte van medestudenten",
      positioningFrom: "Positionering ten opzichte van medestudenten uit",
      eachDot: "Elke stip vertegenwoordigt een student.",
      coloredDot: "De gekleurde stip is",
      semester: "Semester",
      clickTab: "Klik op de tab hierboven om dit semester te bekijken",
      profile: "Profiel van",
      notes: "Notities voor",
      noNotes: "Geen notities gevonden voor deze leerling.",
      withinTarget: "Binnen doelstelling",
      attendance: "Aanwezigheid",
      meetsThreshold: "voldoet aan de grenswaarde",
      goodAttendance: "De leerling heeft een goede aanwezigheidsgraad en voldoet aan de minimumvereisten.",
      authorized: "Gewettigd",
      unauthorized: "Ongewettigd",
      attentionPoints: "Aandachtspunten",
      attendanceBelow: "Aanwezigheid is onder de grenswaarde",
      studentMustAttend: "De leerling moet beter aanwezig zijn om aan de minimumvereisten te voldoen.",
      criticalAttendance: "De leerling heeft een kritisch lage aanwezigheid die dringend aandacht vereist.",
      competencyIssues: "Competentie-issues:",
      needsGuidance: "Deze leerling heeft extra begeleiding nodig.",
      status: "Status",
      passed: "Geslaagd",
      evaluationNeeded: "Evaluatie nodig",
      statusCalculation: "Status berekening:",
      competencies: "Competenties",
      goal: "doel",
      personalAverage: "Persoonlijk gemiddelde",
      passedStatus:
        'De status "Geslaagd" wordt toegekend wanneer de leerling voldoet aan alle criteria: competentiedoelstelling, aanwezigheidsgrenswaarde en persoonlijk gemiddelde.',
      individualGoalExplanation:
        'De individuele doelstelling is afgestemd op de capaciteiten en vooruitgang van de leerling. Leerlingen worden als "at risk" beschouwd wanneer ze onder hun persoonlijke doelstelling presteren.',
      mainSubjects: "Hoofdvakken",
      enrolledSince: "Ingeschreven sinds",
      schoolJaren: "Schooljaren",
      grade: "Graad",
      year: "jaar",
      attendanceThreshold: "Aanwezigheid:",
      save: "Opslaan",
      saving: "Opslaan...",
      enterValidValue: "Voer een geldige waarde in tussen 50 en 100",
      thresholdSaved: "Aanwezigheid grenswaarde opgeslagen!",
      errorSaving: "Er is een fout opgetreden bij het opslaan",
      minimumAttendance: "Minimale percentage aanwezigheid voor de leerlingen",
      individualGoal: "Individuele doelstelling:",
      personalGoal: "Persoonlijke doelstelling voor deze leerling",
      schoolYear: "Schooljaar",
    },
  }

  // Get translations based on current language
  const t = translations[language]

  // Near the beginning of the DashboardContent component, add this check
  useEffect(() => {
    // If no student is selected, show a message or prompt to select a student
    if (!selectedStudent) {
      // You could set a default view or show a message
      // For now, we'll just let the UI handle the empty state
    }
  }, [selectedStudent])

  // Calculate if student is above their average
  useEffect(() => {
    // Bereken het gemiddelde van de vorige semesters
    const semester1Data = getStudentSemesterData(selectedStudent, 1)
    const semester2Data = getStudentSemesterData(selectedStudent, 2)
    const semester3Data = getStudentSemesterData(selectedStudent, 3)

    // Bereken gemiddelde scores per semester
    const getAverageScore = (data: any[]) => {
      if (data.length === 0) return 0
      const sum = data.reduce((acc, item) => acc + item.result.score.raw, 0)
      return sum / data.length
    }

    const avg1 = getAverageScore(semester1Data)
    const avg2 = getAverageScore(semester2Data)
    const avg3 = getAverageScore(semester3Data)

    // Bereken het gemiddelde van alle semesters
    const overallAvg = (avg1 + avg2 + avg3) / 3

    // Bepaal of de huidige score rond of boven het gemiddelde ligt
    // We beschouwen 'rond het gemiddelde' als binnen 5% van het gemiddelde
    const scoreDeviation = Math.abs(percentage - overallAvg)
    const isWithinAverage = scoreDeviation <= 5 || percentage >= overallAvg
    setIsAboveAverage(isWithinAverage)
  }, [selectedStudent, percentage])

  // Close popups when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfile(false)
      }
      if (notesRef.current && !notesRef.current.contains(event.target as Node)) {
        setShowNotes(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  // Update individual goal when selected student changes
  useEffect(() => {
    setIndividualGoal(getStudentIndividualGoal(selectedStudent))
  }, [selectedStudent])

  // Replace the semesterScores useMemo with API calls
  const [semester1Data, setSemester1Data] = useState([])
  const [semester2Data, setSemester2Data] = useState([])
  const [semester3Data, setSemester3Data] = useState([])

  useEffect(() => {
    if (selectedStudent && selectedClass) {
      // Fetch data for all three semesters
      const fetchSemesterData = async () => {
        try {
          const [sem1, sem2, sem3] = await Promise.all([
            api.getSemesterScores(selectedClass, 1, selectedStudent),
            api.getSemesterScores(selectedClass, 2, selectedStudent),
            api.getSemesterScores(selectedClass, 3, selectedStudent),
          ])

          setSemester1Data(sem1.scores)
          setSemester2Data(sem2.scores)
          setSemester3Data(sem3.scores)
        } catch (error) {
          console.error("Error fetching semester scores:", error)
        }
      }

      fetchSemesterData()
    }
  }, [selectedStudent, selectedClass])

  const semesterScores = useMemo(() => {
    return [semester1Data, semester2Data, semester3Data]
  }, [semester1Data, semester2Data, semester3Data])

  // Get student's subject data
  const studentData = useMemo(() => {
    return getStudentData(selectedStudent)
  }, [selectedStudent])

  // Get consistent attendance data
  const attendanceData = useMemo(() => {
    return getStudentAttendance(selectedStudent)
  }, [selectedStudent])

  // Organize subject data by semester
  const semesterSubjects = useMemo(() => {
    const result = {
      1: [] as any[],
      2: [] as any[],
      3: [] as any[],
    }

    studentData.forEach((statement) => {
      const semester = statement.object.definition.semester
      const subject = statement.object.definition.name.nl
      const studentScore = statement.result.score.raw

      if (semester >= 1 && semester <= 3) {
        // Get the class distribution for this subject
        const { distribution, studentBucket } = getClassDistributionForSubject(
          selectedClass,
          subject,
          semester,
          studentScore,
        )

        result[semester].push({
          subject: subject,
          percentage: studentScore,
          competencies: `${statement.result.competencies?.achieved || 0}/${statement.result.competencies?.total || 0}`,
          activities: statement.result.activities || 0,
          distribution: distribution,
          studentBucket: studentBucket,
          status: studentScore < 50 ? "danger" : studentScore < 70 ? "warning" : "success",
        })
      }
    })

    return result
  }, [studentData, selectedClass])

  // Get main subjects for the student
  const mainSubjects = useMemo(() => {
    const subjects = ["Wiskunde", "Nederlands", "Frans", "Engels"]
    const result: { subject: string; score: number; status: string; competencies: string }[] = []

    subjects.forEach((subjectName) => {
      const subjectData = studentData.find(
        (s) => s.object.definition.name.nl === subjectName && s.object.definition.semester === 3, // Get the most recent semester
      )

      if (subjectData) {
        const score = subjectData.result.score.raw
        const competencies = subjectData.result.competencies
          ? `${subjectData.result.competencies.achieved}/${subjectData.result.competencies.total}`
          : "0/0"

        result.push({
          subject: subjectName,
          score,
          competencies,
          status: score < 50 ? "danger" : score < 70 ? "warning" : "success",
        })
      }
    })

    return result
  }, [studentData])

  // Voeg deze functie toe voor het bepalen van de ingeschreven jaren
  const getEnrollmentYears = (studentName: string) => {
    // In een echte applicatie zou dit uit de database komen
    // Voor nu simuleren we dit met wat logica

    // Bepaal het huidige schooljaar (bijv. 2023-2024)
    const currentYear = 2023

    // Bepaal in welk jaar de student zit (3STEM = 3e jaar)
    const currentGrade = Number.parseInt(selectedClass.charAt(0)) || 3

    // Bereken wanneer de student begonnen is
    const startYear = currentYear - (currentGrade - 1)

    // Genereer de jaren waarin de student ingeschreven was
    const years = []
    for (let i = 0; i < currentGrade; i++) {
      const year = startYear + i
      years.push(`${year}-${year + 1}`)
    }

    // Bepaal de graad
    let grade
    if (currentGrade <= 2) {
      grade = 1
    } else if (currentGrade <= 4) {
      grade = 2
    } else {
      grade = 3
    }

    return {
      years,
      grade,
      currentGrade,
    }
  }

  // Voeg deze regel toe aan het profiel gedeelte, na de Calendar regel
  const enrollmentInfo = getEnrollmentYears(selectedStudent)

  // Haal de profielafbeelding op
  const profileImage = getStudentProfileImage(selectedStudent)

  // Haal de competentie-issues op
  const competencyIssues = getStudentCompetencyIssues(selectedStudent)

  // Render een semester with its subjects
  const renderSemester = (semesterNum: number, isActive: boolean) => {
    // Each subject shown here belongs to this specific semester
    // This relationship is defined in the database and cannot be changed
    const subjects = semesterSubjects[semesterNum]

    return (
      <div
        className={`border rounded-md flex-1 dark:bg-gray-800 dark:border-gray-700 relative p-3 ${
          !isActive ? "opacity-60 pointer-events-none select-none" : ""
        }`}
        data-semester={semesterNum}
        style={{
          height: "calc(100vh - 300px)", // Responsive height based on viewport
          maxHeight: "600px", // Maximum height
          overflow: "hidden", // Hide overflow for the container
        }}
      >
        {!isActive && (
          <div className="absolute inset-0 flex items-center justify-center z-10 bg-gray-100/30 dark:bg-gray-900/30">
            <div className="bg-white dark:bg-gray-800 px-4 py-2 rounded-md shadow-md text-center">
              <p className="text-gray-700 dark:text-gray-300 font-medium">{t.clickTab}</p>
            </div>
          </div>
        )}
        <div
          className={`grid grid-cols-1 md:grid-cols-2 gap-3 custom-scrollbar`}
          style={{
            height: "100%",
            overflowY: "auto", // Enable vertical scrolling
            paddingRight: "8px", // Add some padding for the scrollbar
          }}
        >
          {subjects.map((subject, index) => (
            <SubjectCard
              key={index}
              subject={subject.subject}
              percentage={subject.percentage}
              competencies={subject.competencies}
              activities={subject.activities}
              distribution={subject.distribution}
              studentBucket={subject.studentBucket}
              status={subject.status}
              isActive={isActive}
              compact={false}
              className="h-48" // Make cards taller
              semester={semesterNum} // Pass the semester number
            />
          ))}
        </div>
      </div>
    )
  }

  // Replace the handleSaveAttendanceThreshold function with API call
  const handleSaveAttendanceThreshold = async () => {
    if (!thresholdInputRef.current) return

    const newThreshold = Number.parseInt(thresholdInputRef.current.value)
    if (isNaN(newThreshold) || newThreshold < 50 || newThreshold > 100) {
      alert(t.enterValidValue)
      return
    }

    setIsSaving(true)

    try {
      // Use the API service to update the attendance threshold
      const result = await api.updateAttendanceThreshold(selectedStudent, newThreshold)

      if (result.success) {
        // Update local state after successful save
        setAttendanceThreshold(newThreshold)

        // Show success message
        alert(t.thresholdSaved)
      } else {
        throw new Error("Failed to save threshold")
      }
    } catch (error) {
      console.error("Error saving threshold:", error)
      alert(t.errorSaving)
    } finally {
      setIsSaving(false)
    }
  }

  // Replace the handleSaveIndividualGoal function with API call
  const handleSaveIndividualGoal = async () => {
    if (!goalInputRef.current) return

    const newGoal = Number.parseInt(goalInputRef.current.value)
    if (isNaN(newGoal) || newGoal < 50 || newGoal > 100) {
      alert(t.enterValidValue)
      return
    }

    setIsSavingGoal(true)

    try {
      // Use the API service to update the individual goal
      const result = await api.updateIndividualGoal(selectedStudent, newGoal)

      if (result.success) {
        // Update local state after successful save
        setIndividualGoal(newGoal)

        // Show success message
        alert(t.personalGoal + "!")
      } else {
        throw new Error("Failed to save goal")
      }
    } catch (error) {
      console.error("Error saving goal:", error)
      alert(t.errorSaving)
    } finally {
      setIsSavingGoal(false)
    }
  }

  return (
    <div className="h-screen overflow-hidden bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 flex flex-col">
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 py-2 px-4 flex items-center justify-between">
        <div className="flex items-center gap-4 flex-1">
          <StudentSelector />

          <div className="relative" ref={profileRef}>
            <button
              className={`p-2 rounded-md ${
                selectedStudent
                  ? "hover:bg-gray-100 dark:hover:bg-gray-700 text-[#49454F] dark:text-gray-300"
                  : "text-gray-300 dark:text-gray-600 cursor-not-allowed"
              }`}
              onClick={() => selectedStudent && setShowProfile(!showProfile)}
              aria-label="Toon profiel"
              disabled={!selectedStudent}
            >
              <User className="h-5 w-5" />
            </button>

            {showProfile && selectedStudent && (
              <div className="absolute left-0 mt-2 w-[500px] bg-white dark:bg-gray-800 rounded-md shadow-lg z-50 border border-gray-200 dark:border-gray-700">
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                      {t.profile} {selectedStudent}
                    </h2>
                    <button
                      className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
                      onClick={() => setShowProfile(false)}
                    >
                      ×
                    </button>
                  </div>

                  <div className="flex flex-col gap-4">
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 rounded-full overflow-hidden flex-shrink-0">
                        <Image
                          src={profileImage || "/placeholder.svg"}
                          alt={selectedStudent}
                          width={64}
                          height={64}
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-md font-medium text-gray-900 dark:text-gray-100">{selectedStudent}</h3>
                          {isStudentAtRisk(selectedStudent) && (
                            <div className="relative group">
                              <AlertTriangle className="h-4 w-4 text-amber-500" />
                              <div className="absolute left-0 top-full mt-1 w-64 p-2 bg-black text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity z-50">
                                {getAtRiskReason(selectedStudent)}
                              </div>
                            </div>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{selectedClass}</p>
                        <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 mb-1">
                          <Calendar className="h-4 w-4" />
                          <span>{t.schoolYear} 2023-2024</span>
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          <p>
                            {t.grade} {enrollmentInfo.grade} | {enrollmentInfo.currentGrade}e {t.year}
                          </p>
                          <p className="text-xs mt-1">
                            {t.enrolledSince} {enrollmentInfo.years[0]}
                          </p>
                          <p className="text-xs mt-1">
                            {t.schoolYears}: {enrollmentInfo.years.join(", ")}
                          </p>
                        </div>

                        {/* Aanwezigheid grenswaarde instelling */}
                        <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                          <div className="flex items-center justify-between">
                            <label
                              htmlFor="attendance-threshold"
                              className="text-xs font-medium text-gray-700 dark:text-gray-300"
                            >
                              {t.attendanceThreshold}
                            </label>
                            <div className="flex items-center gap-2">
                              <div className="flex items-center">
                                <input
                                  id="attendance-threshold"
                                  type="number"
                                  min="50"
                                  max="100"
                                  ref={thresholdInputRef}
                                  defaultValue={attendanceThreshold}
                                  className="w-16 h-7 px-2 text-xs border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700 dark:text-gray-200"
                                />
                                <span className="ml-1 text-xs text-gray-500 dark:text-gray-400">%</span>
                              </div>
                              <button
                                className={`px-2 py-1 text-xs ${isSaving ? "bg-gray-400" : "bg-green-500 hover:bg-green-600"} text-white rounded flex items-center gap-1`}
                                disabled={isSaving}
                                onClick={handleSaveAttendanceThreshold}
                              >
                                {isSaving ? (
                                  <>
                                    <svg
                                      className="animate-spin -ml-1 mr-2 h-3 w-3 text-white"
                                      xmlns="http://www.w3.org/2000/svg"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                    >
                                      <circle
                                        className="opacity-25"
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                      ></circle>
                                      <path
                                        className="opacity-75"
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                      ></path>
                                    </svg>
                                    {t.saving}
                                  </>
                                ) : (
                                  t.save
                                )}
                              </button>
                            </div>
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{t.minimumAttendance}</p>
                        </div>

                        {/* Individuele doelstelling instelling */}
                        <div className="mt-4 pt-2 border-t border-gray-200 dark:border-gray-700">
                          <div className="flex items-center justify-between">
                            <label
                              htmlFor="individual-goal"
                              className="text-xs font-medium text-gray-700 dark:text-gray-300"
                            >
                              {t.individualGoal}:
                            </label>
                            <div className="flex items-center gap-2">
                              <div className="flex items-center">
                                <input
                                  id="individual-goal"
                                  type="number"
                                  min="50"
                                  max="100"
                                  ref={goalInputRef}
                                  defaultValue={individualGoal}
                                  className="w-16 h-7 px-2 text-xs border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700 dark:text-gray-200"
                                />
                                <span className="ml-1 text-xs text-gray-500 dark:text-gray-400">%</span>
                              </div>
                              <button
                                className={`px-2 py-1 text-xs ${isSavingGoal ? "bg-gray-400" : "bg-blue-500 hover:bg-blue-600"} text-white rounded flex items-center gap-1`}
                                disabled={isSavingGoal}
                                onClick={handleSaveIndividualGoal}
                              >
                                {isSavingGoal ? (
                                  <>
                                    <svg
                                      className="animate-spin -ml-1 mr-2 h-3 w-3 text-white"
                                      xmlns="http://www.w3.org/2000/svg"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                    >
                                      <circle
                                        className="opacity-25"
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                      ></circle>
                                      <path
                                        className="opacity-75"
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                      ></path>
                                    </svg>
                                    {t.saving}
                                  </>
                                ) : (
                                  t.save
                                )}
                              </button>
                            </div>
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{t.personalGoal}</p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Attendance section */}
                      <div className="border rounded-md p-3 bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600">
                        <h3 className="text-sm font-medium mb-2 dark:text-gray-200">{t.attendance}</h3>
                        <div className="space-y-2">
                          <div>
                            <div className="flex justify-between text-xs mb-1">
                              <span className="dark:text-gray-300">{t.attendance}</span>
                              <span className="dark:text-gray-300">{attendanceData.present}%</span>
                            </div>
                            <Progress value={attendanceData.present} className="h-2 bg-gray-200 dark:bg-gray-600" />
                            {/* Add threshold marker */}
                            <div className="relative h-0">
                              <div
                                className="absolute top-[-8px] h-3 w-0.5 bg-red-500"
                                style={{ left: `${attendanceThreshold}%` }}
                              />
                            </div>
                          </div>
                          <div className="flex gap-4 mt-2">
                            <div className="flex items-center gap-1 text-xs">
                              <CheckCircle2 className="h-3 w-3 text-green-500" />
                              <span className="dark:text-gray-300">
                                {t.authorized}: {attendanceData.authorized}%
                              </span>
                            </div>
                            <div className="flex items-center gap-1 text-xs">
                              <XCircle className="h-3 w-3 text-red-500" />
                              <span className="dark:text-gray-300">
                                {t.unauthorized}: {attendanceData.unauthorized}%
                              </span>
                            </div>
                          </div>
                          {/* Add status message based on threshold */}
                          <div
                            className={`text-xs mt-2 ${
                              attendanceData.present >= attendanceThreshold
                                ? "text-green-600 dark:text-green-400"
                                : attendanceData.present >= attendanceThreshold - 10
                                  ? "text-amber-600 dark:text-amber-400"
                                  : "text-red-600 dark:text-red-400"
                            }`}
                          >
                            {attendanceData.present >= attendanceThreshold
                              ? `${t.attendance} ${t.meetsThreshold}`
                              : attendanceData.present >= attendanceThreshold - 10
                                ? `${t.attendance} ${t.attendanceBelow}`
                                : `${t.criticalAttendance} (${attendanceThreshold}%)`}
                          </div>
                        </div>
                      </div>

                      {/* Main subjects section */}
                      <div className="border rounded-md p-3 bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600">
                        <h3 className="text-sm font-medium mb-2 dark:text-gray-200">{t.mainSubjects}</h3>
                        <div className="space-y-2">
                          {mainSubjects.map((subject) => (
                            <div key={subject.subject}>
                              <div className="flex justify-between text-xs mb-1">
                                <span className="dark:text-gray-300">{subject.subject}</span>
                                <div className="flex items-center gap-1">
                                  <span
                                    className={`font-medium ${
                                      subject.status === "danger"
                                        ? "text-red-500"
                                        : subject.status === "warning"
                                          ? "text-amber-500"
                                          : "text-green-600"
                                    }`}
                                  >
                                    {subject.score.toFixed(1)}%
                                  </span>
                                  <span className="text-gray-500 dark:text-gray-400">({subject.competencies})</span>
                                </div>
                              </div>
                              <Progress
                                value={subject.score}
                                className={`h-2 ${
                                  subject.status === "danger"
                                    ? "bg-red-100 dark:bg-red-900/30"
                                    : subject.status === "warning"
                                      ? "bg-amber-100 dark:bg-amber-900/30"
                                      : "bg-green-100 dark:bg-green-900/30"
                                }`}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="relative" ref={notesRef}>
            <button
              className={`p-2 rounded-md ${
                selectedStudent
                  ? "hover:bg-gray-100 dark:hover:bg-gray-700 text-[#49454F] dark:text-gray-300"
                  : "text-gray-300 dark:text-gray-600 cursor-not-allowed"
              }`}
              onClick={() => selectedStudent && setShowNotes(!showNotes)}
              aria-label="Toon notities"
              disabled={!selectedStudent}
            >
              <FileText className="h-5 w-5" />
            </button>

            {showNotes && selectedStudent && (
              <div className="absolute left-0 mt-2 w-[400px] bg-white dark:bg-gray-800 rounded-md shadow-lg z-50 border border-gray-200 dark:border-gray-700">
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                      {t.notes} {selectedStudent}
                    </h2>
                    <button
                      className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
                      onClick={() => setShowNotes(false)}
                    >
                      ×
                    </button>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-md border border-gray-200 dark:border-gray-600">
                    <p className="text-sm text-gray-500 dark:text-gray-400 italic">{t.noNotes}</p>
                  </div>

                  {/* Positive section - show when attendance is above threshold */}
                  {attendanceData.present >= attendanceThreshold && (
                    <div className="mt-4">
                      <h3 className="text-md font-medium text-green-600 dark:text-green-500 flex items-center gap-2 mb-2">
                        <CheckCircle2 className="h-4 w-4" />
                        {t.withinTarget}
                      </h3>
                      <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-md border border-green-200 dark:border-green-800">
                        <p className="text-sm text-green-800 dark:text-green-400 font-medium">
                          {t.attendance} ({attendanceData.present}%) {t.meetsThreshold} ({attendanceThreshold}%)
                        </p>
                        <p className="text-xs text-green-700 dark:text-green-400 mt-1">{t.goodAttendance}.</p>
                        <div className="flex gap-4 mt-2">
                          <div className="flex items-center gap-1 text-xs text-green-700 dark:text-green-400">
                            <CheckCircle2 className="h-3 w-3" />
                            <span>
                              {t.authorized}: {attendanceData.authorized}%
                            </span>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-green-700 dark:text-green-400">
                            <XCircle className="h-3 w-3" />
                            <span>
                              {t.unauthorized}: {attendanceData.unauthorized}%
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* At Risk sectie - tonen als de student at risk is OF als aanwezigheid onder de grenswaarde is */}
                  {((isStudentAtRisk(selectedStudent) && percentage < individualGoal) ||
                    attendanceData.present < attendanceThreshold) && (
                    <div className="mt-4">
                      <h3 className="text-md font-medium text-amber-600 dark:text-amber-500 flex items-center gap-2 mb-2">
                        <AlertTriangle className="h-4 w-4" />
                        {t.attentionPoints}
                      </h3>
                      <div className="bg-amber-50 dark:bg-amber-900/20 p-3 rounded-md border border-amber-200 dark:border-amber-800">
                        {isStudentAtRisk(selectedStudent) && percentage < individualGoal && (
                          <p className="text-sm text-amber-800 dark:text-amber-400 font-medium">
                            {getAtRiskReason(selectedStudent)}
                          </p>
                        )}

                        {/* Aanwezigheid waarschuwing */}
                        {attendanceData.present < attendanceThreshold && (
                          <div
                            className={isStudentAtRisk(selectedStudent) && percentage < individualGoal ? "mt-3" : ""}
                          >
                            <p className="text-sm text-amber-800 dark:text-amber-400 font-medium">
                              {t.attendance} ({attendanceData.present}%) {t.attendanceBelow} ({attendanceThreshold}%)
                            </p>
                            <p className="text-xs text-amber-700 dark:text-amber-400 mt-1">
                              {attendanceData.present >= attendanceThreshold - 10
                                ? t.studentMustAttend
                                : t.criticalAttendance}
                            </p>
                            <p className="text-xs text-amber-700 dark:text-amber-400 mt-1">
                              {t.unauthorized}: {attendanceData.unauthorized}%
                            </p>
                          </div>
                        )}

                        {competencyIssues.length > 0 && percentage < individualGoal && (
                          <div className="mt-3">
                            <p className="text-sm text-amber-700 dark:text-amber-400 font-medium mb-1">
                              {t.competencyIssues}:
                            </p>
                            <ul className="list-disc pl-5 text-xs text-amber-600 dark:text-amber-500 space-y-1">
                              {competencyIssues.map((issue, index) => (
                                <li key={index}>{issue}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        <p className="text-xs text-amber-600 dark:text-amber-500 mt-3">{t.needsGuidance}</p>
                      </div>
                    </div>
                  )}
                  {/* Status sectie - altijd tonen */}
                  <div className="mt-4">
                    <h3 className="text-md font-medium text-blue-600 dark:text-blue-500 flex items-center gap-2 mb-2">
                      <FileText className="h-4 w-4" />
                      {t.status}
                    </h3>
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md border border-blue-200 dark:border-blue-800">
                      <p className="text-sm text-blue-800 dark:text-blue-400 font-medium">
                        {isAboveAverage && percentage >= individualGoal && attendanceData.present >= attendanceThreshold
                          ? t.passed
                          : t.evaluationNeeded}
                      </p>
                      <div className="mt-2">
                        <h4 className="text-xs font-medium mb-1 text-blue-700 dark:text-blue-400">
                          {t.statusCalculation}:
                        </h4>
                        <ul className="list-disc pl-4 space-y-1 text-xs text-blue-700 dark:text-blue-400">
                          <li>
                            {t.competencies}: {percentage.toFixed(2)}% {percentage >= individualGoal ? "✓" : "✗"} (
                            {t.goal}: {individualGoal}%)
                          </li>
                          <li>
                            {t.attendance}: {attendanceData.present}%{" "}
                            {attendanceData.present >= attendanceThreshold ? "✓" : "✗"} ({t.goal}: {attendanceThreshold}
                            %)
                          </li>
                          <li>
                            {t.personalAverage}: {isAboveAverage ? "✓" : "✗"}
                          </li>
                        </ul>
                        <p className="mt-2 text-xs text-blue-700 dark:text-blue-400">{t.passedStatus}</p>
                        <p className="mt-2 text-xs text-blue-700 dark:text-blue-400">{t.individualGoalExplanation}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center">
          <InfoPopup />
          <SettingsMenu />
        </div>
      </header>

      <main className={`w-full px-4 py-2 flex-1 overflow-auto ${compactView ? "max-w-screen-2xl mx-auto" : ""}`}>
        {selectedStudent ? (
          <h1 className="text-xl font-medium text-center mb-4 dark:text-white">
            {t.positioningFrom} {selectedClass}
          </h1>
        ) : (
          <h1 className="text-xl font-medium text-center mb-4 dark:text-white">{t.positioning}</h1>
        )}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div className="md:col-span-1">
            <ProgressHeader attendanceThreshold={attendanceThreshold} individualGoal={individualGoal} />
          </div>
          <div className="md:col-span-3">
            <div
              className={`grid grid-cols-1 ${compactView ? "md:grid-cols-1 lg:grid-cols-3" : "md:grid-cols-3"} gap-4`}
            >
              <SemesterScatterPlot title="Semester 1" data={semesterScores[0]} />
              <SemesterScatterPlot title="Semester 2" data={semesterScores[1]} />
              <SemesterScatterPlot title="Semester 3" data={semesterScores[2]} />
            </div>
            <div className="text-center text-xs text-gray-500 dark:text-gray-400 mt-1">
              {t.eachDot} {selectedStudent && `${t.coloredDot} ${selectedStudent}.`}
            </div>
          </div>
        </div>

        <div className="overflow-hidden">
          <Tabs defaultValue="semester1" className="w-full" onValueChange={setActiveSemester}>
            <TabsList className="grid grid-cols-3 mb-4 bg-gray-50 dark:bg-gray-800/50 rounded-md border-0 p-1">
              <TabsTrigger
                value="semester1"
                className="text-base text-gray-600 dark:text-gray-400 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-md data-[state=active]:border-b-2 data-[state=active]:border-blue-500 dark:data-[state=active]:border-blue-400 data-[state=active]:text-blue-700 dark:data-[state=active]:text-blue-300 transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-700/50"
                onClick={() => {
                  // Extract semester number from the tab value and store it
                  const semesterNum = 1
                  // You can use this semesterNum value to pass to components that need it
                }}
              >
                {t.semester} 1
                <ChevronDown className="ml-1 h-4 w-4" />
              </TabsTrigger>
              <TabsTrigger
                value="semester2"
                className="text-base text-gray-600 dark:text-gray-400 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-md data-[state=active]:border-b-2 data-[state=active]:border-blue-500 dark:data-[state=active]:border-blue-400 data-[state=active]:text-blue-700 dark:data-[state=active]:text-blue-300 transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-700/50"
                onClick={() => {
                  // Extract semester number from the tab value and store it
                  const semesterNum = 2
                  // You can use this semesterNum value to pass to components that need it
                }}
              >
                {t.semester} 2
                <ChevronDown className="ml-1 h-4 w-4" />
              </TabsTrigger>
              <TabsTrigger
                value="semester3"
                className="text-base text-gray-600 dark:text-gray-400 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-md data-[state=active]:border-b-2 data-[state=active]:border-blue-500 dark:data-[state=active]:border-blue-400 data-[state=active]:text-blue-700 dark:data-[state=active]:text-blue-300 transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-700/50"
                onClick={() => {
                  // Extract semester number from the tab value and store it
                  const semesterNum = 3
                  // You can use this semesterNum value to pass to components that need it
                }}
              >
                {t.semester} 3
                <ChevronDown className="ml-1 h-4 w-4" />
              </TabsTrigger>
            </TabsList>

            {compactView ? (
              // In compact view, only show the active semester
              <div>
                {activeSemester === "semester1" && renderSemester(1, true)}
                {activeSemester === "semester2" && renderSemester(2, true)}
                {activeSemester === "semester3" && renderSemester(3, true)}
              </div>
            ) : (
              // In regular view, show all semesters side by side
              <div className="grid grid-cols-3 gap-4">
                {selectedStudent ? (
                  <>
                    {renderSemester(1, activeSemester === "semester1")}
                    {renderSemester(2, activeSemester === "semester2")}
                    {renderSemester(3, activeSemester === "semester3")}
                  </>
                ) : (
                  <div className="col-span-3 flex items-center justify-center bg-white dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700 p-8">
                    <div className="text-center">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                        {t.noStudentSelected}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 max-w-md">{t.selectStudent}</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </Tabs>
        </div>
      </main>
    </div>
  )
}
