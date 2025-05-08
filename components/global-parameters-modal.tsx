"use client"

import { useState, useEffect } from "react"
import { X, AlertTriangle, Save, Check } from "lucide-react"

interface GlobalParametersModalProps {
  onClose: () => void
  language: "en" | "nl"
}

interface ClassThresholds {
  className: string
  attendanceThreshold: number
  individualGoal: number
  useGlobal: boolean
  selected?: boolean
  hasCustomStudentGoals?: boolean
  hasCustomAttendanceThresholds?: boolean
}

// Enhanced API object with database storage simulation
const api = {
  // Simulate database storage using localStorage
  saveThresholdsToDB: async (data: {
    globalAttendanceThreshold: number
    globalIndividualGoal: number
    classThresholds: ClassThresholds[]
  }) => {
    try {
      console.log("Saving thresholds to database:", data)

      // Store global thresholds
      localStorage.setItem("globalAttendanceThreshold", data.globalAttendanceThreshold.toString())
      localStorage.setItem("globalIndividualGoal", data.globalIndividualGoal.toString())

      // Store class-specific thresholds
      const classThresholdsData = data.classThresholds.map((cls) => ({
        className: cls.className,
        attendanceThreshold: cls.attendanceThreshold,
        individualGoal: cls.individualGoal,
        useGlobal: cls.useGlobal,
      }))

      localStorage.setItem("classThresholds", JSON.stringify(classThresholdsData))

      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 500))

      return { success: true, message: "Thresholds saved to database successfully" }
    } catch (error) {
      console.error("Error saving thresholds to database:", error)
      return { success: false, message: "Failed to save thresholds to database" }
    }
  },

  // Load thresholds from database
  loadThresholdsFromDB: async () => {
    try {
      console.log("Loading thresholds from database")

      // Retrieve global thresholds
      const globalAttendanceThreshold = localStorage.getItem("globalAttendanceThreshold")
      const globalIndividualGoal = localStorage.getItem("globalIndividualGoal")

      // Retrieve class-specific thresholds
      const classThresholdsJSON = localStorage.getItem("classThresholds")
      const classThresholds = classThresholdsJSON ? JSON.parse(classThresholdsJSON) : []

      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 300))

      return {
        success: true,
        data: {
          globalAttendanceThreshold: globalAttendanceThreshold ? Number.parseInt(globalAttendanceThreshold) : 80,
          globalIndividualGoal: globalIndividualGoal ? Number.parseInt(globalIndividualGoal) : 60,
          classThresholds,
        },
      }
    } catch (error) {
      console.error("Error loading thresholds from database:", error)
      return {
        success: false,
        data: {
          globalAttendanceThreshold: 80,
          globalIndividualGoal: 60,
          classThresholds: [],
        },
      }
    }
  },

  // Update global thresholds for selected classes
  updateGlobalThresholds: async (params: {
    attendanceThreshold: number
    individualGoal: number
    targetClasses: "all" | string[]
  }) => {
    console.log("Updating global thresholds:", params)

    try {
      // Load current thresholds
      const { data } = await api.loadThresholdsFromDB()

      // Update thresholds for target classes
      const updatedClassThresholds = data.classThresholds.map((cls) => {
        // Check if this class should be updated
        const shouldUpdate =
          params.targetClasses === "all" ||
          (Array.isArray(params.targetClasses) && params.targetClasses.includes(cls.className))

        if (shouldUpdate) {
          return {
            ...cls,
            attendanceThreshold: params.attendanceThreshold,
            individualGoal: params.individualGoal,
          }
        }

        return cls
      })

      // Save updated thresholds
      await api.saveThresholdsToDB({
        globalAttendanceThreshold: params.attendanceThreshold,
        globalIndividualGoal: params.individualGoal,
        classThresholds: updatedClassThresholds,
      })

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 500))

      return { success: true }
    } catch (error) {
      console.error("Error updating global thresholds:", error)
      return { success: false }
    }
  },
}

