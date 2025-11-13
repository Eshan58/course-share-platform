import { useState, useEffect } from "react";
import { courseAPI } from "../../services/api";

const PopularCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPopularCourses();
  }, []);

  const loadPopularCourses = async () => {
    try {
      const result = await courseAPI.getAllCourses({
        featured: "true",
        limit: 6,
      });

      if (result.success) {
        setCourses(result.courses);
      }
    } catch (error) {
      console.error("Error loading popular courses:", error);
      // Silently fail - don't show error for popular courses section
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="py-12 bg-base-200">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8">
            Popular Courses
          </h2>
          <div className="flex justify-center">
            <div className="loading loading-spinner loading-lg"></div>
          </div>
        </div>
      </section>
    );
  }

  if (courses.length === 0) {
    return null; // Don't show section if no courses
  }

  return (
    <section className="py-12 bg-base-200">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-8">Popular Courses</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <div
              key={course._id || course.id}
              className="card bg-base-100 shadow-lg"
            >
              <figure className="h-48">
                <img
                  src={course.image}
                  alt={course.title}
                  className="w-full h-full object-cover"
                />
              </figure>
              <div className="card-body">
                <h3 className="card-title">{course.title}</h3>
                <p className="text-gray-600 line-clamp-2">
                  {course.description}
                </p>
                <div className="card-actions justify-between items-center mt-4">
                  <div className="font-bold text-primary">${course.price}</div>
                  <button className="btn btn-primary btn-sm">Enroll Now</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PopularCourses;
