import { Routes, Route } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import Home from "../pages/Home/Home";
import Login from "../pages/Auth/Login";
import Register from "../pages/Auth/Register";
import AllCourses from "../pages/Courses/AllCourses";
import CourseDetails from "../pages/Courses/CourseDetails";
import AddCourse from "../pages/Courses/AddCourse";
import MyCourses from "../pages/Courses/MyCourses";
import UpdateCourse from "../pages/Courses/UpdateCourse";
import MyEnrolledCourses from "../pages/Courses/MyEnrolledCourses";
import Dashboard from "../pages/Dashboard/Dashboard";
import NotFound from "../pages/Error/NotFound";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import PrivateRoute from "../components/layout/PrivateRoute";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import TestCourses from "../pages/TestCourses";
import EnrolledCourses from "../pages/EnrolledCourses";

const AppRoutes = () => {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-100">
        <LoadingSpinner size="lg" />
        <span className="ml-3 text-lg">Loading...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-base-100">
      <Header />
      <main className="flex-grow">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/courses" element={<AllCourses />} />
          {/* <Route path="/course/:id" element={<CourseDetails />} /> */}
          <Route path="/test-courses" element={<TestCourses />} />

          {/* Private Routes */}
          <Route
            path="/courses"
            element={
              <PrivateRoute>
                <AllCourses />
              </PrivateRoute>
            }
          />
          <Route
            path="/my-enroll-courses"
            element={
              <PrivateRoute>
                <EnrolledCourses />
              </PrivateRoute>
            }
          />
          <Route
            path="/courses-details/:id"
            element={
              <PrivateRoute>
                <CourseDetails />
              </PrivateRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/add-course"
            element={
              <PrivateRoute>
                <AddCourse />
              </PrivateRoute>
            }
          />
          <Route
            path="/my-courses"
            element={
              <PrivateRoute>
                <MyCourses />
              </PrivateRoute>
            }
          />
          <Route
            path="/update-course/:id"
            element={
              <PrivateRoute>
                <UpdateCourse />
              </PrivateRoute>
            }
          />
          <Route
            path="/my-enrolled-courses"
            element={
              <PrivateRoute>
                <MyEnrolledCourses />
              </PrivateRoute>
            }
          />

          {/* 404 Page */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
};

export default AppRoutes;
