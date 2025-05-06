"use client"

import { useState, useEffect } from "react"
import { X, AlertTriangle, Clock, Save, Check, ChevronDown, ChevronUp } from "lucide-react"

interface GlobalParametersModalProps {
  onClose: () => void
  language: "en" | "nl"
}

interface ClassThresholds {
  className: string
  attendanceThreshold: number
  individualGoal: number
  useGlobal: boolean
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
    },
  }

  const t = translations[language]

  // Load class data on mount
  useEffect(() => {
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

    // Initialize with default values
    setClassThresholds(
      classes.map((className) => ({
        className,
        attendanceThreshold: globalAttendanceThreshold,
        individualGoal: globalIndividualGoal,
        useGlobal: true,
      })),
    )
  }, [])

  // Handle global attendance threshold change
  const handleGlobalAttendanceChange = (value: number) => {
    if (value >= 50 && value <= 100) {
      setGlobalAttendanceThreshold(value)

      // Update all classes that use global settings
      setClassThresholds((prev) => prev.map((cls) => (cls.useGlobal ? { ...cls, attendanceThreshold: value } : cls)))
    }
  }

  // Handle global individual goal change
  const handleGlobalGoalChange = (value: number) => {
    if (value >= 50 && value <= 100) {
      setGlobalIndividualGoal(value)

      // Update all classes that use global settings
      setClassThresholds((prev) => prev.map((cls) => (cls.useGlobal ? { ...cls, individualGoal: value } : cls)))
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
              // Reset to global values if switching to global
              attendanceThreshold: useGlobal ? globalAttendanceThreshold : cls.attendanceThreshold,
              individualGoal: useGlobal ? globalIndividualGoal : cls.individualGoal,
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

  // Save all changes
  const saveChanges = async () => {
    setIsSaving(true)
    setSaveSuccess(false)
    setSaveError(false)

    try {
      // In a real app, this would be an API call
      // await api.updateGlobalParameters({
      //   globalAttendanceThreshold,
      //   globalIndividualGoal,
      //   classThresholds
      // })

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch (error) {
      console.error("Error saving global parameters:", error)
      setSaveError(true)
      setTimeout(() => setSaveError(false), 3000)
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

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Global Settings */}
          <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-4">{t.globalSettings}</h3>

            <div className="grid md:grid-cols-2 gap-4">
              {/* Attendance Risk Settings */}
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2 mb-3">
                  <input
                    type="checkbox"
                    id="enable-attendance-threshold"
                    defaultChecked={true}
                    className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                  />
                  <label htmlFor="enable-attendance-threshold" className="flex items-center gap-2 font-medium">
                    <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <span>{t.attendanceThreshold}</span>
                  </label>
                </div>

                <p className="text-xs text-gray-500 dark:text-gray-400 mb-3 ml-6">{t.attendanceDesc}</p>

                <div className="flex items-center gap-3 ml-6">
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
                      className="w-16 h-8 px-2 text-sm border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700 dark:text-gray-200"
                    />
                    <span className="ml-1 text-sm text-gray-500 dark:text-gray-400">%</span>
                  </div>
                </div>
              </div>

              {/* At Risk Settings */}
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2 mb-3">
                  <input
                    type="checkbox"
                    id="enable-individual-goal"
                    defaultChecked={true}
                    className="h-4 w-4 text-amber-600 rounded border-gray-300 focus:ring-amber-500"
                  />
                  <label htmlFor="enable-individual-goal" className="flex items-center gap-2 font-medium">
                    <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                    <span>{t.individualGoal}</span>
                  </label>
                </div>

                <p className="text-xs text-gray-500 dark:text-gray-400 mb-3 ml-6">{t.individualGoalDesc}</p>

                <div className="flex items-center gap-3 ml-6">
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
                      className="w-16 h-8 px-2 text-sm border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700 dark:text-gray-200"
                    />
                    <span className="ml-1 text-sm text-gray-500 dark:text-gray-400">%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Class Settings */}
          <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-4">{t.classSettings}</h3>

            <div className="space-y-3">
              {classThresholds.map((cls) => (
                <div
                  key={cls.className}
                  className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
                >
                  <div
                    className="p-3 flex items-center justify-between cursor-pointer"
                    onClick={() => setExpandedClass(expandedClass === cls.className ? null : cls.className)}
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id={`select-${cls.className}`}
                        checked={cls.useGlobal}
                        onChange={(e) => toggleClassSettings(cls.className, e.target.checked)}
                        onClick={(e) => e.stopPropagation()}
                        className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                      />
                      <label
                        htmlFor={`select-${cls.className}`}
                        className="font-medium text-gray-700 dark:text-gray-300"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {cls.className}
                      </label>
                      {!cls.useGlobal && (
                        <span className="px-2 py-0.5 text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full">
                          {t.customSettings}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {!cls.useGlobal && (
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                            <span className="text-xs text-gray-500 dark:text-gray-400">{cls.attendanceThreshold}%</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <AlertTriangle className="h-3 w-3 text-amber-600 dark:text-amber-400" />
                            <span className="text-xs text-gray-500 dark:text-gray-400">{cls.individualGoal}%</span>
                          </div>
                        </div>
                      )}
                      {expandedClass === cls.className ? (
                        <ChevronUp className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                      )}
                    </div>
                  </div>

                  {expandedClass === cls.className && !cls.useGlobal && (
                    <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                      <div className="grid md:grid-cols-2 gap-4">
                        {/* Class-specific Attendance Threshold */}
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <input
                              type="checkbox"
                              id={`attendance-${cls.className}`}
                              defaultChecked={true}
                              className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                            />
                            <label
                              htmlFor={`attendance-${cls.className}`}
                              className="flex items-center gap-1 text-sm font-medium text-gray-700 dark:text-gray-300"
                            >
                              <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                              <span>{t.attendanceThreshold}</span>
                            </label>
                          </div>

                          <div className="flex items-center gap-3 ml-6">
                            <input
                              type="range"
                              min="50"
                              max="100"
                              value={cls.attendanceThreshold}
                              onChange={(e) =>
                                updateClassThreshold(
                                  cls.className,
                                  "attendanceThreshold",
                                  Number.parseInt(e.target.value),
                                )
                              }
                              className="flex-1 h-2 bg-blue-200 dark:bg-blue-700 rounded-lg appearance-none cursor-pointer"
                            />
                            <div className="flex items-center">
                              <input
                                type="number"
                                min="50"
                                max="100"
                                value={cls.attendanceThreshold}
                                onChange={(e) =>
                                  updateClassThreshold(
                                    cls.className,
                                    "attendanceThreshold",
                                    Number.parseInt(e.target.value),
                                  )
                                }
                                className="w-16 h-8 px-2 text-sm border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700 dark:text-gray-200"
                              />
                              <span className="ml-1 text-sm text-gray-500 dark:text-gray-400">%</span>
                            </div>
                          </div>
                        </div>

                        {/* Class-specific Individual Goal */}
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <input
                              type="checkbox"
                              id={`goal-${cls.className}`}
                              defaultChecked={true}
                              className="h-4 w-4 text-amber-600 rounded border-gray-300 focus:ring-amber-500"
                            />
                            <label
                              htmlFor={`goal-${cls.className}`}
                              className="flex items-center gap-1 text-sm font-medium text-gray-700 dark:text-gray-300"
                            >
                              <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                              <span>{t.individualGoal}</span>
                            </label>
                          </div>

                          <div className="flex items-center gap-3 ml-6">
                            <input
                              type="range"
                              min="50"
                              max="100"
                              value={cls.individualGoal}
                              onChange={(e) =>
                                updateClassThreshold(cls.className, "individualGoal", Number.parseInt(e.target.value))
                              }
                              className="flex-1 h-2 bg-amber-200 dark:bg-amber-700 rounded-lg appearance-none cursor-pointer"
                            />
                            <div className="flex items-center">
                              <input
                                type="number"
                                min="50"
                                max="100"
                                value={cls.individualGoal}
                                onChange={(e) =>
                                  updateClassThreshold(cls.className, "individualGoal", Number.parseInt(e.target.value))
                                }
                                className="w-16 h-8 px-2 text-sm border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700 dark:text-gray-200"
                              />
                              <span className="ml-1 text-sm text-gray-500 dark:text-gray-400">%</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
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
              disabled={isSaving}
              className={`px-4 py-2 text-sm text-white rounded-md flex items-center gap-2 ${
                isSaving
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
