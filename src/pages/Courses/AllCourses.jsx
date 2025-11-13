import { useState, useEffect, useMemo, useCallback } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { courseAPI } from "../../services/api";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import BuyNowButton from "../Courses/BuyNowButton";
import { useEnrollment } from "../../contexts/EnrollmentContext";
import { useAuth } from "../../contexts/AuthContext";
import {
  Search,
  Filter,
  X,
  Star,
  Users,
  Clock,
  BookOpen,
  TrendingUp,
  Calendar,
  Award,
  Zap,
  RefreshCw,
  CheckCircle,
  Eye,
  BarChart3,
} from "lucide-react";

// CourseCardSkeleton component for loading states
const CourseCardSkeleton = () => (
  <div className="card bg-base-200 shadow-xl animate-pulse">
    <div className="h-48 bg-base-300 rounded-t-xl"></div>
    <div className="card-body space-y-3">
      <div className="flex justify-between">
        <div className="h-4 bg-base-300 rounded w-20"></div>
        <div className="h-4 bg-base-300 rounded w-16"></div>
      </div>
      <div className="h-6 bg-base-300 rounded w-3/4"></div>
      <div className="h-4 bg-base-300 rounded w-full"></div>
      <div className="h-4 bg-base-300 rounded w-2/3"></div>
      <div className="flex justify-between items-center pt-2">
        <div className="h-8 bg-base-300 rounded w-20"></div>
        <div className="h-8 bg-base-300 rounded w-16"></div>
      </div>
    </div>
  </div>
);

// Error Boundary Component
const ErrorState = ({ error, onRetry, onReload }) => (
  <div className="min-h-screen bg-base-100 flex items-center justify-center px-4">
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center max-w-md w-full"
    >
      <div className="text-6xl mb-6">😕</div>
      <h1 className="text-2xl font-bold text-error mb-4">
        {error?.includes("Connection")
          ? "Connection Failed"
          : "Failed to Load Courses"}
      </h1>
      <p className="text-gray-600 mb-6 leading-relaxed">
        {error ||
          "We couldn't load the courses. Please check your connection and try again."}
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
        <button onClick={onReload} className="btn btn-outline gap-2">
          Reload Page
        </button>
      </div>
    </motion.div>
  </div>
);

// Empty State Component
const EmptyState = ({
  hasCourses,
  hasActiveFilters,
  onClearFilters,
  searchTerm,
  filter,
}) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="text-center py-12"
  >
    <div className="text-6xl mb-4">{hasCourses ? "🔍" : "📚"}</div>
    <h3 className="text-2xl font-semibold text-gray-600 dark:text-gray-400 mb-2">
      {hasCourses ? "No courses found" : "No courses available"}
    </h3>
    <p className="text-gray-500 dark:text-gray-500 mb-6 max-w-md mx-auto">
      {hasCourses
        ? "Try adjusting your search or filter criteria to find what you're looking for."
        : "There are no courses available at the moment. Please check back later."}
    </p>
    {hasActiveFilters && (
      <button onClick={onClearFilters} className="btn btn-primary gap-2">
        <X className="w-4 h-4" />
        Clear All Filters
      </button>
    )}
  </motion.div>
);

