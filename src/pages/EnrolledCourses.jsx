import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useEnrollment } from "../contexts/EnrollmentContext";
import LoadingSpinner from "../components/ui/LoadingSpinner";

const EnrolledCourses = () => {
  const { enrollments, isLoading, error, loadEnrollments } = useEnrollment();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
        <p className="ml-4 text-gray-600">Loading your courses...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto">
          <div className="text-6xl mb-4">😕</div>
          <h1 className="text-2xl font-bold text-error mb-4">
            Failed to load enrollments
          </h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button onClick={loadEnrollments} className="btn btn-primary">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-100 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-4">
            My Enrolled Courses
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Continue your learning journey with {enrollments.length} courses
          </p>
        </motion.div>

        {/* Enrolled Courses */}
        {enrollments.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-2xl font-semibold text-gray-600 dark:text-gray-400 mb-2">
              No enrolled courses yet
            </h3>
            <p className="text-gray-500 dark:text-gray-500 mb-6">
              Start your learning journey by enrolling in a course
            </p>
            <Link to="/courses" className="btn btn-primary btn-lg">
              Browse All Courses
            </Link>
          </motion.div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {enrollments.map((enrollment, index) => {
                const course = enrollment.course || enrollment;
                return (
                  <motion.div
                    key={enrollment._id || course._id || index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="card bg-base-200 shadow-xl hover:shadow-2xl transition-all duration-300"
                  >
                    <figure className="px-4 pt-4">
                      <img
                        src={
                          course.image ||
                          "https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=600"
                        }
                        alt={course.title}
                        className="rounded-xl h-48 w-full object-cover"
                      />
                    </figure>
                    <div className="card-body">
                      <div className="flex justify-between items-start mb-2">
                        <span className="badge badge-success badge-sm">
                          Enrolled
                        </span>
                        <span className="badge badge-primary badge-sm">
                          {course.category || "General"}
                        </span>
                      </div>

                      <h3 className="card-title text-lg font-semibold line-clamp-2">
                        {course.title}
                      </h3>

                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        By {course.instructor?.name || "Unknown Instructor"}
                      </p>

                      <p className="text-sm text-gray-500 dark:text-gray-500 line-clamp-2">
                        {course.description || "No description available"}
                      </p>

                      <div className="flex justify-between items-center text-sm text-gray-600 dark:text-gray-400 mb-4">
                        <div className="flex items-center gap-1">
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          {course.duration || "Self-paced"}
                        </div>
                        <div className="text-primary font-semibold">
                          ${course.price || 0}
                        </div>
                      </div>

                      <div className="card-actions">
                        <Link
                          to={`/courses/${course._id || course.id}`}
                          className="btn btn-primary btn-block"
                        >
                          Continue Learning
                        </Link>
                      </div>

                      {enrollment.enrolledAt && (
                        <div className="text-xs text-gray-500 text-center mt-2">
                          Enrolled on{" "}
                          {new Date(enrollment.enrolledAt).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Progress Summary */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="bg-primary text-primary-content rounded-lg p-6 text-center"
            >
              <h3 className="text-xl font-semibold mb-2">
                🎉 Learning Progress
              </h3>
              <p>
                You're enrolled in <strong>{enrollments.length}</strong> course
                {enrollments.length !== 1 ? "s" : ""}. Keep up the great work!
              </p>
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
};

export default EnrolledCourses;
