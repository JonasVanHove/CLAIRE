"use client"

import { Check, ChevronDown, User, Search, AlertTriangle, Clock } from "lucide-react"
import { useStudent } from "@/contexts/student-context"
import { useState, useCallback, useEffect } from "react"
import { api } from "@/services/api" // Import the api service
import type { StudentListResponse } from "@/services/api"

// Define the classes we have
const classes = ["1Moderne", "2Moderne", "3STEM", "3TW", "3LAT", "4Sport", "4Mechanica", "4Handel", "5WeWi", "6WeWi"]

export function StudentSelector() {
  const { selectedStudent, selectedClass, setSelectedStudent, setSelectedClass, setStudentData, language } =
    useStudent()
  const [searchTerm, setSearchTerm] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const [activeFilters, setActiveFilters] = useState<string[]>([])
  const [showOnlyAtRisk, setShowOnlyAtRisk] = useState(false)
  const [showOnlyAttendanceRisk, setShowOnlyAttendanceRisk] = useState(false)
  const attendanceThreshold = 85 // Default threshold

  // State to store API response data
  const [studentGroups, setStudentGroups] = useState<StudentListResponse[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingStudentData, setIsLoadingStudentData] = useState(false)

  // Function to fetch student data from API
  const fetchStudentData = useCallback(async () => {
    setIsLoading(true)
    try {
      // Use the API service to fetch student data
      const response = await api.getStudentList({
        classes: activeFilters,
        searchTerm,
        showOnlyAtRisk,
        showOnlyAttendanceRisk,
        attendanceThreshold,
      })

      setStudentGroups(response)
    } catch (error) {
      console.error("Error fetching student data:", error)
      // Handle error state
      setStudentGroups([])
    } finally {
      setIsLoading(false)
    }
  }, [searchTerm, activeFilters, showOnlyAtRisk, showOnlyAttendanceRisk, attendanceThreshold])

  // Call the API when filter parameters change
  useEffect(() => {
    fetchStudentData()
  }, [fetchStudentData])

  // Function to fetch detailed student information when a student is selected
  const fetchStudentDetails = useCallback(
    async (studentName: string, className: string) => {
      setIsLoadingStudentData(true)
      try {
        // Use the API service to fetch student details
        const studentData = await api.getStudentDetails(studentName, className)

        // Update the student context with the fetched data
        setStudentData(studentData)

        // Instead of adding a CSS class to the body, we'll use our own loading state
        // which is already handled by the isLoadingStudentData state

        return studentData
      } catch (error) {
        console.error("Error fetching student details:", error)
        // Handle error state
        return null
      } finally {
        setIsLoadingStudentData(false)
      }
    },
    [setStudentData],
  )

  const handleSelectStudent = async (student: string, className: string) => {
    // First update the UI to show the selected student
    setSelectedStudent(student)
    setSelectedClass(className)
    setIsOpen(false)
    setActiveFilters([])

    // Then fetch the detailed student data
    await fetchStudentDetails(student, className)
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
    // Remove the code that turns off the other filter
  }

  const toggleAttendanceRiskFilter = () => {
    setShowOnlyAttendanceRisk(!showOnlyAttendanceRisk)
    // Remove the code that turns off the other filter
  }

  // Split students into two columns
  const getColumnizedStudents = (
    students: {
      name: string
      atRisk: boolean
      atRiskReason?: string | null
      lowAttendance: boolean
      attendancePercentage: number
    }[],
    className: string,
  ) => {
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

  const renderStudentList = (
    students: {
      name: string
      atRisk: boolean
      atRiskReason?: string | null
      lowAttendance: boolean
      attendancePercentage: number
    }[],
    className: string,
  ) => {
    return students.map((student) => {
      const { name, atRisk, atRiskReason, lowAttendance, attendancePercentage } = student

      return (
        <div
          key={name}
          onClick={() => handleSelectStudent(name, className)}
          className={`flex items-center justify-between px-2 py-1.5 rounded-md cursor-pointer ${
            selectedStudent === name ? "bg-[#ECE6F0] dark:bg-gray-700" : "hover:bg-gray-100 dark:hover:bg-gray-700"
          }`}
        >
          <div className="flex items-center gap-2 overflow-hidden">
            <User className="h-4 w-4 flex-shrink-0 text-[#49454F] dark:text-gray-300" />
            <span className="text-sm truncate dark:text-gray-200">{name}</span>
            {atRisk && (
              <div className="relative group flex-shrink-0">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                <div className="absolute left-0 top-full mt-1 w-64 p-2 bg-black text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity z-50">
                  {language === "en"
                    ? `${atRiskReason || "Student at risk"} (below individual goal)`
                    : `${atRiskReason || "Student at risk"} (onder individuele doelstelling)`}
                </div>
              </div>
            )}
            {lowAttendance && (
              <div className="relative group flex-shrink-0">
                <Clock className="h-4 w-4 text-blue-500" />
                <div className="absolute left-0 top-full mt-1 w-64 p-2 bg-black text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity z-50">
                  {language === "en"
                    ? `Attendance (${attendancePercentage}%) is below threshold`
                    : `Aanwezigheid (${attendancePercentage}%) is onder de grenswaarde`}
                </div>
              </div>
            )}
          </div>
          {selectedStudent === name && <Check className="h-4 w-4 flex-shrink-0 text-[#49454F] dark:text-gray-300" />}
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
          placeholder={language === "en" ? "Search and select a student..." : "Zoek en selecteer een leerling..."}
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
          <div className="relative">
            {isLoading && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/80 dark:bg-gray-800/80">
                <div
                  className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-solid border-current border-r-transparent motion-reduce:animate-[spin_1.5s_linear_infinite]"
                  role="status"
                >
                  <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
                    Loading...
                  </span>
                </div>
              </div>
            )}
            <div className="class-filter-buttons dark:bg-gray-800 dark:border-gray-700 flex flex-wrap gap-1 p-2 border-b border-gray-200 dark:border-gray-700">
              <div className="w-full flex flex-wrap gap-1 mb-2">
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
              </div>

              <div className="w-full flex flex-wrap gap-1">
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
                    <span>{language === "en" ? "At Risk" : "At Risk"}</span>
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
                    <span>{language === "en" ? "Attendance Risk" : "Afwezigheidsrisico"}</span>
                  </div>
                </button>
              </div>
            </div>
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
            <div className="p-4 text-center text-sm text-gray-500 dark:text-gray-400">
              {language === "en" ? "No students found" : "Geen leerlingen gevonden"}
            </div>
          )}
        </div>
      )}

      {/* Global loading indicator for student data */}
      {isLoadingStudentData && (
        <div className="fixed inset-0 bg-black bg-opacity-20 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-lg flex items-center gap-3">
            <div
              className="inline-block h-6 w-6 animate-spin rounded-full border-3 border-solid border-blue-500 border-r-transparent motion-reduce:animate-[spin_1.5s_linear_infinite]"
              role="status"
            >
              <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
                Loading...
              </span>
            </div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {language === "en" ? "Loading student data..." : "Leerlinggegevens laden..."}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
