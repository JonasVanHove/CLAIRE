/**
 * API Service for Student Dashboard
 *
 * This service handles all data fetching for the dashboard.
 * It provides a consistent interface for retrieving student data, competencies,
 * activities, and other information needed by the dashboard components.
 *
 * Currently uses mock data, but is structured to be easily replaced with real API calls.
 *
 * @module services/api
 */

import {
  getStudentsInClass,
  getStudentData,
  isStudentAtRisk,
  getAtRiskReason,
  getStudentAttendance,
  getStudentIndividualGoal,
  getTotalCompetencies,
  getClassScoresForSemester,
  getClassDistributionForSubject,
  getStudentActivitiesForSubject,
  getStudentSemesterData,
  getStudentCompetencyIssues,
  getStudentProfileImage,
  type XAPIStatement,
  type Competency,
  type Activity,
} from "@/data/student-data"

/**
 * Response type for student list API calls
 *
 * @interface StudentListResponse
 * @property {string} class - The class name
 * @property {Object[]} students - Array of student information
 * @property {string} students[].name - Student name
 * @property {boolean} students[].atRisk - Whether the student is at risk
 * @property {string|null} [students[].atRiskReason] - Reason why the student is at risk
 * @property {boolean} students[].lowAttendance - Whether the student has low attendance
 * @property {number} students[].attendancePercentage - Student's attendance percentage
 */
export interface StudentListResponse {
  class: string
  students: {
    name: string
    atRisk: boolean
    atRiskReason?: string | null
    lowAttendance: boolean
    attendancePercentage: number
  }[]
}

/**
 * Response type for student details API calls
 *
 * @interface StudentDetailsResponse
 * @property {Object} studentInfo - Basic student information
 * @property {string} studentInfo.name - Student name
 * @property {string} studentInfo.class - Student's class
 * @property {string} studentInfo.profileImage - URL to student's profile image
 * @property {XAPIStatement[]} subjects - Student's subject data in xAPI format
 * @property {Object} attendance - Student's attendance data
 * @property {number} attendance.present - Percentage of days present
 * @property {number} attendance.authorized - Percentage of authorized absences
 * @property {number} attendance.unauthorized - Percentage of unauthorized absences
 * @property {Object} competencies - Student's competency achievement data
 * @property {number} competencies.achieved - Number of achieved competencies
 * @property {number} competencies.total - Total number of competencies
 * @property {number} individualGoal - Student's individual goal percentage
 * @property {boolean} isAtRisk - Whether the student is at risk
 * @property {string|null} atRiskReason - Reason why the student is at risk
 * @property {string[]} competencyIssues - List of competency issues
 */
export interface StudentDetailsResponse {
  studentInfo: {
    name: string
    class: string
    profileImage: string
  }
  subjects: XAPIStatement[]
  attendance: {
    present: number
    authorized: number
    unauthorized: number
  }
  competencies: {
    achieved: number
    total: number
  }
  individualGoal: number
  isAtRisk: boolean
  atRiskReason: string | null
  competencyIssues: string[]
}

/**
 * Response type for semester scores API calls
 *
 * @interface SemesterScoresResponse
 * @property {number} semester - Semester number (1, 2, or 3)
 * @property {Object[]} scores - Array of student scores
 * @property {string} scores[].name - Student name
 * @property {number} scores[].score - Student's score
 * @property {boolean} scores[].isCurrentStudent - Whether this is the currently selected student
 */
export interface SemesterScoresResponse {
  semester: number
  scores: {
    name: string
    score: number
    isCurrentStudent: boolean
  }[]
}

/**
 * Response type for subject competencies API calls
 *
 * @interface SubjectCompetenciesResponse
 * @property {string} subject - Subject name
 * @property {number} [semester] - Semester number (1, 2, or 3)
 * @property {string} [studentName] - Student name
 * @property {Competency[]} competencies - Array of competencies for the subject
 */
export interface SubjectCompetenciesResponse {
  subject: string
  semester?: number
  studentName?: string
  competencies: Competency[]
}

/**
 * Response type for competency activities API calls
 *
 * @interface CompetencyActivitiesResponse
 * @property {string} competencyId - Competency ID
 * @property {string} subject - Subject name
 * @property {number} semester - Semester number (1, 2, or 3)
 * @property {string} studentName - Student name
 * @property {Activity[]} activities - Array of activities for the competency
 */
