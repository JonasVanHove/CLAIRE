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
  getClassScoresForSemester,
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

export default function Dashboard() {
  return (
    <UIProvider>
      <DashboardContent />
    </UIProvider>
  )
}

function DashboardContent() {
  const { selectedStudent, selectedClass } = useStudent()
  const [showNotes, setShowNotes] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const { compactView, darkMode } = useUI()
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

  // Get data for each semester's scatter plot
  const semesterScores = useMemo(() => {
    return [1, 2, 3].map((semester) => {
      const classScores = getClassScoresForSemester(selectedClass, semester as 1 | 2 | 3)

      // Mark the current student
      return classScores.map((student) => ({
        ...student,
        isCurrentStudent: student.name === selectedStudent,
      }))
    })
  }, [selectedStudent, selectedClass])

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

  // Render een semester met zijn vakken
  const renderSemester = (semesterNum: number, isActive: boolean) => {
    const subjects = semesterSubjects[semesterNum]

    return (
      <div
        className={`border rounded-md flex-1 dark:bg-gray-800 dark:border-gray-700 relative p-3 ${
          !isActive ? "opacity-70 cursor-not-allowed" : ""
        }`}
        style={{
          height: "600px", // Changed from 750px to 600px to make it less tall
          overflow: "hidden", // Hide overflow for the container
          pointerEvents: isActive ? "auto" : "none", // Disable interactions when not active
        }}
      >
        {!isActive && (
          <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 bg-opacity-10 dark:bg-opacity-20 flex items-center justify-center z-10">
            <div className="bg-white dark:bg-gray-800 px-4 py-2 rounded-md shadow-md text-gray-700 dark:text-gray-300 font-medium">
              Selecteer dit semester om te bekijken
            </div>
          </div>
        )}
        <div
          className={`grid grid-cols-1 ${isActive ? "md:grid-cols-2" : ""} gap-3 custom-scrollbar`}
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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 py-2 px-4 flex items-center justify-between">
        <div className="flex items-center gap-4 flex-1">
          <StudentSelector />

          <div className="relative" ref={profileRef}>
            <button
              className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-[#49454F] dark:text-gray-300"
              onClick={() => setShowProfile(!showProfile)}
              aria-label="Toon profiel"
            >
              <User className="h-5 w-5" />
            </button>

            {showProfile && (
              <div className="absolute left-0 mt-2 w-[500px] bg-white dark:bg-gray-800 rounded-md shadow-lg z-50 border border-gray-200 dark:border-gray-700">
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                      Profiel van {selectedStudent}
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
                          <span>Schooljaar 2023-2024</span>
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          <p>
                            Graad {enrollmentInfo.grade} | {enrollmentInfo.currentGrade}e jaar
                          </p>
                          <p className="text-xs mt-1">Ingeschreven sinds {enrollmentInfo.years[0]}</p>
                          <p className="text-xs mt-1">Schooljaren: {enrollmentInfo.years.join(", ")}</p>
                        </div>

                        {/* Aanwezigheid grenswaarde instelling */}
                        <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                          <div className="flex items-center justify-between">
                            <label
                              htmlFor="attendance-threshold"
                              className="text-xs font-medium text-gray-700 dark:text-gray-300"
                            >
                              Aanwezigheid:
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
                                onClick={async () => {
                                  if (!thresholdInputRef.current) return

                                  const newThreshold = Number.parseInt(thresholdInputRef.current.value)
                                  if (isNaN(newThreshold) || newThreshold < 50 || newThreshold > 100) {
                                    alert("Voer een geldige waarde in tussen 50 en 100")
                                    return
                                  }

                                  setIsSaving(true)

                                  try {
                                    // In a real implementation, this would be an API call
                                    // await fetch('/api/students/attendance-threshold', {
                                    //   method: 'POST',
                                    //   headers: { 'Content-Type': 'application/json' },
                                    //   body: JSON.stringify({
                                    //     studentId: selectedStudent,
                                    //     threshold: newThreshold
                                    //   })
                                    // });

                                    // Simulate API call
                                    await new Promise((resolve) => setTimeout(resolve, 500))

                                    // Update local state after successful save
                                    setAttendanceThreshold(newThreshold)

                                    // Show success message
                                    alert("Aanwezigheid grenswaarde opgeslagen!")
                                  } catch (error) {
                                    console.error("Error saving threshold:", error)
                                    alert("Er is een fout opgetreden bij het opslaan")
                                  } finally {
                                    setIsSaving(false)
                                  }
                                }}
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
                                    Opslaan...
                                  </>
                                ) : (
                                  "Opslaan"
                                )}
                              </button>
                            </div>
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Minimale percentage aanwezigheid voor de leerlingen
                          </p>
                        </div>

                        {/* Individuele doelstelling instelling */}
                        <div className="mt-4 pt-2 border-t border-gray-200 dark:border-gray-700">
                          <div className="flex items-center justify-between">
                            <label
                              htmlFor="individual-goal"
                              className="text-xs font-medium text-gray-700 dark:text-gray-300"
                            >
                              Individuele doelstelling:
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
                                onClick={async () => {
                                  if (!goalInputRef.current) return

                                  const newGoal = Number.parseInt(goalInputRef.current.value)
                                  if (isNaN(newGoal) || newGoal < 50 || newGoal > 100) {
                                    alert("Voer een geldige waarde in tussen 50 en 100")
                                    return
                                  }

                                  setIsSavingGoal(true)

                                  try {
                                    // In a real implementation, this would be an API call
                                    // await fetch('/api/students/individual-goal', {
                                    //   method: 'POST',
                                    //   headers: { 'Content-Type': 'application/json' },
                                    //   body: JSON.stringify({
                                    //     studentId: selectedStudent,
                                    //     goal: newGoal
                                    //   })
                                    // });

                                    // Simulate API call
                                    await new Promise((resolve) => setTimeout(resolve, 500))

                                    // Update local state after successful save
                                    setIndividualGoal(newGoal)

                                    // Show success message
                                    alert("Individuele doelstelling opgeslagen!")
                                  } catch (error) {
                                    console.error("Error saving goal:", error)
                                    alert("Er is een fout opgetreden bij het opslaan")
                                  } finally {
                                    setIsSavingGoal(false)
                                  }
                                }}
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
                                    Opslaan...
                                  </>
                                ) : (
                                  "Opslaan"
                                )}
                              </button>
                            </div>
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Persoonlijke doelstelling voor deze leerling
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Attendance section */}
                      <div className="border rounded-md p-3 bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600">
                        <h3 className="text-sm font-medium mb-2 dark:text-gray-200">Aanwezigheid</h3>
                        <div className="space-y-2">
                          <div>
                            <div className="flex justify-between text-xs mb-1">
                              <span className="dark:text-gray-300">Aanwezig</span>
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
                              <span className="dark:text-gray-300">Gewettigd: {attendanceData.authorized}%</span>
                            </div>
                            <div className="flex items-center gap-1 text-xs">
                              <XCircle className="h-3 w-3 text-red-500" />
                              <span className="dark:text-gray-300">Ongewettigd: {attendanceData.unauthorized}%</span>
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
                              ? "Aanwezigheid voldoet aan de grenswaarde"
                              : attendanceData.present >= attendanceThreshold - 10
                                ? "Aanwezigheid onder de grenswaarde"
                                : `Aanwezigheid kritisch onder de grenswaarde (${attendanceThreshold}%)`}
                          </div>
                        </div>
                      </div>

                      {/* Main subjects section */}
                      <div className="border rounded-md p-3 bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600">
                        <h3 className="text-sm font-medium mb-2 dark:text-gray-200">Hoofdvakken</h3>
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
              className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-[#49454F] dark:text-gray-300"
              onClick={() => setShowNotes(!showNotes)}
              aria-label="Toon notities"
            >
              <FileText className="h-5 w-5" />
            </button>

            {showNotes && (
              <div className="absolute left-0 mt-2 w-[400px] bg-white dark:bg-gray-800 rounded-md shadow-lg z-50 border border-gray-200 dark:border-gray-700">
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                      Notities voor {selectedStudent}
                    </h2>
                    <button
                      className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
                      onClick={() => setShowNotes(false)}
                    >
                      ×
                    </button>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-md border border-gray-200 dark:border-gray-600">
                    <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                      Geen notities gevonden voor deze leerling.
                    </p>
                  </div>

                  {/* Positive section - show when attendance is above threshold */}
                  {attendanceData.present >= attendanceThreshold && (
                    <div className="mt-4">
                      <h3 className="text-md font-medium text-green-600 dark:text-green-500 flex items-center gap-2 mb-2">
                        <CheckCircle2 className="h-4 w-4" />
                        Binnen doelstelling
                      </h3>
                      <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-md border border-green-200 dark:border-green-800">
                        <p className="text-sm text-green-800 dark:text-green-400 font-medium">
                          Aanwezigheid ({attendanceData.present}%) voldoet aan de grenswaarde ({attendanceThreshold}%)
                        </p>
                        <p className="text-xs text-green-700 dark:text-green-400 mt-1">
                          De leerling heeft een goede aanwezigheidsgraad en voldoet aan de minimumvereisten.
                        </p>
                        <div className="flex gap-4 mt-2">
                          <div className="flex items-center gap-1 text-xs text-green-700 dark:text-green-400">
                            <CheckCircle2 className="h-3 w-3" />
                            <span>Gewettigd: {attendanceData.authorized}%</span>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-green-700 dark:text-green-400">
                            <XCircle className="h-3 w-3" />
                            <span>Ongewettigd: {attendanceData.unauthorized}%</span>
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
                        Aandachtspunten
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
                              Aanwezigheid ({attendanceData.present}%) is onder de grenswaarde ({attendanceThreshold}%)
                            </p>
                            <p className="text-xs text-amber-700 dark:text-amber-400 mt-1">
                              {attendanceData.present >= attendanceThreshold - 10
                                ? "De leerling moet beter aanwezig zijn om aan de minimumvereisten te voldoen."
                                : "De leerling heeft een kritisch lage aanwezigheid die dringend aandacht vereist."}
                            </p>
                            <p className="text-xs text-amber-700 dark:text-amber-400 mt-1">
                              Ongewettigde afwezigheid: {attendanceData.unauthorized}%
                            </p>
                          </div>
                        )}

                        {competencyIssues.length > 0 && percentage < individualGoal && (
                          <div className="mt-3">
                            <p className="text-sm text-amber-700 dark:text-amber-400 font-medium mb-1">
                              Competentie-issues:
                            </p>
                            <ul className="list-disc pl-5 text-xs text-amber-600 dark:text-amber-500 space-y-1">
                              {competencyIssues.map((issue, index) => (
                                <li key={index}>{issue}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        <p className="text-xs text-amber-600 dark:text-amber-500 mt-3">
                          Deze leerling heeft extra begeleiding nodig.
                        </p>
                      </div>
                    </div>
                  )}
                  {/* Status sectie - altijd tonen */}
                  <div className="mt-4">
                    <h3 className="text-md font-medium text-blue-600 dark:text-blue-500 flex items-center gap-2 mb-2">
                      <FileText className="h-4 w-4" />
                      Status
                    </h3>
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md border border-blue-200 dark:border-blue-800">
                      <p className="text-sm text-blue-800 dark:text-blue-400 font-medium">
                        {isAboveAverage && percentage >= individualGoal && attendanceData.present >= attendanceThreshold
                          ? "Geslaagd"
                          : "Evaluatie nodig"}
                      </p>
                      <div className="mt-2">
                        <h4 className="text-xs font-medium mb-1 text-blue-700 dark:text-blue-400">
                          Status berekening:
                        </h4>
                        <ul className="list-disc pl-4 space-y-1 text-xs text-blue-700 dark:text-blue-400">
                          <li>
                            Competenties: {percentage.toFixed(2)}% {percentage >= individualGoal ? "✓" : "✗"} (doel:{" "}
                            {individualGoal}%)
                          </li>
                          <li>
                            Aanwezigheid: {attendanceData.present}%{" "}
                            {attendanceData.present >= attendanceThreshold ? "✓" : "✗"} (doel: {attendanceThreshold}%)
                          </li>
                          <li>Persoonlijk gemiddelde: {isAboveAverage ? "✓" : "✗"}</li>
                        </ul>
                        <p className="mt-2 text-xs text-blue-700 dark:text-blue-400">
                          De status "Geslaagd" wordt toegekend wanneer de leerling voldoet aan alle criteria:
                          competentiedoelstelling, aanwezigheidsgrenswaarde en persoonlijk gemiddelde.
                        </p>
                        <p className="mt-2 text-xs text-blue-700 dark:text-blue-400">
                          De individuele doelstelling ({individualGoal}%) is afgestemd op de capaciteiten en vooruitgang
                          van de leerling. Leerlingen worden als "at risk" beschouwd wanneer ze onder hun persoonlijke
                          doelstelling presteren.
                        </p>
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

      <main className={`w-full px-4 py-2 ${compactView ? "max-w-screen-2xl mx-auto" : ""}`}>
        <h1 className="text-xl font-medium text-center mb-4 dark:text-white">
          Positionering ten opzichte van medestudenten uit {selectedClass}
        </h1>

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
              Elke stip vertegenwoordigt een student. De donkere stip is {selectedStudent}.
            </div>
          </div>
        </div>

        <div className="overflow-hidden">
          <Tabs defaultValue="semester1" className="w-full" onValueChange={setActiveSemester}>
            <TabsList className="grid grid-cols-3 mb-4 bg-gray-100 dark:bg-gray-800">
              <TabsTrigger
                value="semester1"
                className="text-base data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700"
                onClick={() => {
                  // Extract semester number from the tab value and store it
                  const semesterNum = 1
                  // You can use this semesterNum value to pass to components that need it
                }}
              >
                Semester 1
                <ChevronDown className="ml-1 h-4 w-4" />
              </TabsTrigger>
              <TabsTrigger
                value="semester2"
                className="text-base data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700"
                onClick={() => {
                  // Extract semester number from the tab value and store it
                  const semesterNum = 2
                  // You can use this semesterNum value to pass to components that need it
                }}
              >
                Semester 2
                <ChevronDown className="ml-1 h-4 w-4" />
              </TabsTrigger>
              <TabsTrigger
                value="semester3"
                className="text-base data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700"
                onClick={() => {
                  // Extract semester number from the tab value and store it
                  const semesterNum = 3
                  // You can use this semesterNum value to pass to components that need it
                }}
              >
                Semester 3
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
                {renderSemester(1, activeSemester === "semester1")}
                {renderSemester(2, activeSemester === "semester2")}
                {renderSemester(3, activeSemester === "semester3")}
              </div>
            )}
          </Tabs>
        </div>
      </main>
    </div>
  )
}
