/**
 * Student Data Module
 *
 * This module contains mock data and helper functions for the student dashboard.
 * It provides data structures and functions to simulate a real API for student data,
 * competencies, activities, and other information needed by the dashboard components.
 *
 * @module data/student-data
 */

// Define the exact subject list
export const SUBJECTS = [
  "Wiskunde",
  "Nederlands",
  "Frans",
  "Engels",
  "Levensbeschouwelijke vakken",
  "Geschiedenis",
  "Lichamelijke opvoeding",
  "Mechanica",
  "Elektromagnetisme",
  "Natuurwetenschappen",
  "Artistieke vorming",
  "Toegepaste informatica",
  "Thermodynamica",
  "Project STEM",
] as const

export type Subject = (typeof SUBJECTS)[number]

/**
 * xAPI Statement interface for student performance data
 *
 * @interface XAPIStatement
 * @property {Object} actor - Student information
 * @property {string} actor.name - Student name
 * @property {string} actor.mbox - Student email
 * @property {string} actor.class - Student class
 * @property {string} [actor.profileImage] - URL to student's profile image
 * @property {boolean} [actor.atRisk] - Whether the student is at risk
 * @property {Object} verb - Action verb
 * @property {string} verb.id - Verb ID
 * @property {Object} verb.display - Verb display text
 * @property {string} verb.display.nl - Dutch verb display text
 * @property {Object} object - Activity object
 * @property {string} object.id - Activity ID
 * @property {Object} object.definition - Activity definition
 * @property {Object} object.definition.name - Activity name
 * @property {Subject} object.definition.name.nl - Dutch activity name
 * @property {string} object.definition.type - Activity type
 * @property {1|2|3} object.definition.semester - Semester number
 * @property {Object} result - Activity result
 * @property {Object} result.score - Score information
 * @property {number} result.score.scaled - Scaled score (0-1)
 * @property {number} result.score.raw - Raw score
 * @property {number} result.score.min - Minimum possible score
 * @property {number} result.score.max - Maximum possible score
 * @property {boolean} result.completion - Whether the activity is completed
 * @property {boolean} [result.success] - Whether the activity was successful
 * @property {Object} [result.competencies] - Competency information
 * @property {number} result.competencies.achieved - Number of achieved competencies
 * @property {number} result.competencies.total - Total number of competencies
 * @property {number} [result.activities] - Number of activities
 * @property {string} timestamp - Timestamp of the statement
 */
export interface XAPIStatement {
  actor: {
    name: string
    mbox: string
    class: string
    profileImage?: string
    atRisk?: boolean
  }
  verb: {
    id: string
    display: {
      nl: string
    }
  }
  object: {
    id: string
    definition: {
      name: {
        nl: Subject
      }
      type: string
      semester: 1 | 2 | 3
    }
  }
  result: {
    score: {
      scaled: number
      raw: number
      min: number
      max: number
    }
    completion: boolean
    success?: boolean
    competencies?: {
      achieved: number
      total: number
    }
    activities?: number
  }
  timestamp: string
}

/**
 * Activity interface for student activities
 *
 * @interface Activity
 * @property {string} id - Activity ID
 * @property {"toets"|"taak"|"examen"} type - Activity type
 * @property {string} title - Activity title
 * @property {number} score - Activity score
 * @property {number} maxScore - Maximum possible score
 * @property {boolean} completed - Whether the activity is completed
 * @property {boolean} evaluated - Whether the activity is evaluated
 * @property {string} date - Activity date (ISO string)
 * @property {string} [notes] - Activity notes
 * @property {1|2|3} semester - Semester number
 * @property {Object} classDistribution - Class distribution information
 * @property {number} classDistribution.min - Minimum score in class
 * @property {number} classDistribution.max - Maximum score in class
 * @property {number} classDistribution.average - Average score in class
 * @property {number} classDistribution.studentCount - Number of students
 * @property {number} classDistribution.lowPerformers - Percentage of low performers
 * @property {number} classDistribution.mediumPerformers - Percentage of medium performers
 * @property {number} classDistribution.highPerformers - Percentage of high performers
 * @property {"onder"|"boven"|"gemiddeld"} relativePerformance - Relative performance
 * @property {string} competencyId - ID of the competency this activity is for
 * @property {string} subjectId - ID of the subject this activity belongs to
 */
export interface Activity {
  id: string
  type: "toets" | "taak" | "examen"
  title: string
  score: number
  maxScore: number
  completed: boolean
  evaluated: boolean
  date: string
  notes?: string
  semester: 1 | 2 | 3 // Add semester information
  classDistribution: {
    min: number
    max: number
    average: number
    studentCount: number
    lowPerformers: number // Percentage of students scoring <50%
    mediumPerformers: number // Percentage of students scoring 50-70%
    highPerformers: number // Percentage of students scoring >70%
  }
  relativePerformance: "onder" | "boven" | "gemiddeld"
  competencyId: string // Reference to the competency this activity is for
  subjectId: string // Reference to the subject this activity belongs to
}

/**
 * Competency interface for student competencies
 *
 * @interface Competency
 * @property {string} id - Competency ID
 * @property {string} title - Competency title
 * @property {"not-achieved"|"partially-achieved"|"achieved"} status - Competency status
 * @property {Object} classDistribution - Class distribution information
 * @property {number} classDistribution.notAchieved - Percentage of students who have not achieved
 * @property {number} classDistribution.partiallyAchieved - Percentage of students who have partially achieved
 * @property {number} classDistribution.achieved - Percentage of students who have achieved
 * @property {Activity[]} activities - Activities for this competency
 * @property {string} [notes] - Competency notes
 * @property {string} globalId - Global identifier for the competency across subjects
 * @property {string[]} subjects - List of subjects this competency is relevant for
 */