export interface CompetencyActivitiesResponse {
  competencyId: string
  subject: string
  semester: number
  studentName: string
  activities: Activity[]
}

/**
 * Response type for subject activities API calls
 *
 * @interface SubjectActivitiesResponse
 * @property {string} subject - Subject name
 * @property {Activity[]} activities - Array of activities for the subject
 */
export interface SubjectActivitiesResponse {
  subject: string
  activities: Activity[]
}

/**
 * Response type for class distribution API calls
 *
 * @interface ClassDistributionResponse
 * @property {number[]} distribution - Array of values representing the class distribution
 * @property {number} studentBucket - The bucket where the student falls
 */
export interface ClassDistributionResponse {
  distribution: number[]
  studentBucket: number
}

/**
 * API Service class for the Student Dashboard
 *
 * This class provides methods for fetching data from the API.
 * In the current implementation, it uses mock data, but it's structured
 * to be easily replaced with real API calls.
 *
 * @class ApiService
 */
class ApiService {
  private baseUrl: string

  /**
   * Creates an instance of ApiService.
   *
   * @constructor
   */
  constructor() {
    // In the POC phase, we always use /api as the base URL
    // Later in the actual implementation, this can be adjusted to an environment variable
    this.baseUrl = "/api"
  }

  /**
   * Adds a delay to simulate network latency
   *
   * @private
   * @param {number} [ms=300] - Delay in milliseconds
   * @returns {Promise<void>}
   */
  private async delay(ms = 300): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  /**
   * Gets a list of students with filtering options
   *
   * @param {Object} filters - Filtering options
   * @param {string[]} [filters.classes] - Array of class names to filter by
   * @param {string} [filters.searchTerm] - Search term to filter by
   * @param {boolean} [filters.showOnlyAtRisk] - Whether to show only at-risk students
   * @param {boolean} [filters.showOnlyAttendanceRisk] - Whether to show only students with attendance risk
   * @param {number} [filters.attendanceThreshold] - Attendance threshold percentage
   * @returns {Promise<StudentListResponse[]>} - Array of student list responses
   */
  async getStudentList(filters: {
    classes?: string[]
    searchTerm?: string
    showOnlyAtRisk?: boolean
    showOnlyAttendanceRisk?: boolean
    attendanceThreshold?: number
  }): Promise<StudentListResponse[]> {
    // In a real implementation, this would be a fetch call to your API
    // const response = await fetch(`${this.baseUrl}/students`, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(filters),
    // });
    // return await response.json();

    // Simulate API delay
    await this.delay()

    const {
      classes = [],
      searchTerm = "",
      showOnlyAtRisk = false,
      showOnlyAttendanceRisk = false,
      attendanceThreshold = 85,
    } = filters

    // Get all available classes if none specified
    const classesToFetch =
      classes.length > 0
        ? classes
        : ["1Moderne", "2Moderne", "3STEM", "3TW", "3LAT", "4Sport", "4Mechanica", "4Handel", "5WeWi", "6WeWi"]

    // Mock implementation using the existing data functions
    const result: StudentListResponse[] = classesToFetch
      .map((className) => {
        const studentNames = getStudentsInClass(className)

        const students = studentNames
          .filter((student) => {
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
          })
          .map((student) => {
            const individualGoal = getStudentIndividualGoal(student)
            const { achieved, total } = getTotalCompetencies(student)
            const percentage = (achieved / total) * 100
            const attendanceData = getStudentAttendance(student)

            return {
              name: student,
              atRisk: isStudentAtRisk(student) && percentage < individualGoal,
              atRiskReason: getAtRiskReason(student),
              lowAttendance: attendanceData.present < attendanceThreshold,
              attendancePercentage: attendanceData.present,
            }
          })

        return {
          class: className,
          students,
        }
      })
      .filter((group) => group.students.length > 0)

    return result
  }

