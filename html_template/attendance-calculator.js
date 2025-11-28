// Attendance Rate Calculator Module
// Provides accurate attendance rate calculations for students and admin dashboard

/**
 * Calculate attendance rate for a specific student
 * @param {string} studentId - The student's ID
 * @returns {number} - Attendance rate as a percentage (0-100)
 */
function calculateStudentAttendanceRate(studentId) {
    const attendanceHistory = JSON.parse(localStorage.getItem('attendanceHistory') || '[]');
    
    if (attendanceHistory.length === 0) {
        return 0;
    }
    
    let totalClasses = 0;
    let attendedClasses = 0;
    
    attendanceHistory.forEach(record => {
        if (record.details && record.details[studentId]) {
            totalClasses++;
            if (record.details[studentId] === 'present') {
                attendedClasses++;
            }
        }
    });
    
    if (totalClasses === 0) {
        return 0;
    }
    
    return Math.round((attendedClasses / totalClasses) * 100);
}

/**
 * Calculate overall attendance rate across all students
 * @returns {number} - Overall attendance rate as a percentage (0-100)
 */
function calculateOverallAttendanceRate() {
    const attendanceHistory = JSON.parse(localStorage.getItem('attendanceHistory') || '[]');
    
    if (attendanceHistory.length === 0) {
        return 0;
    }
    
    let totalAttendanceRecords = 0;
    let totalPresentRecords = 0;
    
    attendanceHistory.forEach(record => {
        if (record.details) {
            Object.values(record.details).forEach(status => {
                totalAttendanceRecords++;
                if (status === 'present') {
                    totalPresentRecords++;
                }
            });
        }
    });
    
    if (totalAttendanceRecords === 0) {
        return 0;
    }
    
    return Math.round((totalPresentRecords / totalAttendanceRecords) * 100);
}

/**
 * Get attendance statistics for a student
 * @param {string} studentId - The student's ID
 * @returns {object} - Object containing attendance statistics
 */
function getStudentAttendanceStats(studentId) {
    const attendanceHistory = JSON.parse(localStorage.getItem('attendanceHistory') || '[]');
    
    let totalClasses = 0;
    let attendedClasses = 0;
    let absentClasses = 0;
    
    attendanceHistory.forEach(record => {
        if (record.details && record.details[studentId]) {
            totalClasses++;
            if (record.details[studentId] === 'present') {
                attendedClasses++;
            } else {
                absentClasses++;
            }
        }
    });
    
    const rate = totalClasses > 0 ? Math.round((attendedClasses / totalClasses) * 100) : 0;
    
    return {
        totalClasses,
        attendedClasses,
        absentClasses,
        rate
    };
}

/**
 * Get attendance statistics for current month
 * @param {string} studentId - Optional student ID for individual stats
 * @returns {object} - Object containing monthly attendance statistics
 */
function getMonthlyAttendanceStats(studentId = null) {
    const attendanceHistory = JSON.parse(localStorage.getItem('attendanceHistory') || '[]');
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    
    const monthlyRecords = attendanceHistory.filter(record => {
        const recordDate = new Date(record.date);
        return recordDate.getMonth() === currentMonth && recordDate.getFullYear() === currentYear;
    });
    
    if (studentId) {
        let classesThisMonth = 0;
        let attendedThisMonth = 0;
        
        monthlyRecords.forEach(record => {
            if (record.details && record.details[studentId]) {
                classesThisMonth++;
                if (record.details[studentId] === 'present') {
                    attendedThisMonth++;
                }
            }
        });
        
        return {
            classesThisMonth,
            attendedThisMonth,
            rate: classesThisMonth > 0 ? Math.round((attendedThisMonth / classesThisMonth) * 100) : 0
        };
    }
    
    // Overall monthly stats
    let totalRecords = 0;
    let totalPresent = 0;
    
    monthlyRecords.forEach(record => {
        if (record.details) {
            Object.values(record.details).forEach(status => {
                totalRecords++;
                if (status === 'present') {
                    totalPresent++;
                }
            });
        }
    });
    
    return {
        totalClasses: monthlyRecords.length,
        totalRecords,
        totalPresent,
        rate: totalRecords > 0 ? Math.round((totalPresent / totalRecords) * 100) : 0
    };
}

// Export functions for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        calculateStudentAttendanceRate,
        calculateOverallAttendanceRate,
        getStudentAttendanceStats,
        getMonthlyAttendanceStats
    };
}