export interface Competency {
  id: string
  title: string
  status: "not-achieved" | "partially-achieved" | "achieved"
  classDistribution: {
    notAchieved: number
    partiallyAchieved: number
    achieved: number
  }
  activities: Activity[]
  notes?: string
  // New fields to support cross-subject competencies
  globalId: string // A global identifier for the competency across subjects
  subjects: string[] // List of subjects this competency is relevant for
}

/**
 * Student interface for student-specific data
 *
 * @interface Student
 * @property {string} id - Student ID
 * @property {string} name - Student name
 * @property {string} class - Student class
 * @property {string} [profileImage] - URL to student's profile image
 * @property {boolean} atRisk - Whether the student is at risk
 * @property {string[]} failedSubjects - List of failed subjects
 * @property {string[]} lowPerformanceSubjects - List of subjects with low performance
 * @property {Object} competencies - Competency information
 * @property {Object} competencies[competencyId] - Information for a specific competency
 * @property {"not-achieved"|"partially-achieved"|"achieved"} competencies[competencyId].status - Competency status
 * @property {number} competencies[competencyId].progress - Competency progress (0-100)
 * @property {Object} activities - Activity information
 * @property {Object} activities[subjectId] - Activities for a specific subject
 * @property {Object} activities[subjectId][activityId] - Information for a specific activity
 * @property {boolean} activities[subjectId][activityId].completed - Whether the activity is completed
 * @property {boolean} activities[subjectId][activityId].evaluated - Whether the activity is evaluated
 * @property {number} activities[subjectId][activityId].score - Activity score
 * @property {string} activities[subjectId][activityId].date - Activity date
 */
export interface Student {
  id: string
  name: string
  class: string
  profileImage?: string
  atRisk: boolean
  failedSubjects: string[]
  lowPerformanceSubjects: string[]
  competencies: {
    [competencyId: string]: {
      status: "not-achieved" | "partially-achieved" | "achieved"
      progress: number // 0-100
    }
  }
  activities: {
    [subjectId: string]: {
      [activityId: string]: {
        completed: boolean
        evaluated: boolean
        score: number
        date: string
      }
    }
  }
}

