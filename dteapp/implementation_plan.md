# Core Liveness Engine Integration

Implement an open-source Core Liveness Engine to verify the realness of faculty members when logging lectures. 
This involves a two-part system:
1. **Frontend (Mobile App/Kiosk UI)**: Uses Google MediaPipe Face Mesh (in-browser) to run locally, computing the Eye Aspect Ratio (EAR) for blink detection and Mouth Aspect Ratio (MAR) for smile detection (active liveness).
2. **Backend (Anti-Spoofing)**: Uses the `Silent-Face-Anti-Spoofing` PyTorch repository to detect lookalike photos, phone screens, and printed paper cuts (passive liveness). 
The faculty portal will have an option to scan and lock face credentials initially, and require a face scan for self-attendance every time a lecture is logged.

## User Review Required
> [!IMPORTANT]
> The backend relies on a PyTorch repository (`Silent-Face-Anti-Spoofing`) and pre-trained weights. We will need to clone the repository, install Python computer vision dependencies (`torch`, `torchvision`, `opencv-python`), and integrate them. Setting up this AI infrastructure will add a few hundred megabytes of dependencies.

> [!WARNING]
> Since we need a face embedding to "lock face credentials" and match faces later, we will also need a lightweight face recognition library (like `face_recognition` or `insightface`) on the backend to match the verified face against the registered face.

## Open Questions
> [!CAUTION]
> 1. Do you already have the `Silent-Face-Anti-Spoofing` repository cloned and weights downloaded locally, or should I write a script to automatically download them?
> 2. For Face Matching (verifying the identity after liveness passes), is it acceptable to use the standard Python `face_recognition` package (dlib-based)?

## Proposed Changes

### Backend Database Models
#### [MODIFY] `app/models/faculty_credentials.py`
- Add `face_embedding` column (String or JSON) to store the registered face vector.
- Add `face_registered` column (Boolean) to track if the faculty has locked their credentials.

#### [MODIFY] `app/models/lecture_log.py`
- Add `liveness_score` (Float) to store the backend's anti-spoofing score.
- Add `face_verified` (Boolean) to strictly enforce that the logged lecture was self-attended.

### Backend Attendance APIs
#### [NEW] `app/modules/attendance/liveness_service.py`
- Create a service to load the PyTorch `Silent-Face-Anti-Spoofing` models.
- Provide a function to accept a base64 image or multipart file, run the anti-spoof inference, and return a realness score.

#### [MODIFY] `app/modules/attendance/router.py` & `controller.py`
- Add an endpoint `POST /api/attendance/face-register` to receive the initial face, verify liveness, extract embedding, and lock it to the faculty credential.
- Modify the endpoint for logging lectures to accept the selfie, run liveness, run face matching against the registered embedding, and only then log the lecture.

### Frontend Faculty Portal
#### [NEW] `dteapp/src/features/faculty/FaceScanner.jsx`
- Create a UI component that uses `@mediapipe/face_mesh` and `@mediapipe/camera_utils`.
- Draw the face mesh on a `<canvas>` overlaid on the webcam video stream.
- Calculate EAR and MAR in real-time, prompting the user to "Blink" or "Smile" to pass active liveness.
- Once active liveness passes, capture a high-quality frame and send it to the backend.

#### [MODIFY] `dteapp/src/features/faculty/FacultyDashboard.jsx`
- Add a "Lock Face Credentials" card/button if `face_registered` is false.

#### [MODIFY] `dteapp/src/features/faculty/WorkLogs.jsx`
- Integrate the `FaceScanner` component before the submit action is enabled.

## Verification Plan
### Automated Tests
- Run backend unit tests for the anti-spoofing logic using sample real and spoof images.
### Manual Verification
- Register a face in the Faculty Portal using the webcam. Verify MediaPipe detects blinks and smiles.
- Attempt to log a lecture using a phone screen displaying a face. Verify the PyTorch backend rejects it.
- Log a lecture with a real face. Verify the lecture is logged with `face_verified = true`.
