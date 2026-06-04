import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Brain, Code, Cpu, Heart, Lightbulb, Users } from 'lucide-react';
import { portfolioAPI } from '../services/api';

const About = () => {
  const [about, setAbout] = useState(null);
  const [loading, setLoading] = useState(true);

  const qualityIcons = {
    Leadership: Users,
    Creativity: Lightbulb,
    'Problem-Solving': Brain,
    Teamwork: Users,
    'Quick Learner': Brain,
    'Innovative Thinking': Lightbulb
  };

  useEffect(() => {
    fetchAbout();
  }, []);

  const fetchAbout = async () => {
    try {
      const response = await portfolioAPI.getAbout();
      setAbout(response.data);
    } catch (error) {
      console.error('Error fetching about:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="py-20 px-4 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </section>
    );
  }

  if (!about) return null;

  return (
    <section id="about" className="py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-blue-600 via-violet-600 to-cyan-500 bg-clip-text text-transparent">
              About Me
            </span>
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-blue-600 to-violet-600 mx-auto rounded-full" />
        </motion.div>

        <div className="grid md:grid-cols-2 gap-12 items-start">
          {/* Description */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-6"
          >
            <div className="p-8 bg-white/50 dark:bg-gray-800/50 backdrop-blur-lg rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700">
              <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
                {about.description}
              </p>

              <div className="space-y-4">
                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 flex items-center space-x-2">
                  <Heart className="w-6 h-6 text-blue-600 dark:text-cyan-400" />
                  <span>My Interests</span>
                </h3>
                <div className="flex flex-wrap gap-2">
                  {about.interests.map((interest, index) => (
                    <motion.span
                      key={index}
                      initial={{ opacity: 0, scale: 0.8 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ scale: 1.05 }}
                      className="px-4 py-2 bg-gradient-to-r from-blue-100 to-violet-100 dark:from-blue-900/30 dark:to-violet-900/30 text-blue-700 dark:text-cyan-400 rounded-lg font-medium text-sm border border-blue-200 dark:border-blue-800"
                    >
                      {interest}
                    </motion.span>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Qualities */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="space-y-6"
          >
            <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-6">Key Qualities</h3>
            <div className="grid grid-cols-2 gap-4">
              {about.qualities.map((quality, index) => {
                const Icon = qualityIcons[quality] || Brain;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.05, y: -5 }}
                    className="p-6 bg-white/50 dark:bg-gray-800/50 backdrop-blur-lg rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 group hover:shadow-xl transition-all duration-300"
                  >
                    <Icon className="w-8 h-8 text-blue-600 dark:text-cyan-400 mb-3 group-hover:scale-110 transition-transform duration-300" />
                    <p className="text-gray-800 dark:text-gray-200 font-semibold">{quality}</p>
                  </motion.div>
                );
              })}
            </div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.6 }}
              className="grid grid-cols-3 gap-4 mt-8"
            >
              <div className="p-6 bg-gradient-to-br from-blue-500 to-violet-500 rounded-xl shadow-lg text-center text-white">
                <p className="text-3xl font-bold mb-1">9.04</p>
                <p className="text-sm font-medium opacity-90">CGPA</p>
              </div>
              <div className="p-6 bg-gradient-to-br from-violet-500 to-cyan-500 rounded-xl shadow-lg text-center text-white">
                <p className="text-3xl font-bold mb-1">3+</p>
                <p className="text-sm font-medium opacity-90">Projects</p>
              </div>
              <div className="p-6 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl shadow-lg text-center text-white">
                <p className="text-3xl font-bold mb-1">7</p>
                <p className="text-sm font-medium opacity-90">Languages</p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default About;
