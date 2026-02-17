import { useState } from 'react';
import { motion } from 'framer-motion';
import deobusVideo from '../../assets/deobus.mp4';

const VideoSection = () => {
  const [isPlaying, setIsPlaying] = useState(false);

  const handlePlayClick = () => {
    setIsPlaying(true);
  };

  return (
    <section className="py-14 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <p className="text-color2 font-semibold text-lg mb-2">DISCOVER</p>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Experience the Journey</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Watch how KCTrip transforms bus travel in Cameroon. Comfort, safety, and reliability in every journey.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative rounded-2xl overflow-hidden shadow-2xl"
        >
          <div className="relative aspect-video bg-gradient-to-br from-gray-800 to-gray-900">
            {!isPlaying ? (
              <>
                <div className="absolute inset-0 bg-black/40">
                  <img
                    src={"/src/assets/paysage.jpg"}
                    alt="Video Thumbnail"
                    className="w-full h-full object-cover"
                  />
                </div>

                <motion.button
                  onClick={handlePlayClick}
                  className="absolute inset-0 flex items-center justify-center group"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <motion.div
                    className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-2xl"
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    <svg className="w-12 h-12 text-color2 ml-2" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </motion.div>
                </motion.button>

                <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black/80 to-transparent">
                  <h3 className="text-white text-2xl font-bold mb-2">Our Story, Your Journey</h3>
                  <p className="text-white/90">See how we're making travel better for everyone in Cameroon</p>
                </div>
              </>
            ) : (
              <div className="relative aspect-video bg-black">
                <video
                  className="absolute inset-0 w-full h-full object-cover"
                  src={deobusVideo}
                  controls
                  autoPlay
                  title="KCTrip Video"
                >
                  Your browser does not support the video tag.
                </video>
              </div>
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12"
        >
          {[
            { icon: '🚌', label: 'Modern Fleet', value: '50+ Buses' },
            { icon: '🛡️', label: 'Safe Travel', value: 'Safety First' },
            { icon: '⭐', label: 'Happy Clients', value: '100K+' },
            { icon: '🎯', label: 'On-Time', value: '95% Rate' },
          ].map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.4 + index * 0.1 }}
              whileHover={{ y: -5 }}
              className="text-center p-6 bg-white rounded-xl shadow-lg"
            >
              <div className="text-4xl mb-3">{stat.icon}</div>
              <div className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</div>
              <div className="text-sm text-gray-600">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default VideoSection;
