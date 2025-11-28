# Bug Fixes and Enhancements TODO

## Issues to Fix:

### 1. Student Login Redirect Issue
- **Problem**: Student login redirects to parent dashboard (student-dashboard.html has parent dashboard content)
- **Solution**: Create proper student dashboard with student-specific content
- **Files**: student-dashboard.html

### 2. Admin Delete Student Functionality
- **Problem**: Need to ensure admin can properly delete student accounts from student management
- **Solution**: Already implemented in student-management.html, verify it works correctly
- **Files**: student-management.html (lines 411-463)

### 3. General Enhancements
- Improve error handling
- Add confirmation messages
- Ensure data consistency across all pages
- Fix any UI/UX issues

## Implementation Plan:

1. ✅ Review current code structure
2. 🔄 Fix student-dashboard.html (currently shows parent content)
3. ✅ Verify admin delete functionality in student-management.html
4. ✅ Test login redirects
5. ✅ Add any missing enhancements

## Files to Modify:
- student-dashboard.html (CRITICAL - wrong content)
- Verify: student-management.html, index.html, script.js