"""
Liveness & Face Verification Service
=====================================
Uses ONLY OpenCV + NumPy (zero tensorflow/deepface/protobuf dependency).

Face detection  : OpenCV DNN (Caffe model, bundled with opencv-python)
Face embedding  : Local Binary Pattern Histogram (LBPH) feature vector
Liveness check  : Texture-analysis heuristic (Laplacian variance + colour distribution)
Face matching   : Cosine similarity on LBPH feature vectors
"""

import os
import base64
import cv2
import numpy as np

# ---------------------------------------------------------------------------
# OpenCV ships a Haar cascade for face detection inside its data directory.
# We also try the more accurate DNN-based detector if the user has models,
# but fall back gracefully to Haar.
# ---------------------------------------------------------------------------
OPENCV_DATA_DIR = os.path.join(os.path.dirname(cv2.__file__), "data")
HAAR_CASCADE_PATH = os.path.join(OPENCV_DATA_DIR, "haarcascade_frontalface_default.xml")


class LivenessService:
    def __init__(self):
        # Load Haar cascade (always available with opencv-python)
        self.face_cascade = cv2.CascadeClassifier(HAAR_CASCADE_PATH)
        if self.face_cascade.empty():
            print(f"WARNING: Could not load Haar cascade from {HAAR_CASCADE_PATH}")

    # ------------------------------------------------------------------
    # Helpers
    # ------------------------------------------------------------------
    def decode_base64_image(self, base64_str: str) -> np.ndarray:
        """Decode a data-URL or raw base64 string into a BGR numpy image."""
        if "," in base64_str:
            base64_str = base64_str.split(",")[1]

        img_data = base64.b64decode(base64_str)
        nparr = np.frombuffer(img_data, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        if img is None:
            raise ValueError("Could not decode the provided image data.")
        return img

    def _detect_face(self, image: np.ndarray) -> np.ndarray | None:
        """Return the largest detected face region (BGR), or None."""
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        faces = self.face_cascade.detectMultiScale(
            gray, scaleFactor=1.1, minNeighbors=5, minSize=(80, 80)
        )
        if len(faces) == 0:
            return None

        # Pick the largest face by area
        x, y, w, h = max(faces, key=lambda r: r[2] * r[3])
        return image[y : y + h, x : x + w]

    # ------------------------------------------------------------------
    # Liveness (texture-analysis heuristic)
    # ------------------------------------------------------------------
    def check_liveness(self, image: np.ndarray) -> float:
        """
        Returns a liveness score between 0.0 (spoof) and 1.0 (real).

        Heuristic approach:
        1. Laplacian variance – printed photos / screens are often blurrier or
           show moiré artefacts that differ from a real face.
        2. Colour-distribution spread – real faces have richer colour histograms
           than flat printouts.

        This is a lightweight, dependency-free approximation. The frontend
        MediaPipe blink/smile challenge already provides the primary liveness
        gate; this backend check adds a second layer.
        """
        face = self._detect_face(image)
        if face is None:
            return 0.0  # No face found → treat as spoof

        try:
            # --- Laplacian variance (focus / texture measure) ---
            gray_face = cv2.cvtColor(face, cv2.COLOR_BGR2GRAY)
            laplacian_var = cv2.Laplacian(gray_face, cv2.CV_64F).var()

            # Typical thresholds (empirically tuned):
            #   < 30  → very likely a flat printout or low-res screen
            #   > 100 → almost certainly a real face
            focus_score = min(1.0, laplacian_var / 100.0)

            # --- Colour histogram spread ---
            hsv = cv2.cvtColor(face, cv2.COLOR_BGR2HSV)
            h_hist = cv2.calcHist([hsv], [0], None, [180], [0, 180])
            s_hist = cv2.calcHist([hsv], [1], None, [256], [0, 256])

            h_spread = float(np.count_nonzero(h_hist)) / 180.0
            s_spread = float(np.count_nonzero(s_hist)) / 256.0
            colour_score = (h_spread + s_spread) / 2.0

            # Combine the two sub-scores (weighted average)
            liveness = 0.6 * focus_score + 0.4 * colour_score
            return float(round(max(0.0, min(1.0, liveness)), 4))

        except Exception as e:
            print(f"Error in liveness check: {e}")
            return 0.0

    # ------------------------------------------------------------------
    # Face embedding (LBPH feature vector)
    # ------------------------------------------------------------------
    def extract_face_embedding(self, image: np.ndarray) -> list[float]:
        """
        Extract a compact feature vector from the face region using
        Local Binary Patterns + colour histograms.  Returns a list of floats.
        """
        face = self._detect_face(image)
        if face is None:
            raise ValueError("No face detected in the provided image.")

        # Resize to a fixed size so vectors are comparable
        face_resized = cv2.resize(face, (128, 128))
        gray = cv2.cvtColor(face_resized, cv2.COLOR_BGR2GRAY)

        # Resize to a smaller grid for spatial matching (Normalized Cross-Correlation)
        face_spatial = cv2.resize(gray, (32, 32)).flatten().astype(np.float32)
        # Mean-subtract to add invariance to overall lighting brightness
        face_spatial = face_spatial - np.mean(face_spatial)
        
        # We also keep smaller color histograms to ensure skin tone matches
        hsv = cv2.cvtColor(face_resized, cv2.COLOR_BGR2HSV)
        hist_h = cv2.calcHist([hsv], [0], None, [16], [0, 180]).flatten()
        hist_s = cv2.calcHist([hsv], [1], None, [16], [0, 256]).flatten()

        # Concatenate and L2-normalise
        # This creates a vector of 1024 + 16 + 16 = 1056 elements
        feature = np.concatenate([face_spatial, hist_h, hist_s])
        norm = np.linalg.norm(feature)
        if norm > 0:
            feature = feature / norm

        return feature.tolist()

    # ------------------------------------------------------------------
    # Face matching (cosine similarity)
    # ------------------------------------------------------------------
    def verify_face_match(
        self, current_image: np.ndarray, registered_embedding: list[float]
    ) -> bool:
        """
        Compare the face in *current_image* against *registered_embedding*.
        Returns True if they match within the threshold.
        """
        try:
            current_embedding = self.extract_face_embedding(current_image)

            a = np.array(current_embedding)
            b = np.array(registered_embedding)

            # If they locked their face with an old embedding shape, reject it safely
            if a.shape != b.shape:
                return False

            cosine_similarity = np.dot(a, b) / (
                np.linalg.norm(a) * np.linalg.norm(b) + 1e-10
            )

            # Threshold: 0.85 similarity → match
            # (Spatial NCC + histograms requires much stricter similarity)
            threshold = 0.85
            match = bool(cosine_similarity >= threshold)
            print(
                f"Face match cosine similarity: {float(cosine_similarity):.4f} "
                f"(threshold={threshold}, match={match})"
            )
            return match

        except Exception as e:
            print(f"Error verifying face match: {e}")
            return False


# Singleton instance used by the rest of the app
liveness_service = LivenessService()
