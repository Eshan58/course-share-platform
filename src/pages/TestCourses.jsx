import { useState, useEffect } from "react";
import { courseAPI, healthCheck } from "../services/api";

const TestCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [connection, setConnection] = useState(null);
  const [health, setHealth] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    console.log("🔍 Starting connection test...");

    // Test health check
    const healthResult = await healthCheck();
    setHealth(healthResult);
    console.log("🏥 Health check:", healthResult);

    // Test connection
    const connectionTest = await testConnection();
    setConnection(connectionTest);
    console.log("🔗 Connection test:", connectionTest);

    // Test courses
    console.log("📚 Fetching courses...");
    const coursesResult = await courseAPI.getAllCourses();
    console.log("🎯 Courses result:", coursesResult);

    if (coursesResult.success) {
      setCourses(coursesResult.courses);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center">
            <div className="loading loading-spinner loading-lg text-primary"></div>
            <p className="mt-4 text-lg">
              Testing connection and loading courses...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">
          🔧 API Connection Test
        </h1>

        {/* Connection Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div
            className={`p-6 rounded-lg border-2 ${
              connection?.backend
                ? "border-green-200 bg-green-50"
                : "border-red-200 bg-red-50"
            }`}
          >
            <h2 className="text-xl font-semibold mb-2">🔗 Connection Status</h2>
            <pre className="text-sm whitespace-pre-wrap">
              {JSON.stringify(connection, null, 2)}
            </pre>
          </div>

          <div
            className={`p-6 rounded-lg border-2 ${
              health?.success
                ? "border-green-200 bg-green-50"
                : "border-red-200 bg-red-50"
            }`}
          >
            <h2 className="text-xl font-semibold mb-2">🏥 Health Check</h2>
            <pre className="text-sm whitespace-pre-wrap">
              {JSON.stringify(health, null, 2)}
            </pre>
          </div>
        </div>

        {/* Courses Section */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold">
              📚 Courses Found:{" "}
              <span className="text-blue-600">{courses.length}</span>
            </h2>
            <button onClick={loadData} className="btn btn-primary">
              🔄 Run Tests Again
            </button>
          </div>

          {courses.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-6xl mb-4">😕</div>
              <h3 className="text-xl font-semibold mb-2">No courses found</h3>
              <p className="text-gray-600 mb-4">This could mean:</p>
              <ul className="text-left list-disc list-inside text-gray-600 mb-6 max-w-md mx-auto">
                <li>Backend connection issues</li>
                <li>No courses in the database</li>
                <li>API endpoint not working</li>
              </ul>
              <button onClick={loadData} className="btn btn-primary">
                Try Again
              </button>
            </div>
          ) : (
            <div className="grid gap-4">
              {courses.map((course) => (
                <div
                  key={course._id || course.id}
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start gap-4">
                    <img
                      src={course.image}
                      alt={course.title}
                      className="w-20 h-20 object-cover rounded"
                      onError={(e) => {
                        e.target.src =
                          "https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=200";
                      }}
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{course.title}</h3>
                      <p className="text-gray-600 text-sm mt-1">
                        {course.description}
                      </p>
                      <div className="flex gap-4 mt-2 text-sm text-gray-500">
                        <span>💰 ${course.price}</span>
                        <span>📁 {course.category}</span>
                        <span>👤 {course.students} students</span>
                        <span>⭐ {course.rating}/5</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Debug Information */}
        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-3">🐛 Debug Information</h3>
          <div className="text-sm">
            <p>
              <strong>API Base URL:</strong> http://localhost:5000/api
            </p>
            <p>
              <strong>Expected Endpoints:</strong>
            </p>
            <ul className="list-disc list-inside ml-4">
              <li>
                <code>/health</code> - Server status
              </li>
              <li>
                <code>/courses</code> - All courses
              </li>
              <li>
                <code>/courses/instructor/username</code> - Instructor courses
              </li>
              <li>
                <code>/users</code> - User sync
              </li>
            </ul>
            <p className="mt-2">
              <strong>Check browser console (F12) for detailed logs</strong>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestCourses;
