import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { courseAPI } from "../../services/api";
import { enrollmentAPI } from "../../services/api";
import { useAuth } from "../../contexts/AuthContext";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import { toast } from "react-hot-toast";
import {
  Star,
  Users,
  Clock,
  BookOpen,
  CheckCircle,
  Shield,
  PlayCircle,
  ArrowLeft,
  Calendar,
  BarChart3,
  Edit3,
  Trash2,
  MoreVertical,
} from "lucide-react";

const CourseDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [checkingEnrollment, setCheckingEnrollment] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  // Enhanced ID validation with better debugging
  useEffect(() => {
    console.log("🔍 Course ID from URL:", id);

    if (!id) {
      toast.error("No course ID provided");
      navigate("/courses");
      return;
    }

    const isValidObjectId =
      id && id.length === 24 && /^[0-9a-fA-F]{24}$/.test(id);

    if (!isValidObjectId) {
      console.error("❌ Invalid course ID format:", {
        received: id,
        length: id?.length,
        validFormat: /^[0-9a-fA-F]{24}$/.test(id),
      });
      toast.error("Invalid course link");
      navigate("/courses");
      return;
    }

    console.log("✅ Valid course ID format:", id);
  }, [id, navigate]);

  // Enhanced course query with better error handling
  // Enhanced course query with better error handling
  // ✅ FIXED: Enhanced course query with better error handling
  const {
    data: courseData,
    isLoading: courseLoading,
    error: courseError,
    refetch: refetchCourse,
  } = useQuery({
    queryKey: ["course", id],
    queryFn: async () => {
      try {
        console.log("🔄 Fetching course with ID:", id);

        // Double validation
        if (!id || !/^[0-9a-fA-F]{24}$/.test(id)) {
          throw new Error(`INVALID_ID_FORMAT: ${id}`);
        }

        const response = await courseAPI.getCourseById(id);
        console.log("📡 Course API response:", response);

        // ✅ FIXED: Handle all error cases properly
        if (!response) {
          throw new Error("NO_RESPONSE");
        }

        if (response.success === false) {
          throw new Error(response.message || "API_ERROR");
        }

        // ✅ FIXED: Extract course data safely
        const course = response.course || response.data;

        if (!course) {
          console.error("❌ No course data in response:", response);
          throw new Error("NO_COURSE_DATA");
        }

        if (!course._id) {
          console.error("❌ Course missing _id:", course);
          throw new Error("INVALID_COURSE_DATA");
        }

        if (course._id.toString() !== id) {
          console.error("❌ Course ID mismatch:", {
            expected: id,
            received: course._id.toString(),
          });
          throw new Error("COURSE_ID_MISMATCH");
        }

        return {
          success: true,
          course,
          message: "Course fetched successfully",
        };
      } catch (error) {
        console.error("❌ Course fetch failed:", {
          error: error.message,
          courseId: id,
          timestamp: new Date().toISOString(),
        });

        // Enhanced error mapping
        let userFriendlyMessage;

        switch (error.message) {
          case "INVALID_ID_FORMAT":
            userFriendlyMessage = "Invalid course ID format";
            break;
          case "NO_RESPONSE":
            userFriendlyMessage = "No response from server";
            break;
          case "NO_COURSE_DATA":
            userFriendlyMessage = "Course data not found in response";
            break;
          case "INVALID_COURSE_DATA":
            userFriendlyMessage = "Invalid course data received";
            break;
          case "COURSE_ID_MISMATCH":
            userFriendlyMessage = "Course ID mismatch";
            break;
          case "API_ERROR":
            userFriendlyMessage = error.originalError?.message || "API error";
            break;
          default:
            if (error.response?.status === 404) {
              userFriendlyMessage = "Course not found";
            } else if (error.response?.status === 408) {
              userFriendlyMessage = "Request timeout - please try again";
            } else if (error.response?.status === 500) {
              userFriendlyMessage = "Server error - please try again later";
            } else {
              userFriendlyMessage = error.message || "Failed to load course";
            }
        }

        const enhancedError = new Error(userFriendlyMessage);
        enhancedError.courseId = id;
        enhancedError.originalError = error;
        enhancedError.statusCode = error.response?.status;
        throw enhancedError;
      }
    },
    enabled: !!id && /^[0-9a-fA-F]{24}$/.test(id),
    retry: (failureCount, error) => {
      // Don't retry on client-side errors
      if (
        error.message.includes("INVALID") ||
        error.message.includes("not found") ||
        error.message.includes("NO_COURSE") ||
        error.message.includes("mismatch") ||
        error.statusCode === 404
      ) {
        return false;
      }
      // Retry timeout errors once
      if (error.statusCode === 408 && failureCount < 1) {
        return true;
      }
      return failureCount < 2;
    },
    staleTime: 5 * 60 * 1000,
  });
  // Safely extract course data
  const course = courseData?.course;

  // ✅ FIXED: Check if current user is the course owner - MOVED AFTER course initialization
  const isCourseOwner = user && course?.owner === user.uid;

  // Enhanced enrollment check
  useEffect(() => {
    const checkEnrollment = async () => {
      if (!isAuthenticated || !user?.uid || !id || !course) {
        setCheckingEnrollment(false);
        return;
      }

      try {
        console.log("🔍 Checking enrollment status...");
        const enrollmentCheck = await enrollmentAPI.checkEnrollment(id);

        const enrolled =
          enrollmentCheck?.isEnrolled ||
          enrollmentCheck?.enrolled ||
          enrollmentCheck?.data?.isEnrolled ||
          false;

        console.log("🎫 Enrollment status:", enrolled);
        setIsEnrolled(enrolled);
      } catch (error) {
        console.error("Enrollment check error:", error);
        setIsEnrolled(false);
      } finally {
        setCheckingEnrollment(false);
      }
    };

    if (course && id) {
      checkEnrollment();
    }
  }, [id, user?.uid, isAuthenticated, course]);

  // Enhanced enrollment mutation
  const enrollMutation = useMutation({
    mutationFn: () => {
      if (!id || !user?.uid) {
        throw new Error("Missing required information");
      }
      return enrollmentAPI.enrollInCourse(id);
    },
    onSuccess: (data) => {
      console.log("✅ Enrollment successful:", data);
      setIsEnrolled(true);
      toast.success("🎉 Successfully enrolled in course!");
      queryClient.invalidateQueries(["enrollments"]);
      queryClient.invalidateQueries(["user-courses"]);
    },
    onError: (error) => {
      console.error("❌ Enrollment failed:", error);
      toast.error(
        error.message || "Failed to enroll in course. Please try again."
      );
    },
  });

  // Delete course mutation
  const deleteCourseMutation = useMutation({
    mutationFn: () => {
      if (!id) {
        throw new Error("Course ID is required");
      }
      return courseAPI.deleteCourse(id);
    },
    onSuccess: () => {
      toast.success("Course deleted successfully");
      queryClient.invalidateQueries(["courses"]);
      navigate("/courses");
    },
    onError: (error) => {
      console.error("❌ Delete course error:", error);
      toast.error(error.message || "Failed to delete course");
    },
  });

  const handleEnroll = () => {
    if (!isAuthenticated) {
      toast.error("Please log in to enroll in this course");
      navigate("/login", { state: { returnUrl: `/courses/${id}` } });
      return;
    }

    if (!user?.uid) {
      toast.error("Please refresh the page and try again");
      return;
    }

    enrollMutation.mutate();
  };

  const handleContinueLearning = () => {
    if (course?._id) {
      navigate(`/learn/${course._id}`);
    } else {
      toast.error("Unable to navigate to course content");
    }
  };

  const handleEditCourse = () => {
    if (course?._id) {
      navigate(`/courses/${course._id}/edit`);
    } else {
      toast.error("Cannot edit course at this time");
    }
  };

  const handleDeleteCourse = () => {
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    deleteCourseMutation.mutate();
    setShowDeleteModal(false);
  };

  const handleRetry = () => {
    console.log("🔄 Retrying course fetch...");
    refetchCourse();
  };

  // Render loading state
  if (courseLoading) {
    return (
      <div className="min-h-screen bg-base-100 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-4 text-lg text-gray-600"
          >
            Loading course details...
          </motion.p>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-sm text-gray-500 mt-2"
          >
            Preparing your learning experience
          </motion.p>
        </div>
      </div>
    );
  }

  // Render error state
  if (courseError) {
    const isNotFound = courseError?.status === 404;
    const isInvalidId = courseError?.message?.includes("Invalid course ID");
    const isServerError = courseError?.status === 500;

    return (
      <div className="min-h-screen bg-base-100 flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md w-full"
        >
          <div className="text-6xl mb-6">🚫</div>
          <h1 className="text-2xl font-bold text-error mb-4">
            {isNotFound ? "Course Not Found" : "Error Loading Course"}
          </h1>
          <p className="text-gray-600 mb-6 leading-relaxed">
            {isNotFound
              ? "The course you're looking for doesn't exist or may have been removed."
              : isInvalidId
              ? "The course link appears to be invalid or corrupted."
              : isServerError
              ? "We're experiencing technical difficulties. Please try again later."
              : "We encountered an unexpected error while loading the course."}
          </p>

          <div className="space-y-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleRetry}
              className="btn btn-primary btn-lg w-full"
            >
              Try Again
            </motion.button>
            <Link to="/courses" className="btn btn-outline btn-lg w-full">
              Browse All Courses
            </Link>
          </div>

          {/* Technical details for debugging */}
          {process.env.NODE_ENV === "development" && (
            <div className="mt-6 p-4 bg-gray-100 rounded-lg text-left">
              <p className="text-sm font-mono text-gray-700 break-all">
                <strong>Error:</strong> {courseError.message}
                <br />
                <strong>Course ID:</strong> {id}
              </p>
            </div>
          )}
        </motion.div>
      </div>
    );
  }

  // Render no course data state
  if (!course) {
    return (
      <div className="min-h-screen bg-base-100 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-6">❓</div>
          <h1 className="text-2xl font-bold text-error mb-4">
            Course Unavailable
          </h1>
          <p className="text-gray-600 mb-6">
            The course information is currently unavailable or may have been
            removed.
          </p>
          <div className="space-y-3">
            <Link to="/courses" className="btn btn-primary btn-lg w-full">
              Explore Courses
            </Link>
            <button
              onClick={handleRetry}
              className="btn btn-outline btn-lg w-full"
            >
              Retry Loading
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Enhanced course data extraction with better fallbacks
  const {
    title = "Untitled Course",
    description = "No description available for this course.",
    image,
    category = "Uncategorized",
    level = "All Levels",
    isFeatured = false,
    students = 0,
    rating = 0,
    lessons = 0,
    duration = "Self-paced",
    price = 0,
    instructor = {},
    createdAt,
    updatedAt,
    _id: courseId,
    owner,
  } = course;

  // Format display values
  const displayRating = typeof rating === "number" ? rating.toFixed(1) : "New";
  const displayPrice = typeof price === "number" ? price : 0;
  const displayStudents = students?.toLocaleString() || "0";
  const displayLessons = lessons || 0;

  // Calculate rating stars
  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(
          <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
        );
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
        );
      } else {
        stars.push(<Star key={i} className="w-4 h-4 text-gray-300" />);
      }
    }
    return stars;
  };

  // Course features
  const courseFeatures = [
    "Lifetime access to course materials",
    "Certificate of completion",
    "Q&A support from instructor",
    "Access on mobile and TV",
    "Downloadable resources and exercises",
    "Progress tracking and analytics",
  ];

  // Curriculum items (mock data - you can replace with actual curriculum)
  const curriculumItems = [
    { title: "Course Introduction", duration: "15 min", type: "video" },
    {
      title: "Setting Up Development Environment",
      duration: "30 min",
      type: "video",
    },
    { title: "Core Concepts Overview", duration: "45 min", type: "video" },
    { title: "Hands-on Project Setup", duration: "1 hour", type: "project" },
    { title: "Advanced Techniques", duration: "2 hours", type: "video" },
    { title: "Final Project", duration: "3 hours", type: "project" },
  ];

  return (
    <div className="min-h-screen bg-base-100">
      {/* Header Navigation */}
      <motion.header
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="border-b border-base-300 bg-base-100 sticky top-0 z-40"
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/courses" className="btn btn-ghost btn-sm gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Courses
            </Link>

            <div className="flex items-center gap-4">
              {isFeatured && (
                <span className="badge badge-accent badge-sm">Featured</span>
              )}
              <span className="badge badge-outline badge-sm">{level}</span>

              {/* Course Owner Menu */}
              {isCourseOwner && (
                <div className="relative">
                  <button
                    onClick={() => setShowMenu(!showMenu)}
                    className="btn btn-ghost btn-sm gap-2"
                  >
                    <MoreVertical className="w-4 h-4" />
                    Manage
                  </button>

                  {showMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-base-100 border border-base-300 rounded-lg shadow-lg z-50">
                      <button
                        onClick={handleEditCourse}
                        className="w-full text-left px-4 py-2 hover:bg-base-200 flex items-center gap-2"
                      >
                        <Edit3 className="w-4 h-4" />
                        Edit Course
                      </button>
                      <button
                        onClick={handleDeleteCourse}
                        className="w-full text-left px-4 py-2 hover:bg-base-200 text-error flex items-center gap-2"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete Course
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.header>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-base-100 rounded-2xl p-6 max-w-md w-full"
          >
            <h3 className="text-lg font-bold mb-4">Delete Course</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete "{title}"? This action cannot be
              undone and all course data will be permanently removed.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="btn btn-outline flex-1"
                disabled={deleteCourseMutation.isLoading}
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="btn btn-error flex-1 gap-2"
                disabled={deleteCourseMutation.isLoading}
              >
                {deleteCourseMutation.isLoading ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
                Delete
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Course Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Course Hero Section */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-base-200 rounded-3xl overflow-hidden"
            >
              <div className="relative">
                <img
                  src={
                    image ||
                    "https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=1200"
                  }
                  alt={title}
                  className="w-full h-64 lg:h-80 object-cover"
                  onError={(e) => {
                    e.target.src =
                      "https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=1200";
                  }}
                />
                <div className="absolute top-4 left-4">
                  <span className="badge badge-primary badge-lg">
                    {category}
                  </span>
                </div>
                {isCourseOwner && (
                  <div className="absolute top-4 right-4">
                    <span className="badge badge-secondary badge-lg">
                      Your Course
                    </span>
                  </div>
                )}
              </div>

              <div className="p-6 lg:p-8">
                <div className="flex flex-wrap items-center gap-4 mb-4">
                  <div className="flex items-center gap-1">
                    {renderStars(rating)}
                    <span className="text-sm font-medium ml-1">
                      {displayRating} ({students} reviews)
                    </span>
                  </div>
                  <span className="text-sm text-gray-500">•</span>
                  <span className="text-sm text-gray-600">
                    {displayStudents} students
                  </span>
                </div>

                <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                  {title}
                </h1>

                <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed mb-6">
                  {description}
                </p>

                {/* Key Metrics */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 py-6 border-y border-base-300">
                  <div className="text-center">
                    <Users className="w-8 h-8 text-primary mx-auto mb-2" />
                    <div className="text-2xl font-bold text-gray-900">
                      {displayStudents}
                    </div>
                    <div className="text-sm text-gray-600">Students</div>
                  </div>
                  <div className="text-center">
                    <BookOpen className="w-8 h-8 text-primary mx-auto mb-2" />
                    <div className="text-2xl font-bold text-gray-900">
                      {displayLessons}
                    </div>
                    <div className="text-sm text-gray-600">Lessons</div>
                  </div>
                  <div className="text-center">
                    <Clock className="w-8 h-8 text-primary mx-auto mb-2" />
                    <div className="text-2xl font-bold text-gray-900">
                      {duration}
                    </div>
                    <div className="text-sm text-gray-600">Duration</div>
                  </div>
                  <div className="text-center">
                    <BarChart3 className="w-8 h-8 text-primary mx-auto mb-2" />
                    <div className="text-2xl font-bold text-gray-900">
                      {level}
                    </div>
                    <div className="text-sm text-gray-600">Level</div>
                  </div>
                </div>
              </div>
            </motion.section>

            {/* Tabs Navigation */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-base-200 rounded-2xl p-1"
            >
              <div className="flex space-x-1">
                {["overview", "curriculum", "reviews", "instructor"].map(
                  (tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`flex-1 py-3 px-4 rounded-xl text-sm font-medium transition-all ${
                        activeTab === tab
                          ? "bg-primary text-primary-content shadow-sm"
                          : "text-gray-600 hover:text-gray-900"
                      }`}
                    >
                      {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                  )
                )}
              </div>
            </motion.div>

            {/* Tab Content */}
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-base-200 rounded-2xl p-6 lg:p-8"
            >
              {activeTab === "overview" && (
                <div className="space-y-6">
                  <h3 className="text-2xl font-bold text-gray-900">
                    What You'll Learn
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      `Master the fundamentals of ${title}`,
                      "Build real-world projects and applications",
                      "Develop industry-relevant skills",
                      "Gain hands-on experience with practical exercises",
                      "Understand best practices and patterns",
                      "Prepare for advanced topics and certifications",
                    ].map((item, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{item}</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-6 border-t border-base-300">
                    <h4 className="text-lg font-semibold mb-4">
                      Prerequisites
                    </h4>
                    <ul className="list-disc list-inside text-gray-600 space-y-1">
                      <li>Basic computer literacy</li>
                      <li>Willingness to learn and practice</li>
                      <li>No prior experience required</li>
                    </ul>
                  </div>
                </div>
              )}

              {activeTab === "curriculum" && (
                <div className="space-y-4">
                  <h3 className="text-2xl font-bold text-gray-900">
                    Course Curriculum
                  </h3>
                  <div className="space-y-3">
                    {curriculumItems.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-4 bg-base-100 rounded-lg border border-base-300"
                      >
                        <div className="flex items-center gap-3">
                          <PlayCircle className="w-5 h-5 text-primary" />
                          <span className="font-medium">{item.title}</span>
                          {item.type === "project" && (
                            <span className="badge badge-secondary badge-sm">
                              Project
                            </span>
                          )}
                        </div>
                        <span className="text-sm text-gray-500">
                          {item.duration}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === "instructor" && (
                <div className="space-y-6">
                  <h3 className="text-2xl font-bold text-gray-900">
                    About the Instructor
                  </h3>
                  <div className="flex items-start gap-6">
                    <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center text-white font-bold text-2xl">
                      {instructor.name?.charAt(0) || "I"}
                    </div>
                    <div className="flex-1">
                      <h4 className="text-xl font-semibold text-gray-900">
                        {instructor.name || "Expert Instructor"}
                      </h4>
                      <p className="text-gray-600 mt-2">
                        {instructor.bio ||
                          "Experienced professional with years of industry expertise and a passion for teaching."}
                      </p>
                      <div className="flex items-center gap-4 mt-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-400" />
                          <span>4.8 Instructor Rating</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4 text-primary" />
                          <span>10,000+ Students</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <BookOpen className="w-4 h-4 text-primary" />
                          <span>15 Courses</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "reviews" && (
                <div className="space-y-6">
                  <h3 className="text-2xl font-bold text-gray-900">
                    Student Reviews
                  </h3>
                  <div className="text-center py-8">
                    <div className="text-6xl mb-4">⭐</div>
                    <p className="text-gray-600">
                      No reviews yet. Be the first to review this course!
                    </p>
                  </div>
                </div>
              )}
            </motion.div>
          </div>

          {/* Right Column - Enrollment Card */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="sticky top-24 space-y-6"
            >
              {/* Enrollment Card */}
              <div className="bg-base-200 rounded-2xl p-6 border border-base-300">
                <div className="text-center mb-6">
                  <div className="text-4xl font-bold text-primary mb-2">
                    ${displayPrice}
                  </div>
                  <div className="text-sm text-gray-600">
                    One-time payment • Lifetime access
                  </div>
                </div>

                {checkingEnrollment ? (
                  <button className="btn btn-primary btn-lg w-full" disabled>
                    <LoadingSpinner size="sm" />
                    Checking Enrollment...
                  </button>
                ) : isEnrolled ? (
                  <div className="text-center space-y-4">
                    <div className="alert alert-success">
                      <CheckCircle className="w-5 h-5" />
                      <span>You're enrolled in this course!</span>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleContinueLearning}
                      className="btn btn-primary btn-lg w-full gap-2"
                    >
                      <PlayCircle className="w-5 h-5" />
                      Continue Learning
                    </motion.button>
                  </div>
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleEnroll}
                    disabled={enrollMutation.isLoading}
                    className="btn btn-primary btn-lg w-full gap-2"
                  >
                    {enrollMutation.isLoading ? (
                      <>
                        <LoadingSpinner size="sm" />
                        Enrolling...
                      </>
                    ) : (
                      <>
                        <BookOpen className="w-5 h-5" />
                        Enroll Now
                      </>
                    )}
                  </motion.button>
                )}

                {/* Course Features */}
                <div className="mt-6 space-y-3">
                  <h4 className="font-semibold text-lg mb-3 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    This course includes:
                  </h4>
                  {courseFeatures.map((feature, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
                      <span className="text-sm text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* Guarantee */}
                <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center gap-3">
                    <Shield className="w-5 h-5 text-green-600" />
                    <div>
                      <div className="text-sm font-medium text-green-800">
                        30-Day Money-Back Guarantee
                      </div>
                      <div className="text-xs text-green-600">
                        Full refund if you're not satisfied
                      </div>
                    </div>
                  </div>
                </div>

                {/* Course Info */}
                <div className="mt-6 space-y-3 text-sm text-gray-600">
                  <div className="flex items-center justify-between">
                    <span>Last updated:</span>
                    <span>
                      {updatedAt
                        ? new Date(updatedAt).toLocaleDateString()
                        : "Recently"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Includes:</span>
                    <span>Video, articles, resources</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Access:</span>
                    <span>Lifetime</span>
                  </div>
                </div>
              </div>

              {/* Share Course */}
              <div className="bg-base-200 rounded-2xl p-6 border border-base-300">
                <h4 className="font-semibold mb-3">Share this course</h4>
                <div className="flex gap-2">
                  {["Twitter", "Facebook", "LinkedIn", "Copy Link"].map(
                    (platform) => (
                      <button
                        key={platform}
                        className="btn btn-outline btn-sm flex-1"
                        onClick={() => {
                          navigator.clipboard.writeText(window.location.href);
                          toast.success("Course link copied!");
                        }}
                      >
                        {platform}
                      </button>
                    )
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ✅ FIXED: Make sure this default export exists
export default CourseDetails;
