import { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { courseAPI } from "../../services/api";
import toast from "react-hot-toast";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import {
  Plus,
  Eye,
  Edit3,
  Trash2,
  Star,
  Users,
  TrendingUp,
  Award,
  RefreshCw,
  BookOpen,
  Filter,
  Search,
  X,
  BarChart3,
  Clock,
  DollarSign,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

// Skeleton Loading Component
const CourseCardSkeleton = ({ isMobile = false }) => (
  <div
    className={`card bg-base-200 shadow-xl animate-pulse ${
      isMobile ? "" : "flex-row"
    }`}
  >
    <div
      className={`${isMobile ? "h-48" : "w-32 h-32"} bg-base-300 ${
        isMobile ? "rounded-t-xl" : "rounded-l-xl"
      }`}
    ></div>
    <div className="card-body space-y-3">
      <div className="flex justify-between">
        <div className="h-4 bg-base-300 rounded w-20"></div>
        <div className="h-4 bg-base-300 rounded w-16"></div>
      </div>
      <div className="h-6 bg-base-300 rounded w-3/4"></div>
      <div className="h-4 bg-base-300 rounded w-full"></div>
      <div className="flex justify-between items-center pt-2">
        <div className="h-8 bg-base-300 rounded w-20"></div>
        <div className="h-8 bg-base-300 rounded w-16"></div>
      </div>
    </div>
  </div>
);

// Error State Component
const ErrorState = ({ error, onRetry }) => (
  <div className="min-h-screen flex items-center justify-center px-4">
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center max-w-md w-full"
    >
      <div className="text-6xl mb-6">😕</div>
      <h1 className="text-2xl font-bold text-error mb-4">
        Failed to Load Courses
      </h1>
      <p className="text-gray-600 mb-6 leading-relaxed">
        {error?.message ||
          "We couldn't load your courses. Please check your connection and try again."}
      </p>
      <div className="flex gap-3 justify-center flex-wrap">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onRetry}
          className="btn btn-primary gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Try Again
        </motion.button>
        <button
          onClick={() => window.location.reload()}
          className="btn btn-outline gap-2"
        >
          Reload Page
        </button>
      </div>
    </motion.div>
  </div>
);

// Empty State Component
const EmptyState = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="text-center py-16"
  >
    <div className="text-6xl mb-4">📚</div>
    <h3 className="text-2xl font-semibold text-gray-600 dark:text-gray-400 mb-4">
      No courses created yet
    </h3>
    <p className="text-gray-500 dark:text-gray-500 mb-8 max-w-md mx-auto">
      Start sharing your knowledge by creating your first course and inspiring
      learners worldwide.
    </p>
    <Link to="/add-course" className="btn btn-primary btn-lg gap-2">
      <Plus className="w-5 h-5" />
      Create Your First Course
    </Link>
  </motion.div>
);

