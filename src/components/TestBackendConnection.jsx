import React, { useState, useEffect } from "react";
import { healthCheck, courseAPI } from "../services/api";

const TestBackendConnection = () => {
  const [health, setHealth] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    testConnection();
  }, []);

  const testConnection = async () => {
    try {
      setLoading(true);

      // Test health endpoint--
      const healthResponse = await healthCheck();
      setHealth(healthResponse);

      // Test courses endpoint---
      const coursesResponse = await courseAPI.getAllCourses();
      if (coursesResponse.success) {
        setCourses(coursesResponse.courses);
      }
    } catch (error) {
      // console.error("Backend connection test failed:", error);
      setHealth({ message: "Connection failed", error: error.message });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-4 bg-blue-100 rounded-lg">
        <p>Testing backend connection...</p>
      </div>
    );
  }

  return (
    <div className="p-4 bg-base-200 rounded-lg space-y-4">
      <h3 className="text-lg font-bold">Backend Connection Test</h3>

      <div className="p-3 bg-green-100 rounded">
        <p className="font-semibold">Health Check:</p>
        <p>{health?.message || "No response"}</p>
        <p className="text-sm">Database: {health?.database || "Unknown"}</p>
      </div>

      <div className="p-3 bg-blue-100 rounded">
        <p className="font-semibold">Courses Loaded: {courses.length}</p>
        {courses.slice(0, 3).map((course) => (
          <div key={course._id} className="text-sm mt-2 p-2 bg-white rounded">
            {course.title} - ${course.price}
          </div>
        ))}
        {courses.length > 3 && (
          <p className="text-sm">... and {courses.length - 3} more</p>
        )}
      </div>

      <button onClick={testConnection} className="btn btn-sm btn-primary">
        Test Again
      </button>
    </div>
  );
};

export default TestBackendConnection;
