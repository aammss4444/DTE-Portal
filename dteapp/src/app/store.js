import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import uiReducer from '../features/ui/uiSlice';
import userReducer from '../features/user/userSlice';
import institutionReducer from '../features/admin/institutionSlice';
import courseReducer from '../features/admin/courseSlice';
import normReducer from '../features/admin/normSlice';
import intakeReducer from '../features/admin/intakeSlice';
import requirementReducer from '../features/admin/requirementSlice';
import facultyReducer from '../features/principal/facultySlice';
import vacancyReducer from '../features/admin/vacancySlice';
import adReducer from '../features/admin/advertisementSlice';
import candidateReducer from '../features/candidate/candidateSlice';
import selectionReducer from '../features/principal/selectionSlice';
import attendanceReducer from '../features/faculty/attendanceSlice';
import billingReducer from '../features/admin/billingSlice';
import applicationReducer from '../features/candidate/applicationSlice';
import reportReducer from '../features/admin/reportSlice';
import principalReducer from '../features/principal/principalSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    ui: uiReducer,
    user: userReducer,
    institutions: institutionReducer,
    courses: courseReducer,
    norms: normReducer,
    intakes: intakeReducer,
    requirements: requirementReducer,
    faculty: facultyReducer,
    vacancy: vacancyReducer,
    ads: adReducer,
    candidate: candidateReducer,
    selection: selectionReducer,
    attendance: attendanceReducer,
    billing: billingReducer,
    application: applicationReducer,
    reports: reportReducer,
    principal: principalReducer,
  },
});


export default store;