  /**
   * Gets detailed information for a specific student
   *
   * @param {string} studentName - Student name
   * @param {string} className - Class name
   * @returns {Promise<StudentDetailsResponse>} - Student details response
   */
  async getStudentDetails(studentName: string, className: string): Promise<StudentDetailsResponse> {
    // In a real implementation, this would be a fetch call to your API
    // const response = await fetch(`${this.baseUrl}/students/${encodeURIComponent(studentName)}`, {
    //   method: 'GET',
    //   headers: { 'Content-Type': 'application/json' },
    // });
    // return await response.json();

    // Simulate API delay
    await this.delay(500)

    // Mock implementation using the existing data functions
    const studentDetails: StudentDetailsResponse = {
      studentInfo: {
        name: studentName,
        class: className,
        profileImage: getStudentProfileImage(studentName),
      },
      subjects: getStudentData(studentName),
      attendance: getStudentAttendance(studentName),
      competencies: getTotalCompetencies(studentName),
      individualGoal: getStudentIndividualGoal(studentName),
      isAtRisk: isStudentAtRisk(studentName),
      atRiskReason: getAtRiskReason(studentName),
      competencyIssues: getStudentCompetencyIssues(studentName),
    }

    return studentDetails
  }

  /**
   * Gets semester scores for class comparison
   *
   * @param {string} className - Class name
   * @param {1|2|3} semester - Semester number
   * @param {string} currentStudent - Current student name
   * @returns {Promise<SemesterScoresResponse>} - Semester scores response
   */
  async getSemesterScores(
    className: string,
    semester: 1 | 2 | 3,
    currentStudent: string,
  ): Promise<SemesterScoresResponse> {
    // In a real implementation, this would be a fetch call to your API
    // const response = await fetch(`${this.baseUrl}/classes/${encodeURIComponent(className)}/semesters/${semester}/scores`, {
    //   method: 'GET',
    //   headers: { 'Content-Type': 'application/json' },
    // });
    // return await response.json();

    // Simulate API delay
    await this.delay()

    // Mock implementation using the existing data functions
    const classScores = getClassScoresForSemester(className, semester)

    // Mark the current student
    const scores = classScores.map((student) => ({
      ...student,
      isCurrentStudent: student.name === currentStudent,
    }))

    return {
      semester,
      scores,
    }
  }

  /**
   * Gets competencies for a specific subject
   *
   * @param {string} subject - Subject name
   * @param {number} [semester=1] - Semester number
   * @param {string} [studentName=""] - Student name
   * @returns {Promise<SubjectCompetenciesResponse>} - Subject competencies response
   */
  async getSubjectCompetencies(subject: string, semester = 1, studentName = ""): Promise<SubjectCompetenciesResponse> {
    // In a real implementation, this would be a fetch call to your API
    // const response = await fetch(`${this.baseUrl}/subjects/${encodeURIComponent(subject)}/competencies`, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ semester, studentName }),
    // });
    // return await response.json();

    // Simulate API delay
    await this.delay()

    console.log(`Fetching competencies for subject: ${subject}, semester: ${semester}, student: ${studentName}`)

    // Generate a consistent seed based on the combination of student, subject, and semester
    const seedString = `${studentName}-${subject}-${semester}`
    let seed = 0
    for (let i = 0; i < seedString.length; i++) {
      seed = ((seed << 5) - seed + seedString.charCodeAt(i)) | 0
    }

    // Use the seed to generate consistent competencies
    const competencies = this.generateConsistentCompetencies(subject, seed)

    return {
      subject,
      semester,
      studentName,
      competencies,
    }
  }

  /**
   * Gets activities for a specific competency
   *
   * @param {string} competencyId - Competency ID
   * @param {string} subject - Subject name
   * @param {number} [semester=1] - Semester number
   * @param {string} [studentName=""] - Student name
   * @returns {Promise<CompetencyActivitiesResponse>} - Competency activities response
   */
  async getCompetencyActivities(
    competencyId: string,
    subject: string,
    semester = 1,
    studentName = "",
  ): Promise<CompetencyActivitiesResponse> {
    // In a real implementation, this would be a fetch call to your API
    // const response = await fetch(`${this.baseUrl}/competencies/${encodeURIComponent(competencyId)}/activities`, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ subject, semester, studentName }),
    // });
    // return await response.json();

    // Simulate API delay
    await this.delay()

    console.log(
      `Fetching activities for competency: ${competencyId}, subject: ${subject}, semester: ${semester}, student: ${studentName}`,
    )

    // Generate a consistent seed based on the combination of student, subject, semester, and competencyId
    const seedString = `${studentName}-${subject}-${semester}-${competencyId}`
    let seed = 0
    for (let i = 0; i < seedString.length; i++) {
      seed = ((seed << 5) - seed + seedString.charCodeAt(i)) | 0
    }

    // Use the seed to generate consistent activities
    const activities = this.generateConsistentActivities(competencyId, subject, seed)

    return {
      competencyId,
      subject,
      semester,
      studentName,
      activities,
    }
  }

