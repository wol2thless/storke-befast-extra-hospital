import { Routes, Route } from "react-router";
import RequireAuth from "./RequireAuth";
import RequireAdminAuth from "./RequireAdminAuth";
import HomePage from "@/pages/user/HomePage";
import Login from "@/pages/auth/Login";
import Callback from "@/pages/auth/Callback";
import Logout from "@/pages/auth/Logout";
import HealthBehavior from "@/pages/user/HealthBehavior";
import PersonInfoPage from "../pages/user/PersonInfoPage";
import HealthRecord from "../pages/user/HealthRecord";
import VideoLibrary from "../pages/user/VideoLibrary";
import VideoLibraryDetail from "../pages/user/VideoLibraryDetail";
import SatisfactionSurvey from "../pages/user/SatisfactionSurvey";
import MainLayout from "../layouts/MainLayout";
import AdminLayout from "../layouts/AdminLayout";
import VideoStatsDetailPage from "../pages/user/VideoStatsDetailPage";
import ExerciseRecordDetail from "../pages/user/ExerciseRecordDetail";
import NutritionRecordDetail from "../pages/user/NutritionRecordDetail";
import MedicationRecordDetail from "../pages/user/MedicationRecordDetail";
import HealthBehaviorDetail from "../pages/user/HealthBehaviorDetail";
import SatisfactionSurveyDetail from "../pages/user/SatisfactionSurveyDetail";
import BEFASTHistory from "../components/BEFASTHistory";
import ADLAssessmentHistory from "../pages/user/ADLAssessmentHistory";
import AppointmentHistory from "../pages/user/AppointmentHistory";
import TestAppointmentAPI from "../pages/user/TestAppointmentAPI";
import AdminLogin from "../pages/admin/AdminLogin";
import AdminDashboard from "../pages/admin/AdminDashboard";
import PatientDetail from "../pages/admin/PatientDetail";
import PatientVideoStats from "../pages/admin/PatientVideoStats";
import AdminOverview from "../pages/admin/AdminOverview";
import AdminCreateUser from "../pages/admin/AdminCreateUser";
import AdminUserManagement from "../pages/admin/AdminUserManagement";

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/core" element={<Callback />} />
      <Route path="/logout" element={<Logout />} />

      {/* Admin Routes */}
      <Route path="/admin/login" element={<AdminLogin />} />
      
      <Route element={<RequireAdminAuth />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminOverview />} />
          <Route path="overview" element={<AdminOverview />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="create-user" element={<AdminCreateUser />} />
          <Route path="users" element={<AdminUserManagement />} />
          <Route path="patient/:nationalId" element={<PatientDetail />} />
          <Route path="patient/:nationalId/video-stats" element={<PatientVideoStats />} />
          <Route path="patient/:nationalId/exercise-records" element={<ExerciseRecordDetail />} />
          <Route path="patient/:nationalId/nutrition-records" element={<NutritionRecordDetail />} />
          <Route path="patient/:nationalId/medication-records" element={<MedicationRecordDetail />} />
          <Route path="patient/:nationalId/health-behavior" element={<HealthBehaviorDetail />} />
          <Route path="patient/:nationalId/satisfaction-survey" element={<SatisfactionSurveyDetail />} />
          <Route path="patient/:nationalId/befast-history" element={<BEFASTHistory />} />
          <Route path="patient/:nationalId/adl-assessment" element={<ADLAssessmentHistory />} />
          <Route path="patient/:nationalId/appointment-history" element={<AppointmentHistory />} />
        </Route>
      </Route>

      {/* User Routes */}
      <Route element={<RequireAuth />}>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<HomePage />} />
          <Route path="health-behavior" element={<HealthBehavior />} />
          <Route path="health-behavior-detail" element={<HealthBehaviorDetail />} />
          <Route path="satisfaction-survey-detail" element={<SatisfactionSurveyDetail />} />
          <Route path="health-record" element={<HealthRecord />} />
          <Route path="befast-history" element={<BEFASTHistory />} />
          <Route
            path="adl-assessment-history"
            element={<ADLAssessmentHistory />}
          />
          <Route path="appointment-history" element={<AppointmentHistory />} />
          <Route path="test-appointment-api" element={<TestAppointmentAPI />} />
          <Route
            path="exercise-records/detail"
            element={<ExerciseRecordDetail />}
          />
          <Route
            path="nutrition-records/detail"
            element={<NutritionRecordDetail />}
          />
          <Route
            path="medication-records/detail"
            element={<MedicationRecordDetail />}
          />
          <Route path="video-library" element={<VideoLibrary />} />
          <Route path="video-library-detail" element={<VideoLibraryDetail />} />
          <Route path="video-stats-detail" element={<VideoStatsDetailPage />} />
          <Route path="satisfaction-survey" element={<SatisfactionSurvey />} />
          <Route path="person-info" element={<PersonInfoPage />} />
        </Route>
      </Route>
      
      <Route path="*" element={<h1>404</h1>} />
    </Routes>
  );
};
export default AppRoutes;