// Define unique student names for each class
export const studentsByClass = {
  "1Moderne": [
    { firstName: "Liam", lastName: "Janssens" },
    { firstName: "Olivia", lastName: "Peeters" },
    { firstName: "Noah", lastName: "Maes" },
    { firstName: "Emma", lastName: "Jacobs" },
    { firstName: "Lucas", lastName: "Willems" },
    { firstName: "Mila", lastName: "Claes" },
    { firstName: "Finn", lastName: "Dubois" },
    { firstName: "Nora", lastName: "Vermeulen" },
    { firstName: "Levi", lastName: "De Vos" },
    { firstName: "Ella", lastName: "Wouters" },
  ],
  "2Moderne": [
    { firstName: "Adam", lastName: "Verstraeten" },
    { firstName: "Fien", lastName: "Vandenberghe" },
    { firstName: "Roos", lastName: "Hendrickx" },
    { firstName: "Stan", lastName: "Goossens" },
    { firstName: "Lotte", lastName: "Verhoeven" },
    { firstName: "Wout", lastName: "Mertens" },
    { firstName: "Fleur", lastName: "Vandecasteele" },
    { firstName: "Seppe", lastName: "Verschueren" },
    { firstName: "Noor", lastName: "Vandermeulen" },
    { firstName: "Tuur", lastName: "De Ridder" },
  ],
  "3STEM": [
    { firstName: "Marc", lastName: "Vertongen" },
    { firstName: "Emma", lastName: "Peeters" },
    { firstName: "Thomas", lastName: "Janssens" },
    { firstName: "Sophie", lastName: "Maes" },
    { firstName: "Lukas", lastName: "Wouters" },
    { firstName: "Nina", lastName: "Vermeulen" },
    { firstName: "Daan", lastName: "De Vos" },
    { firstName: "Lotte", lastName: "Jacobs" },
    { firstName: "Seppe", lastName: "Claes" },
    { firstName: "Fien", lastName: "Martens" },
    { firstName: "Wout", lastName: "Willems" },
    { firstName: "Amber", lastName: "Smets" },
    { firstName: "Jonas", lastName: "Verhaeghe" },
    { firstName: "Xavier", lastName: "Waterslaeghers" },
  ],
  "3TW": [
    { firstName: "Lucas", lastName: "Dubois" },
    { firstName: "Nora", lastName: "Van den Berg" },
    { firstName: "Elias", lastName: "Coppens" },
    { firstName: "Julie", lastName: "De Smet" },
    { firstName: "Mathis", lastName: "Peeters" },
    { firstName: "Olivia", lastName: "Janssens" },
    { firstName: "Ruben", lastName: "Maes" },
    { firstName: "Ella", lastName: "Wouters" },
    { firstName: "Milan", lastName: "Vermeulen" },
    { firstName: "Lara", lastName: "De Vos" },
    { firstName: "Arne", lastName: "Desmet" },
  ],
  "3LAT": [
    { firstName: "Finn", lastName: "Jacobs" },
    { firstName: "Mila", lastName: "Martens" },
    { firstName: "Arthur", lastName: "Claes" },
    { firstName: "Noor", lastName: "Willems" },
    { firstName: "Victor", lastName: "Smets" },
    { firstName: "Fleur", lastName: "Dubois" },
    { firstName: "Tuur", lastName: "Van den Berg" },
    { firstName: "Lien", lastName: "Coppens" },
    { firstName: "Nore", lastName: "Vandenberghe" },
  ],
  "4Sport": [
    { firstName: "Jasper", lastName: "Vandenberghe" },
    { firstName: "Linde", lastName: "Verstraeten" },
    { firstName: "Sander", lastName: "De Ridder" },
    { firstName: "Febe", lastName: "Goossens" },
    { firstName: "Brent", lastName: "Verhoeven" },
    { firstName: "Hanne", lastName: "Mertens" },
    { firstName: "Lode", lastName: "Vandecasteele" },
  ],
  "4Mechanica": [
    { firstName: "Stijn", lastName: "Verschueren" },
    { firstName: "Lara", lastName: "Vandermeulen" },
    { firstName: "Kobe", lastName: "Hendrickx" },
  ],
  "4Handel": [
    { firstName: "Jef", lastName: "Vermeulen" },
    { firstName: "Lien", lastName: "Peeters" },
    { firstName: "Seppe", lastName: "Janssens" },
    { firstName: "Fien", lastName: "Maes" },
    { firstName: "Wout", lastName: "Wouters" },
    { firstName: "Amber", lastName: "Vermeulen" },
    { firstName: "Jonas", lastName: "De Vos" },
    { firstName: "Lotte", lastName: "Jacobs" },
    { firstName: "Sander", lastName: "Claes" },
    { firstName: "Hanne", lastName: "Martens" },
    { firstName: "Brent", lastName: "Willems" },
    { firstName: "Febe", lastName: "Smets" },
  ],
  "5WeWi": [
    { firstName: "Amber", lastName: "Janssens" },
    { firstName: "Bram", lastName: "Peeters" },
    { firstName: "Charlotte", lastName: "Maertens" },
    { firstName: "Dries", lastName: "Verhaeghe" },
    { firstName: "Elise", lastName: "Vandenberghe" },
    { firstName: "Floris", lastName: "Desmet" },
    { firstName: "Gitte", lastName: "Claeys" },
    { firstName: "Hannes", lastName: "Vermeulen" },
    { firstName: "Ine", lastName: "Vandecasteele" },
    { firstName: "Jarne", lastName: "Debruyne" },
    { firstName: "Kato", lastName: "Verstraete" },
    { firstName: "Lennert", lastName: "Dewilde" },
    { firstName: "Marthe", lastName: "Vanhaverbeke" },
    { firstName: "Niels", lastName: "Decoene" },
    { firstName: "Paulien", lastName: "Vanhee" },
    { firstName: "Quinten", lastName: "Desmedt" },
  ],
  "6WeWi A": [
    { firstName: "Nienke", lastName: "Martens" },
    { firstName: "Amber", lastName: "Rosenberg" },
    { firstName: "Fabian", lastName: "Ruitenburg" },
    { firstName: "Patricia", lastName: "Soeters" },
    { firstName: "Mick", lastName: "Zeelenberg" },
    { firstName: "Mara", lastName: "Sabri" },
    { firstName: "Appie", lastName: "Tayibi" },
    { firstName: "Jeroen", lastName: "Cornelissen" },
  ],
  "6WeWi B": [
    { firstName: "Jelle", lastName: "Verstraete" },
    { firstName: "Lore", lastName: "Debruyne" },
    { firstName: "Mathias", lastName: "Vanhaverbeke" },
    { firstName: "Nele", lastName: "Decoene" },
    { firstName: "Pieter", lastName: "Vanhee" },
    { firstName: "Roos", lastName: "Desmedt" },
    { firstName: "Simon", lastName: "Claeys" },
    { firstName: "Tine", lastName: "Vermeulen" },
  ],
}

// Helper functions
export const getStudentData = (studentName: string) => {
  return studentData.filter((statement) => statement.actor.name === studentName)
}

export const getStudentSubjectData = (studentName: string) => {
  return studentData.filter((statement) => statement.actor.name === studentName)
}

export const getClassData = (className: string) => {
  return studentData.filter((statement) => statement.actor.class === className)
}

export const getStudentSemesterData = (studentName: string, semester: 1 | 2 | 3) => {
  return studentData.filter(
    (statement) => statement.actor.name === studentName && statement.object.definition.semester === semester,
  )
}

export const getStudentsInClass = (className: string) => {
  const uniqueStudents = new Set<string>()
  studentData.forEach((statement) => {
    if (statement.actor.class === className) {
      uniqueStudents.add(statement.actor.name)
    }
  })
  return Array.from(uniqueStudents)
}

export const getClassScoresForSemester = (className: string, semester: 1 | 2 | 3) => {
  const statements = studentData.filter((s) => s.actor.class === className && s.object.definition.semester === semester)

  // Group by student and calculate average score
  const studentScores = new Map<string, number[]>()

  statements.forEach((statement) => {
    const studentName = statement.actor.name
    const score = statement.result.score.raw

    if (!studentScores.has(studentName)) {
      studentScores.set(studentName, [])
    }

    studentScores.get(studentName)?.push(score)
  })

  // Calculate average score for each student
  return Array.from(studentScores.entries()).map(([name, scores]) => {
    const avgScore = Number.parseFloat((scores.reduce((sum, score) => sum + score, 0) / scores.length).toFixed(2))
    return {
      name,
      score: avgScore,
      isCurrentStudent: false, // This will be set by the component
    }
  })
}

