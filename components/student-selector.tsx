"use client"

import { Check, ChevronDown, User, Search, AlertTriangle, Clock } from "lucide-react"
import { useStudent } from "@/contexts/student-context"
import {
  getStudentsInClass,
  isStudentAtRisk,
  getAtRiskReason,
  getStudentAttendance,
  getStudentIndividualGoal,
  getTotalCompetencies,
} from "@/data/student-data"
import { useMemo, useState } from "react"

// Define the classes we have
const classes = ["1Moderne", "2Moderne", "3STEM", "3TW", "3LAT", "4Sport", "4Mechanica", "4Handel", "5WeWi", "6WeWi"]

export function StudentSelector() {
  const { selectedStudent, selectedClass, setSelectedStudent, setSelectedClass } = useStudent()
  const [searchTerm, setSearchTerm] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const [activeFilters, setActiveFilters] = useState<string[]>([])
  const [showOnlyAtRisk, setShowOnlyAtRisk] = useState(false)
  const [showOnlyAttendanceRisk, setShowOnlyAttendanceRisk] = useState(false)
  const attendanceThreshold = 85 // Default threshold

  // Get students for each class from our data
  const studentGroups = useMemo(() => {
    return classes
      .filter((className) => activeFilters.length === 0 || activeFilters.includes(className))
      .map((className) => ({
        class: className,
        students: getStudentsInClass(className).filter((student) => {
          // Basic search filter
          const matchesSearch = searchTerm === "" || student.toLowerCase().includes(searchTerm.toLowerCase())
          if (!matchesSearch) return false

          // At risk filter
          if (showOnlyAtRisk) {
            const individualGoal = getStudentIndividualGoal(student)
            const { achieved, total } = getTotalCompetencies(student)
            const percentage = (achieved / total) * 100
            const isAtRisk = isStudentAtRisk(student) && percentage < individualGoal
            if (!isAtRisk) return false
          }

          // Attendance risk filter
          if (showOnlyAttendanceRisk) {
            const attendanceData = getStudentAttendance(student)
            const hasLowAttendance = attendanceData.present < attendanceThreshold
            if (!hasLowAttendance) return false
          }

          return true
        }),
      }))
      .filter((group) => group.students.length > 0)
  }, [searchTerm, activeFilters, showOnlyAtRisk, showOnlyAttendanceRisk])

  const handleSelectStudent = (student: string, className: string) => {
    setSelectedStudent(student)
    setSelectedClass(className)
    setIsOpen(false)
    setActiveFilters([])
  }

  const toggleFilter = (className: string) => {
    if (activeFilters.includes(className)) {
      setActiveFilters(activeFilters.filter((filter) => filter !== className))
    } else {
      setActiveFilters([...activeFilters, className])
    }
  }

  const toggleAtRiskFilter = () => {
    setShowOnlyAtRisk(!showOnlyAtRisk)
    // Remove the line that disables the other filter
  }

  const toggleAttendanceRiskFilter = () => {
    setShowOnlyAttendanceRisk(!showOnlyAttendanceRisk)
    // Remove the line that disables the other filter
  }

  // Split students into two columns
  const getColumnizedStudents = (students: string[], className: string) => {
    const midpoint = Math.ceil(students.length / 2)
    const leftColumn = students.slice(0, midpoint)
    const rightColumn = students.slice(midpoint)

    return (
      <div className="grid grid-cols-2 gap-1">
        <div>{renderStudentList(leftColumn, className)}</div>
        <div>{renderStudentList(rightColumn, className)}</div>
      </div>
    )
  }

  const renderStudentList = (students: string[], className: string) => {
    return students.map((student) => {
      // Check if student is at risk based on individual goal
      const individualGoal = getStudentIndividualGoal(student)
      const { achieved, total } = getTotalCompetencies(student)
      const percentage = (achieved / total) * 100
      const atRisk = isStudentAtRisk(student) && percentage < individualGoal

      const atRiskReason = getAtRiskReason(student)
      const attendanceData = getStudentAttendance(student)
      const lowAttendance = attendanceData.present < attendanceThreshold

      return (
        <div
          key={student}
          onClick={() => handleSelectStudent(student, className)}
          className={`flex items-center justify-between px-2 py-1.5 rounded-md cursor-pointer ${
            selectedStudent === student ? "bg-[#ECE6F0] dark:bg-gray-700" : "hover:bg-gray-100 dark:hover:bg-gray-700"
          }`}
        >
          <div className="flex items-center gap-2 overflow-hidden">
            <User className="h-4 w-4 flex-shrink-0 text-[#49454F] dark:text-gray-300" />
            <span className="text-sm truncate dark:text-gray-200">{student}</span>
            {atRisk && (
              <div className="relative group flex-shrink-0">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                <div className="absolute left-0 top-full mt-1 w-64 p-2 bg-black text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity z-50">
                  {atRiskReason} (onder individuele doelstelling van {individualGoal}%)
                </div>
              </div>
            )}
            {lowAttendance && (
              <div className="relative group flex-shrink-0">
                <Clock className="h-4 w-4 text-blue-500" />
                <div className="absolute left-0 top-full mt-1 w-64 p-2 bg-black text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity z-50">
                  Aanwezigheid ({attendanceData.present}%) is onder de grenswaarde ({attendanceThreshold}%)
                </div>
              </div>
            )}
          </div>
          {selectedStudent === student && <Check className="h-4 w-4 flex-shrink-0 text-[#49454F] dark:text-gray-300" />}
        </div>
      )
    })
  }

  return (
    <div className="relative flex-1 max-w-xl">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <Search className="h-4 w-4 text-[#49454F] dark:text-gray-300" />
        </div>
        <input
          type="text"
          className="block w-full pl-10 pr-10 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-[#ECE6F0] dark:focus:ring-[#75b265] focus:border-[#ECE6F0] dark:focus:border-[#75b265]"
          placeholder="Zoek een leerling..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => setIsOpen(true)}
        />
        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
          <button onClick={() => setIsOpen(!isOpen)} className="text-gray-500 dark:text-gray-400">
            <ChevronDown className="h-4 w-4" />
          </button>
        </div>
      </div>

      {isOpen && (
        <div
          className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 flex flex-col"
          style={{ maxHeight: "calc(70vh)" }}
        >
          <div className="class-filter-buttons dark:bg-gray-800 dark:border-gray-700 flex flex-wrap gap-1 p-2 border-b border-gray-200 dark:border-gray-700">
            {classes.map((className) => (
              <button
                key={className}
                onClick={() => toggleFilter(className)}
                className={`class-filter-button text-xs px-3 py-1.5 rounded-md ${
                  activeFilters.includes(className)
                    ? "bg-[#49454F] text-white font-medium border-2 border-[#49454F] shadow-md transform scale-105"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-gray-600"
                } transition-all duration-150`}
              >
                {className}
              </button>
            ))}
            <button
              onClick={toggleAtRiskFilter}
              className={`class-filter-button text-xs px-3 py-1.5 rounded-md ${
                showOnlyAtRisk
                  ? "bg-amber-500 text-white font-medium border-2 border-amber-500 shadow-md transform scale-105"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-gray-600"
              } transition-all duration-150`}
            >
              <div className="flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                <span>At Risk</span>
              </div>
            </button>
            <button
              onClick={toggleAttendanceRiskFilter}
              className={`class-filter-button text-xs px-3 py-1.5 rounded-md ${
                showOnlyAttendanceRisk
                  ? "bg-blue-500 text-white font-medium border-2 border-blue-500 shadow-md transform scale-105"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-gray-600"
              } transition-all duration-150`}
            >
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>Afwezigheidsrisico</span>
              </div>
            </button>
          </div>

          {studentGroups.length > 0 ? (
            <div className="overflow-y-auto custom-scrollbar" style={{ maxHeight: "calc(70vh - 50px)" }}>
              {studentGroups.map((group) => (
                <div key={group.class} className="mb-2">
                  <div className="text-xs font-medium text-[#49454F] dark:text-gray-300 px-3 py-1 sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                    {group.class}
                  </div>
                  <div className="px-1">{getColumnizedStudents(group.students, group.class)}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 text-center text-sm text-gray-500 dark:text-gray-400">Geen leerlingen gevonden</div>
          )}
        </div>
      )}
    </div>
  )
}
