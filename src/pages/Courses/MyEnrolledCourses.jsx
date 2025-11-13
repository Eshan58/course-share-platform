import React, { createContext, useContext, useReducer, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { toast } from "react-hot-toast";

// Import the API functions correctly
import { enrollmentAPI, courseAPI, userAPI } from "../../services/api.js";

const EnrollmentContext = createContext();

// Action types
const ACTION_TYPES = {
  SET_LOADING: "SET_LOADING",
  SET_ENROLLMENTS: "SET_ENROLLMENTS",
  ADD_ENROLLMENT: "ADD_ENROLLMENT",
  SET_ERROR: "SET_ERROR",
  CLEAR_ERROR: "CLEAR_ERROR",
};

// Reducer function
const enrollmentReducer = (state, action) => {
  switch (action.type) {
    case ACTION_TYPES.SET_LOADING:
      return {
        ...state,
        loading: action.payload,
      };
    case ACTION_TYPES.SET_ENROLLMENTS:
      return {
        ...state,
        enrollments: action.payload,
        loading: false,
        error: null,
      };
    case ACTION_TYPES.ADD_ENROLLMENT:
      return {
        ...state,
        enrollments: [...state.enrollments, action.payload],
        loading: false,
        error: null,
      };
    case ACTION_TYPES.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        loading: false,
      };
    case ACTION_TYPES.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };
    default:
      return state;
  }
};

// Initial state
const initialState = {
  enrollments: [],
  loading: false,
  error: null,
  enrollmentCount: 0,
};

export const EnrollmentProvider = ({ children }) => {
  const [state, dispatch] = useReducer(enrollmentReducer, initialState);
  const { user, isAuthenticated } = useAuth();

  // Load enrollments when user changes
  useEffect(() => {
    if (isAuthenticated && user?.uid) {
      loadEnrollments();
    } else {
      // Clear enrollments when user logs out
      dispatch({ type: ACTION_TYPES.SET_ENROLLMENTS, payload: [] });
    }
  }, [user, isAuthenticated]);

  const loadEnrollments = async () => {
    if (!isAuthenticated || !user?.uid) {
      return;
    }

    try {
      dispatch({ type: ACTION_TYPES.SET_LOADING, payload: true });

      // console.log(" Loading enrollments for user:", user.uid);

      const response = await enrollmentAPI.getMyEnrollments(user.uid);

      // console.log(" Enrollment response:", response);

      // Handle different response structures
      const enrollments = response.enrollments || response.data || [];

      dispatch({
        type: ACTION_TYPES.SET_ENROLLMENTS,
        payload: enrollments,
      });

      // console.log(`Loaded ${enrollments.length} enrollments`);
    } catch (error) {
      // console.error(" Error loading enrollments:", error);

      // Don't show error for 404s (no enrollments)
      if (error.response?.status !== 404) {
        dispatch({
          type: ACTION_TYPES.SET_ERROR,
          payload: error.message || "Failed to load enrollments",
        });
        toast.error("Failed to load your courses");
      } else {
        // Set empty enrollments for 404
        dispatch({
          type: ACTION_TYPES.SET_ENROLLMENTS,
          payload: [],
        });
      }
    }
  };

  const enrollInCourse = async (courseId) => {
    if (!isAuthenticated || !user?.uid) {
      toast.error("Please log in to enroll in courses");
      return { success: false, message: "User not authenticated" };
    }

    try {
      dispatch({ type: ACTION_TYPES.SET_LOADING, payload: true });

      // console.log(" Enrolling in course:", courseId);

      const response = await enrollmentAPI.enrollCourse(courseId, user.uid);

      // console.log("Enrollment successful:", response);

      // Add the new enrollment to state
      const newEnrollment = response.enrollment ||
        response.data || {
          courseId,
          userId: user.uid,
          enrolledAt: new Date().toISOString(),
        };

      dispatch({
        type: ACTION_TYPES.ADD_ENROLLMENT,
        payload: newEnrollment,
      });

      toast.success("Successfully enrolled in course!");
      return { success: true, data: response };
    } catch (error) {
      // console.error(" Enrollment error:", error);
      // const errorMessage = error.message || "Failed to enroll in course";
      // dispatch({
      //   type: ACTION_TYPES.SET_ERROR,
      //   payload: errorMessage,
      // });
      // toast.error(errorMessage);
      // return { success: false, message: errorMessage };
    }
  };

  const checkEnrollment = async (courseId) => {
    if (!isAuthenticated || !user?.uid) {
      return { isEnrolled: false };
    }

    try {
      // console.log(" Checking enrollment for course:", courseId);

      const response = await enrollmentAPI.checkEnrollment(courseId);

      // console.log(" Enrollment check result:", response);

      // Handle different response structures
      const isEnrolled =
        response.isEnrolled ||
        response.enrolled ||
        response.data?.isEnrolled ||
        false;

      return { isEnrolled, data: response };
    } catch (error) {
      // console.error("Enrollment check error:", error);
      // For enrollment checks, we treat errors as "not enrolled"
      // return {
      //   isEnrolled: false,
      //   error: error.message,
      // };
    }
  };

  // const clearError = () => {
  //   dispatch({ type: ACTION_TYPES.CLEAR_ERROR });
  // };

  // Check if user is enrolled in a specific course
  const isEnrolledInCourse = (courseId) => {
    if (!courseId || !state.enrollments.length) return false;

    return state.enrollments.some(
      (enrollment) =>
        enrollment.courseId === courseId || enrollment.course?._id === courseId
    );
  };

  // Get enrolled course IDs
  const getEnrolledCourseIds = () => {
    return state.enrollments
      .map((enrollment) => enrollment.courseId || enrollment.course?._id)
      .filter(Boolean);
  };

  const value = {
    // State
    enrollments: state.enrollments,
    loading: state.loading,
    error: state.error,
    enrollmentCount: state.enrollments.length,

    // Actions
    enrollInCourse,
    checkEnrollment,
    loadEnrollments,
    clearError,
    isEnrolledInCourse,
    getEnrolledCourseIds,

    // Convenience getters--
    hasEnrollments: state.enrollments.length > 0,
    enrolledCourses: state.enrollments,
  };

  return (
    <EnrollmentContext.Provider value={value}>
      {children}
    </EnrollmentContext.Provider>
  );
};

// Custom hook to use the enrollment
export const useEnrollment = () => {
  const context = useContext(EnrollmentContext);
  if (!context) {
    throw new Error("useEnrollment must be used within an EnrollmentProvider");
  }
  return context;
};

export default EnrollmentContext;
