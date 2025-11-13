import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

const Home = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-base-100">
      {/* Hero Section */}
      <section className="hero min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-gray-900 dark:to-gray-800">
        <div className="hero-content text-center">
          <div className="max-w-4xl">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-5xl md:text-6xl font-bold text-gray-800 dark:text-white mb-6"
            >
              Learn, Share, Grow
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-xl text-gray-600 dark:text-gray-300 mb-8"
            >
              Join thousands of learners and instructors on our platform.
              Discover amazing courses or share your knowledge with the world.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              {user ? (
                <>
                  <Link to="/courses" className="btn btn-primary btn-lg">
                    Browse Courses
                  </Link>
                  <Link to="/add-course" className="btn btn-outline btn-lg">
                    Create Course
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/register" className="btn btn-primary btn-lg">
                    Get Started
                  </Link>
                  <Link to="/courses" className="btn btn-outline btn-lg">
                    Explore Courses
                  </Link>
                </>
              )}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-base-100">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 dark:text-white mb-4">
              Why Choose CourseShare?
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Our platform offers everything you need to learn and teach
              effectively.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Learn Anything",
                description:
                  "Access thousands of courses across all categories and skill levels.",
                icon: "🎓",
              },
              {
                title: "Teach Your Way",
                description:
                  "Share your expertise and build your own courses with our easy-to-use tools.",
                icon: "👨‍🏫",
              },
              {
                title: "Community Driven",
                description:
                  "Join a vibrant community of learners and instructors from around the world.",
                icon: "🌍",
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="card bg-base-200 hover:shadow-xl transition-shadow duration-300"
              >
                <div className="card-body text-center">
                  <div className="text-4xl mb-4">{feature.icon}</div>
                  <h3 className="card-title justify-center text-xl font-bold mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