  /**
   * Generates consistent competencies based on a seed
   *
   * @private
   * @param {string} subject - Subject name
   * @param {number} seed - Seed for random number generation
   * @returns {Competency[]} - Array of competencies
   */
  private generateConsistentCompetencies(subject: string, seed: number): Competency[] {
    // This is a simplified version that ensures consistency
    // In a real implementation, you would use the seed to generate deterministic random values

    // Use the seed to create a simple pseudo-random number generator
    const pseudoRandom = (max: number) => {
      seed = (seed * 9301 + 49297) % 233280
      return (seed / 233280) * max
    }

    const competencyCount = 5 + Math.floor(pseudoRandom(10)) // 5-14 competencies
    const competencies: Competency[] = []

    // Define subject-specific competency titles
    const subjectCompetencyTitles: Record<string, string[]> = {
      Wiskunde: [
        "Students apply mathematical techniques in physical and technological contexts.",
        "Students create and interpret tables and graphs in various situations.",
        "Students work with functions and graphs to analyze relationships.",
        "Students calculate probabilities in simple probabilistic situations.",
        "Students use statistical techniques to process and interpret data.",
        "Students solve mathematical problems through logical reasoning and deduction.",
        "Students interpret and use formulas and equations in application problems.",
        "Students analyze patterns and relationships in numerical and algebraic data.",
        "Students calculate areas, volumes, and perimeters of geometric figures.",
        "Students solve equations and inequalities with one or more unknowns.",
        "Students apply basic arithmetic skills in complex contexts.",
        "Students use geometric principles to solve spatial problems.",
      ],
      Nederlands: [
        "Students analyze and interpret literary texts from different periods.",
        "Students write coherent and structured texts for different purposes.",
        "Students correctly apply grammatical rules in written and spoken language.",
        "Students give effective oral presentations on various topics.",
        "Students understand and analyze complex texts from different sources.",
        "Students actively participate in debates and discussions on social themes.",
        "Students use a varied vocabulary in different communicative contexts.",
        "Students critically reflect on language use in media and literature.",
      ],
      // Other subjects remain the same...
    }

    // Get subject-specific titles if available
    const specificTitles = subjectCompetencyTitles[subject] || subjectCompetencyTitles.Wiskunde

    for (let i = 0; i < competencyCount; i++) {
      const statusRandom = pseudoRandom(1)
      let status: "not-achieved" | "partially-achieved" | "achieved"

      if (statusRandom < 0.2) {
        status = "not-achieved"
      } else if (statusRandom < 0.4) {
        status = "partially-achieved"
      } else {
        status = "achieved"
      }

      const total = 100
      const achieved = Math.floor(pseudoRandom(60)) // 0-59%
      const partiallyAchieved = Math.floor(pseudoRandom(100 - achieved) / 2)
      const notAchieved = total - achieved - partiallyAchieved

      const id = `COMP-${subject.substring(0, 3).toUpperCase()}-${i + 1}`
      const title = specificTitles[i % specificTitles.length]

      // Generate consistent activities
      const activityCount = 2 + Math.floor(pseudoRandom(4)) // 2-5 activities
      const activities: Activity[] = []

      for (let j = 0; j < activityCount; j++) {
        const activityType = pseudoRandom(1) > 0.5 ? "toets" : "taak"
        const score = Math.floor(pseudoRandom(20) + 1)
        const maxScore = 20

        activities.push({
          id: `${id}-ACT-${j + 1}`,
          type: activityType,
          title: `${subject} ${activityType} ${j + 1}`,
          score,
          maxScore,
          completed: true,
          evaluated: true,
          date: new Date(2023, pseudoRandom(12) | 0, (pseudoRandom(28) | 0) + 1).toISOString(),
          semester: pseudoRandom(3) < 1 ? 1 : pseudoRandom(3) < 2 ? 2 : 3,
          classDistribution: {
            min: Math.max(1, score - 5),
            max: Math.min(maxScore, score + 5),
            average: score,
            studentCount: 20,
            lowPerformers: 20,
            mediumPerformers: 50,
            highPerformers: 30,
          },
          relativePerformance: pseudoRandom(3) < 1 ? "onder" : pseudoRandom(3) < 2 ? "gemiddeld" : "boven",
          competencyId: id,
          subjectId: subject,
        })
      }

      competencies.push({
        id,
        title,
        status,
        classDistribution: {
          notAchieved,
          partiallyAchieved,
          achieved,
        },
        activities,
        globalId: `GLOBAL-${id}`,
        subjects: [subject],
      })
    }

    return competencies
  }

