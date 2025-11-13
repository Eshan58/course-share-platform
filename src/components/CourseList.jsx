import React, { useState, useEffect } from "react";
import { courseAPI } from "../services/api";

const CourseList = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      setLoading(true);
      const response = await courseAPI.getAllCourses();
      if (response.success) {
        setCourses(response.courses);
      }
    } catch (err) {
      setError("Failed to load courses");
      // console.error("Error loading courses:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return <div className="text-center py-8">Loading courses...</div>;
  if (error)
    return <div className="text-center py-8 text-red-500">{error}</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Available Courses</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => (
          <div key={course._id} className="card bg-base-200 shadow-xl">
            <figure>
              <img
                src={course.image}
                alt={course.title}
                className="w-full h-48 object-cover"
              />
            </figure>
            <div className="card-body">
              <h2 className="card-title">{course.title}</h2>
              <p className="text-base-content/70">{course.description}</p>
              <div className="flex justify-between items-center mt-4">
                <span className="badge badge-primary">{course.category}</span>
                <span className="font-bold">${course.price}</span>
              </div>
              <div className="card-actions justify-end mt-4">
                <button className="btn btn-primary">Enroll Now</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CourseList;
