import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const Hero = () => {
  return (
    <section className="hero min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="hero-content text-center">
        <div className="max-w-4xl">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-5xl md:text-6xl font-bold text-gray-800 dark:text-white mb-6"
          >
            Learn Without
            <span className="text-blue-600 dark:text-blue-400 block">Limits</span>
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto"
          >
            Join thousands of students mastering new skills with our comprehensive 
            course platform. Learn from industry experts and advance your career.
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link to="/courses" className="btn btn-primary btn-lg px-8">
              Explore Courses
            </Link>
            <Link to="/register" className="btn btn-outline btn-lg px-8">
              Start Learning Free
            </Link>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-8 text-center"
          >
            <div>
              <div className="stat-value text-primary">10K+</div>
              <div className="stat-desc">Students</div>
            </div>
            <div>
              <div className="stat-value text-secondary">500+</div>
              <div className="stat-desc">Courses</div>
            </div>
            <div>
              <div className="stat-value text-accent">100+</div>
              <div className="stat-desc">Instructors</div>
            </div>
            <div>
              <div className="stat-value text-info">95%</div>
              <div className="stat-desc">Success Rate</div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;