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
 * Student Dashboard block
 *
 * @package    block_student_dashboard
 * @copyright  2023 Your Name <your.email@example.com>
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

defined('MOODLE_INTERNAL') || die();

class block_student_dashboard extends block_base {

    public function init() {
        $this->title = get_string('pluginname', 'block_student_dashboard');
    }

    public function get_content() {
        global $CFG, $OUTPUT, $USER, $DB, $PAGE;

        if ($this->content !== null) {
            return $this->content;
        }

        $this->content = new stdClass;
        
        // Add required JavaScript
        $PAGE->requires->js(new moodle_url($CFG->wwwroot . '/blocks/student_dashboard/js/d3.v7.min.js'));
        $PAGE->requires->js(new moodle_url($CFG->wwwroot . '/blocks/student_dashboard/js/dashboard.js'));
        
        // Add required CSS
        $PAGE->requires->css(new moodle_url($CFG->wwwroot . '/blocks/student_dashboard/styles.css'));

        // Get the current user's information
        $user = $DB->get_record('user', array('id' => $USER->id));
        
        // Get the current user's class/cohort
        // This would need to be adapted to your specific Moodle setup
        $cohorts = $DB->get_records_sql(
            "SELECT c.id, c.name
             FROM {cohort} c
             JOIN {cohort_members} cm ON cm.cohortid = c.id
             WHERE cm.userid = ?",
            array($USER->id)
        );
        
        $currentClass = !empty($cohorts) ? reset($cohorts)->name : 'Unknown Class';
        
        // Prepare the dashboard content
        $dashboardContent = $this->generate_dashboard_html($user->firstname . ' ' . $user->lastname, $currentClass);
        
        $this->content->text = $dashboardContent;
        $this->content->footer = '';

        return $this->content;
    }

    private function generate_dashboard_html($studentName, $className) {
        // This function generates the HTML structure for the dashboard
        $profileImageUrl = 'https://static.wikia.nocookie.net/fcdekampioenen/images/8/8c/Marc.jpg/revision/latest?cb=20130713153556';
        
        $html = '
        <div class="student-dashboard" data-student="' . htmlspecialchars($studentName) . '" data-class="' . htmlspecialchars($className) . '">
            <header class="dashboard-header">
                <div class="header-left">
                    <button class="icon-button">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                            <line x1="3" y1="9" x2="21" y2="9"></line>
                            <line x1="9" y1="21" x2="9" y2="9"></line>
                        </svg>
                    </button>
                    <div class="student-selector-container">
                        <button class="student-selector-button">
                            <span class="student-name">' . htmlspecialchars($studentName) . '</span>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <polyline points="6 9 12 15 18 9"></polyline>
                            </svg>
                        </button>
                        <div class="student-dropdown" style="display: none;">
                            <!-- Will be populated by JavaScript -->
                        </div>
                    </div>
                </div>
                <div class="header-right">
                    <button class="icon-button">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <circle cx="11" cy="11" r="8"></circle>
                            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                        </svg>
                    </button>
                    <button class="icon-button">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <circle cx="12" cy="12" r="10"></circle>
                            <circle cx="12" cy="10" r="3"></circle>
                            <path d="M7 20.662V19a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1.662"></path>
                        </svg>
                    </button>
                </div>
            </header>

            <main class="dashboard-content">
                <h1 class="page-title">Positionering ten opzichte van medestudenten uit <span class="class-name">' . htmlspecialchars($className) . '</span></h1>

                <div class="progress-section">
                    <div class="progress-header">
                        <div class="progress-title">
                            <div class="progress-label">Competenties behaald</div>
                            <div class="progress-value" id="competencies-value">0/0</div>
                        </div>
                        
                        <div class="progress-bar">
                            <div class="progress-fill" id="competencies-fill" style="width: 0%;"></div>
                        </div>
                        
                        <div class="status-card">
                            <div class="status-title">Status:</div>
                            <div class="status-items">
                                <div class="profile-section">
                                    <img src="' . $profileImageUrl . '" alt="' . htmlspecialchars($studentName) . '" class="profile-image" style="width: 80px; height: 80px; border-radius: 50%; object-fit: cover; margin-bottom: 10px;">
                                </div>
                                <div class="status-item">
                                    <svg class="status-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                                        <polyline points="22 4 12 14.01 9 11.01"></polyline>
                                    </svg>
                                    <span>Binnen doelstelling</span>
                                </div>
                                <div class="status-item">
                                    <svg class="status-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                                        <polyline points="22 4 12 14.01 9 11.01"></polyline>
                                    </svg>
                                    <span>Aanwezigheid boven grenswaarde</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="dot-plots">
                        <div class="dot-plot-card">
                            <div class="dot-plot-title">Semester 1</div>
                            <div id="dot-plot-1" class="dot-plot"></div>
                        </div>
                        <div class="dot-plot-card">
                            <div class="dot-plot-title">Semester 2</div>
                            <div id="dot-plot-2" class="dot-plot"></div>
                        </div>
                        <div class="dot-plot-card">
                            <div class="dot-plot-title">Semester 3</div>
                            <div id="dot-plot-3" class="dot-plot"></div>
                        </div>
                    </div>
                </div>

                <div class="tabs">
                    <div class="tabs-list">
                        <button class="tab-button active" data-tab="semester1">
                            Semester 1
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <polyline points="6 9 12 15 18 9"></polyline>
                            </svg>
                        </button>
                        <button class="tab-button" data-tab="semester2">
                            Semester 2
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <polyline points="6 9 12 15 18 9"></polyline>
                            </svg>
                        </button>
                        <button class="tab-button" data-tab="semester3">
                            Semester 3
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <polyline points="6 9 12 15 18 9"></polyline>
                            </svg>
                        </button>
                    </div>
                    
                    <div class="tab-content active" id="semester1">
                        <div class="subject-grid" id="semester1-grid">
                            <!-- Will be populated by JavaScript -->
                        </div>
                    </div>
                    
                    <div class="tab-content" id="semester2">
                        <div class="subject-grid" id="semester2-grid">
                            <!-- Will be populated by JavaScript -->
                        </div>
                    </div>
                    
                    <div class="tab-content" id="semester3">
                        <div class="subject-grid" id="semester3-grid">
                            <!-- Will be populated by JavaScript -->
                        </div>
                    </div>
                </div>
            </main>
        </div>
        ';
        
        return $html;
    }

    public function applicable_formats() {
        return array(
            'all' => true
        );
    }

    public function has_config() {
        return false;
    }
}
