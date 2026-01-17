# ATS Resume Checker - Design Guidelines

## Brand Identity

**Purpose**: Empower job seekers to confidently navigate ATS systems and land interviews.

**Aesthetic Direction**: Professional/encouraging - Clean, trustworthy interface with optimistic color accents that reduce job-search anxiety. The design should feel like a supportive career coach, not a cold automated tool.

**Memorable Element**: Visual score indicators with satisfying animations. Resume scores display as circular progress rings that fill smoothly, paired with encouraging micro-copy ("You're almost there!" or "Excellent work!").

## Navigation Architecture

**Root Navigation**: Tab Bar (4 tabs)
- **Home** - Dashboard with recent scans and quick actions
- **Scan** - Upload and analyze resume (center position, primary action)
- **History** - Past resume scans and reports
- **Profile** - Account, subscription, settings

**Auth Required**: Yes (subscription system, saved resumes, sync)
- Apple Sign-In (iOS required) + Google Sign-In
- Profile includes: avatar, display name, subscription tier, logout

## Screen-by-Screen Specifications

### 1. Home Screen (Dashboard)
- **Header**: Transparent, greeting text "Hi [Name]" (left), notification icon (right)
- **Layout**: Scrollable with sections:
  - Hero card: "Upload New Resume" CTA with illustration
  - Stats row: Total scans, Average score, Improvements made
  - Recent scans list (3 items max, "View All" link)
  - Quick actions: "Match with JD", "Generate Cover Letter"
- **Insets**: Top: headerHeight + Spacing.xl, Bottom: tabBarHeight + Spacing.xl

### 2. Scan Screen (Core Action)
- **Header**: Title "Resume Scan", transparent
- **Layout**: Scrollable form
  - Upload area: Large dashed-border dropzone with upload icon
  - Accepted formats pill: "PDF or DOCX"
  - After upload: File preview card with name, size, remove button
  - "Analyze Resume" button (full-width, bottom)
- **Empty State**: Upload illustration (upload-resume.png)
- **Insets**: Top: headerHeight + Spacing.xl, Bottom: tabBarHeight + Spacing.xl

### 3. Resume Report Screen (Modal after scan)
- **Header**: "Resume Analysis", close button (right)
- **Layout**: Scrollable sections:
  - Score circle (large, animated on mount)
  - Sections breakdown: Skills (✓/✗), Experience (✓/✗), Keywords (✓/✗), Formatting (✓/✗)
  - "Missing Items" expandable list
  - "Match with Job Description" button
  - "Improve Resume" button (premium badge if locked)
- **Insets**: Top: headerHeight + Spacing.xl, Bottom: insets.bottom + Spacing.xl

### 4. Job Description Match Screen
- **Header**: "JD Match", back button (left)
- **Layout**: Scrollable form
  - Text area: "Paste Job Description"
  - "Analyze Match" button
  - Results: Match percentage ring, missing skills list, keyword gaps
- **Insets**: Top: headerHeight + Spacing.xl, Bottom: tabBarHeight + Spacing.xl

### 5. Resume Improvement Screen
- **Header**: "Improve Resume", back button (left)
- **Layout**: Scrollable
  - Original vs Improved side-by-side cards (swipeable)
  - "Generate Improved Resume" button
  - Preview modal with download option
- **Premium Gate**: Show upgrade modal if free user
- **Insets**: Top: headerHeight + Spacing.xl, Bottom: tabBarHeight + Spacing.xl

### 6. Interview Questions Screen
- **Header**: "Interview Prep", back button (left)
- **Layout**: Scrollable list with categories:
  - HR Questions (expandable)
  - Technical Questions (expandable)
  - Situational Questions (expandable)
- **Empty State**: Generate illustration (empty-questions.png)
- **Insets**: Top: headerHeight + Spacing.xl, Bottom: tabBarHeight + Spacing.xl

### 7. Cover Letter Generator Screen
- **Header**: "Cover Letter", back button (left)
- **Layout**: Scrollable
  - "Generate Cover Letter" button
  - Preview text area (generated letter)
  - Copy and Download buttons
- **Premium Gate**: Lock for free users
- **Insets**: Top: headerHeight + Spacing.xl, Bottom: tabBarHeight + Spacing.xl

### 8. History Screen
- **Header**: Title "History", transparent, filter icon (right)
- **Layout**: List of past scans with: Resume name, Date, Score badge
- **Empty State**: Illustration (empty-history.png) with "No scans yet" message
- **Insets**: Top: headerHeight + Spacing.xl, Bottom: tabBarHeight + Spacing.xl

### 9. Profile Screen
- **Header**: Transparent
- **Layout**: Scrollable sections:
  - Avatar + name + subscription badge
  - Subscription card: Current plan, "Upgrade to Premium" button
  - Settings: Notifications, Theme (light/dark)
  - Account: Logout, Delete account (nested)
- **Insets**: Top: insets.top + Spacing.xl, Bottom: tabBarHeight + Spacing.xl

### 10. Premium Upgrade Screen (Modal)
- **Header**: "Upgrade to Premium", close button (right)
- **Layout**: Scrollable
  - Feature comparison table
  - Pricing cards (monthly, yearly)
  - "Subscribe" button
- **Insets**: Top: headerHeight + Spacing.xl, Bottom: insets.bottom + Spacing.xl

## Color Palette

- **Primary**: #2563EB (Trustworthy blue, professional)
- **Accent**: #10B981 (Success green for scores/positive feedback)
- **Warning**: #F59E0B (For missing items/low scores)
- **Background**: #F9FAFB (Light mode), #111827 (Dark mode)
- **Surface**: #FFFFFF (Light), #1F2937 (Dark)
- **Text Primary**: #111827 (Light), #F9FAFB (Dark)
- **Text Secondary**: #6B7280
- **Border**: #E5E7EB

## Typography

- **Font**: System default (SF Pro for iOS, Roboto for Android) for maximum legibility
- **Scale**:
  - Hero: 32pt, Bold
  - H1: 24pt, Bold
  - H2: 20pt, Semibold
  - Body: 16pt, Regular
  - Caption: 14pt, Regular
  - Label: 12pt, Medium

## Visual Design

- Icons: Feather icons from @expo/vector-icons
- Score circles: Animated stroke progress with gradient fill
- Buttons: Rounded (12px), solid primary color with white text
- Cards: Rounded (16px), subtle shadow for elevation
- Premium badges: Small gold icon next to locked features
- Floating buttons (if used): shadowOffset {width: 0, height: 2}, shadowOpacity: 0.10, shadowRadius: 2
- All touchables: Opacity feedback (0.7) on press

## Assets to Generate

1. **icon.png** - App icon with document/checkmark symbol - Used: Device home screen
2. **splash-icon.png** - Simplified logo for launch - Used: App startup
3. **upload-resume.png** - Friendly illustration of document upload - Used: Scan screen empty state
4. **empty-history.png** - Folder with magnifying glass - Used: History screen when no scans
5. **empty-questions.png** - Lightbulb with question mark - Used: Interview prep screen before generation
6. **profile-avatar.png** - Default user avatar (professional silhouette) - Used: Profile screen
7. **success-checkmark.png** - Celebratory checkmark - Used: After successful resume improvement

All illustrations should use the primary blue color with subtle green accents, simple line-art style, approachable and supportive tone.