export const getTotalCompetencies = (studentName: string) => {
  const statements = getStudentData(studentName)

  let achieved = 0
  let total = 0

  statements.forEach((statement) => {
    if (statement.result.competencies) {
      achieved += statement.result.competencies.achieved
      total += statement.result.competencies.total
    }
  })

  return { achieved, total }
}

// Wijzig de getStudentProfileImage functie om automatisch te zoeken naar afbeeldingen op basis van de naam
export const getStudentProfileImage = (studentName: string) => {
  if (!studentName) return "/images/profiles/default.png"

  // Converteer de naam naar het juiste formaat voor de bestandsnaam (voornaam_achternaam.png)
  const nameParts = studentName.split(" ")
  if (nameParts.length < 2) return "/images/profiles/default.png"

  const firstName = nameParts[0].toLowerCase()
  const lastName = nameParts.slice(1).join("_").toLowerCase()
  const imageFileName = `${firstName}_${lastName}.png`

  // Probeer eerst de afbeelding in de standaard locatie te vinden
  const imagePath = `/images/${imageFileName}`

  // We kunnen niet direct controleren of het bestand bestaat in de browser
  // Daarom retourneren we het pad en laten we de Image component de fallback afhandelen
  return imagePath
}

// Helper function to check if a student is 'at risk' based on competency achievement
export const isStudentAtRisk = (studentName: string): boolean => {
  // Get the student's competency percentage
  const { achieved, total } = getTotalCompetencies(studentName)
  const percentage = (achieved / total) * 100

  // Get the student's individual goal
  const individualGoal = getStudentIndividualGoal(studentName)

  // Student is at risk if their competency achievement is below their individual goal
  return percentage < individualGoal
}

export const getAtRiskReason = (studentName: string, language = "nl"): string => {
  // Get the student's competency percentage
  const { achieved, total } = getTotalCompetencies(studentName)
  const percentage = (achieved / total) * 100

  // Get the student's individual goal
  const individualGoal = getStudentIndividualGoal(studentName)

  // Return a consistent reason based on the rule
  if (language === "en") {
    return `Competency achievement (${percentage.toFixed(1)}%) is below individual goal (${individualGoal}%)`
  } else {
    return `Competentiebehaald (${percentage.toFixed(1)}%) is onder individuele doelstelling (${individualGoal}%)`
  }
}

// Helper function to check if a student has attendance risk
export const hasAttendanceRisk = (studentName: string, threshold = 85): boolean => {
  const attendance = getStudentAttendance(studentName)
  return attendance.present < threshold
}

// Helper function to get attendance risk reason
export const getAttendanceRiskReason = (studentName: string, threshold = 85, language = "nl"): string => {
  const attendance = getStudentAttendance(studentName)

  if (language === "en") {
    return `Attendance (${attendance.present}%) is below threshold (${threshold}%)`
  } else {
    return `Aanwezigheid (${attendance.present}%) is onder de grenswaarde (${threshold}%)`
  }
}

// Add this function to check if a student has low attendance
export const hasLowAttendance = (studentName: string, threshold = 85) => {
  const attendance = getStudentAttendance(studentName)
  return attendance.present < threshold
}

// Add this function to get consistent individual goal data for a student
export const getStudentIndividualGoal = (studentName: string) => {
  // Default goal
  const defaultGoal = 60

  // In a real implementation, this would fetch from the database
  // For now, we'll generate consistent data based on the student name

  // Use the student name to generate a consistent hash
  let hash = 0
  for (let i = 0; i < studentName.length; i++) {
    hash = (hash << 5) - hash + studentName.charCodeAt(i)
    hash |= 0 // Convert to 32bit integer
  }

  // Use the hash to generate a consistent goal value
  const seed = Math.abs(hash) / 100000000

  // Generate goal between 65% and 90%
  return Math.floor(65 + ((seed * 25) % 26))
}

