"use client"

import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { CheckCircle2, AlertTriangle, Clock } from "lucide-react"
import { ProfileImage } from "@/components/profile-image"
import { useStudent } from "@/contexts/student-context"
import {
  getTotalCompetencies,
  getStudentProfileImage,
  getStudentSemesterData,
  isStudentAtRisk,
  getAtRiskReason,
  getStudentAttendance,
} from "@/data/student-data"
import { useUI } from "@/contexts/ui-context"
import { useState, useEffect } from "react"

interface ProgressHeaderProps {
  attendanceThreshold: number
  individualGoal?: number
}

export function ProgressHeader({ attendanceThreshold, individualGoal = 75 }: ProgressHeaderProps) {
  const { selectedStudent, selectedClass } = useStudent()
  const { achieved, total } = getTotalCompetencies(selectedStudent)
  const profileImage = getStudentProfileImage(selectedStudent)
  const percentage = (achieved / total) * 100
  const formattedPercentage = percentage.toFixed(2)
  const { darkMode, language } = useUI()
  const atRisk = isStudentAtRisk(selectedStudent)
  const atRiskReason = getAtRiskReason(selectedStudent)

  // Get consistent attendance data for this student
  const attendanceData = getStudentAttendance(selectedStudent)

  // Bereken of de student boven zijn persoonlijk gemiddelde zit
  const [isAboveAverage, setIsAboveAverage] = useState(false)
  // const [showStatusInfo, setShowStatusInfo] = useState(false)

  // Determine attendance status based on the threshold
  const attendanceStatus =
    attendanceData.present >= attendanceThreshold
      ? "good"
      : attendanceData.present >= attendanceThreshold - 10
        ? "warning"
        : "danger"

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

  // Check if student is truly at risk based on individual goal
  const isTrulyAtRisk = atRisk && percentage < individualGoal

  // Get competencies achieved per semester
  const getCompetenciesPerSemester = () => {
    const semesterData = [1, 2, 3].map((semester) => {
      const data = getStudentSemesterData(selectedStudent, semester as 1 | 2 | 3)
      let achieved = 0
      let total = 0

      data.forEach((statement) => {
        if (statement.result.competencies) {
          achieved += statement.result.competencies.achieved
          total += statement.result.competencies.total
        }
      })

      return {
        semester,
        achieved,
        total,
        percentage: total > 0 ? (achieved / total) * 100 : 0,
      }
    })

    return semesterData
  }

  const semesterCompetencies = getCompetenciesPerSemester()

  // Translations
  const translations = {
    en: {
      competenciesAchieved: "Competencies achieved",
      status: "Status",
      withinTarget: "Within target",
      evaluationNeeded: "Evaluation needed",
      competenciesPerSemester: "Competencies per semester",
      semester: "S",
    },
    nl: {
      competenciesAchieved: "Competenties behaald",
      status: "Status",
      withinTarget: "Binnen doelstelling",
      evaluationNeeded: "Evaluatie nodig",
      competenciesPerSemester: "Competenties per semester",
      semester: "S",
    },
  }

  // Get translations based on current language
  const t = translations[language]

  return (
    <div className="mb-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-2">
        <div className="text-base font-medium dark:text-gray-200">{t.competenciesAchieved}</div>
        <div className="text-base font-medium dark:text-gray-200">
          {selectedStudent ? `${achieved}/${total}` : "0/0"}
        </div>
      </div>

      <Progress
        value={selectedStudent ? percentage : 0}
        className="h-2 mb-4 bg-gray-200 dark:bg-gray-700"
        style={{ backgroundColor: "#e5e7eb" }}
      >
        <div
          className="h-full bg-[#75b265] dark:bg-[#75b265]"
          style={{ width: `${selectedStudent ? percentage : 0}%` }}
        ></div>
      </Progress>

      <Card className="p-4 dark:bg-gray-800 dark:border-gray-700">
        <div className="flex items-start gap-4">
          <ProfileImage
            src={selectedStudent ? profileImage : "/placeholder.svg"}
            alt={selectedStudent || "Geen leerling geselecteerd"}
            className="w-16 h-16 hidden sm:block"
          />
          <div className="flex-1">
            <div className="text-base font-medium mb-1 dark:text-gray-200">
              {selectedStudent || (language === "en" ? "No student selected" : "Geen leerling geselecteerd")}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              {selectedStudent
                ? `${language === "en" ? "Class" : "Klas"}: ${selectedClass}`
                : language === "en"
                  ? "Select a student"
                  : "Selecteer een leerling"}
            </div>
            {selectedStudent ? (
              <div className="flex items-center gap-2 mb-2">
                <div className="text-sm font-medium dark:text-gray-200">{t.status}:</div>
                {isTrulyAtRisk && (
                  <div className="relative group">
                    <AlertTriangle className="h-4 w-4 text-amber-500" />
                    <div className="absolute left-0 top-full mt-1 w-64 p-2 bg-black text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity z-50">
                      {atRiskReason} (
                      {language === "en"
                        ? `below individual goal of ${individualGoal}%`
                        : `onder individuele doelstelling van ${individualGoal}%`}
                      )
                    </div>
                  </div>
                )}
                {attendanceData.present < attendanceThreshold && (
                  <div className="relative group">
                    <Clock className="h-4 w-4 text-blue-500" />
                    <div className="absolute left-0 top-full mt-1 w-64 p-2 bg-black text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity z-50">
                      {language === "en"
                        ? `Attendance (${attendanceData.present}%) is below threshold (${attendanceThreshold}%)`
                        : `Aanwezigheid (${attendanceData.present}%) is onder de grenswaarde (${attendanceThreshold}%)`}
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-2 relative group">
                  <CheckCircle2
                    className={`h-4 w-4 ${
                      !isTrulyAtRisk || (isAboveAverage && percentage >= individualGoal)
                        ? "text-green-500"
                        : "text-gray-400"
                    }`}
                  />
                  <span
                    className={`text-xs ${
                      !isTrulyAtRisk || (isAboveAverage && percentage >= individualGoal)
                        ? "font-medium text-green-600 dark:text-green-400"
                        : "text-gray-500 dark:text-gray-400"
                    }`}
                  >
                    {!isTrulyAtRisk || (isAboveAverage && percentage >= individualGoal)
                      ? t.withinTarget
                      : t.evaluationNeeded}
                  </span>
                  {/* Tooltip that appears on hover */}
                  <div className="absolute left-0 top-full mt-1 w-64 p-2 bg-black text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity z-50">
                    <p className="mb-1">{language === "en" ? "Status calculation:" : "Status berekening:"}</p>
                    <ul className="list-disc pl-4 space-y-0.5">
                      <li>
                        {language === "en" ? "Competencies" : "Competenties"}: {formattedPercentage}%{" "}
                        {percentage >= individualGoal ? "✓" : "✗"} ({language === "en" ? "goal" : "doel"}:{" "}
                        {individualGoal}%)
                      </li>
                      <li>
                        {language === "en" ? "Attendance" : "Aanwezigheid"}: {attendanceData.present}%{" "}
                        {attendanceData.present >= attendanceThreshold ? "✓" : "✗"} (
                        {language === "en" ? "goal" : "doel"}: {attendanceThreshold}%)
                      </li>
                      <li>
                        {language === "en" ? "Personal average" : "Persoonlijk gemiddelde"}:{" "}
                        {isAboveAverage ? "✓" : "✗"}
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {language === "en"
                  ? "Use the search field above to select a student"
                  : "Gebruik het zoekveld bovenaan om een leerling te selecteren"}
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Semester Competencies Section */}
      {selectedStudent && (
        <div className="mt-2 bg-white dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700 p-2">
          <div className="text-sm font-medium mb-1 dark:text-gray-200 text-center">{t.competenciesPerSemester}</div>
          <div className="flex items-center justify-between gap-2">
            {semesterCompetencies.map((semData, index) => {
              // Calculate cumulative achievements
              const previousSemesters = semesterCompetencies.slice(0, index)
              const previousAchieved = previousSemesters.reduce((sum, sem) => sum + sem.achieved, 0)
              const cumulativeAchieved = previousAchieved + semData.achieved

              // Use the same scale for all semesters
              const totalScale = total // Use the total from getTotalCompetencies
              const cumulativePercentage = (cumulativeAchieved / totalScale) * 100
              const currentSemesterPercentage = (semData.achieved / totalScale) * 100

              // Define colors for each semester with the specified hex values
              // Define gradient colors for each semester
              const semesterGradients = [
                ["#6b6770", "#4b4750"], // Semester 1: darker to lighter purple-gray
                ["#b3acbc", "#93889c"], // Semester 2: darker to lighter lavender
                ["#3a383c", "#1a181c"], // Semester 3: darker to lighter dark gray
              ]

              return (
                <div key={semData.semester} className="flex-1">
                  <div className="flex justify-between text-xs mb-0.5">
                    <span className="dark:text-gray-300">
                      {t.semester}
                      {semData.semester}
                    </span>
                    <span className="dark:text-gray-300">
                      {cumulativeAchieved}/{totalScale}
                    </span>
                  </div>
                  <div className="h-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden relative">
                    {/* Show previous semesters' contributions */}
                    {previousSemesters.map((prevSem, prevIndex) => {
                      const prevPercentage = (prevSem.achieved / totalScale) * 100
                      const prevOffset = previousSemesters
                        .slice(0, prevIndex)
                        .reduce((sum, s) => sum + (s.achieved / totalScale) * 100, 0)

                      return (
                        <div
                          key={`prev-${prevSem.semester}`}
                          className="absolute h-full"
                          style={{
                            width: `${prevPercentage}%`,
                            left: `${prevOffset}%`,
                            background: `linear-gradient(to right, ${semesterGradients[prevIndex][0]}, ${semesterGradients[prevIndex][1]})`,
                          }}
                        />
                      )
                    })}

                    {/* Show current semester's contribution */}
                    <div
                      className="absolute h-full"
                      style={{
                        width: `${currentSemesterPercentage}%`,
                        left: `${cumulativePercentage - currentSemesterPercentage}%`,
                        background: `linear-gradient(to right, ${semesterGradients[index][0]}, ${semesterGradients[index][1]})`,
                      }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
