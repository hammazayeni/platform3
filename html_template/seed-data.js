// Seed Data Generator for Taekwondo Academy Platform
// This script generates realistic demo data for testing

function generateSeedData() {
    // Check if seed data already exists
    const seedGenerated = localStorage.getItem('seedDataGenerated');
    if (seedGenerated === 'true') {
        console.log('Seed data already generated. Skipping...');
        return;
    }
    
    console.log('Generating seed data...');
    
    // Generate sample activities
    const activities = [
        {
            id: Date.now() - 7200000,
            type: 'STUDENT_ENROLLED',
            icon: '👤',
            description: 'New student enrolled: Emma Johnson',
            timestamp: new Date(Date.now() - 7200000).toISOString(),
            metadata: {}
        },
        {
            id: Date.now() - 18000000,
            type: 'ATTENDANCE_MARKED',
            icon: '✅',
            description: 'Attendance marked: Advanced Class',
            timestamp: new Date(Date.now() - 18000000).toISOString(),
            metadata: {}
        },
        {
            id: Date.now() - 86400000,
            type: 'BELT_PROMOTION',
            icon: '🏆',
            description: 'Belt promotion: Michael Chen to Blue Belt',
            timestamp: new Date(Date.now() - 86400000).toISOString(),
            metadata: {}
        },
        {
            id: Date.now() - 172800000,
            type: 'CERTIFICATE_ISSUED',
            icon: '🎓',
            description: 'Certificate issued: Yellow Belt Certificate for Sarah Kim',
            timestamp: new Date(Date.now() - 172800000).toISOString(),
            metadata: {}
        },
        {
            id: Date.now() - 259200000,
            type: 'ANNOUNCEMENT_POSTED',
            icon: '📢',
            description: 'Announcement posted: Tournament Registration Now Open',
            timestamp: new Date(Date.now() - 259200000).toISOString(),
            metadata: {}
        }
    ];
    
    localStorage.setItem('recentActivities', JSON.stringify(activities));
    
    // Generate today's classes
    const today = new Date().toISOString().split('T')[0];
    const todayClasses = [
        {
            id: Date.now() + 1,
            name: 'Beginner Class',
            time: '10:00',
            date: today,
            beltLevels: 'White & Yellow Belts',
            studentCount: 15,
            instructor: 'Master Kim',
            createdAt: new Date().toISOString()
        },
        {
            id: Date.now() + 2,
            name: 'Intermediate Class',
            time: '14:00',
            date: today,
            beltLevels: 'Green & Blue Belts',
            studentCount: 12,
            instructor: 'Master Lee',
            createdAt: new Date().toISOString()
        },
        {
            id: Date.now() + 3,
            name: 'Advanced Class',
            time: '17:00',
            date: today,
            beltLevels: 'Red & Black Belts',
            studentCount: 8,
            instructor: 'Master Park',
            createdAt: new Date().toISOString()
        },
        {
            id: Date.now() + 4,
            name: 'Kids Class',
            time: '16:00',
            date: today,
            beltLevels: 'All Levels',
            studentCount: 20,
            instructor: 'Coach Johnson',
            createdAt: new Date().toISOString()
        }
    ];
    
    localStorage.setItem('dailyClasses', JSON.stringify(todayClasses));
    
    // Generate weekly schedule
    const weeklySchedule = [
        // Monday
        {
            id: Date.now() + 101,
            day: 'Monday',
            time: '10:00',
            className: 'Beginner Basics',
            beltLevels: 'White & Yellow Belts',
            instructor: 'Master Kim',
            createdAt: new Date().toISOString()
        },
        {
            id: Date.now() + 102,
            day: 'Monday',
            time: '17:00',
            className: 'Advanced Sparring',
            beltLevels: 'Red & Black Belts',
            instructor: 'Master Park',
            createdAt: new Date().toISOString()
        },
        // Tuesday
        {
            id: Date.now() + 201,
            day: 'Tuesday',
            time: '14:00',
            className: 'Forms & Patterns',
            beltLevels: 'Green & Blue Belts',
            instructor: 'Master Lee',
            createdAt: new Date().toISOString()
        },
        {
            id: Date.now() + 202,
            day: 'Tuesday',
            time: '18:00',
            className: 'Self-Defense',
            beltLevels: 'All Levels',
            instructor: 'Coach Johnson',
            createdAt: new Date().toISOString()
        },
        // Wednesday
        {
            id: Date.now() + 301,
            day: 'Wednesday',
            time: '10:00',
            className: 'Kids Taekwondo',
            beltLevels: 'Ages 5-12',
            instructor: 'Coach Martinez',
            createdAt: new Date().toISOString()
        },
        {
            id: Date.now() + 302,
            day: 'Wednesday',
            time: '16:00',
            className: 'Board Breaking',
            beltLevels: 'Blue Belt & Above',
            instructor: 'Master Kim',
            createdAt: new Date().toISOString()
        },
        // Thursday
        {
            id: Date.now() + 401,
            day: 'Thursday',
            time: '14:00',
            className: 'Intermediate Training',
            beltLevels: 'Green & Blue Belts',
            instructor: 'Master Lee',
            createdAt: new Date().toISOString()
        },
        {
            id: Date.now() + 402,
            day: 'Thursday',
            time: '19:00',
            className: 'Competition Prep',
            beltLevels: 'Red & Black Belts',
            instructor: 'Master Park',
            createdAt: new Date().toISOString()
        },
        // Friday
        {
            id: Date.now() + 501,
            day: 'Friday',
            time: '10:00',
            className: 'Beginner Basics',
            beltLevels: 'White & Yellow Belts',
            instructor: 'Master Kim',
            createdAt: new Date().toISOString()
        },
        {
            id: Date.now() + 502,
            day: 'Friday',
            time: '17:00',
            className: 'Family Class',
            beltLevels: 'All Ages & Levels',
            instructor: 'Coach Johnson',
            createdAt: new Date().toISOString()
        },
        // Saturday
        {
            id: Date.now() + 601,
            day: 'Saturday',
            time: '09:00',
            className: 'Morning Warriors',
            beltLevels: 'All Levels',
            instructor: 'Master Lee',
            createdAt: new Date().toISOString()
        },
        {
            id: Date.now() + 602,
            day: 'Saturday',
            time: '11:00',
            className: 'Advanced Techniques',
            beltLevels: 'Black Belts',
            instructor: 'Master Park',
            createdAt: new Date().toISOString()
        },
        {
            id: Date.now() + 603,
            day: 'Saturday',
            time: '14:00',
            className: 'Open Sparring',
            beltLevels: 'Blue Belt & Above',
            instructor: 'Master Kim',
            createdAt: new Date().toISOString()
        },
        // Sunday
        {
            id: Date.now() + 701,
            day: 'Sunday',
            time: '10:00',
            className: 'Meditation & Flexibility',
            beltLevels: 'All Levels',
            instructor: 'Coach Martinez',
            createdAt: new Date().toISOString()
        }
    ];
    
    localStorage.setItem('weeklySchedule', JSON.stringify(weeklySchedule));
    
    // Mark seed data as generated
    localStorage.setItem('seedDataGenerated', 'true');
    
    console.log('✅ Seed data generated successfully!');
    console.log(`- ${activities.length} activities created`);
    console.log(`- ${todayClasses.length} today's classes created`);
    console.log(`- ${weeklySchedule.length} weekly schedule entries created`);
}

// Auto-generate seed data on first load
if (typeof window !== 'undefined') {
    // Run after a short delay to ensure localStorage is ready
    setTimeout(generateSeedData, 100);
}