export function GlobalParametersModal({ onClose, language }: GlobalParametersModalProps) {
  // Global thresholds
  const [globalAttendanceThreshold, setGlobalAttendanceThreshold] = useState(80)
  const [globalIndividualGoal, setGlobalIndividualGoal] = useState(60)

  // Class-specific thresholds
  const [classThresholds, setClassThresholds] = useState<ClassThresholds[]>([])
  const [expandedClass, setExpandedClass] = useState<string | null>(null)

  // Saving states
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [saveError, setSaveError] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Translations
  const translations = {
    en: {
      title: "Global Parameters",
      subtitle: "Set risk thresholds for all students or by class",
      globalSettings: "Global Settings",
      attendanceThreshold: "Attendance Threshold",
      attendanceDesc: "Students with attendance below this percentage are at attendance risk",
      individualGoal: "Individual Goal",
      individualGoalDesc: "Students with competency achievement below this percentage are at risk",
      classSettings: "Class Settings",
      useGlobalSettings: "Use global settings",
      customSettings: "Custom settings",
      save: "Save Changes",
      saving: "Saving...",
      saved: "Changes saved successfully!",
      error: "Error saving changes",
      cancel: "Cancel",
      allClasses: "All Classes",
      expandClass: "Expand class settings",
      collapseClass: "Collapse class settings",
      loading: "Loading settings...",
      custom: "[custom]",
    },
    nl: {
      title: "Globale Parameters",
      subtitle: "Stel risicodrempels in voor alle leerlingen of per klas",
      globalSettings: "Globale Instellingen",
      attendanceThreshold: "Aanwezigheidsdrempel",
      attendanceDesc: "Leerlingen met aanwezigheid onder dit percentage hebben aanwezigheidsrisico",
      individualGoal: "Individuele Doelstelling",
      individualGoalDesc: "Leerlingen met competentiebehaald onder dit percentage zijn at risk",
      classSettings: "Klasinstellingen",
      useGlobalSettings: "Gebruik globale instellingen",
      customSettings: "Aangepaste instellingen",
      save: "Wijzigingen Opslaan",
      saving: "Opslaan...",
      saved: "Wijzigingen succesvol opgeslagen!",
      error: "Fout bij opslaan wijzigingen",
      cancel: "Annuleren",
      allClasses: "Alle Klassen",
      expandClass: "Klasinstellingen uitklappen",
      collapseClass: "Klasinstellingen inklappen",
      loading: "Instellingen laden...",
      custom: "[aangepast]",
    },
  }

  const t = translations[language]

  // Function to check for custom student thresholds (both goals and attendance)
  const checkForCustomStudentThresholds = () => {
    try {
      // Get student profiles from localStorage
      const studentProfilesJSON = localStorage.getItem("studentProfiles")
      if (!studentProfilesJSON) return { goals: {}, attendance: {} }

      const studentProfiles = JSON.parse(studentProfilesJSON)

      // Create maps to track which classes have students with custom thresholds
      const classesWithCustomGoals = {}
      const classesWithCustomAttendance = {}

      // Iterate through student profiles
      Object.keys(studentProfiles).forEach((studentName) => {
        // Extract class from student name (assuming format like "John Doe (3STEM)")
        const classMatch = studentName.match(/$$([^)]+)$$/)
        if (classMatch && classMatch[1]) {
          const className = classMatch[1]
          // If this student has an individual goal set
          if (studentProfiles[studentName]?.individualGoal) {
            classesWithCustomGoals[className] = true
          }
          // If this student has a custom attendance threshold
          if (studentProfiles[studentName]?.attendanceThreshold) {
            classesWithCustomAttendance[className] = true
          }
        }
      })

      return { goals: classesWithCustomGoals, attendance: classesWithCustomAttendance }
    } catch (error) {
      console.error("Error checking for custom student thresholds:", error)
      return { goals: {}, attendance: {} }
    }
  }

  // Load class data and thresholds on mount
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)

      try {
        // In a real app, this would fetch from an API
        const classes = [
          "1Moderne",
          "2Moderne",
          "3STEM",
          "3TW",
          "3LAT",
          "4Sport",
          "4Mechanica",
          "4Handel",
          "5WeWi",
          "6WeWi",
        ]

        // Load thresholds from database
        const { success, data } = await api.loadThresholdsFromDB()

        // Check which classes have students with custom thresholds
        const { goals: classesWithCustomGoals, attendance: classesWithCustomAttendance } =
          checkForCustomStudentThresholds()

        if (success) {
          // Set global thresholds
          setGlobalAttendanceThreshold(data.globalAttendanceThreshold)
          setGlobalIndividualGoal(data.globalIndividualGoal)

          // Map stored class thresholds to our format
          const storedClassMap = new Map(data.classThresholds.map((cls) => [cls.className, cls]))

          // Initialize class thresholds with stored values or defaults
          const initializedClasses = classes.map((className) => {
            const storedClass = storedClassMap.get(className)

            if (storedClass) {
              return {
                ...storedClass,
                selected: false,
                hasCustomStudentGoals: classesWithCustomGoals[className] || false,
                hasCustomAttendanceThresholds: classesWithCustomAttendance[className] || false,
              }
            }

            return {
              className,
              attendanceThreshold: data.globalAttendanceThreshold,
              individualGoal: data.globalIndividualGoal,
              useGlobal: true,
              selected: false,
              hasCustomStudentGoals: classesWithCustomGoals[className] || false,
              hasCustomAttendanceThresholds: classesWithCustomAttendance[className] || false,
            }
          })

          setClassThresholds(initializedClasses)
        } else {
          // Initialize with default values if loading fails
          setClassThresholds(
            classes.map((className) => ({
              className,
              attendanceThreshold: globalAttendanceThreshold,
              individualGoal: globalIndividualGoal,
              useGlobal: true,
              selected: false,
              hasCustomStudentGoals: classesWithCustomGoals[className] || false,
              hasCustomAttendanceThresholds: classesWithCustomAttendance[className] || false,
            })),
          )
        }
      } catch (error) {
        console.error("Error loading data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  // Handle global attendance threshold change
  const handleGlobalAttendanceChange = (value: number) => {
    if (value >= 50 && value <= 100) {
      setGlobalAttendanceThreshold(value)
      // No longer update class thresholds in real-time
    }
  }

  // Handle global individual goal change
  const handleGlobalGoalChange = (value: number) => {
    if (value >= 50 && value <= 100) {
      setGlobalIndividualGoal(value)
      // No longer update class thresholds in real-time
    }
  }

  // Toggle class using global or custom settings
  const toggleClassSettings = (className: string, useGlobal: boolean) => {
    setClassThresholds((prev) =>
      prev.map((cls) =>
        cls.className === className
          ? {
              ...cls,
              useGlobal,
              // Only reset attendance threshold if switching to global, keep individualGoal unchanged
              attendanceThreshold: useGlobal ? globalAttendanceThreshold : cls.attendanceThreshold,
              // Keep the individualGoal (class goal) unchanged regardless of global/custom setting
              individualGoal: cls.individualGoal,
            }
          : cls,
      ),
    )
  }

  // Update class-specific threshold
  const updateClassThreshold = (className: string, field: "attendanceThreshold" | "individualGoal", value: number) => {
    if (value >= 50 && value <= 100) {
      setClassThresholds((prev) => prev.map((cls) => (cls.className === className ? { ...cls, [field]: value } : cls)))
    }
  }

  // Update the saveChanges function to save to database and trigger a reload
  const [attendanceThreshold, setAttendanceThreshold] = useState(80)
  const [individualGoal, setIndividualGoal] = useState(60)
  const [selectedClasses, setSelectedClasses] = useState<string[]>([])

  useEffect(() => {
    setAttendanceThreshold(globalAttendanceThreshold)
  }, [globalAttendanceThreshold])

  useEffect(() => {
    setIndividualGoal(globalIndividualGoal)
  }, [globalIndividualGoal])

  useEffect(() => {
    const selected = classThresholds.filter((cls) => cls.selected).map((cls) => cls.className)
    setSelectedClasses(selected)
  }, [classThresholds])

  const saveChanges = async () => {
    setIsSaving(true)
    setSaveSuccess(false)
    setSaveError(false)

    try {
      // Get the selected classes
      const selectedClassList = classThresholds.filter((cls) => cls.selected).map((cls) => cls.className)

      if (selectedClassList.length === 0) {
        // If no classes are selected, just show a message and return
        setSaveError(true)
        return
      }

      // Create updated class thresholds
      const updatedClassThresholds = classThresholds.map((cls) => {
        // Only update selected classes with global values
        if (cls.selected) {
          return {
            ...cls,
            attendanceThreshold: globalAttendanceThreshold,
            individualGoal: globalIndividualGoal,
            selected: false, // Reset selection
          }
        }
        return cls
      })

      // Save updated thresholds to database
      const dbSaveResult = await api.saveThresholdsToDB({
        globalAttendanceThreshold,
        globalIndividualGoal,
        classThresholds: updatedClassThresholds,
      })

      if (!dbSaveResult.success) {
        throw new Error("Failed to save thresholds to database")
      }

      // Update the class thresholds state
      setClassThresholds(updatedClassThresholds)

      // Show success message
      setSaveSuccess(true)

      // Dispatch a custom event to notify other components that thresholds have been updated
      const event = new CustomEvent("refreshStudentData", {
        detail: {
          thresholdsUpdated: true,
          classesUpdated: selectedClassList,
        },
      })
      window.dispatchEvent(event)

      // Close the modal after a short delay
      setTimeout(() => {
        onClose()
      }, 1500)
    } catch (error) {
      console.error("Error saving threshold changes:", error)
      setSaveError(true)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{t.title}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">{t.subtitle}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content - Compact Version */}
        <div className="flex-1 overflow-y-auto p-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="flex flex-col items-center">
                <svg
                  className="animate-spin h-8 w-8 text-blue-500 mb-2"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                <span className="text-sm text-gray-500 dark:text-gray-400">{t.loading}</span>
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
              {/* Global Values */}
              <div className="grid grid-cols-2 gap-6 mb-6">
                {/* Attendance Threshold */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t.attendanceThreshold}
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="50"
                      max="100"
                      value={globalAttendanceThreshold}
                      onChange={(e) => handleGlobalAttendanceChange(Number.parseInt(e.target.value))}
                      className="flex-1 h-2 bg-blue-200 dark:bg-blue-700 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex items-center">
                      <input
                        type="number"
                        min="50"
                        max="100"
                        value={globalAttendanceThreshold}
                        onChange={(e) => handleGlobalAttendanceChange(Number.parseInt(e.target.value))}
                        className="w-14 h-8 px-2 text-sm border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700 dark:text-gray-200"
                      />
                      <span className="ml-1 text-sm text-gray-500 dark:text-gray-400">%</span>
                    </div>
                  </div>
                </div>

                {/* Individual Goal */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t.individualGoal}
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="50"
                      max="100"
                      value={globalIndividualGoal}
                      onChange={(e) => handleGlobalGoalChange(Number.parseInt(e.target.value))}
                      className="flex-1 h-2 bg-amber-200 dark:bg-amber-700 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex items-center">
                      <input
                        type="number"
                        min="50"
                        max="100"
                        value={globalIndividualGoal}
                        onChange={(e) => handleGlobalGoalChange(Number.parseInt(e.target.value))}
                        className="w-14 h-8 px-2 text-sm border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700 dark:text-gray-200"
                      />
                      <span className="ml-1 text-sm text-gray-500 dark:text-gray-400">%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Class-Specific Thresholds */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {language === "en" ? "Class-Specific Thresholds" : "Klasspecifieke Drempelwaarden"}
                  </label>
                  <span className="text-xs text-blue-600 dark:text-blue-400">
                    {language === "en"
                      ? "Individual settings are managed per student"
                      : "Individuele instellingen worden per leerling beheerd"}
                  </span>
                </div>

                <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                  {language === "en"
                    ? "Select classes to update with the global values above when saving"
                    : "Selecteer klassen om bij te werken met de bovenstaande globale waarden bij het opslaan"}
                </p>

                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="select-all-classes"
                      checked={classThresholds.every((cls) => cls.selected)}
                      onChange={(e) => {
                        // Update all checkboxes to match this one
                        setClassThresholds((prev) =>
                          prev.map((cls) => ({
                            ...cls,
                            selected: e.target.checked,
                          })),
                        )
                      }}
                      className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                    />
                    <label htmlFor="select-all-classes" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      {language === "en" ? "Select All" : "Alles Selecteren"}
                    </label>
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {classThresholds.filter((cls) => cls.selected).length} / {classThresholds.length}{" "}
                    {language === "en" ? "selected" : "geselecteerd"}
                  </span>
                </div>

                {/* Class Selection */}
                <div className="max-h-48 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-md">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 dark:bg-gray-800/50 sticky top-0">
                      <tr className="border-b border-gray-200 dark:border-gray-700">
                        <th className="py-2 px-3 text-left font-medium text-gray-500 dark:text-gray-400">
                          {language === "en" ? "Class" : "Klas"}
                        </th>
                        <th className="py-2 px-3 text-center font-medium text-gray-500 dark:text-gray-400">
                          {t.attendanceThreshold}
                        </th>
                        <th className="py-2 px-3 text-center font-medium text-gray-500 dark:text-gray-400">
                          {language === "en"
                            ? "Class Goal (Individual when customized)"
                            : "Klasdoelstelling (Individueel bij aanpassing)"}
                        </th>
                        <th className="py-2 px-3 text-center font-medium text-gray-500 dark:text-gray-400">
                          {language === "en" ? "Update" : "Bijwerken"}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {classThresholds.map((cls) => (
                        <tr
                          key={cls.className}
                          className="border-b border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/20"
                        >
                          <td className="py-2 px-3">
                            <span className="text-gray-700 dark:text-gray-300">{cls.className}</span>
                          </td>
                          <td className="py-2 px-3 text-center">
                            {cls.hasCustomAttendanceThresholds ? (
                              <span className="px-2 py-1 rounded-md text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
                                {t.custom}
                              </span>
                            ) : (
                              <span
                                className={`px-2 py-1 rounded-md text-xs font-medium ${
                                  cls.attendanceThreshold < 70
                                    ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                                    : cls.attendanceThreshold < 80
                                      ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300"
                                      : "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                                }`}
                              >
                                {cls.attendanceThreshold}%
                              </span>
                            )}
                          </td>
                          <td className="py-2 px-3 text-center">
                            {cls.hasCustomStudentGoals ? (
                              <span className="px-2 py-1 rounded-md text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
                                {t.custom}
                              </span>
                            ) : (
                              <span
                                className={`px-2 py-1 rounded-md text-xs font-medium ${
                                  cls.individualGoal < 60
                                    ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                                    : cls.individualGoal < 70
                                      ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300"
                                      : "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                                }`}
                              >
                                {cls.individualGoal}%
                              </span>
                            )}
                          </td>
                          <td className="py-2 px-3 text-center">
                            <div className="flex justify-center">
                              <input
                                type="checkbox"
                                id={`select-${cls.className}`}
                                checked={cls.selected}
                                onChange={(e) => {
                                  setClassThresholds((prev) =>
                                    prev.map((c) =>
                                      c.className === cls.className ? { ...c, selected: e.target.checked } : c,
                                    ),
                                  )
                                }}
                                className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                              />
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div>
            {saveSuccess && (
              <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                <Check className="h-4 w-4" />
                <span className="text-sm">{t.saved}</span>
              </div>
            )}
            {saveError && (
              <div className="flex items-center gap-1 text-red-600 dark:text-red-400">
                <AlertTriangle className="h-4 w-4" />
                <span className="text-sm">{t.error}</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
            >
              {t.cancel}
            </button>
            <button
              onClick={saveChanges}
              disabled={isSaving || isLoading}
              className={`px-4 py-2 text-sm text-white rounded-md flex items-center gap-2 ${
                isSaving || isLoading
                  ? "bg-blue-400 dark:bg-blue-600 cursor-not-allowed"
                  : "bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600"
              }`}
            >
              {isSaving ? (
                <>
                  <svg
                    className="animate-spin h-4 w-4 text-white"
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
                <>
                  <Save className="h-4 w-4" />
                  {t.save}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