const AllCourses = () => {
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sortBy, setSortBy] = useState("popular");
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState([0, 500]);
  const [levelFilter, setLevelFilter] = useState("all");
  const [durationFilter, setDurationFilter] = useState("all");
  const [viewMode, setViewMode] = useState("grid"); // 'grid' or 'list'

  const { enrollments, enrollmentCount } = useEnrollment();
  const { user } = useAuth();

  // Constants and configuration
  const categories = useMemo(
    () => [
      {
        value: "all",
        label: "All Courses",
        icon: "📚",
        color: "bg-gradient-to-r from-blue-500 to-purple-600",
      },
      {
        value: "web-development",
        label: "Web Development",
        icon: "💻",
        color: "bg-gradient-to-r from-green-500 to-blue-600",
      },
      {
        value: "data-science",
        label: "Data Science",
        icon: "📊",
        color: "bg-gradient-to-r from-purple-500 to-pink-600",
      },
      {
        value: "design",
        label: "Design",
        icon: "🎨",
        color: "bg-gradient-to-r from-pink-500 to-red-600",
      },
      {
        value: "mobile",
        label: "Mobile Development",
        icon: "📱",
        color: "bg-gradient-to-r from-orange-500 to-yellow-600",
      },
      {
        value: "marketing",
        label: "Marketing",
        icon: "📈",
        color: "bg-gradient-to-r from-teal-500 to-green-600",
      },
      {
        value: "business",
        label: "Business",
        icon: "💼",
        color: "bg-gradient-to-r from-indigo-500 to-purple-600",
      },
      {
        value: "programming",
        label: "Programming",
        icon: "⚡",
        color: "bg-gradient-to-r from-yellow-500 to-orange-600",
      },
    ],
    []
  );

  const sortOptions = useMemo(
    () => [
      { value: "popular", label: "Most Popular", icon: TrendingUp },
      { value: "newest", label: "Newest First", icon: Calendar },
      { value: "price-low", label: "Price: Low to High", icon: Award },
      { value: "price-high", label: "Price: High to Low", icon: Zap },
      { value: "rating", label: "Highest Rated", icon: Star },
      { value: "duration", label: "Shortest Duration", icon: Clock },
    ],
    []
  );

  const levelOptions = useMemo(
    () => [
      { value: "all", label: "All Levels" },
      { value: "beginner", label: "Beginner" },
      { value: "intermediate", label: "Intermediate" },
      { value: "advanced", label: "Advanced" },
    ],
    []
  );

  const durationOptions = useMemo(
    () => [
      { value: "all", label: "Any Duration" },
      { value: "short", label: "Short (< 4 weeks)" },
      { value: "medium", label: "Medium (4-8 weeks)" },
      { value: "long", label: "Long (> 8 weeks)" },
    ],
    []
  );

  // Debounce search with improved cleanup
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Test connection with improved error handling
  const { data: connectionTest, error: connectionError } = useQuery({
    queryKey: ["connection-test"],
    queryFn: async () => {
      try {
        const data = await courseAPI.testConnection();
        // console.log("Connection test successful:", data);
        return data;
      } catch (error) {
        // console.error("Connection test failed:", error);
        throw new Error(
          "Cannot connect to the server. Please make sure your backend server is running."
        );
      }
    },
    retry: 2,
    retryDelay: 1000,
    staleTime: 5 * 60 * 1000,
  });

  // Fetch courses with improved error handling and caching
  const {
    data: response,
    isLoading,
    error: coursesError,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["courses", filter, debouncedSearch],
    queryFn: async () => {
      try {
        // console.log(" Fetching courses...");
        const data = await courseAPI.getAllCourses(1, 100);
        // console.log("Courses data received:", data);

        if (data && data.success !== false) {
          return data;
        } else {
          throw new Error(data?.message || "Failed to fetch courses");
        }
      } catch (error) {
        // console.error("Error fetching courses:", error);
        throw new Error(
          error.message || "Network error. Please check your connection."
        );
      }
    },
    retry: (failureCount, error) => {
      // Don't retry on 404 or auth errors
      if (error.message.includes("404") || error.message.includes("401")) {
        return false;
      }
      return failureCount < 2;
    },
    retryDelay: 1000,
    staleTime: 5 * 60 * 1000,
    enabled: !!connectionTest,
  });

  // Process courses data with fallback
  const courses = useMemo(() => {
    if (!response) return [];

    // console.log("Raw API response:", response);

    let rawCourses = [];

    if (Array.isArray(response)) {
      rawCourses = response;
    } else if (response.courses && Array.isArray(response.courses)) {
      rawCourses = response.courses;
    } else if (response.data && Array.isArray(response.data)) {
      rawCourses = response.data;
    } else if (response.success && response.data) {
      rawCourses = Array.isArray(response.data)
        ? response.data
        : [response.data];
    }

    // console.log("Processed courses:", rawCourses.length);

    // Fallback sample data for demonstration
    if (rawCourses.length === 0) {
      return [
        {
          _id: "1",
          title: "React Fundamentals",
          description:
            "Learn React from scratch with hands-on projects and build modern web applications",
          category: "web-development",
          price: 49,
          rating: 4.5,
          students: 1250,
          durationWeeks: 4,
          level: "beginner",
          image:
            "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=250&fit=crop",
          instructor: { name: "John Doe", verified: true },
          tags: ["React", "JavaScript", "Frontend", "Web Development"],
          createdAt: "2024-01-15",
        },
        {
          _id: "2",
          title: "Data Science with Python",
          description:
            "Master data analysis, visualization, and machine learning with Python",
          category: "data-science",
          price: 79,
          rating: 4.7,
          students: 890,
          durationWeeks: 8,
          level: "intermediate",
          image:
            "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=250&fit=crop",
          instructor: { name: "Sarah Wilson", verified: true },
          tags: ["Python", "Data Science", "Machine Learning", "AI"],
          createdAt: "2024-02-01",
        },
        {
          _id: "3",
          title: "UI/UX Design Masterclass",
          description:
            "Learn user-centered design principles and create stunning interfaces",
          category: "design",
          price: 59,
          rating: 4.8,
          students: 670,
          durationWeeks: 6,
          level: "beginner",
          image:
            "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=250&fit=crop",
          instructor: { name: "Mike Chen", verified: true },
          tags: ["UI/UX", "Design", "Figma", "Prototyping"],
          createdAt: "2024-01-20",
        },
      ];
    }

    return rawCourses;
  }, [response]);

  // Helper functions
  const getCategoryLabel = useCallback((category) => {
    if (!category) return "Uncategorized";
    return category
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }, []);

  const getCategoryIcon = useCallback(
    (category) => {
      const found = categories.find((cat) => cat.value === category);
      return found?.icon || "📚";
    },
    [categories]
  );

  // Action handlers
  const handleRetry = useCallback(() => {
    refetch();
  }, [refetch]);

  const handleReload = useCallback(() => {
    window.location.reload();
  }, []);

  const clearAllFilters = useCallback(() => {
    setSearchTerm("");
    setFilter("all");
    setLevelFilter("all");
    setDurationFilter("all");
    setPriceRange([0, 500]);
  }, []);

  // Filter and sort courses
  const filteredCourses = useMemo(() => {
    if (!courses.length) return [];

    return courses.filter((course) => {
      const matchesCategory = filter === "all" || course.category === filter;
      const matchesSearch =
        !debouncedSearch ||
        course.title?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        course.description
          ?.toLowerCase()
          .includes(debouncedSearch.toLowerCase()) ||
        course.instructor?.name
          ?.toLowerCase()
          .includes(debouncedSearch.toLowerCase()) ||
        course.tags?.some((tag) =>
          tag.toLowerCase().includes(debouncedSearch.toLowerCase())
        );

      const matchesLevel =
        levelFilter === "all" || course.level?.toLowerCase() === levelFilter;

      const matchesDuration =
        durationFilter === "all" ||
        (durationFilter === "short" &&
          (!course.durationWeeks || course.durationWeeks < 4)) ||
        (durationFilter === "medium" &&
          course.durationWeeks >= 4 &&
          course.durationWeeks <= 8) ||
        (durationFilter === "long" && course.durationWeeks > 8);

      const matchesPrice =
        (course.price || 0) >= priceRange[0] &&
        (course.price || 0) <= priceRange[1];

      return (
        matchesCategory &&
        matchesSearch &&
        matchesLevel &&
        matchesDuration &&
        matchesPrice
      );
    });
  }, [
    courses,
    filter,
    debouncedSearch,
    levelFilter,
    durationFilter,
    priceRange,
  ]);

  const sortedCourses = useMemo(() => {
    if (!filteredCourses.length) return [];

    return [...filteredCourses].sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        case "price-low":
          return (a.price || 0) - (b.price || 0);
        case "price-high":
          return (b.price || 0) - (a.price || 0);
        case "rating":
          return (b.rating || 0) - (a.rating || 0);
        case "duration":
          return (a.durationWeeks || 0) - (b.durationWeeks || 0);
        case "popular":
        default:
          return (b.students || 0) - (a.students || 0);
      }
    });
  }, [filteredCourses, sortBy]);

  // Enrollment and filter stats
  const enrolledCourseIds = useMemo(
    () => enrollments.map((e) => e.courseId || e.course?._id),
    [enrollments]
  );

  const enrolledCoursesCount = useMemo(
    () =>
      courses.filter((course) =>
        enrolledCourseIds.includes(course._id || course.id)
      ).length,
    [courses, enrolledCourseIds]
  );

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filter !== "all") count++;
    if (debouncedSearch) count++;
    if (levelFilter !== "all") count++;
    if (durationFilter !== "all") count++;
    if (priceRange[0] > 0 || priceRange[1] < 500) count++;
    return count;
  }, [filter, debouncedSearch, levelFilter, durationFilter, priceRange]);

  const hasActiveFilters = useMemo(
    () => activeFiltersCount > 0,
    [activeFiltersCount]
  );

  // Debug effect
  useEffect(() => {
    // console.log(" DEBUG - Courses data:", {
    //   courses: courses.length,
    //   filteredCourses: filteredCourses.length,
    //   sortedCourses: sortedCourses.length,
    //   isLoading,
    //   error: coursesError,
    // });
  }, [courses, filteredCourses, sortedCourses, isLoading, coursesError]);

  // Error states
  if (connectionError) {
    return (
      <ErrorState
        error={connectionError.message}
        onRetry={handleRetry}
        onReload={handleReload}
      />
    );
  }

  if (coursesError && !courses.length) {
    return (
      <ErrorState
        error={coursesError.message}
        onRetry={handleRetry}
        onReload={handleReload}
      />
    );
  }

  // Loading state -
  if (isLoading) {
    return (
      <div className="min-h-screen bg-base-100 py-8">
        <div className="container mx-auto px-4">
          {/* Skeleton Header */}
          <div className="text-center mb-12 animate-pulse">
            <div className="h-12 bg-base-300 rounded-lg max-w-2xl mx-auto mb-4"></div>
            <div className="h-6 bg-base-300 rounded-lg max-w-xl mx-auto mb-8"></div>
            <div className="flex flex-wrap justify-center gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 bg-base-300 rounded-lg w-32"></div>
              ))}
            </div>
          </div>

          {/* Skeleton Course Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <CourseCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-100 py-8">
      <div className="container mx-auto px-4">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-800 dark:text-white mb-4">
            Explore Our Courses
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-6 leading-relaxed">
            Discover a wide range of courses designed by industry experts to
            help you achieve your learning goals and advance your career.
          </p>

          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-4 mb-6">
            <div className="stat bg-base-200 rounded-2xl px-6 py-4 border border-base-300">
              <div className="stat-title text-sm opacity-70 flex items-center gap-1">
                <BarChart3 className="w-4 h-4" />
                Total Courses
              </div>
              <div className="stat-value text-2xl text-primary">
                {courses.length}
              </div>
            </div>

            {user && (
              <div className="stat bg-primary text-primary-content rounded-2xl px-6 py-4 border border-primary">
                <div className="stat-title text-sm opacity-90 flex items-center gap-1">
                  <BookOpen className="w-4 h-4" />
                  Your Enrollments
                </div>
                <div className="stat-value text-2xl">{enrollmentCount}</div>
              </div>
            )}

            <div className="stat bg-base-200 rounded-2xl px-6 py-4 border border-base-300">
              <div className="stat-title text-sm opacity-70 flex items-center gap-1">
                <Eye className="w-4 h-4" />
                Now Showing
              </div>
              <div className="stat-value text-2xl text-secondary">
                {sortedCourses.length}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          {user && (
            <motion.div
              className="flex flex-wrap gap-3 justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Link to="/my-courses" className="btn btn-primary gap-2">
                <BookOpen className="w-4 h-4" />
                My Courses ({enrollmentCount})
              </Link>
              {enrollmentCount > 0 && (
                <Link to="/my-courses" className="btn btn-outline gap-2">
                  Continue Learning
                  <Zap className="w-4 h-4" />
                </Link>
              )}
            </motion.div>
          )}
        </motion.div>

        {/* Search and Filter Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8 space-y-6"
        >
          {/* Main Search and Controls */}
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            {/* Search Input */}
            <div className="flex-1 w-full lg:max-w-lg">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search courses, instructors, topics..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input input-bordered w-full pl-12 pr-12 py-3 text-lg focus:input-primary transition-all"
                  disabled={isFetching}
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>

            {/* Controls */}
            <div className="flex gap-3 w-full lg:w-auto">
              {/* View Mode Toggle */}
              <div className="btn-group">
                <button
                  className={`btn btn-sm ${
                    viewMode === "grid" ? "btn-active" : ""
                  }`}
                  onClick={() => setViewMode("grid")}
                >
                  Grid
                </button>
                <button
                  className={`btn btn-sm ${
                    viewMode === "list" ? "btn-active" : ""
                  }`}
                  onClick={() => setViewMode("list")}
                >
                  List
                </button>
              </div>

              {/* Sort Dropdown */}
              <div className="flex-1 lg:flex-none">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="select select-bordered w-full focus:select-primary"
                  disabled={isFetching}
                >
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Filter Toggle */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowFilters(!showFilters)}
                className={`btn gap-2 ${
                  showFilters ? "btn-primary" : "btn-outline"
                }`}
              >
                <Filter className="w-4 h-4" />
                Filters
                {activeFiltersCount > 0 && (
                  <span className="badge badge-primary badge-sm">
                    {activeFiltersCount}
                  </span>
                )}
              </motion.button>
            </div>
          </div>

          {/* Advanced Filters */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-base-200 rounded-2xl p-6 border border-base-300 space-y-6 overflow-hidden"
              >
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Advanced Filters</h3>
                  <div className="flex gap-2">
                    <button
                      onClick={clearAllFilters}
                      className="btn btn-ghost btn-sm gap-2"
                    >
                      <X className="w-4 h-4" />
                      Clear All
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Price Range */}
                  <div className="space-y-3">
                    <label className="label">
                      <span className="label-text font-medium">
                        Price Range
                      </span>
                      <span className="label-text-alt">
                        ${priceRange[0]} - ${priceRange[1]}
                      </span>
                    </label>
                    <div className="space-y-2">
                      <input
                        type="range"
                        min="0"
                        max="500"
                        value={priceRange[1]}
                        onChange={(e) =>
                          setPriceRange([
                            priceRange[0],
                            parseInt(e.target.value),
                          ])
                        }
                        className="range range-primary range-sm"
                      />
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>$0</span>
                        <span>$500</span>
                      </div>
                    </div>
                  </div>

                  {/* Level Filter */}
                  <div className="space-y-3">
                    <label className="label">
                      <span className="label-text font-medium">
                        Difficulty Level
                      </span>
                    </label>
                    <select
                      value={levelFilter}
                      onChange={(e) => setLevelFilter(e.target.value)}
                      className="select select-bordered w-full"
                    >
                      {levelOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Duration Filter */}
                  <div className="space-y-3">
                    <label className="label">
                      <span className="label-text font-medium">
                        Course Duration
                      </span>
                    </label>
                    <select
                      value={durationFilter}
                      onChange={(e) => setDurationFilter(e.target.value)}
                      className="select select-bordered w-full"
                    >
                      {durationOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2 justify-center">
            {categories.map((category) => (
              <motion.button
                key={category.value}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setFilter(category.value)}
                className={`btn btn-sm ${
                  filter === category.value ? "btn-primary" : "btn-outline"
                } transition-all duration-200 gap-2`}
                disabled={isFetching}
              >
                <span className="text-lg">{category.icon}</span>
                {category.label}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Results Count and Active Filters */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
        >
          <div className="space-y-2">
            <p className="text-gray-600 dark:text-gray-400">
              Showing <strong>{sortedCourses.length}</strong> of{" "}
              <strong>{courses.length}</strong> courses
              {debouncedSearch && ` for "${debouncedSearch}"`}
              {filter !== "all" &&
                ` in ${categories.find((c) => c.value === filter)?.label}`}
            </p>

            {/* Active Filters */}
            {hasActiveFilters && (
              <div className="flex flex-wrap gap-2">
                {debouncedSearch && (
                  <span className="badge badge-outline gap-2">
                    Search: "{debouncedSearch}"
                    <button
                      onClick={() => setSearchTerm("")}
                      className="text-xs hover:text-error"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {filter !== "all" && (
                  <span className="badge badge-outline gap-2">
                    Category:{" "}
                    {categories.find((c) => c.value === filter)?.label}
                    <button
                      onClick={() => setFilter("all")}
                      className="text-xs hover:text-error"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {levelFilter !== "all" && (
                  <span className="badge badge-outline gap-2">
                    Level:{" "}
                    {levelOptions.find((l) => l.value === levelFilter)?.label}
                    <button
                      onClick={() => setLevelFilter("all")}
                      className="text-xs hover:text-error"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {durationFilter !== "all" && (
                  <span className="badge badge-outline gap-2">
                    Duration:{" "}
                    {
                      durationOptions.find((d) => d.value === durationFilter)
                        ?.label
                    }
                    <button
                      onClick={() => setDurationFilter("all")}
                      className="text-xs hover:text-error"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {(priceRange[0] > 0 || priceRange[1] < 500) && (
                  <span className="badge badge-outline gap-2">
                    Price: ${priceRange[0]} - ${priceRange[1]}
                    <button
                      onClick={() => setPriceRange([0, 500])}
                      className="text-xs hover:text-error"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
              </div>
            )}
          </div>

          <div className="flex gap-2">
            {(coursesError || filteredCourses.length === 0) && (
              <button
                onClick={handleRetry}
                className="btn btn-sm btn-outline gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
            )}
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="btn btn-sm btn-ghost gap-2"
              >
                <X className="w-4 h-4" />
                Clear All
              </button>
            )}
          </div>
        </motion.div>

        {/* Courses Grid/List */}
        {sortedCourses.length === 0 ? (
          <EmptyState
            hasCourses={courses.length > 0}
            hasActiveFilters={hasActiveFilters}
            onClearFilters={clearAllFilters}
            searchTerm={searchTerm}
            filter={filter}
          />
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className={`
              ${
                viewMode === "grid"
                  ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                  : "space-y-4"
              }
            `}
          >
            {sortedCourses.map((course, index) => (
              <motion.div
                key={course._id || course.id || `course-${index}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className={`
                  card bg-base-200 shadow-xl hover:shadow-2xl transition-all duration-300 group cursor-pointer
                  ${viewMode === "list" ? "card-side" : ""}
                `}
              >
                <figure
                  className={`${
                    viewMode === "list" ? "w-1/3" : "px-4 pt-4"
                  } relative`}
                >
                  <img
                    src={
                      course.image ||
                      course.thumbnail ||
                      "https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=400&h=250&fit=crop"
                    }
                    alt={course.title}
                    className={`
                      ${
                        viewMode === "list"
                          ? "h-full rounded-l-xl"
                          : "rounded-xl h-48 w-full"
                      } 
                      object-cover group-hover:scale-105 transition-transform duration-300
                    `}
                    onError={(e) => {
                      e.target.src =
                        "https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=400&h=250&fit=crop";
                    }}
                  />

                  {/* Enrollment Badge */}
                  {enrolledCourseIds.includes(course._id || course.id) && (
                    <div className="absolute top-6 right-6">
                      <div className="badge badge-success badge-lg gap-2">
                        <CheckCircle className="w-4 h-4" />
                        Enrolled
                      </div>
                    </div>
                  )}

                  {/* Category Icon */}
                  <div className="absolute top-6 left-6">
                    <div className="bg-base-100 bg-opacity-90 rounded-lg p-2 shadow-lg">
                      <span className="text-xl">
                        {getCategoryIcon(course.category)}
                      </span>
                    </div>
                  </div>

                  {/* Price Badge */}
                  <div className="absolute bottom-4 right-4">
                    <div className="bg-primary text-primary-content px-3 py-1 rounded-full font-bold">
                      ${course.price || 0}
                    </div>
                  </div>
                </figure>

                <div
                  className={`card-body ${viewMode === "list" ? "w-2/3" : ""}`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="badge badge-primary badge-sm">
                      {getCategoryLabel(course.category)}
                    </span>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      <span className="text-sm font-medium">
                        {course.rating?.toFixed(1) || "4.5"}
                      </span>
                    </div>
                  </div>

                  <h3 className="card-title text-lg font-semibold line-clamp-2 group-hover:text-primary transition-colors">
                    <Link to={`/courses-details/${course._id || course.id}`}>
                      {course.title || "Untitled Course"}
                    </Link>
                  </h3>

                  <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                    <span className="font-medium">By</span>
                    {course.instructor?.name ||
                      course.instructorName ||
                      "Unknown Instructor"}
                    {course.instructor?.verified && (
                      <span className="badge badge-success badge-xs">✓</span>
                    )}
                  </p>

                  <p className="text-sm text-gray-500 dark:text-gray-500 line-clamp-2">
                    {course.description ||
                      course.shortDescription ||
                      "No description available"}
                  </p>

                  {/* Course Tags */}
                  {course.tags && course.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {course.tags.slice(0, 3).map((tag, tagIndex) => (
                        <span
                          key={tagIndex}
                          className="badge badge-outline badge-xs"
                        >
                          {tag}
                        </span>
                      ))}
                      {course.tags.length > 3 && (
                        <span className="badge badge-ghost badge-xs">
                          +{course.tags.length - 3} more
                        </span>
                      )}
                    </div>
                  )}

                  <div className="flex justify-between items-center text-sm text-gray-600 dark:text-gray-400 mb-4">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {course.duration || "Self-paced"}
                      {course.durationWeeks &&
                        ` • ${course.durationWeeks} weeks`}
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {(
                        course.students ||
                        course.enrollmentCount ||
                        0
                      ).toLocaleString()}
                    </div>
                  </div>

                  <div className="card-actions justify-between items-center">
                    <BuyNowButton course={course} />

                    <Link
                      to={`/courses-details/${course._id || course.id}`}
                      className="btn btn-ghost btn-sm"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Load More / Pagination */}
        {sortedCourses.length > 0 && sortedCourses.length < courses.length && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center mt-12"
          >
            <button className="btn btn-outline btn-wide gap-2">
              <RefreshCw className="w-4 h-4" />
              Load More Courses
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default AllCourses;