// Update the getStudentActivitiesForSubject function to properly filter activities by subject
export const getStudentActivitiesForSubject = (studentName: string, subject: string) => {
  // Get the competencies for this subject
  const competencies = generateMockCompetencies(subject)

  // Return all activities from all competencies, ensuring they belong to this subject
  const allActivities = competencies.flatMap((comp) => comp.activities.filter((act) => act.subjectId === subject))

  // Sort activities by date (newest first)
  return allActivities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

// Function to get student competencies across all subjects
export const getStudentCompetencies = (studentName: string) => {
  // In a real implementation, this would fetch from the database
  // For now, we'll generate a map of competencies by global ID

  const competencyMap = new Map<string, Competency>()

  // For each subject, get competencies and add them to the map if not already present
  SUBJECTS.forEach((subject) => {
    const competencies = generateMockCompetencies(subject)

    competencies.forEach((comp) => {
      if (!competencyMap.has(comp.globalId)) {
        competencyMap.set(comp.globalId, comp)
      }
    })
  })

  return Array.from(competencyMap.values())
}

// Mock function to generate student attendance data
export const getStudentAttendance = (studentName: string) => {
  // In a real implementation, this would fetch from the database
  // For now, we'll generate consistent data based on the student name

  // Use the student name to generate a consistent hash
  let hash = 0
  for (let i = 0; i < studentName.length; i++) {
    hash = (hash << 5) - hash + studentName.charCodeAt(i)
    hash |= 0 // Convert to 32bit integer
  }

  // Use the hash to generate a consistent attendance value
  const seed = Math.abs(hash) / 100000000

  // Generate attendance between 80% and 100%
  const present = Math.floor(80 + ((seed * 20) % 21))
  const late = Math.floor((seed * 10) % 11)

  return { present, late }
}

// Mock function to generate competencies for a subject
const generateMockCompetencies = (subject: string): Competency[] => {
  const competencies: Competency[] = []

  // Generate 5 competencies per subject
  for (let i = 1; i <= 5; i++) {
    const competencyId = `COMP-${subject.slice(0, 3).toUpperCase()}-${i}`
    const globalId = `COMP-00${i}` // Use a global ID for cross-subject linking

    // Determine status based on random chance
    const statusOptions: ("not-achieved" | "partially-achieved" | "achieved")[] = [
      "not-achieved",
      "partially-achieved",
      "achieved",
    ]
    const status = statusOptions[Math.floor(Math.random() * statusOptions.length)]

    // Generate class distribution
    const notAchieved = Math.floor(Math.random() * 30)
    const partiallyAchieved = Math.floor(Math.random() * (70 - notAchieved))
    const achieved = 100 - notAchieved - partiallyAchieved

    // Generate activities for this competency
    const activities = generateActivities(competencyId, subject)

    competencies.push({
      id: competencyId,
      globalId: globalId,
      title: `Competentie ${i} voor ${subject}`,
      status: status,
      classDistribution: {
        notAchieved,
        partiallyAchieved,
        achieved,
      },
      activities: activities,
      subjects: [subject], // Indicate the subject this competency is relevant for
    })
  }

  return competencies
}

// Update the generateActivities function to limit activities to 3-6 per subject per semester
// and ensure exactly 1 exam per subject per semester for main subjects
const generateActivities = (competencyId: string, subject: string, studentName = ""): Activity[] => {
  // Determine if this is a main subject
  const isMainSubject = ["Wiskunde", "Nederlands", "Frans", "Engels"].includes(subject)

  // Determine how many activities to generate (3-6 activities, including the exam for main subjects)
  const minActivities = 3
  const maxActivities = 6
  // For main subjects, we'll generate 1 less regular activity since we'll add an exam
  const activityCount = isMainSubject
    ? minActivities + Math.floor(Math.random() * (maxActivities - minActivities)) - 1
    : minActivities + Math.floor(Math.random() * (maxActivities - minActivities))

  const activities: Activity[] = []

  const activityTypes: ("toets" | "taak")[] = ["toets", "taak"]
  const activityTitles = {
    toets: [
      "Hoofdstuk 1 evaluatie",
      "Hoofdstuk 2 evaluatie",
      "Hoofdstuk 3 evaluatie",
      "Tussentijdse toets",
      "Goniometrie in technische toepassingen",
      "Optimalisatie in technologische processen",
      "Differentiaalvergelijkingen",
      "Integraalrekening",
      "Vectoren en matrices",
      "Kansrekening en statistiek",
    ],
    taak: [
      "Onderzoeksopdracht",
      "Groepswerk",
      "Presentatie",
      "Portfolio",
      "Exponentiële functies in natuurkunde",
      "Uitbreiding vraagstukken hoofdstuk 3",
      "Praktische toepassing",
      "Analyse van datasets",
      "Modellering van problemen",
      "Technisch verslag",
    ],
    examen: ["Examen periode 1", "Examen periode 2", "Examen periode 3", "Herexamen", "Eindexamen"],
  }

  // Subject-specific activity titles
  const subjectSpecificTitles: Record<string, string[]> = {
    Wiskunde: [
      "Integraalrekening toepassing",
      "Differentiaalvergelijkingen",
      "Vectoren en matrices",
      "Goniometrische functies",
      "Kansrekening en statistiek",
      "Complexe getallen",
      "Reeksontwikkelingen",
      "Limieten en continuïteit",
    ],
    Nederlands: [
      "Literatuuranalyse",
      "Tekstbegrip",
      "Grammatica en spelling",
      "Schrijfopdracht",
      "Mondelinge presentatie",
      "Debat",
      "Poëzieanalyse",
      "Taalvaardigheid",
    ],
    Frans: [
      "Luistervaardigheid",
      "Spreekvaardigheid",
      "Grammatica",
      "Vocabulaire",
      "Schrijfopdracht",
      "Literatuur",
      "Cultuur en samenleving",
      "Vertaaloefening",
    ],
    Engels: [
      "Reading comprehension",
      "Listening skills",
      "Grammar test",
      "Writing assignment",
      "Oral presentation",
      "Vocabulary",
      "Literature analysis",
      "Cultural assignment",
    ],
    Mechanica: [
      "Statica",
      "Dynamica",
      "Kinematica",
      "Krachtenleer",
      "Momentenleer",
      "Wrijving",
      "Arbeid en energie",
      "Traagheidsmomenten",
    ],
    Elektromagnetisme: [
      "Elektrische velden",
      "Magnetische velden",
      "Inductie",
      "Elektrische circuits",
      "Elektromagnetische golven",
      "Elektrische machines",
      "Halfgeleiders",
      "Transformatoren",
    ],
    Natuurwetenschappen: [
      "Thermodynamica",
      "Optica",
      "Golven",
      "Atoomfysica",
      "Kernfysica",
      "Relativiteitstheorie",
      "Kwantummechanica",
      "Astronomie",
    ],
  }

  // Get subject-specific titles if available
  const specificTitles = subjectSpecificTitles[subject] || []

  // Extract semester from competencyId (assuming it's encoded in the ID)
  // For this mock implementation, we'll assign a random semester if not determinable
  let semester: 1 | 2 | 3
  const semesterMatch = competencyId.match(/S(\d)/)
  if (semesterMatch && ["1", "2", "3"].includes(semesterMatch[1])) {
    semester = Number.parseInt(semesterMatch[1]) as 1 | 2 | 3
  } else {
    // Assign a random semester if not determinable from ID
    semester = (Math.floor(Math.random() * 3) + 1) as 1 | 2 | 3
  }

  // First, generate regular activities (toets and taak)
  for (let i = 0; i < activityCount; i++) {
    // Choose between toets and taak
    const type = activityTypes[Math.floor(Math.random() * activityTypes.length)]

    // Use subject-specific titles if available, otherwise use general titles
    let title
    if (specificTitles.length > 0 && Math.random() > 0.3) {
      title = specificTitles[Math.floor(Math.random() * specificTitles.length)]
      if (type === "toets") title += " - Toets"
      else title += " - Opdracht"
    } else {
      const titles = activityTitles[type]
      title = titles[Math.floor(Math.random() * titles.length)]
    }

    // Determine if the activity is completed and evaluated
    const completed = Math.random() > 0.1 // 90% chance of being completed
    const evaluated = completed && Math.random() > 0.1 // 90% chance of being evaluated if completed

    // Generate a score if the activity is evaluated
    const maxScore = type === "toets" ? 20 : 10
    let score = 0

    if (evaluated) {
      // Generate a score between 40% and 95% of the maximum score
      score = Math.floor((0.4 + Math.random() * 0.55) * maxScore)
    }

    // Generate class distribution
    const average = maxScore * 0.65 // Average score is 65% of maximum
    const min = Math.max(0, average - maxScore * 0.3) // Minimum is 30% under average
    const max = Math.min(maxScore, average + maxScore * 0.3) // Maximum is 30% above average

    // Generate distribution for low, medium, and high performers
    const lowPerformers = Math.floor(Math.random() * 30) + 10 // 10-40%
    const highPerformers = Math.floor(Math.random() * 30) + 10 // 10-40%
    const mediumPerformers = 100 - lowPerformers - highPerformers // Remaining percentage

    // Determine relative performance
    let relativePerformance: "onder" | "boven" | "gemiddeld"
    if (score < average * 0.9) {
      relativePerformance = "onder"
    } else if (score > average * 1.1) {
      relativePerformance = "boven"
    } else {
      relativePerformance = "gemiddeld"
    }

    // Generate date within the semester timeframe
    const date = new Date()
    if (semester === 1) {
      date.setMonth(Math.floor(Math.random() * 4)) // Jan-Apr
    } else if (semester === 2) {
      date.setMonth(4 + Math.floor(Math.random() * 4)) // May-Aug
    } else {
      date.setMonth(8 + Math.floor(Math.random() * 4)) // Sep-Dec
    }
    date.setDate(1 + Math.floor(Math.random() * 28))

    // Sometimes add a note
    const hasNote = Math.random() < 0.3
    const notes = hasNote
      ? [
          "Goede vooruitgang, maar nog wat meer oefening nodig.",
          "Leerling heeft moeite met het concept, extra oefening nodig.",
          "Uitstekend werk, leerling begrijpt de stof volledig.",
          "Leerling heeft hulp nodig bij het toepassen in complexe situaties.",
          "Concept is begrepen, maar toepassing in nieuwe contexten is nog moeilijk.",
        ][Math.floor(Math.random() * 5)]
      : undefined

    activities.push({
      id: `${competencyId}-act-${i + 1}`,
      type,
      title,
      score,
      maxScore,
      completed,
      evaluated,
      date: date.toISOString(),
      semester,
      notes,
      classDistribution: {
        min,
        max,
        average,
        studentCount: Math.floor(Math.random() * 15) + 10, // 10-25 students
        lowPerformers,
        mediumPerformers,
        highPerformers,
      },
      relativePerformance,
      competencyId,
      subjectId: subject,
    })
  }

  // For main subjects, add exactly one exam per semester
  if (isMainSubject) {
    const examTitle = activityTitles.examen[Math.floor(Math.random() * activityTitles.examen.length)]

    // Generate date at the end of the semester
    const examDate = new Date()
    if (semester === 1) {
      examDate.setMonth(3) // April
    } else if (semester === 2) {
      examDate.setMonth(7) // August
    } else {
      examDate.setMonth(11) // December
    }
    examDate.setDate(15 + Math.floor(Math.random() * 10)) // Middle to end of month

    const maxScore = 100
    const completed = Math.random() > 0.05 // 95% chance of being completed
    const evaluated = completed && Math.random() > 0.05 // 95% chance of being evaluated if completed

    let score = 0
    if (evaluated) {
      // Generate a score between 40% and 95% of the maximum score
      score = Math.floor((0.4 + Math.random() * 0.55) * maxScore)
    }

    // Generate class distribution
    const average = maxScore * 0.65 // Average score is 65% of maximum
    const min = Math.max(0, average - maxScore * 0.3) // Minimum is 30% under average
    const max = Math.min(maxScore, average + maxScore * 0.3) // Maximum is 30% above average

    // Generate distribution for low, medium, and high performers
    const lowPerformers = Math.floor(Math.random() * 30) + 10 // 10-40%
    const highPerformers = Math.floor(Math.random() * 30) + 10 // 10-40%
    const mediumPerformers = 100 - lowPerformers - highPerformers // Remaining percentage

    // Determine relative performance
    let relativePerformance: "onder" | "boven" | "gemiddeld"
    if (score < average * 0.9) {
      relativePerformance = "onder"
    } else if (score > average * 1.1) {
      relativePerformance = "boven"
    } else {
      relativePerformance = "gemiddeld"
    }

    // Add exam note
    const examNote = "Dit is het semesterexamen dat alle competenties van het vak evalueert."

    activities.push({
      id: `${competencyId}-exam-S${semester}`,
      type: "examen",
      title: examTitle,
      score,
      maxScore,
      completed,
      evaluated,
      date: examDate.toISOString(),
      semester,
      notes: examNote,
      classDistribution: {
        min,
        max,
        average,
        studentCount: Math.floor(Math.random() * 15) + 10, // 10-25 students
        lowPerformers,
        mediumPerformers,
        highPerformers,
      },
      relativePerformance,
      competencyId,
      subjectId: subject,
    })
  }

  return activities
}

// Wijzig de generateClassData functie om de profielafbeeldingen niet meer hardcoded toe te wijzen
const generateClassData = (className: string): XAPIStatement[] => {
  const students = studentsByClass[className as keyof typeof studentsByClass].map((student) => {
    const { firstName, lastName } = student
    const name = `${firstName} ${lastName}`

    // Standaard is niemand 'at risk'
    let atRisk = false

    // Voor Marc Vertongen zetten we dit op true voor demonstratiedoeleinden
    if (firstName === "Marc" && lastName === "Vertongen") {
      atRisk = true
    } else {
      // Voor andere studenten, ongeveer 15% kans om 'at risk' te zijn
      atRisk = Math.random() < 0.15
    }

    // We laten de profielafbeelding bepalen door de getStudentProfileImage functie
    // Deze functie wordt aangeroepen wanneer de afbeelding nodig is

    return {
      name,
      mbox: `mailto:${firstName.toLowerCase()}.${lastName.toLowerCase().replace(" ", "")}@school.be`,
      class: className,
      atRisk,
    }
  })

  const statements: XAPIStatement[] = []

  // Rest van de functie blijft hetzelfde...
  // Generate statements for each student, subject, and semester
  students.forEach((student) => {
    // Bijhouden of de student faalt voor hoofdvakken
    const failedMainSubjects: string[] = []
    const lowPerformanceSubjects: string[] = []
    let globalPerformance = 0
    let totalSubjects = 0

    for (let semester = 1; semester <= 3; semester++) {
      SUBJECTS.forEach((subject) => {
        // Generate a base score that's consistent for a student across semesters (with some variation)
        const studentBaseScore =
          student.name === "Marc Vertongen"
            ? 75 + Math.random() * 15 // Marc is a good student
            : 40 + Math.random() * 50 // Other students have more variation

        // Add some progression across semesters
        const semesterBonus = (semester - 1) * 5

        // Add subject-specific variation
        const subjectVariation = Math.random() * 20 - 10

        // Calculate final score
        let score = studentBaseScore + semesterBonus + subjectVariation

        // Special cases for Marc
        if (student.name === "Marc Vertongen") {
          if (subject === "Lichamelijke opvoeding" && semester === 1) {
            score = 50 // Marc struggles with PE in semester 1
          }
          if (subject === "Toegepaste informatica" && semester === 1) {
            score = 35 // Marc really struggles with computer science
          }
        }

        // Clamp score between 0 and 100
        score = Math.max(0, Math.min(100, score))

        // Check voor hoofdvakken (in het laatste semester)
        if (semester === 3) {
          if (["Wiskunde", "Nederlands", "Frans", "Engels"].includes(subject) && score < 50) {
            failedMainSubjects.push(subject)
          }

          // Houd bij voor globale prestatie
          globalPerformance += score
          totalSubjects++

          // Houd bij welke vakken onder 60% scoren
          if (score < 60) {
            lowPerformanceSubjects.push(subject)
          }
        }

        // Calculate competencies - zorg dat deze consistent zijn met de score
        const totalCompetencies = 20 // Vast aantal competenties per vak
        const achievedCompetencies = Math.floor((score / 100) * totalCompetencies)

        // For main subjects, ensure 3-6 activities including 1 exam per semester
        // For other subjects, 3-5 activities
        const isMainSubject = ["Wiskunde", "Nederlands", "Frans", "Engels"].includes(subject)
        const activityCount = isMainSubject ? 3 + Math.floor(Math.random() * 3) : 3 + Math.floor(Math.random() * 2)

        statements.push({
          actor: student,
          verb: {
            id: "http://adlnet.gov/expapi/verbs/completed",
            display: {
              nl: "heeft voltooid",
            },
          },
          object: {
            id: `http://school.be/activities/${subject.toLowerCase().replace(/ /g, "-")}/S${semester}`,
            definition: {
              name: {
                nl: subject,
              },
              type: "http://adlnet.gov/expapi/activities/course",
              semester: semester as 1 | 2 | 3,
            },
          },
          result: {
            score: {
              scaled: Number.parseFloat((score / 100).toFixed(2)),
              raw: Number.parseFloat(score.toFixed(2)),
              min: 0,
              max: 100,
            },
            completion: true,
            success: score >= 50,
            competencies: {
              achieved: achievedCompetencies,
              total: totalCompetencies,
            },
            activities: activityCount,
          },
          timestamp: new Date(2023, (semester - 1) * 4, 15).toISOString(),
        })
      })
    }

    // Update atRisk status op basis van hoofdvakken en globale prestatie
    if (failedMainSubjects.length > 0) {
      student.atRisk = true
    } else if (totalSubjects > 0) {
      const avgPerformance = globalPerformance / totalSubjects
      // Als de student gemiddeld onder 60% scoort voor hoofdvakken, is hij/zij ook at risk
      if (avgPerformance < 60) {
        student.atRisk = true
      }
    }
    // Sla de gefaalde vakken en lage prestatie vakken op in de student data
    // Dit doen we door een custom property toe te voegen aan het student object
    ;(student as any).failedSubjects = failedMainSubjects
    ;(student as any).lowPerformanceSubjects = lowPerformanceSubjects
  })

  return statements
}

// Generate data for each class
const moderne1Data = generateClassData("1Moderne")
const moderne2Data = generateClassData("2Moderne")
const stem3Data = generateClassData("3STEM")
const tw3Data = generateClassData("3TW")
const lat3Data = generateClassData("3LAT")
const sport4Data = generateClassData("4Sport")
const mechanica4Data = generateClassData("4Mechanica")
const handel4Data = generateClassData("4Handel")
const wewi5Data = generateClassData("5WeWi")

// Generate data for the new 6WeWi A class
const wewiA6Data = generateClassData("6WeWi A")
const wewi6Data = generateClassData("6WeWi B")

// Combine all data
export const studentData: XAPIStatement[] = [
  ...moderne1Data,
  ...moderne2Data,
  ...stem3Data,
  ...tw3Data,
  ...lat3Data,
  ...sport4Data,
  ...mechanica4Data,
  ...handel4Data,
  ...wewi5Data,
  ...wewiA6Data,
  ...wewi6Data,
]

// Create a list of global competencies that can be shared across subjects
const globalCompetencies: { id: string; title: string; subjects: string[] }[] = [
  {
    id: "COMP-001",
    title: "Kan complexe problemen analyseren en oplossen",
    subjects: ["Wiskunde", "Natuurwetenschappen", "Mechanica", "Elektromagnetisme"],
  },
  {
    id: "COMP-002",
    title: "Kan effectief communiceren in verschillende contexten",
    subjects: ["Nederlands", "Frans", "Engels"],
  },
  {
    id: "COMP-003",
    title: "Kan kritisch denken en evalueren",
    subjects: ["Wiskunde", "Nederlands", "Geschiedenis", "Natuurwetenschappen"],
  },
  {
    id: "COMP-004",
    title: "Kan samenwerken in teamverband",
    subjects: ["Project STEM", "Lichamelijke opvoeding", "Artistieke vorming"],
  },
  {
    id: "COMP-005",
    title: "Kan technologie effectief gebruiken",
    subjects: ["Toegepaste informatica", "Project STEM", "Elektromagnetisme"],
  },
  {
    id: "COMP-006",
    title: "Kan zelfstandig leren en reflecteren",
    subjects: SUBJECTS as unknown as string[],
  },
  {
    id: "COMP-007",
    title: "Kan creatief denken en innoveren",
    subjects: ["Artistieke vorming", "Project STEM", "Toegepaste informatica"],
  },
  {
    id: "COMP-008",
    title: "Kan informatie verzamelen, analyseren en interpreteren",
    subjects: ["Geschiedenis", "Natuurwetenschappen", "Wiskunde", "Nederlands"],
  },
  {
    id: "COMP-009",
    title: "Kan ethisch redeneren en handelen",
    subjects: ["Levensbeschouwelijke vakken", "Geschiedenis"],
  },
  {
    id: "COMP-010",
    title: "Kan plannen en organiseren",
    subjects: SUBJECTS as unknown as string[],
  },
]

// Helper functions
export const getClassDistributionForSubject = (
  className: string,
  subject: string,
  semester: 1 | 2 | 3,
  studentScore: number,
) => {
  // Get all student scores for this class, subject, and semester
  const scores = getClassData(className)
    .filter((s) => s.object.definition.name.nl === subject && s.object.definition.semester === semester)
    .map((s) => s.result.score.raw)

  // Create buckets for each 5% range
  const bucketSize = 5
  const numBuckets = 100 / bucketSize
  const distribution = Array(numBuckets).fill(0)

  // Count the number of students in each bucket
  scores.forEach((score) => {
    const bucketIndex = Math.floor(score / bucketSize)
    if (bucketIndex >= 0 && bucketIndex < numBuckets) {
      distribution[bucketIndex]++
    }
  })

  // Determine which bucket the student falls into
  const studentBucket = Math.floor(studentScore / bucketSize)

  return {
    distribution,
    studentBucket,
  }
}

export const getStudentCompetencyIssues = (studentName: string): string[] => {
  // In a real implementation, this would fetch from the database
  // For now, we'll generate consistent data based on the student name

  const issues: string[] = []

  // Use the student name to generate a consistent hash
  let hash = 0
  for (let i = 0; i < studentName.length; i++) {
    hash = (hash << 5) - hash + studentName.charCodeAt(i)
    hash |= 0 // Convert to 32bit integer
  }

  // Use the hash to generate consistent issues
  const seed = Math.abs(hash) / 100000000

  // Generate a random number of issues (0-3)
  const numIssues = Math.floor((seed * 4) % 4)

  // Generate consistent issue messages
  for (let i = 0; i < numIssues; i++) {
    const issueIndex = Math.floor((seed * (i + 1) * 5) % 5)
    switch (issueIndex) {
      case 0:
        issues.push("Heeft moeite met het toepassen van concepten in nieuwe situaties.")
        break
      case 1:
        issues.push("Toont weinig interesse in de leerstof.")
        break
      case 2:
        issues.push("Heeft moeite met het plannen en organiseren van taken.")
        break
      case 3:
        issues.push("Toont weinig initiatief tijdens groepswerk.")
        break
      case 4:
        issues.push("Heeft moeite met het stellen van vragen om de leerstof beter te begrijpen.")
        break
    }
  }

  return issues
}
