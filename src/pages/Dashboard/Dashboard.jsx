import { motion } from "framer-motion";
import { useAuth } from "../../contexts/AuthContext";
import { Link } from "react-router-dom";

const Dashboard = () => {
  const { user } = useAuth();

  const dashboardCards = [
    {
      title: "My Courses",
      description: "View and manage your created courses",
      link: "/my-courses",
      icon: "📚",
      color: "bg-blue-500",
    },
    {
      title: "Add New Course",
      description: "Create and publish a new course",
      link: "/add-course",
      icon: "➕",
      color: "bg-green-500",
    },
    {
      title: "Enrolled Courses",
      description: "View courses you are enrolled in",
      link: "/my-courses",
      icon: "🎓",
      color: "bg-purple-500",
    },
    {
      title: "Browse Courses",
      description: "Explore all available courses",
      link: "/courses",
      icon: "🔍",
      color: "bg-orange-500",
    },
  ];

  return (
    <div className="min-h-screen bg-base-100 py-8">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-4">
            Welcome back, {user?.displayName || "Instructor"}!
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Manage your courses and track your progress
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {dashboardCards.map((card, index) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.05 }}
              className="card bg-base-200 shadow-xl hover:shadow-2xl transition-all duration-300"
            >
              <div className="card-body text-center">
                <div
                  className={`text-4xl mb-4 ${card.color} w-16 h-16 rounded-full flex items-center justify-center mx-auto text-white`}
                >
                  {card.icon}
                </div>
                <h3 className="card-title justify-center text-lg font-semibold">
                  {card.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {card.description}
                </p>
                <div className="card-actions justify-center mt-4">
                  <Link to={card.link} className="btn btn-primary btn-sm">
                    Go
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="bg-base-200 rounded-lg p-6"
        >
          <h2 className="text-2xl font-bold mb-4 text-center">Quick Stats</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="stat">
              <div className="stat-value text-primary">0</div>
              <div className="stat-desc">Courses Created</div>
            </div>
            <div className="stat">
              <div className="stat-value text-secondary">0</div>
              <div className="stat-desc">Students Enrolled</div>
            </div>
            <div className="stat">
              <div className="stat-value text-accent">0</div>
              <div className="stat-desc">Courses Enrolled</div>
            </div>
            <div className="stat">
              <div className="stat-value text-info">0%</div>
              <div className="stat-desc">Completion Rate</div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
