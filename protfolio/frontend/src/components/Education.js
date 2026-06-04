import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { GraduationCap, Calendar, Award } from 'lucide-react';
import { portfolioAPI } from '../services/api';

const Education = () => {
  const [education, setEducation] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEducationAndLanguages();
  }, []);

  const fetchEducationAndLanguages = async () => {
    try {
      const [eduResponse, langResponse] = await Promise.all([
        portfolioAPI.getEducation(),
        portfolioAPI.getLanguages()
      ]);
      setEducation(eduResponse.data);
      setLanguages(langResponse.data);
    } catch (error) {
      console.error('Error fetching education and languages:', error);
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

  const texts = {
    title: "Education",
    languagesKnown: "Languages Known"
  };

  return (
    <section id="education" className="py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-blue-600 via-violet-600 to-cyan-500 bg-clip-text text-transparent">
              {texts.title}
            </span>
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-blue-600 to-violet-600 mx-auto rounded-full" />
        </motion.div>

        <div className="relative">
          {/* Timeline Line */}
          <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-gradient-to-b from-blue-500 via-violet-500 to-cyan-500" />

          <div className="space-y-12">
            {education.map((edu, index) => (
              <motion.div
                key={edu.id}
                initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                className={`relative flex items-center ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}
              >
                {/* Content Card */}
                <div className={`w-full md:w-5/12 ${index % 2 === 0 ? 'md:pr-12' : 'md:pl-12'}`}>
                  <motion.div
                    whileHover={{ scale: 1.05, y: -5 }}
                    className="group p-6 bg-white/50 dark:bg-gray-800/50 backdrop-blur-lg rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 hover:shadow-2xl transition-all duration-300"
                  >
                    <div className="flex items-start space-x-4">
                      <div className="p-3 bg-gradient-to-br from-blue-500 to-violet-500 rounded-lg group-hover:scale-110 transition-transform duration-300">
                        <GraduationCap className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1 space-y-2">
                        <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 group-hover:text-blue-600 dark:group-hover:text-cyan-400 transition-colors duration-300">
                          {edu.degree}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 font-medium">{edu.institution}</p>
                        
                        <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-500">
                          <Calendar className="w-4 h-4" />
                          <span>{edu.duration}</span>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Award className="w-4 h-4 text-blue-600 dark:text-cyan-400" />
                          <span className="text-blue-600 dark:text-cyan-400 font-bold">{edu.score}</span>
                        </div>
                        
                        <span className="inline-block px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-cyan-400 rounded-full text-xs font-semibold border border-blue-200 dark:border-blue-800">
                          {edu.status}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                </div>

                {/* Timeline Dot */}
                <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2 w-6 h-6 bg-gradient-to-r from-blue-500 to-violet-500 rounded-full border-4 border-white dark:border-gray-900 shadow-lg z-10" />

                {/* Empty Space for alternate layout */}
                <div className="hidden md:block w-5/12" />
              </motion.div>
            ))}
          </div>
        </div>

        {/* Languages Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-20 p-8 bg-white/50 dark:bg-gray-800/50 backdrop-blur-lg rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700"
        >
          <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-6 text-center">{texts.languagesKnown}</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {languages.map((lang, index) => (
              <motion.div
                key={lang.id}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.05 }}
                className="p-4 bg-gradient-to-br from-blue-100 to-violet-100 dark:from-blue-900/30 dark:to-violet-900/30 rounded-lg text-center border border-blue-200 dark:border-blue-800"
              >
                <p className="text-gray-800 dark:text-gray-200 font-semibold">{lang.name}</p>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  {lang.proficiency}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Education;
