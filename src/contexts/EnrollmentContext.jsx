import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useCallback,
} from "react";
import { useAuth } from "./AuthContext";
import { enrollmentAPI } from "../services/api";

const EnrollmentContext = createContext();

export const useEnrollment = () => {
  const context = useContext(EnrollmentContext);
  if (!context) {
    throw new Error("useEnrollment must be used within an EnrollmentProvider");
  }
  return context;
};

export const EnrollmentProvider = ({ children }) => {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  const fetchUserEnrollments = useCallback(async () => {
    if (!user) {
      setEnrollments([]);
      setError(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const userId = user.uid || user.id;

      if (!userId) {
      }

      const response = await enrollmentAPI.getUserEnrollments(userId);

      if (response.success) {
        setEnrollments(response.enrollments || []);

        if (response.source === "mock") {
          setError("Backend temporarily unavailable - using demo data");
        } else {
          setError(null);
        }
      } else {
        throw new Error(response.message || "Failed to fetch enrollments");
      }
    } catch (err) {
      if (
        err.message.includes("Network") ||
        err.message.includes("connection")
      ) {
        // console.log(" Network issue - continuing with existing enrollments");
        setError("Backend temporarily unavailable - using demo data");
      } else {
        setError(err.message);
      }

      // Keep existing enrollments to prevent UI flickering
      // console.log(" Keeping existing enrollments despite error");
    } finally {
      setLoading(false);
    }
  }, [user]);

  // FIXED: Enhanced enrollInCourse with better 404 handling
  const enrollInCourse = async (courseId) => {
    if (!user) {
      throw new Error("You must be logged in to enroll in a course");
    }

    try {
      setLoading(true);

      // Check if already enrolled locally first
      if (isEnrolled(courseId)) {
        throw new Error("You are already enrolled in this course");
      }

      // console.log("Enrolling in course:", courseId);
      const response = await enrollmentAPI.enrollInCourse(courseId);

      if (response.success) {
        // Add the new enrollment to the list
        const newEnrollment = response.enrollment;
        setEnrollments((prev) => [...prev, newEnrollment]);
        // console.log("Course enrolled successfully");

        // Set info message if using mock data
        if (response.source === "mock") {
          setError("Backend unavailable - using demo enrollment data");
        } else {
          setError(null);
        }

        return { success: true, enrollment: newEnrollment };
      } else {
        throw new Error(response.message || "Failed to enroll in course");
      }
    } catch (err) {
      // console.error("Enrollment error:", err);

      // Handle 404 errors gracefully - create mock enrollment
      if (err.message.includes("404") || err.message.includes("Not Found")) {
        // console.log("Backend unavailable - creating mock enrollment");

        const mockEnrollment = {
          _id: `mock_${courseId}_${Date.now()}`,
          courseId: courseId,
          userId: user.uid,
          enrolledAt: new Date().toISOString(),
          progress: 0,
          completed: false,
          source: "mock",
        };

        setEnrollments((prev) => [...prev, mockEnrollment]);
        setError("Backend unavailable - using demo enrollment data");

        return { success: true, enrollment: mockEnrollment, source: "mock" };
      }

      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const unenrollFromCourse = async (enrollmentId) => {
    try {
      setLoading(true);
      const response = await enrollmentAPI.unenrollFromCourse(enrollmentId);

      if (response.success) {
        // Remove the enrollment from the list
        setEnrollments((prev) => prev.filter((e) => e._id !== enrollmentId));

        // Set info message if using mock data
        if (response.source === "mock") {
          setError("Backend unavailable - using demo data");
        }

        return { success: true };
      } else {
        throw new Error(response.message || "Failed to unenroll from course");
      }
    } catch (err) {
      // console.error("Unenrollment error:", err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateEnrollmentProgress = async (enrollmentId, progressData) => {
    try {
      const response = await enrollmentAPI.updateEnrollmentProgress(
        enrollmentId,
        progressData
      );

      if (response.success) {
        setEnrollments((prev) =>
          prev.map((e) =>
            e._id === enrollmentId ? { ...e, ...progressData } : e
          )
        );

        // Set info message if using mock data
        if (response.source === "mock") {
          // console.log("Progress updated using mock data");
        }

        return { success: true };
      } else {
        throw new Error(response.message || "Failed to update progress");
      }
    } catch (err) {
      // console.error("Progress update error:", err);
      setError(err.message);
      throw err;
    }
  };

  // FIXED: Consistent function naming and improved logic
  const isEnrolled = (courseId) => {
    return enrollments.some(
      (e) => e.courseId === courseId || e.course?._id === courseId
    );
  };

  // FIXED: Alias for backward compatibility
  const isEnrolledInCourse = (courseId) => {
    return isEnrolled(courseId);
  };

  // FIXED: Improved enrollment count calculation
  const enrollmentCount = enrollments.length;

  // FIXED: Better effect dependencies
  useEffect(() => {
    fetchUserEnrollments();
  }, [fetchUserEnrollments]);

  const value = {
    // State
    enrollments,
    enrollmentCount,
    loading,
    error,

    // Actions
    enrollInCourse,
    unenrollFromCourse,
    updateEnrollmentProgress,
    refreshEnrollments: fetchUserEnrollments,

    // Enrollment checking - FIXED: Consistent naming
    isEnrolled,
    isEnrolledInCourse, // Alias for backward compatibility
    hasEnrollment: isEnrolled, // Additional alias

    // Additional convenience functions
    getEnrollmentByCourseId: (courseId) => {
      return enrollments.find(
        (e) => e.courseId === courseId || e.course?._id === courseId
      );
    },

    // Progress utilities
    getEnrollmentProgress: (courseId) => {
      const enrollment = enrollments.find(
        (e) => e.courseId === courseId || e.course?._id === courseId
      );
      return enrollment?.progress || 0;
    },

    // Stats
    getCompletedCourses: () => {
      return enrollments.filter((e) => e.completed);
    },

    getInProgressCourses: () => {
      return enrollments.filter((e) => !e.completed && e.progress > 0);
    },

    getNotStartedCourses: () => {
      return enrollments.filter((e) => e.progress === 0);
    },

    // Utility to check if backend is available
    isUsingMockData: () => {
      return error && error.includes("Backend temporarily unavailable");
    },
  };

  return (
    <EnrollmentContext.Provider value={value}>
      {children}
    </EnrollmentContext.Provider>
  );
};

export default EnrollmentContext;
