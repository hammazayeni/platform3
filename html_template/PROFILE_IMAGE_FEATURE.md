# Profile Image Upload and Display Feature

## Overview
This document describes the profile image upload and display functionality implemented for the Taekwondo Academy platform. Students and parents can now have profile images that are uploaded by administrators and displayed across the platform.

## Features Implemented

### 1. Admin Profile Image Upload (Student Management)
**Location:** `student-management.html`

**Features:**
- ✅ Admin can upload profile photos when adding new students
- ✅ Admin can upload/change profile photos when editing existing students
- ✅ Profile photos are displayed in the student list table
- ✅ Supports PNG, JPG, JPEG formats
- ✅ Images are stored as base64 in localStorage under `students` array
- ✅ Profile photos sync with login credentials

**How to Use:**
1. Navigate to Student Management page (admin only)
2. Click "Add New Student" or "Edit" on existing student
3. Click "Upload Profile Photo" button in the modal
4. Select an image file (PNG/JPG)
5. Complete the form and save
6. The profile photo will be stored and synced with the student's account

### 2. Admin Profile Image Upload (Parent Management)
**Location:** `parent-management.html`

**Features:**
- ✅ Admin can upload profile photos when adding new parents
- ✅ Admin can upload/change profile photos when editing existing parents
- ✅ Profile photos are displayed in the parent cards
- ✅ Supports PNG, JPG, JPEG formats
- ✅ Images are stored as base64 in localStorage under `parents` array
- ✅ Profile photos sync with login credentials

**How to Use:**
1. Navigate to Parent Management page (admin only)
2. Click "Add New Parent" or "Edit" on existing parent
3. Click "Upload Profile Photo" button in the modal
4. Select an image file (PNG/JPG)
5. Complete the form and save
6. The profile photo will be stored and synced with the parent's account

### 3. Login Page Profile Preview
**Location:** `index.html`

**Features:**
- ✅ Two-step login process
- ✅ Step 1: Select role and enter username/email
- ✅ Step 2: Shows profile preview with uploaded photo (if available)
- ✅ Displays user's profile image before password entry
- ✅ Falls back to emoji if no photo is uploaded

**User Experience:**
1. User selects their role (Admin/Student/Parent)
2. User enters username or email
3. System displays profile preview with photo
4. User enters password and logs in

### 4. Student Dashboard Profile Display
**Location:** `student-dashboard.html`

**Features:**
- ✅ Profile image displayed in the profile card section
- ✅ Auto-syncs with admin-uploaded photos
- ✅ Refreshes every 5 seconds to catch admin updates
- ✅ Shows default emoji if no photo is available
- ✅ Profile information includes name, belt rank, class, and join date

**Files Involved:**
- `student-dashboard.html` - Main dashboard HTML
- `student-dashboard-profile.js` - Profile loading logic
- `profile-sync.js` - Cross-page synchronization

### 5. Parent Dashboard Profile Display
**Location:** `parent-dashboard.html`

**Features:**
- ✅ Profile image displayed in the profile card section
- ✅ Auto-syncs with admin-uploaded photos
- ✅ Refreshes every 5 seconds to catch admin updates
- ✅ Shows default emoji if no photo is available
- ✅ Displays children's profile photos in the children list
- ✅ Profile information includes name, member since date, and linked children

**Files Involved:**
- `parent-dashboard.html` - Main dashboard HTML
- `parent-dashboard-profile.js` - Profile loading logic
- `profile-sync.js` - Cross-page synchronization

### 6. Profile Synchronization System
**Location:** `profile-sync.js`

**Features:**
- ✅ Centralized profile image retrieval function
- ✅ Handles admin, student, and parent profiles differently
- ✅ Syncs profile images across all pages
- ✅ Auto-updates when admin changes photos
- ✅ Updates currentUser session with latest photo

**Key Functions:**
- `getUserProfileImage(user)` - Gets profile image from appropriate storage
- `updateProfileImageDisplay(user, avatarElementId)` - Updates avatar elements
- `syncProfileImageToCurrentUser()` - Syncs profile to current session

## Data Storage Structure

### Students
```javascript
{
  id: "unique_id",
  name: "Student Name",
  username: "student_username",
  email: "student@example.com",
  password: "hashed_password",
  beltRank: "White",
  class: "Beginner",
  profilePhoto: "data:image/png;base64,..." // Base64 encoded image
  // ... other fields
}
```

### Parents
```javascript
{
  id: "unique_id",
  name: "Parent Name",
  username: "parent_username",
  email: "parent@example.com",
  password: "hashed_password",
  children: ["student_id_1", "student_id_2"],
  profilePhoto: "data:image/png;base64,..." // Base64 encoded image
  // ... other fields
}
```

### Current User Session
```javascript
{
  id: "user_id",
  name: "User Name",
  username: "username",
  email: "email@example.com",
  role: "student" | "parent" | "admin",
  image: "data:image/png;base64,..." // Synced from profilePhoto
  // ... other fields
}
```

## Technical Implementation

### Image Upload Process
1. Admin clicks "Upload Profile Photo" button
2. File input dialog opens (accepts PNG, JPG, JPEG)
3. FileReader converts image to base64 data URL
4. Base64 string is stored in `profilePhoto` field
5. Image preview updates immediately in modal
6. On form submit, data is saved to localStorage
7. Profile syncs with approvedUsers for login access

### Image Display Process
1. Page loads and checks currentUser
2. Retrieves user data from appropriate storage (students/parents)
3. Finds matching record by id, username, or email
4. Extracts profilePhoto field
5. Creates img element with base64 src
6. Updates avatar element with image
7. Auto-refreshes every 5 seconds

### Cross-Page Synchronization
1. `profile-sync.js` loads on all dashboard pages
2. Monitors for profile changes in localStorage
3. Updates currentUser session when changes detected
4. Refreshes avatar displays automatically
5. Ensures consistency across all pages

## Browser Compatibility
- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## File Size Considerations
- Images are stored as base64 in localStorage
- Recommended max image size: 500KB
- localStorage limit: ~5-10MB per domain
- Large images may impact performance
- Consider image compression for production

## Future Enhancements
- [ ] Image compression before storage
- [ ] Cloud storage integration (AWS S3, Cloudinary)
- [ ] Image cropping tool in upload modal
- [ ] Multiple image formats support (WebP)
- [ ] Profile image gallery
- [ ] Image optimization for mobile devices

## Troubleshooting

### Profile Image Not Showing
1. Check if profilePhoto field exists in localStorage
2. Verify base64 string is valid
3. Check browser console for errors
4. Clear localStorage and re-upload image
5. Ensure image file is valid PNG/JPG

### Image Not Syncing Across Pages
1. Check if profile-sync.js is loaded
2. Verify currentUser session is updated
3. Check if user ID matches across records
4. Clear browser cache and reload
5. Check localStorage for data consistency

### Upload Button Not Working
1. Verify file input element exists
2. Check if FileReader is supported
3. Ensure event listeners are attached
4. Check browser console for JavaScript errors
5. Verify file type is PNG/JPG/JPEG

## Support
For issues or questions, please contact the development team or refer to the main platform documentation.

---

**Last Updated:** 2024
**Version:** 1.0
**Author:** Platform Development Team