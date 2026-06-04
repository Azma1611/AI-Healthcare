import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Code, Database, Globe, Cpu, Cloud, GitBranch } from 'lucide-react';
import { portfolioAPI } from '../services/api';

const Skills = () => {
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);

  const categoryIcons = {
    Programming: Code,
    'Web Development': Globe,
    Technologies: Cpu
  };

  useEffect(() => {
    fetchSkills();
  }, []);

  const fetchSkills = async () => {
    try {
      const response = await portfolioAPI.getSkills();
      setSkills(response.data);
    } catch (error) {
      console.error('Error fetching skills:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="py-20 px-4 flex items-center justify-center bg-gray-50/50 dark:bg-gray-900/50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </section>
    );
  }

  const categories = [...new Set(skills.map(skill => skill.category))];

  return (
    <section id="skills" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50/50 dark:bg-gray-900/50 relative overflow-hidden">
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
              Skills & Expertise
            </span>
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-blue-600 to-violet-600 mx-auto rounded-full" />
        </motion.div>

        <div className="space-y-12">
          {categories.map((category, catIndex) => {
            const Icon = categoryIcons[category] || Cpu;
            const categorySkills = skills.filter(skill => skill.category === category);

            return (
              <motion.div
                key={category}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: catIndex * 0.1 }}
                className="p-8 bg-white/50 dark:bg-gray-800/50 backdrop-blur-lg rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700"
              >
                <div className="flex items-center space-x-3 mb-6">
                  <Icon className="w-8 h-8 text-blue-600 dark:text-cyan-400" />
                  <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200">{category}</h3>
                </div>

                <div className="space-y-6">
                  {categorySkills.map((skill, index) => (
                    <motion.div
                      key={skill.id}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.05 }}
                      className="space-y-2"
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700 dark:text-gray-300 font-semibold">{skill.name}</span>
                        <span className="text-blue-600 dark:text-cyan-400 font-bold">{skill.level}%</span>
                      </div>
                      <div className="relative h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{ width: `${skill.level}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 1, delay: index * 0.05, ease: 'easeOut' }}
                          className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 via-violet-500 to-cyan-500 rounded-full shadow-lg"
                        >
                          <div className="absolute inset-0 bg-white/20 animate-pulse" />
                        </motion.div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Skills;
