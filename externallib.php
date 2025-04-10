<?php
// This file is part of Moodle - http://moodle.org/
//
// Moodle is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// Moodle is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with Moodle.  If not, see <http://www.gnu.org/licenses/>.

/**
 * External Web Service API
 *
 * @package    block_student_dashboard
 * @copyright  2023 Your Name <your.email@example.com>
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

defined('MOODLE_INTERNAL') || die();

require_once($CFG->libdir . '/externallib.php');

class block_student_dashboard_external extends external_api {

    /**
     * Returns description of get_student_data parameters
     * @return external_function_parameters
     */
    public static function get_student_data_parameters() {
        return new external_function_parameters(
            array(
                'studentname' => new external_value(PARAM_TEXT, 'Student name'),
                'classname' => new external_value(PARAM_TEXT, 'Class name')
            )
        );
    }

    /**
     * Get student data for the dashboard
     * @param string $studentname Student name
     * @param string $classname Class name
     * @return array Student data
     */
    public static function get_student_data($studentname, $classname) {
        global $DB, $USER;
        
        // Parameter validation
        $params = self::validate_parameters(
            self::get_student_data_parameters(),
            array(
                'studentname' => $studentname,
                'classname' => $classname
            )
        );
        
        // Context validation
        $context = context_system::instance();
        self::validate_context($context);
        
        // Capability check
        require_capability('block/student_dashboard:view', $context);
        
        // In a real implementation, this would fetch data from Moodle's database
        // For this example, we'll generate mock data
        
        // Define the subjects
        $subjects = array(
            "Wiskunde", "Nederlands", "Frans", "Engels", "Levensbeschouwelijke vakken",
            "Geschiedenis", "Lichamelijke opvoeding", "Mechanica", "Elektromagnetisme",
            "Natuurwetenschappen", "Artistieke vorming", "Toegepaste informatica",
            "Thermodynamica", "Project STEM"
        );
        
        // Generate competencies data
        $competencies = array(
            'achieved' => 165,
            'total' => 210
        );
        
        // Generate semester scores for class comparison
        $semesterScores = array();
        
        for ($semester = 1; $semester <= 3; $semester++) {
            // Generate 20-30 students per class
            $studentCount = 20 + rand(0, 10);
            $scores = array();
            
            for ($i = 0; $i < $studentCount; $i++) {
                $isCurrentStudent = $i === 0; // First student is the current one
                $baseScore = $isCurrentStudent ? 75 : 40 + (rand(0, 5000) / 100);
                $semesterBonus = ($semester - 1) * 5;
                $variation = (rand(-1000, 1000) / 100);
                
                $score = $baseScore + $semesterBonus + $variation;
                $score = max(0, min(100, $score));
                
                $scores[] = array(
                    'name' => $isCurrentStudent ? $studentname : "Student $i",
                    'score' => $score,
                    'isCurrentStudent' => $isCurrentStudent
                );
            }
            
            $semesterScores[] = array(
                'semester' => $semester,
                'scores' => $scores
            );
        }
        
        // Generate subject data for each semester
        $semesterSubjects = array();
        
        for ($semester = 1; $semester <= 3; $semester++) {
            $semesterSubjects[$semester] = array();
            
            // Not all subjects are available in each semester
            $semesterSubjectCount = $semester === 1 ? count($subjects) : 7;
            $subjectsForSemester = array_slice($subjects, 0, $semesterSubjectCount);
            
            foreach ($subjectsForSemester as $subject) {
                // Generate a base score that's consistent for a student (with some variation)
                $baseScore = 75 + (rand(0, 1500) / 100); // Student is generally good
                
                // Add some progression across semesters
                $semesterBonus = ($semester - 1) * 5;
                
                // Add subject-specific variation
                $subjectVariation = (rand(-1000, 1000) / 100);
                
                // Calculate final score
                $score = $baseScore + $semesterBonus + $subjectVariation;
                
                // Special cases
                if ($subject === "Lichamelijke opvoeding" && $semester === 1) {
                    $score = 50; // Struggles with PE in semester 1
                }
                if ($subject === "Toegepaste informatica" && $semester === 1) {
                    $score = 35; // Really struggles with computer science
                }
                
                // Clamp score between 0 and 100
                $score = max(0, min(100, $score));
                
                // Calculate competencies
                $totalCompetencies = 10 + rand(0, 15);
                $achievedCompetencies = floor(($score / 100) * $totalCompetencies);
                
                // Generate chart data (distribution of students by score)
                $chartData = array();
                for ($i = 0; $i < 10; $i++) {
                    $chartData[] = rand(0, 10);
                }
                
                $semesterSubjects[$semester][] = array(
                    'subject' => $subject,
                    'percentage' => $score,
                    'competencies' => "$achievedCompetencies/$totalCompetencies",
                    'activities' => 1 + rand(0, 7),
                    'chartData' => $chartData,
                    'status' => $score < 50 ? "danger" : ($score < 70 ? "warning" : "success")
                );
            }
        }
        
        return array(
            'competencies' => $competencies,
            'semesterScores' => $semesterScores,
            'semesterSubjects' => $semesterSubjects
        );
    }

    /**
     * Returns description of get_student_data return values
     * @return external_description
     */
    public static function get_student_data_returns() {
        return new external_single_structure(
            array(
                'competencies' => new external_single_structure(
                    array(
                        'achieved' => new external_value(PARAM_INT, 'Number of achieved competencies'),
                        'total' => new external_value(PARAM_INT, 'Total number of competencies')
                    )
                ),
                'semesterScores' => new external_multiple_structure(
                    new external_single_structure(
                        array(
                            'semester' => new external_value(PARAM_INT, 'Semester number'),
                            'scores' => new external_multiple_structure(
                                new external_single_structure(
                                    array(
                                        'name' => new external_value(PARAM_TEXT, 'Student name'),
                                        'score' => new external_value(PARAM_FLOAT, 'Student score'),
                                        'isCurrentStudent' => new external_value(PARAM_BOOL, 'Whether this is the current student')
                                    )
                                )
                            )
                        )
                    )
                ),
                'semesterSubjects' => new external_single_structure(
                    array(
                        '1' => new external_multiple_structure(
                            new external_single_structure(
                                array(
                                    'subject' => new external_value(PARAM_TEXT, 'Subject name'),
                                    'percentage' => new external_value(PARAM_FLOAT, 'Score percentage'),
                                    'competencies' => new external_value(PARAM_TEXT, 'Competencies achieved/total'),
                                    'activities' => new external_value(PARAM_INT, 'Number of activities'),
                                    'chartData' => new external_multiple_structure(
                                        new external_value(PARAM_INT, 'Chart data point')
                                    ),
                                    'status' => new external_value(PARAM_TEXT, 'Status (success, warning, danger)')
                                )
                            )
                        ),
                        '2' => new external_multiple_structure(
                            new external_single_structure(
                                array(
                                    'subject' => new external_value(PARAM_TEXT, 'Subject name'),
                                    'percentage' => new external_value(PARAM_FLOAT, 'Score percentage'),
                                    'competencies' => new external_value(PARAM_TEXT, 'Competencies achieved/total'),
                                    'activities' => new external_value(PARAM_INT, 'Number of activities'),
                                    'chartData' => new external_multiple_structure(
                                        new external_value(PARAM_INT, 'Chart data point')
                                    ),
                                    'status' => new external_value(PARAM_TEXT, 'Status (success, warning, danger)')
                                )
                            )
                        ),
                        '3' => new external_multiple_structure(
                            new external_single_structure(
                                array(
                                    'subject' => new external_value(PARAM_TEXT, 'Subject name'),
                                    'percentage' => new external_value(PARAM_FLOAT, 'Score percentage'),
                                    'competencies' => new external_value(PARAM_TEXT, 'Competencies achieved/total'),
                                    'activities' => new external_value(PARAM_INT, 'Number of activities'),
                                    'chartData' => new external_multiple_structure(
                                        new external_value(PARAM_INT, 'Chart data point')
                                    ),
                                    'status' => new external_value(PARAM_TEXT, 'Status (success, warning, danger)')
                                )
                            )
                        )
                    )
                )
            )
        );
    }

    /**
     * Returns description of get_class_students parameters
     * @return external_function_parameters
     */
    public static function get_class_students_parameters() {
        return new external_function_parameters(
            array(
                'classname' => new external_value(PARAM_TEXT, 'Class name')
            )
        );
    }

    /**
     * Get list of students in a class
     * @param string $classname Class name
     * @return array List of students
     */
    public static function get_class_students($classname) {
        global $DB;
        
        // Parameter validation
        $params = self::validate_parameters(
            self::get_class_students_parameters(),
            array(
                'classname' => $classname
            )
        );
        
        // Context validation
        $context = context_system::instance();
        self::validate_context($context);
        
        // Capability check
        require_capability('block/student_dashboard:view', $context);
        
        // In a real implementation, this would fetch students from Moodle's database
        // For this example, we'll return mock data
        
        $studentsByClass = array(
            "3STEM" => array(
                array("name" => "Marc Vertongen", "atRisk" => false),
                array("name" => "Emma Peeters", "atRisk" => false),
                array("name" => "Thomas Janssens", "atRisk" => true),
                array("name" => "Sophie Maes", "atRisk" => false),
                array("name" => "Lukas Wouters", "atRisk" => true),
                array("name" => "Nina Vermeulen", "atRisk" => false),
                array("name" => "Daan De Vos", "atRisk" => false),
                array("name" => "Lotte Jacobs", "atRisk" => false)
            ),
            "3TW" => array(
                array("name" => "Lucas Dubois", "atRisk" => false),
                array("name" => "Nora Van den Berg", "atRisk" => true),
                array("name" => "Elias Coppens", "atRisk" => false),
                array("name" => "Julie De Smet", "atRisk" => false),
                array("name" => "Mathis Peeters", "atRisk" => true),
                array("name" => "Olivia Janssens", "atRisk" => false)
            ),
            "3LAT" => array(
                array("name" => "Finn Jacobs", "atRisk" => false),
                array("name" => "Mila Martens", "atRisk" => true),
                array("name" => "Arthur Claes", "atRisk" => false),
                array("name" => "Noor Willems", "atRisk" => false),
                array("name" => "Victor Smets", "atRisk" => false),
                array("name" => "Fleur Dubois", "atRisk" => true)
            )
        );
        
        if (isset($studentsByClass[$classname])) {
            return array('students' => $studentsByClass[$classname]);
        } else {
            return array('students' => array());
        }
    }

    /**
     * Returns description of get_class_students return values
     * @return external_description
     */
    public static function get_class_students_returns() {
        return new external_single_structure(
            array(
                'students' => new external_multiple_structure(
                    new external_single_structure(
                        array(
                            'name' => new external_value(PARAM_TEXT, 'Student name'),
                            'atRisk' => new external_value(PARAM_BOOL, 'Whether the student is at risk')
                        )
                    )
                )
            )
        );
    }
}
