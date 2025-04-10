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
 * Web service definitions
 *
 * @package    block_student_dashboard
 * @copyright  2023 Your Name <your.email@example.com>
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

defined('MOODLE_INTERNAL') || die();

$services = array(
    'Student Dashboard Service' => array(
        'functions' => array(
            'block_student_dashboard_get_student_data',
            'block_student_dashboard_get_class_students',
        ),
        'restrictedusers' => 0,
        'enabled' => 1,
    )
);

$functions = array(
    'block_student_dashboard_get_student_data' => array(
        'classname'   => 'block_student_dashboard_external',
        'methodname'  => 'get_student_data',
        'classpath'   => 'blocks/student_dashboard/externallib.php',
        'description' => 'Get student data for the dashboard',
        'type'        => 'read',
        'ajax'        => true,
        'capabilities'=> 'block/student_dashboard:view',
    ),
    'block_student_dashboard_get_class_students' => array(
        'classname'   => 'block_student_dashboard_external',
        'methodname'  => 'get_class_students',
        'classpath'   => 'blocks/student_dashboard/externallib.php',
        'description' => 'Get list of students in a class',
        'type'        => 'read',
        'ajax'        => true,
        'capabilities'=> 'block/student_dashboard:view',
    ),
);
