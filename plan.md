# OcuGuide Improvement Plan

This document outlines the planned improvements for the OcuGuide application based on user feedback and requirements.

## Patient Information Area

### Improvements:
- Change birthdate input method on pad
  - Modify `PatientForm.jsx` to update the birthdate input component
  - 캘린더 선택 기능은 유지하고 직접 날짜를 숫자로 입력할 수 있게 추가
  - Ensure the age calculation functionality is maintained
- Remove duplicate opinion sections
  - Remove the "Registered Opinion" section that appears at the bottom of the patient information
  - Keep only the "Registered Primary Opinion" section

## Surgery Information Area

### Improvements:
1. Audio Playback and Navigation Enhancements
   - Move listen button to the top of each step
   - Implement karaoke-style functionality
     - Add synchronization between audio playback and text highlighting
     - Text should highlight in real-time as audio plays at x1 speed
   - Improve UI for right arrow activation after listening
     - Make the activation state more visually apparent
     - Add appropriate styling to indicate when the user can proceed

2. Content Organization
   - Divide lengthy content pages into multiple stages:
     - Split "Intraocular Lens Decision" into shorter pages
     - Split "Complications and Side Effects of Cataract Surgery" into multiple pages
     - Ensure each page has a manageable amount of content

3. Post-Surgery Information Restructuring
   - Remove Stage 6 "Post-Surgery Precautions and Schedule" from main flow
   - Create new left tab item specifically for "Post-Surgery Precautions and Schedule"
   - Move AI-generated opinion from patient information tab to this new section
   - Update the one week after surgery item to state "determined after consultation with attending physician"

4. Navigation Improvements
   - Reduce total stages from 6 to 5 after removing the post-surgery precautions section
   - Remove "Return to Start" button after completing stages
   - Enable navigation back to previous stages by making stage titles clickable

## Chatbot Consultation Area

### Improvements:
- UI/UX Enhancement
  - Remove text input field from chatbot window
  - Replace with voice question button in the same location
  - Ensure smooth transition between voice input and response display

## Data Management

### Improvements:
- Add initialization functionality
  - Create a dedicated button for doctors to reset/initialize patient data
  - Implement appropriate confirmation dialog to prevent accidental data loss

## Implementation Strategy

1. Begin with structural changes (removing/adding sections)
2. Implement UI improvements and navigation changes
3. Develop audio synchronization (karaoke) functionality
4. Add voice input replacement in chatbot
5. Implement data initialization functionality
6. Conduct thorough testing of all changes

## Component Modifications

### Files to modify:
- `src/components/PatientInfo/PatientForm.jsx`
- `src/components/PatientInfo/PatientSummary.jsx`
- `src/pages/SurgeryInfoPage.jsx`
- `src/components/SurgeryInfo/InfoStep.jsx`
- `src/components/SurgeryInfo/CalendarSchedule.jsx`
- `src/pages/ChatbotPage.jsx`
- `src/components/Chatbot/ChatInterface.jsx`
- `src/components/Chatbot/AudioRecorder.jsx`

### New components to create:
- `src/components/PostSurgeryInfo/PostSurgeryPage.jsx`
- `src/components/common/DataInitializer.jsx`