  /**
   * Generates consistent activities for a specific competency
   *
   * @private
   * @param {string} competencyId - Competency ID
   * @param {string} subject - Subject name
   * @param {number} seed - Seed for random number generation
   * @returns {Activity[]} - Array of activities
   */
  private generateConsistentActivities(competencyId: string, subject: string, seed: number): Activity[] {
    // Use the seed to create a simple pseudo-random number generator
    const pseudoRandom = (max: number) => {
      seed = (seed * 9301 + 49297) % 233280
      return (seed / 233280) * max
    }

    const activityCount = 3 + Math.floor(pseudoRandom(5)) // 3-7 activities
    const activities: Activity[] = []

    for (let j = 0; j < activityCount; j++) {
      const activityType = pseudoRandom(1) > 0.7 ? "examen" : pseudoRandom(1) > 0.5 ? "toets" : "taak"
      const score = Math.floor(pseudoRandom(20) + 1)
      const maxScore = 20
      const semester = pseudoRandom(3) < 1 ? 1 : pseudoRandom(3) < 2 ? 2 : 3

      // Generate a more detailed title based on the activity type and competency
      let title = ""
      if (activityType === "examen") {
        title = `${subject} ${semester === 1 ? "Midterm" : "Final"} Exam ${j + 1}`
      } else if (activityType === "toets") {
        title = `${subject} Test ${j + 1}: ${competencyId.split("-")[1]} Skills`
      } else {
        title = `${subject} Assignment ${j + 1}: ${competencyId.split("-")[1]} Application`
      }

      activities.push({
        id: `${competencyId}-ACT-${j + 1}`,
        type: activityType,
        title,
        score,
        maxScore,
        completed: pseudoRandom(1) > 0.1, // 90% chance of being completed
        evaluated: pseudoRandom(1) > 0.2, // 80% chance of being evaluated if completed
        date: new Date(2023, Math.floor(pseudoRandom(12)), Math.floor(pseudoRandom(28)) + 1).toISOString(),
        semester,
        classDistribution: {
          min: Math.max(1, score - 5),
          max: Math.min(maxScore, score + 5),
          average: score - 1 + pseudoRandom(2), // Average close to student's score
          studentCount: 20 + Math.floor(pseudoRandom(10)),
          lowPerformers: Math.floor(pseudoRandom(30)),
          mediumPerformers: Math.floor(pseudoRandom(40)) + 10,
          highPerformers: Math.floor(pseudoRandom(30)),
        },
        relativePerformance: pseudoRandom(3) < 1 ? "onder" : pseudoRandom(3) < 2 ? "gemiddeld" : "boven",
        competencyId,
        subjectId: subject,
      })
    }

    return activities
  }

  /**
   * Gets activities for a specific subject
   *
   * @param {string} studentName - Student name
   * @param {string} subject - Subject name
   * @returns {Promise<SubjectActivitiesResponse>} - Subject activities response
   */
  async getSubjectActivities(studentName: string, subject: string): Promise<SubjectActivitiesResponse> {
    // In a real implementation, this would be a fetch call to your API
    // const response = await fetch(`${this.baseUrl}/students/${encodeURIComponent(studentName)}/subjects/${encodeURIComponent(subject)}/activities`, {
    //   method: 'GET',
    //   headers: { 'Content-Type': 'application/json' },
    // });
    // return await response.json();

    // Simulate API delay
    await this.delay()

    // Mock implementation using the existing data functions
    const activities = getStudentActivitiesForSubject(studentName, subject)

    return {
      subject,
      activities,
    }
  }

