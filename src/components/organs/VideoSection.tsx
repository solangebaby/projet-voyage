import { useTranslation } from 'react-i18next';
import { PlayCircle } from '@phosphor-icons/react';
import { Fade } from 'react-awesome-reveal';

const VideoSection = () => {
  const { t } = useTranslation();

  const videos = [
    {
      id: 1,
      title: 'Discover Cameroon with Jadoo Travels',
      thumbnail: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800',
      videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      description: 'Experience the beauty of traveling across Cameroon'
    },
    {
      id: 2,
      title: 'Inside Our Premium VIP Buses',
      thumbnail: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=800',
      videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      description: 'Take a tour of our luxurious VIP bus fleet'
    },
    {
      id: 3,
      title: 'Customer Testimonials',
      thumbnail: 'https://images.unsplash.com/photo-1552581234-26160f608093?w=800',
      videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      description: 'Hear what our satisfied customers have to say'
    },
    {
      id: 4,
      title: 'Safety First - Our Commitment',
      thumbnail: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800',
      videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      description: 'Learn about our safety protocols and standards'
    }
  ];

  return (
    <section className="py-10 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto px-6">
        <Fade direction="up" triggerOnce>
          <div className="text-center mb-8">
            <p className="text-color2 font-semibold text-lg mb-2">Watch & Learn</p>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Experience Jadoo Travels
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Watch our videos to learn more about our services, safety measures, and the amazing experiences our customers enjoy
            </p>
          </div>
        </Fade>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {videos.map((video, index) => (
            <Fade key={video.id} direction="up" delay={index * 100} triggerOnce>
              <div className="group cursor-pointer">
                <div className="relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                  {/* Thumbnail */}
                  <div className="relative h-64 bg-gray-200">
                    <img
                      src={video.thumbnail}
                      alt={video.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    
                    {/* Play Button Overlay */}
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/60 transition-all flex items-center justify-center">
                      <div className="w-16 h-16 rounded-full bg-white/90 group-hover:bg-white group-hover:scale-110 transition-all duration-300 flex items-center justify-center">
                        <PlayCircle size={40} weight="fill" className="text-color2" />
                      </div>
                    </div>

                    {/* Duration Badge */}
                    <div className="absolute bottom-3 right-3 bg-black/80 text-white text-xs font-semibold px-2 py-1 rounded">
                      3:45
                    </div>
                  </div>

                  {/* Video Info */}
                  <div className="bg-white p-4">
                    <h3 className="font-bold text-gray-900 mb-2 group-hover:text-color2 transition-colors">
                      {video.title}
                    </h3>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {video.description}
                    </p>
                  </div>
                </div>
              </div>
            </Fade>
          ))}
        </div>

        {/* CTA Section */}
        <Fade direction="up" delay={400} triggerOnce>
          <div className="mt-8 text-center">
            <div className="inline-block bg-gradient-to-r from-color2 to-color3 rounded-2xl p-8 shadow-xl">
              <h3 className="text-2xl font-bold text-white mb-3">
                Ready to Start Your Journey?
              </h3>
              <p className="text-white/90 mb-6">
                Book your ticket now and experience premium bus travel in Cameroon
              </p>
              <button className="bg-white text-color2 px-8 py-3 rounded-lg font-bold hover:bg-gray-100 transition shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
                Book Your Ticket
              </button>
            </div>
          </div>
        </Fade>
      </div>
    </section>
  );
};

export default VideoSection;