const MyCourses = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  // Fetch courses with enhanced error handling
  const {
    data: response,
    isLoading,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["my-courses"],
    queryFn: async () => {
      try {
        const data = await courseAPI.getMyCourses();
        return data;
      } catch (error) {
        console.error("❌ Error fetching courses:", error);
        throw new Error(
          error.message ||
            "Failed to load courses. Please check your connection."
        );
      }
    },
    retry: 2,
    retryDelay: 1000,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Delete mutation with enhanced feedback
  const deleteMutation = useMutation({
    mutationFn: (courseId) => courseAPI.deleteCourse(courseId),
    onSuccess: (_, courseId) => {
      queryClient.invalidateQueries(["my-courses"]);
      toast.success("Course deleted successfully");
    },
    onError: (error, courseId) => {
      console.error("❌ Error deleting course:", error);
      toast.error(error.message || "Failed to delete course");
    },
  });

  // Process courses data
  const courses = useMemo(() => {
    return response?.data?.courses || response?.courses || response || [];
  }, [response]);

  // Filter and sort courses
  const filteredAndSortedCourses = useMemo(() => {
    let filtered = courses.filter((course) => {
      const matchesSearch =
        !searchTerm ||
        course.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.description?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "featured" && course.isFeatured) ||
        (statusFilter === "regular" && !course.isFeatured);

      const matchesCategory =
        categoryFilter === "all" || course.category === categoryFilter;

      return matchesSearch && matchesStatus && matchesCategory;
    });

    // Sort courses
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case "popular":
          return (b.students || 0) - (a.students || 0);
        case "rating":
          return (b.rating || 0) - (a.rating || 0);
        case "price-high":
          return (b.price || 0) - (a.price || 0);
        case "price-low":
          return (a.price || 0) - (b.price || 0);
        case "newest":
        default:
          return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      }
    });
  }, [courses, searchTerm, statusFilter, categoryFilter, sortBy]);

  // Get unique categories for filter
  const categories = useMemo(() => {
    const uniqueCategories = [
      ...new Set(courses.map((course) => course.category).filter(Boolean)),
    ];
    return uniqueCategories.map((category) => ({
      value: category,
      label: getCategoryLabel(category),
    }));
  }, [courses]);

  // Calculate stats
  const stats = useMemo(() => {
    const totalStudents = courses.reduce(
      (sum, course) => sum + (course.students || 0),
      0
    );
    const featuredCourses = courses.filter(
      (course) => course.isFeatured
    ).length;
    const averageRating =
      courses.length > 0
        ? (
            courses.reduce((sum, course) => sum + (course.rating || 0), 0) /
            courses.length
          ).toFixed(1)
        : "0.0";
    const totalRevenue = courses.reduce(
      (sum, course) => sum + (course.price || 0) * (course.students || 0),
      0
    );

    return {
      totalCourses: courses.length,
      totalStudents,
      featuredCourses,
      averageRating,
      totalRevenue,
    };
  }, [courses]);

  // Helper functions
  const getCategoryLabel = useCallback((category) => {
    if (!category) return "Uncategorized";
    return category
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }, []);

  const getStatusBadge = useCallback((course) => {
    if (course.isFeatured) {
      return (
        <span className="badge badge-primary badge-sm gap-1">
          <Award className="w-3 h-3" /> Featured
        </span>
      );
    }
    return <span className="badge badge-ghost badge-sm">Regular</span>;
  }, []);

  const getProgressColor = useCallback((rating) => {
    if (rating >= 4.5) return "text-green-500";
    if (rating >= 4.0) return "text-blue-500";
    if (rating >= 3.0) return "text-yellow-500";
    return "text-red-500";
  }, []);

  // Action handlers
  const handleDelete = useCallback(
    (courseId, courseTitle) => {
      if (
        window.confirm(
          `Are you sure you want to delete "${courseTitle}"? This action cannot be undone.`
        )
      ) {
        deleteMutation.mutate(courseId);
      }
    },
    [deleteMutation]
  );

  const handleRetry = useCallback(() => {
    refetch();
  }, [refetch]);

  const clearFilters = useCallback(() => {
    setSearchTerm("");
    setStatusFilter("all");
    setCategoryFilter("all");
  }, []);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-base-100 py-8">
        <div className="container mx-auto px-4">
          {/* Skeleton Header */}
          <div className="text-center mb-12 animate-pulse">
            <div className="h-12 bg-base-300 rounded-lg max-w-2xl mx-auto mb-4"></div>
            <div className="h-6 bg-base-300 rounded-lg max-w-xl mx-auto mb-8"></div>
          </div>

          {/* Skeleton Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="stat bg-base-200 rounded-lg animate-pulse"
              >
                <div className="h-4 bg-base-300 rounded w-20 mb-2"></div>
                <div className="h-8 bg-base-300 rounded w-16"></div>
              </div>
            ))}
          </div>

          {/* Skeleton Courses */}
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <CourseCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return <ErrorState error={error} onRetry={handleRetry} />;
  }

  return (
    <div className="min-h-screen bg-base-100 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8"
        >
          <div>
            <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-2">
              My Courses
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Manage and track your created courses
            </p>
          </div>
          <Link to="/add-course" className="btn btn-primary mt-4 lg:mt-0 gap-2">
            <Plus className="w-5 h-5" />
            Add New Course
          </Link>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <div className="stat bg-base-200 rounded-2xl border border-base-300">
            <div className="stat-figure text-primary">
              <BookOpen className="w-8 h-8" />
            </div>
            <div className="stat-title">Total Courses</div>
            <div className="stat-value text-primary">{stats.totalCourses}</div>
          </div>

          <div className="stat bg-base-200 rounded-2xl border border-base-300">
            <div className="stat-figure text-secondary">
              <Users className="w-8 h-8" />
            </div>
            <div className="stat-title">Total Students</div>
            <div className="stat-value text-secondary">
              {stats.totalStudents.toLocaleString()}
            </div>
          </div>

          <div className="stat bg-base-200 rounded-2xl border border-base-300">
            <div className="stat-figure text-accent">
              <Award className="w-8 h-8" />
            </div>
            <div className="stat-title">Featured Courses</div>
            <div className="stat-value text-accent">
              {stats.featuredCourses}
            </div>
          </div>

          <div className="stat bg-base-200 rounded-2xl border border-base-300">
            <div className="stat-figure text-info">
              <Star className="w-8 h-8" />
            </div>
            <div className="stat-title">Average Rating</div>
            <div className="stat-value text-info">{stats.averageRating}</div>
          </div>
        </motion.div>

        {/* Search and Filters */}
        {courses.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-base-200 rounded-2xl p-6 mb-8 border border-base-300"
          >
            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
              {/* Search */}
              <div className="flex-1 w-full lg:max-w-md">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search your courses..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="input input-bordered w-full pl-12 pr-12 py-3"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm("")}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap gap-3 w-full lg:w-auto">
                {/* Status Filter */}
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="select select-bordered"
                >
                  <option value="all">All Status</option>
                  <option value="featured">Featured</option>
                  <option value="regular">Regular</option>
                </select>

                {/* Category Filter */}
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="select select-bordered"
                  disabled={categories.length === 0}
                >
                  <option value="all">All Categories</option>
                  {categories.map((category) => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>

                {/* Sort */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="select select-bordered"
                >
                  <option value="newest">Newest First</option>
                  <option value="popular">Most Popular</option>
                  <option value="rating">Highest Rated</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="price-low">Price: Low to High</option>
                </select>

                {/* Clear Filters */}
                {(searchTerm ||
                  statusFilter !== "all" ||
                  categoryFilter !== "all") && (
                  <button
                    onClick={clearFilters}
                    className="btn btn-ghost gap-2"
                  >
                    <X className="w-4 h-4" />
                    Clear
                  </button>
                )}
              </div>
            </div>

            {/* Active Filters Badges */}
            {(searchTerm ||
              statusFilter !== "all" ||
              categoryFilter !== "all") && (
              <div className="flex flex-wrap gap-2 mt-4">
                {searchTerm && (
                  <span className="badge badge-outline gap-2">
                    Search: "{searchTerm}"
                    <button
                      onClick={() => setSearchTerm("")}
                      className="text-xs"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {statusFilter !== "all" && (
                  <span className="badge badge-outline gap-2">
                    Status: {statusFilter}
                    <button
                      onClick={() => setStatusFilter("all")}
                      className="text-xs"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {categoryFilter !== "all" && (
                  <span className="badge badge-outline gap-2">
                    Category: {getCategoryLabel(categoryFilter)}
                    <button
                      onClick={() => setCategoryFilter("all")}
                      className="text-xs"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
              </div>
            )}
          </motion.div>
        )}

        {/* Results Info */}
        {courses.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-between items-center mb-6"
          >
            <p className="text-gray-600">
              Showing <strong>{filteredAndSortedCourses.length}</strong> of{" "}
              <strong>{courses.length}</strong> courses
            </p>
            {isFetching && (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <RefreshCw className="w-4 h-4 animate-spin" />
                Updating...
              </div>
            )}
          </motion.div>
        )}

        {/* Courses Grid/Table */}
        {courses.length === 0 ? (
          <EmptyState />
        ) : filteredAndSortedCourses.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-2xl font-semibold text-gray-600 dark:text-gray-400 mb-4">
              No courses found
            </h3>
            <p className="text-gray-500 dark:text-gray-500 mb-8">
              Try adjusting your search or filter criteria
            </p>
            <button onClick={clearFilters} className="btn btn-primary">
              Clear All Filters
            </button>
          </motion.div>
        ) : (
          <>
            {/* Mobile Cards View */}
            <div className="lg:hidden space-y-6">
              <AnimatePresence>
                {filteredAndSortedCourses.map((course, index) => (
                  <motion.div
                    key={course._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.1 }}
                    className="card bg-base-200 shadow-xl hover:shadow-2xl transition-all duration-300"
                  >
                    <figure className="px-4 pt-4">
                      <img
                        src={
                          course.image ||
                          "https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=400&h=250&fit=crop"
                        }
                        alt={course.title}
                        className="rounded-xl h-48 w-full object-cover"
                        onError={(e) => {
                          e.target.src =
                            "https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=400&h=250&fit=crop";
                        }}
                      />
                    </figure>
                    <div className="card-body">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex flex-wrap gap-2">
                          <span className="badge badge-primary badge-sm">
                            {getCategoryLabel(course.category)}
                          </span>
                          {getStatusBadge(course)}
                        </div>
                        <div className="flex items-center gap-1 text-sm">
                          <Star className="w-4 h-4 text-yellow-500 fill-current" />
                          <span className={getProgressColor(course.rating)}>
                            {course.rating?.toFixed(1) || "0.0"}
                          </span>
                        </div>
                      </div>

                      <h3 className="card-title text-lg line-clamp-2">
                        {course.title}
                      </h3>

                      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                        {course.description}
                      </p>

                      <div className="flex justify-between items-center text-sm text-gray-500 mb-4">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {course.students?.toLocaleString() || 0}
                          </div>
                          <div className="flex items-center gap-1">
                            <DollarSign className="w-4 h-4" />
                            <span className="font-bold text-primary">
                              ${course.price || 0}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="card-actions justify-between">
                        <Link
                          to={`/courses/${course._id}`}
                          className="btn btn-ghost btn-sm gap-2"
                        >
                          <Eye className="w-4 h-4" />
                          View
                        </Link>
                        <div className="flex gap-2">
                          <Link
                            to={`/update-course/${course._id}`}
                            className="btn btn-outline btn-sm gap-2"
                          >
                            <Edit3 className="w-4 h-4" />
                            Edit
                          </Link>
                          <button
                            onClick={() =>
                              handleDelete(course._id, course.title)
                            }
                            disabled={deleteMutation.isLoading}
                            className="btn btn-error btn-sm gap-2"
                          >
                            {deleteMutation.isLoading ? (
                              <LoadingSpinner size="sm" />
                            ) : (
                              <>
                                <Trash2 className="w-4 h-4" />
                                Delete
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Desktop Table View */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="hidden lg:block"
            >
              <div className="bg-base-200 rounded-2xl shadow overflow-hidden border border-base-300">
                <table className="table table-zebra w-full">
                  <thead>
                    <tr className="bg-base-300">
                      <th className="text-lg">Course</th>
                      <th>Category</th>
                      <th>Students</th>
                      <th>Rating</th>
                      <th>Price</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <AnimatePresence>
                      {filteredAndSortedCourses.map((course, index) => (
                        <motion.tr
                          key={course._id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ delay: index * 0.05 }}
                          className="hover:bg-base-300 transition-colors"
                        >
                          <td>
                            <div className="flex items-center gap-4">
                              <div className="avatar">
                                <div className="mask mask-squircle w-14 h-14">
                                  <img
                                    src={
                                      course.image ||
                                      "https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=400&h=250&fit=crop"
                                    }
                                    alt={course.title}
                                    className="object-cover"
                                    onError={(e) => {
                                      e.target.src =
                                        "https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=400&h=250&fit=crop";
                                    }}
                                  />
                                </div>
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="font-bold line-clamp-1 text-lg">
                                  {course.title}
                                </div>
                                <div className="text-sm opacity-70 line-clamp-1">
                                  {course.description}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td>
                            <span className="badge badge-outline badge-lg">
                              {getCategoryLabel(course.category)}
                            </span>
                          </td>
                          <td>
                            <div className="flex items-center gap-2">
                              <Users className="w-4 h-4" />
                              <span className="font-semibold">
                                {course.students?.toLocaleString() || 0}
                              </span>
                            </div>
                          </td>
                          <td>
                            <div className="flex items-center gap-2">
                              <Star
                                className={`w-4 h-4 fill-current ${getProgressColor(
                                  course.rating
                                )}`}
                              />
                              <span
                                className={`font-semibold ${getProgressColor(
                                  course.rating
                                )}`}
                              >
                                {course.rating?.toFixed(1) || "0.0"}
                              </span>
                            </div>
                          </td>
                          <td>
                            <div className="flex items-center gap-2">
                              <DollarSign className="w-4 h-4 text-primary" />
                              <span className="font-bold text-primary text-lg">
                                ${course.price || 0}
                              </span>
                            </div>
                          </td>
                          <td>{getStatusBadge(course)}</td>
                          <td>
                            <div className="flex gap-2">
                              <Link
                                to={`/courses/${course._id}`}
                                className="btn btn-ghost btn-sm gap-2"
                                title="View Course"
                              >
                                <Eye className="w-4 h-4" />
                              </Link>
                              <Link
                                to={`/update-course/${course._id}`}
                                className="btn btn-outline btn-sm gap-2"
                                title="Edit Course"
                              >
                                <Edit3 className="w-4 h-4" />
                              </Link>
                              <button
                                onClick={() =>
                                  handleDelete(course._id, course.title)
                                }
                                disabled={deleteMutation.isLoading}
                                className="btn btn-error btn-sm gap-2"
                                title="Delete Course"
                              >
                                {deleteMutation.isLoading ? (
                                  <LoadingSpinner size="sm" />
                                ) : (
                                  <Trash2 className="w-4 h-4" />
                                )}
                              </button>
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
};

export default MyCourses;
