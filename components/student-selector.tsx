"use client"

import { Check, ChevronDown, User, Search, AlertTriangle, Clock } from "lucide-react"
import { useStudent } from "@/contexts/student-context"
import { useState, useCallback, useEffect } from "react"
import { api } from "@/services/api" // Import the api service
import type { StudentListResponse } from "@/services/api"
import { studentsByClass } from "@/data/student-data" // Import studentsByClass to get all classes

// Define the classes dynamically from the database
const classes = Object.keys(studentsByClass)

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

  // Mock function for fetching student details (replace with actual implementation)
  const fetchStudentDetails = async (student: string, className: string) => {
    setIsLoadingStudentData(true)
    try {
      // Simulate fetching student details
      await new Promise((resolve) => setTimeout(resolve, 500))
      console.log(`Fetched details for student: ${student} from class: ${className}`)
      // Update student data in context (replace with actual data)
      setStudentData({ name: student, className: className, grade: 5, attendance: 90 })
    } catch (error) {
      console.error("Error fetching student details:", error)
    } finally {
      setIsLoadingStudentData(false)
    }
  }

  // Function to toggle class filter
  const toggleFilter = (className: string) => {
    setActiveFilters((prevFilters) =>
      prevFilters.includes(className)
        ? prevFilters.filter((filter) => filter !== className)
        : [...prevFilters, className],
    )
  }

  // Function to fetch student data from API
  const fetchStudentData = useCallback(async () => {
    setIsLoading(true)
    try {
      // Get current threshold values from localStorage
      let currentAttendanceThreshold = attendanceThreshold
      let currentIndividualGoal = 60 // Default value

      try {
        // First check global parameters
        const globalParamsJSON = localStorage.getItem("globalParameters")
        if (globalParamsJSON) {
          const globalParams = JSON.parse(globalParamsJSON)
          if (globalParams.individualGoal) {
            currentIndividualGoal = Number(globalParams.individualGoal)
          }
          if (globalParams.attendanceThreshold) {
            currentAttendanceThreshold = Number(globalParams.attendanceThreshold)
          }
        } else {
          // Fall back to legacy storage if global parameters not found
          const storedIndividualGoal = localStorage.getItem("globalIndividualGoal")
          const storedAttendanceThreshold = localStorage.getItem("globalAttendanceThreshold")

          if (storedIndividualGoal) {
            currentIndividualGoal = Number(storedIndividualGoal)
          }
          if (storedAttendanceThreshold) {
            currentAttendanceThreshold = Number(storedAttendanceThreshold)
          }
        }
      } catch (error) {
        console.error("Error loading threshold values:", error)
        // Use defaults if there's an error
      }

      // Use the API service to fetch student data with updated thresholds
      const response = await api.getStudentList({
        classes: activeFilters,
        searchTerm,
        showOnlyAtRisk,
        showOnlyAttendanceRisk,
        attendanceThreshold: currentAttendanceThreshold,
        individualGoal: currentIndividualGoal,
        seed: 42, // Add a consistent seed for deterministic results
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

  // Add this effect to refresh student data when thresholds change
  useEffect(() => {
    const handleThresholdUpdate = (event: CustomEvent) => {
      if (event.detail?.thresholdsUpdated) {
        // Refresh the student list with new threshold values
        fetchStudentData()
      }
    }

    window.addEventListener("refreshStudentData", handleThresholdUpdate as EventListener)

    return () => {
      window.removeEventListener("refreshStudentData", handleThresholdUpdate as EventListener)
    }
  }, [fetchStudentData])

  useEffect(() => {
    // Initialize default thresholds in localStorage if not already set
    const storedAttendanceThreshold = localStorage.getItem("globalAttendanceThreshold")
    const storedIndividualGoal = localStorage.getItem("globalIndividualGoal")

    if (!storedAttendanceThreshold) {
      localStorage.setItem("globalAttendanceThreshold", "80")
    }

    if (!storedIndividualGoal) {
      localStorage.setItem("globalIndividualGoal", "60")
    }

    // Also update any global parameters
    try {
      const globalParamsJSON = localStorage.getItem("globalParameters")
      const globalParams = globalParamsJSON ? JSON.parse(globalParamsJSON) : {}

      if (!globalParams.attendanceThreshold) {
        globalParams.attendanceThreshold = 80
      }

      if (!globalParams.individualGoal) {
        globalParams.individualGoal = 60
      }

      localStorage.setItem("globalParameters", JSON.stringify(globalParams))
    } catch (error) {
      console.error("Error updating global parameters:", error)
    }
  }, [])

  // Store and restore filter states between refreshes
  useEffect(() => {
    // Restore filters from localStorage on component mount
    const storedFilters = localStorage.getItem("studentSelectorFilters")
    if (storedFilters) {
      try {
        const parsedFilters = JSON.parse(storedFilters)
        if (parsedFilters.activeFilters && Array.isArray(parsedFilters.activeFilters)) {
          // Controleer of de opgeslagen filters nog steeds bestaan in de huidige klassenlijst
          const validFilters = parsedFilters.activeFilters.filter((filter) => classes.includes(filter))
          setActiveFilters(validFilters)
          console.log("Restored class filters from session:", validFilters)
        }
        if (parsedFilters.showOnlyAtRisk !== undefined) {
          setShowOnlyAtRisk(parsedFilters.showOnlyAtRisk)
        }
        if (parsedFilters.showOnlyAttendanceRisk !== undefined) {
          setShowOnlyAttendanceRisk(parsedFilters.showOnlyAttendanceRisk)
        }
        if (parsedFilters.searchTerm) {
          setSearchTerm(parsedFilters.searchTerm)
        }
        if (parsedFilters.isOpen !== undefined) {
          // Optioneel: ook de open/gesloten status van de dropdown onthouden
          setIsOpen(parsedFilters.isOpen)
        }
      } catch (error) {
        console.error("Error restoring filters from localStorage:", error)
      }
    }
  }, [classes]) // Voeg classes toe als dependency om te reageren op veranderingen in beschikbare klassen

  // Save filters to localStorage when they change
  useEffect(() => {
    const filtersToSave = {
      activeFilters,
      showOnlyAtRisk,
      showOnlyAttendanceRisk,
      searchTerm,
      isOpen, // Optioneel: ook de open/gesloten status van de dropdown opslaan
    }
    localStorage.setItem("studentSelectorFilters", JSON.stringify(filtersToSave))

    // Log voor debugging
    if (activeFilters.length > 0) {
      console.log("Saved class filters to session:", activeFilters)
    }
  }, [activeFilters, showOnlyAtRisk, showOnlyAttendanceRisk, searchTerm, isOpen])

  // Functie om alle filters te wissen
  const clearAllFilters = () => {
    setActiveFilters([])
    setShowOnlyAtRisk(false)
    setShowOnlyAttendanceRisk(false)
    setSearchTerm("")
  }

  const toggleAtRiskFilter = () => {
    setShowOnlyAtRisk(!showOnlyAtRisk)
    // Remove the code that turns off the other filter
  }

  const toggleAttendanceRiskFilter = () => {
    // Toggle de filter aan/uit
    setShowOnlyAttendanceRisk(!showOnlyAttendanceRisk)

    // Als we de filter aanzetten, log dan een bericht voor debugging
    if (!showOnlyAttendanceRisk) {
      console.log("Toon alleen leerlingen met aanwezigheidsrisico (klokicoontje)")
    }

    // Ververs de studentenlijst om de filter toe te passen
    // De API-aanroep in fetchStudentData gebruikt de showOnlyAttendanceRisk parameter
    // om alleen leerlingen met aanwezigheidsrisico te tonen
    fetchStudentData()
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
    // Sort students by name to ensure consistent order
    const sortedStudents = [...students].sort((a, b) => a.name.localeCompare(b.name))

    return sortedStudents.map((student) => {
      const { name, atRisk, atRiskReason, lowAttendance, attendancePercentage } = student

      // Get threshold values from localStorage or use defaults
      // First try to get from global parameters (which is the primary source)
      let individualGoal = 60 // Default value
      let attendanceThreshold = 80 // Default value

      try {
        // First check global parameters
        const globalParamsJSON = localStorage.getItem("globalParameters")
        if (globalParamsJSON) {
          const globalParams = JSON.parse(globalParamsJSON)
          if (globalParams.individualGoal) {
            individualGoal = Number(globalParams.individualGoal)
          }
          if (globalParams.attendanceThreshold) {
            attendanceThreshold = Number(globalParams.attendanceThreshold)
          }
        } else {
          // Fall back to legacy storage if global parameters not found
          const storedIndividualGoal = localStorage.getItem("globalIndividualGoal")
          const storedAttendanceThreshold = localStorage.getItem("globalAttendanceThreshold")

          if (storedIndividualGoal) {
            individualGoal = Number(storedIndividualGoal)
          }
          if (storedAttendanceThreshold) {
            attendanceThreshold = Number(storedAttendanceThreshold)
          }
        }

        // For individual students, check if they have a custom goal in their profile
        if (name) {
          const studentProfilesJSON = localStorage.getItem("studentProfiles")
          if (studentProfilesJSON) {
            const studentProfiles = JSON.parse(studentProfilesJSON)
            if (studentProfiles[name] && studentProfiles[name].individualGoal) {
              individualGoal = Number(studentProfiles[name].individualGoal)
            }
          }
        }
      } catch (error) {
        console.error("Error loading threshold values:", error)
        // Use defaults if there's an error
      }

      return (
        <div
          key={name}
          onClick={() => handleSelectStudent(name, className)}
          className={`flex items-center px-2 py-1.5 rounded-md cursor-pointer ${
            selectedStudent === name ? "bg-[#ECE6F0] dark:bg-gray-700" : "hover:bg-gray-100 dark:hover:bg-gray-700"
          }`}
          data-student-name={name}
        >
          <div className="flex items-center overflow-hidden flex-1">
            <User className="h-4 w-4 flex-shrink-0 text-[#49454F] dark:text-gray-300 mr-2" />
            <span className="text-sm truncate dark:text-gray-200">{name}</span>
          </div>

          {/* Fixed-width container for icons to ensure consistent alignment */}
          <div className="flex items-center gap-0.5 flex-shrink-0 w-[60px] justify-end">
            {/* Risk icons - only show if conditions are met based on thresholds */}
            <div className="flex items-center gap-0.5">
              {/* At risk icon - show when student is below their individual goal */}
              {atRisk && (
                <div className="relative group">
                  <div className="bg-amber-100 dark:bg-amber-900/60 p-0.5 rounded-full border-2 border-white dark:border-gray-800">
                    <AlertTriangle className="h-3 w-3 text-amber-500 dark:text-amber-400" />
                  </div>
                  <div className="absolute right-0 top-full mt-1 w-64 p-2 bg-black text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity z-50">
                    {language === "en"
                      ? `${atRiskReason || "Below individual goal"} (${individualGoal}%)`
                      : `${atRiskReason || "Onder individuele doelstelling"} (${individualGoal}%)`}
                  </div>
                </div>
              )}

              {/* Attendance risk icon - show ONLY when attendance is strictly below threshold */}
              {attendancePercentage < attendanceThreshold && (
                <div className="relative group attendance-risk-indicator">
                  <div className="bg-blue-100 dark:bg-blue-900/60 p-0.5 rounded-full border-2 border-white dark:border-gray-800">
                    <Clock className="h-3 w-3 text-blue-500 dark:text-blue-400" />
                  </div>
                  <div className="absolute right-0 top-full mt-1 w-64 p-2 bg-black text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity z-50">
                    <span className="font-medium">{language === "en" ? "Attendance Risk" : "Afwezigheidsrisico"}:</span>
                    {language === "en"
                      ? `Attendance (${attendancePercentage}%) is below threshold (${attendanceThreshold}%)`
                      : `Aanwezigheid (${attendancePercentage}%) is onder de grenswaarde (${attendanceThreshold}%)`}
                  </div>
                </div>
              )}
            </div>

            {/* Checkmark for selected student */}
            {selectedStudent === name && (
              <Check className="h-4 w-4 flex-shrink-0 text-[#49454F] dark:text-gray-300 ml-2" />
            )}
          </div>
        </div>
      )
    })
  }

  const handleSelectStudent = async (student: string, className: string) => {
    // First update the UI to show the selected student
    setSelectedStudent(student)
    setSelectedClass(className)
    setIsOpen(false)
    // Verwijder deze regel om de filters te behouden: setActiveFilters([])

    // Then fetch the detailed student data
    await fetchStudentDetails(student, className)
  }

  // Voeg een event listener toe om de attendanceData bij te werken wanneer deze verandert
  // Voeg deze useEffect toe na de andere useEffect hooks

  // Verbeter de event listener voor attendance updates
  useEffect(() => {
    const handleAttendanceUpdate = (event: CustomEvent) => {
      const { student, attendancePercentage, isBelowThreshold, threshold } = event.detail

      // Update de studentGroups met de nieuwe attendance data
      setStudentGroups((prevGroups) => {
        return prevGroups.map((group) => {
          // Zoek de student in deze groep
          const updatedStudents = group.students.map((s) => {
            if (s.name === student) {
              // Update de attendance data van deze student
              return {
                ...s,
                attendancePercentage: attendancePercentage,
                lowAttendance: isBelowThreshold,
              }
            }
            return s
          })

          return {
            ...group,
            students: updatedStudents,
          }
        })
      })

      // Als de attendance risk filter actief is, ververs dan de studentenlijst
      if (showOnlyAttendanceRisk) {
        fetchStudentData()
      }
    }

    // Voeg event listener toe
    window.addEventListener("updateStudentAttendance", handleAttendanceUpdate as EventListener)

    // Cleanup
    return () => {
      window.removeEventListener("updateStudentAttendance", handleAttendanceUpdate as EventListener)
    }
  }, [fetchStudentData, showOnlyAttendanceRisk])

  // Add this useEffect to listen for status updates from the progress-header
  useEffect(() => {
    const handleStatusUpdate = (event: CustomEvent) => {
      const { student, isAtRisk, atRiskReason, attendancePercentage, isBelowAttendanceThreshold } = event.detail

      // Update the studentGroups with the new status data
      setStudentGroups((prevGroups) => {
        return prevGroups.map((group) => {
          // Find the student in this group
          const updatedStudents = group.students.map((s) => {
            if (s.name === student) {
              // Update the status data for this student
              return {
                ...s,
                atRisk: isAtRisk,
                atRiskReason: atRiskReason,
                attendancePercentage: attendancePercentage,
                lowAttendance: isBelowAttendanceThreshold,
              }
            }
            return s
          })

          return {
            ...group,
            students: updatedStudents,
          }
        })
      })
    }

    // Add event listener
    window.addEventListener("updateStudentStatus", handleStatusUpdate as EventListener)

    // Cleanup
    return () => {
      window.removeEventListener("updateStudentStatus", handleStatusUpdate as EventListener)
    }
  }, [])

  // Add this function to refresh student statuses when the dropdown is opened
  const handleOpenDropdown = () => {
    setIsOpen(true)

    // Refresh student data to ensure statuses are up-to-date
    fetchStudentData()

    // Dispatch an event to request status updates for all visible students
    const refreshEvent = new CustomEvent("requestStatusRefresh", {
      detail: { requestedBy: "studentSelector" },
    })
    window.dispatchEvent(refreshEvent)
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
          onFocus={handleOpenDropdown}
        />
        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
          <button onClick={() => setIsOpen(!isOpen)} className="text-gray-500 dark:text-gray-400">
            <ChevronDown className="h-4 w-4" />
          </button>
        </div>
      </div>

      {isOpen && (
        <div
          className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 flex flex-col animate-in fade-in slide-in-from-top-2 duration-200"
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
              <div className="w-full flex flex-wrap justify-between items-center mb-2">
                <div className="flex flex-wrap gap-1 flex-1">
                  {classes.map((className) => {
                    // Determine grade level based on first digit
                    const gradeLevel = Number.parseInt(className.charAt(0))

                    // Set color based on grade level
                    let gradeColor = ""
                    if (gradeLevel <= 2) {
                      // First grade (1st and 2nd years) - light blue
                      gradeColor = activeFilters.includes(className)
                        ? "bg-blue-600 border-blue-600"
                        : "bg-blue-100 dark:bg-blue-900/30 border-blue-300 dark:border-blue-800"
                    } else if (gradeLevel <= 4) {
                      // Second grade (3rd and 4th years) - light green
                      gradeColor = activeFilters.includes(className)
                        ? "bg-green-600 border-green-600"
                        : "bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-800"
                    } else {
                      // Third grade (5th and 6th years) - light purple
                      gradeColor = activeFilters.includes(className)
                        ? "bg-purple-600 border-purple-600"
                        : "bg-purple-100 dark:bg-purple-900/30 border-purple-300 dark:border-purple-800"
                    }

                    return (
                      <button
                        key={className}
                        onClick={() => toggleFilter(className)}
                        className={`class-filter-button text-xs px-3 py-1.5 rounded-md ${
                          activeFilters.includes(className)
                            ? `${gradeColor} text-white font-medium border-2 shadow-md transform scale-105`
                            : `${gradeColor} text-gray-700 dark:text-gray-200 border`
                        } transition-all duration-150`}
                      >
                        {className}
                      </button>
                    )
                  })}
                </div>

                {/* Clear filters button - only shown when filters are active */}
                {(activeFilters.length > 0 || showOnlyAtRisk || showOnlyAttendanceRisk || searchTerm) && (
                  <button
                    onClick={clearAllFilters}
                    className="text-xs px-3 py-1.5 rounded-md bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-800/50 text-red-700 dark:text-red-300 border border-red-300 dark:border-red-800 ml-1 flex items-center gap-1 font-medium transition-all duration-150"
                    title={language === "en" ? "Clear all filters" : "Wis alle filters"}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                    <span>{language === "en" ? "Clear filters" : "Filters wissen"}</span>
                  </button>
                )}
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
                    <AlertTriangle className="h-3 w-3 text-amber-500 dark:text-amber-400" />
                    <span>{language === "en" ? "Goal" : "Doelstelling"}</span>
                  </div>
                </button>
                <button
                  onClick={toggleAttendanceRiskFilter}
                  className={`class-filter-button text-xs px-3 py-1.5 rounded-md ${
                    showOnlyAttendanceRisk
                      ? "bg-blue-500 text-white font-medium border-2 border-blue-500 shadow-md transform scale-105"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-gray-600"
                  } transition-all duration-150`}
                  title={
                    language === "en"
                      ? "Show only students with attendance risk"
                      : "Toon enkel leerlingen met afwezigheidsrisico"
                  }
                >
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3 text-blue-500 dark:text-blue-400" />
                    <span>{language === "en" ? "Attendance Risk" : "Afwezigheidsrisico"}</span>
                  </div>
                </button>

                {/* Active filters counter */}
                {(activeFilters.length > 0 || showOnlyAtRisk || showOnlyAttendanceRisk) && (
                  <div className="ml-auto text-xs px-3 py-1.5 rounded-md bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 font-medium flex items-center gap-1">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
                    </svg>
                    <span>
                      {language === "en" ? "Active filters: " : "Actieve filters: "}
                      {activeFilters.length + (showOnlyAtRisk ? 1 : 0) + (showOnlyAttendanceRisk ? 1 : 0)}
                    </span>
                  </div>
                )}
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
