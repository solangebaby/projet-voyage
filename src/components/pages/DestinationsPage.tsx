import { useEffect, useState } from 'react';
import axios from 'axios';
import NavBar from '../organs/NavBar';
import Footer from '../organs/Footer';
import { Buildings } from '@phosphor-icons/react';

interface Destination {
  id: number;
  city_name: string;
  description?: string;
  image?: string;
}

const DestinationsPage = () => {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await axios.get('http://localhost:8000/api/destinations');
        if (res.data.success) setDestinations(res.data.data);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-yellow-50 to-blue-100">
      <NavBar />
      <div className="pt-28 pb-16 max-w-6xl mx-auto px-6">
        <div className="bg-white rounded-3xl shadow-2xl p-10 border-t-4 border-blue-600">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center shadow-lg">
              <Buildings size={28} weight="fill" className="text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-black bg-gradient-to-r from-blue-600 to-yellow-500 bg-clip-text text-transparent">
                Destinations
              </h1>
              <p className="text-gray-600">Cities where KCTrip operates with local agencies</p>
            </div>
          </div>

          {loading ? (
            <p className="text-gray-600">Loading destinations...</p>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
              {destinations.map((d) => (
                <div key={d.id} className="rounded-2xl overflow-hidden shadow-lg border-2 border-blue-100 bg-white">
                  <div className="h-44 bg-gray-200">
                    <img
                      src={d.image || 'https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&w=1200&q=80'}
                      alt={d.city_name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-5">
                    <h2 className="text-xl font-black text-gray-900">{d.city_name}</h2>
                    <p className="text-gray-700 text-sm mt-2 line-clamp-3">
                      {d.description || 'Explore this destination with KCTrip.'}
                    </p>
                    <div className="mt-4 inline-flex items-center gap-2 text-blue-700 font-bold">
                      <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                      Agencies available
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default DestinationsPage;