  /**
   * Gets class distribution for a specific subject
   *
   * @param {string} className - Class name
   * @param {string} subject - Subject name
   * @param {number} semester - Semester number
   * @param {number} studentScore - Student's score
   * @returns {Promise<ClassDistributionResponse>} - Class distribution response
   */
  async getClassDistribution(
    className: string,
    subject: string,
    semester: number,
    studentScore: number,
  ): Promise<ClassDistributionResponse> {
    // In a real implementation, this would be a fetch call to your API
    // const response = await fetch(`${this.baseUrl}/classes/${encodeURIComponent(className)}/subjects/${encodeURIComponent(subject)}/distribution`, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ semester, studentScore }),
    // });
    // return await response.json();

    // Simulate API delay
    await this.delay()

    // Mock implementation using the existing data functions
    const { distribution, studentBucket } = getClassDistributionForSubject(
      className,
      subject,
      semester as 1 | 2 | 3,
      studentScore,
    )

    return {
      distribution,
      studentBucket,
    }
  }

  /**
   * Gets student semester data
   *
   * @param {string} studentName - Student name
   * @param {1|2|3} semester - Semester number
   * @returns {Promise<XAPIStatement[]>} - Array of xAPI statements
   */
  async getStudentSemesterData(studentName: string, semester: 1 | 2 | 3): Promise<XAPIStatement[]> {
    // In a real implementation, this would be a fetch call to your API
    // const response = await fetch(`${this.baseUrl}/students/${encodeURIComponent(studentName)}/semesters/${semester}`, {
    //   method: 'GET',
    //   headers: { 'Content-Type': 'application/json' },
    // });
    // return await response.json();

    // Simulate API delay
    await this.delay()

    // Mock implementation using the existing data functions
    return getStudentSemesterData(studentName, semester)
  }

  /**
   * Updates attendance threshold for a student
   *
   * @param {string} studentName - Student name
   * @param {number} threshold - Attendance threshold percentage
   * @returns {Promise<{success: boolean}>} - Success response
   */
  async updateAttendanceThreshold(studentName: string, threshold: number): Promise<{ success: boolean }> {
    // In a real implementation, this would be a fetch call to your API
    // const response = await fetch(`${this.baseUrl}/students/${encodeURIComponent(studentName)}/attendance-threshold`, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ threshold }),
    // });
    // return await response.json();

    // Simulate API delay
    await this.delay(500)

    // Mock implementation - just return success
    return { success: true }
  }

  /**
   * Updates individual goal for a student
   *
   * @param {string} studentName - Student name
   * @param {number} goal - Individual goal percentage
   * @returns {Promise<{success: boolean}>} - Success response
   */
  async updateIndividualGoal(studentName: string, goal: number): Promise<{ success: boolean }> {
    // In a real implementation, this would be a fetch call to your API
    // const response = await fetch(`${this.baseUrl}/students/${encodeURIComponent(studentName)}/individual-goal`, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ goal }),
    // });
    // return await response.json();

    // Simulate API delay
    await this.delay(500)

    // Mock implementation - just return success
    return { success: true }
  }
}

// Create a singleton instance of the API service
const apiService = new ApiService()

// Export the API with all methods from ApiService plus our additional methods
export const api = {
  // Include all methods from the ApiService instance
  getStudentList: apiService.getStudentList.bind(apiService),
  getStudentDetails: apiService.getStudentDetails.bind(apiService),
  getSemesterScores: apiService.getSemesterScores.bind(apiService),
  getSubjectCompetencies: apiService.getSubjectCompetencies.bind(apiService),
  getCompetencyActivities: apiService.getCompetencyActivities.bind(apiService),
  getSubjectActivities: apiService.getSubjectActivities.bind(apiService),
  getClassDistribution: apiService.getClassDistribution.bind(apiService),
  getStudentSemesterData: apiService.getStudentSemesterData.bind(apiService),
  updateAttendanceThreshold: apiService.updateAttendanceThreshold.bind(apiService),
  updateIndividualGoal: apiService.updateIndividualGoal.bind(apiService),

  /**
   * Updates global threshold settings
   * @param {Object} params - The threshold parameters
   * @param {number} params.attendanceThreshold - The new attendance threshold percentage
   * @param {number} params.individualGoal - The new individual goal percentage
   * @param {string|string[]} params.targetClasses - The classes to apply these thresholds to ('all' or array of class names)
   * @returns {Promise<{success: boolean}>} - Result of the operation
   */
  updateGlobalThresholds: async (params: {
    attendanceThreshold: number
    individualGoal: number
    targetClasses: "all" | string[]
  }): Promise<{ success: boolean }> => {
    // In a real implementation, this would make an API call
    // For now, we'll simulate a successful update
    console.log("Updating global thresholds:", params)

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    return { success: true }
  },
}
