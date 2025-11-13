import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Star,
  Users,
  Clock,
  BarChart3,
  PlayCircle,
  BookOpen,
  Heart,
  Share2,
  Eye,
  Zap,
} from "lucide-react";

const CourseCard = ({ course, onViewDetails }) => {
  const handleViewDetails = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onViewDetails) {
      onViewDetails(course);
    }
  };

  const handleEnroll = (e) => {
    e.preventDefault();
    e.stopPropagation();
    // console.log("Enrolling in course:", course._id)
    // Add enrollment logic here
  };

  const handleQuickView = (e) => {
    e.preventDefault();
    e.stopPropagation();
    // Add quick view logic here
    // console.log("Quick view:", course._id);
  };

  const handleAddToWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    // console.log("Add to wishlist:", course._id);
  };

  const handleShare = (e) => {
    e.preventDefault();
    e.stopPropagation();
    // console.log("Share course:", course._id);
  };

  // Calculate rating stars
  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(
          <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
        );
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
        );
      } else {
        stars.push(<Star key={i} className="w-3 h-3 text-gray-300" />);
      }
    }
    return stars;
  };

  // Format numbers
  const formatNumber = (num) => {
    if (!num) return "0";
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + "k";
    }
    return num.toString();
  };

  const {
    _id,
    title = "Untitled Course",
    description = "No description available",
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
    enrolledStudents = 0,
  } = course;

  const displayPrice = price === 0 || !price ? "FREE" : `$${price}`;
  const displayRating = rating ? rating.toFixed(1) : "New";
  const displayStudents = formatNumber(students || enrolledStudents);
  const displayLessons = lessons || 0;

  return (
    <motion.div
      className="group bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden transition-all duration-300 hover:-translate-y-1"
      whileHover={{ y: -4 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Course Image */}
      <div className="relative overflow-hidden">
        <img
          src={image || "/default-course-image.jpg"}
          alt={title}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            e.target.src =
              "https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=400";
          }}
        />

        {/* Overlay with quick actions */}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
          <div className="flex gap-2">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleQuickView}
              className="bg-white text-gray-900 p-2 rounded-full shadow-lg hover:shadow-xl transition-all"
              title="Quick View"
            >
              <Eye className="w-4 h-4" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleAddToWishlist}
              className="bg-white text-gray-900 p-2 rounded-full shadow-lg hover:shadow-xl transition-all"
              title="Add to Wishlist"
            >
              <Heart className="w-4 h-4" />
            </motion.button>
          </div>
        </div>

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {isFeatured && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-semibold px-2 py-1 rounded-full shadow-lg"
            >
              <Zap className="w-3 h-3 inline mr-1" />
              Featured
            </motion.span>
          )}
          {category && (
            <span className="bg-primary text-primary-content text-xs font-medium px-2 py-1 rounded-full shadow-lg">
              {category}
            </span>
          )}
        </div>

        {/* Share Button */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleShare}
          className="absolute top-3 right-3 bg-white text-gray-700 p-1.5 rounded-full shadow-lg hover:shadow-xl transition-all opacity-0 group-hover:opacity-100"
          title="Share Course"
        >
          <Share2 className="w-3 h-3" />
        </motion.button>
      </div>

      {/* Course Content */}
      <div className="p-5">
        {/* Instructor */}
        <div className="flex items-center gap-2 mb-3">
          <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white text-xs font-bold">
            {instructor.name?.charAt(0) || "U"}
          </div>
          <span className="text-xs text-gray-600 dark:text-gray-400">
            {instructor.name || "Unknown Instructor"}
          </span>
        </div>

        {/* Title */}
        <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-primary transition-colors">
          {title}
        </h3>

        {/* Description */}
        <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2 leading-relaxed">
          {description}
        </p>

        {/* Rating and Students */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              {renderStars(rating)}
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {displayRating}
              </span>
            </div>
            <span className="text-xs text-gray-500">•</span>
            <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
              <Users className="w-3 h-3" />
              {displayStudents}
            </div>
          </div>

          <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
            <BookOpen className="w-3 h-3" />
            {displayLessons} lessons
          </div>
        </div>

        {/* Course Stats */}
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-4">
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>{duration}</span>
          </div>
          <div className="flex items-center gap-1">
            <BarChart3 className="w-3 h-3" />
            <span
              className={`font-medium ${
                level === "Beginner"
                  ? "text-green-600"
                  : level === "Intermediate"
                  ? "text-yellow-600"
                  : level === "Advanced"
                  ? "text-red-600"
                  : "text-gray-600"
              }`}
            >
              {level}
            </span>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200 dark:border-gray-700 mb-4"></div>

        {/* Price and Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span
              className={`text-xl font-bold ${
                price === 0 ? "text-green-600" : "text-gray-900 dark:text-white"
              }`}
            >
              {displayPrice}
            </span>
            {price > 0 && (
              <span className="text-sm text-gray-500 line-through">
                ${(price * 1.2).toFixed(2)}
              </span>
            )}
          </div>

          <div className="flex gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleViewDetails}
              className="btn btn-outline btn-sm gap-1 text-xs"
            >
              <Eye className="w-3 h-3" />
              Details
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleEnroll}
              className={`btn btn-sm gap-1 text-xs ${
                price === 0 ? "btn-primary" : "btn-success"
              }`}
            >
              {price === 0 ? (
                <>
                  <PlayCircle className="w-3 h-3" />
                  Enroll
                </>
              ) : (
                <>
                  <BookOpen className="w-3 h-3" />
                  Buy Now
                </>
              )}
            </motion.button>
          </div>
        </div>

        {/* Progress bar for enrolled courses (optional) */}
        {course.progress !== undefined && (
          <div className="mt-3">
            <div className="flex justify-between text-xs text-gray-600 mb-1">
              <span>Progress</span>
              <span>{Math.round(course.progress)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div
                className="bg-green-600 h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${course.progress}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>

      {/* Hover effect border */}
      <div className="absolute inset-0 border-2 border-transparent group-hover:border-primary rounded-2xl transition-all duration-300 pointer-events-none"></div>
    </motion.div>
  );
};

export default CourseCard;
