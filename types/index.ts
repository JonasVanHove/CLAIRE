/**
 * Types Module
 *
 * This module contains TypeScript type definitions used throughout the application.
 *
 * @module types
 */

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
 * @property {any[]} activities - Activities for this competency
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
  activities: any[]
  notes?: string
  globalId: string
  subjects: string[]
}
