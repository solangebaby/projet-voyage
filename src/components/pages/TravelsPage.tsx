import NavBar from '../organs/NavBar';
import Footer from '../organs/Footer';
import { MapPin, Clock, MapTrifold, Info } from '@phosphor-icons/react';
import { Fade } from 'react-awesome-reveal';

const TravelsPage = () => {
  const popularRoutes = [
    { from: 'Yaoundé', to: 'Douala', duration: '3h30', frequency: '8 départs/jour', price: '3500 XAF' },
    { from: 'Yaoundé', to: 'Bafoussam', duration: '4h', frequency: '6 départs/jour', price: '4000 XAF' },
    { from: 'Douala', to: 'Limbé', duration: '1h30', frequency: '10 départs/jour', price: '2000 XAF' },
    { from: 'Douala', to: 'Bafoussam', duration: '3h', frequency: '5 départs/jour', price: '3500 XAF' },
    { from: 'Yaoundé', to: 'Bamenda', duration: '5h', frequency: '4 départs/jour', price: '5000 XAF' },
    { from: 'Douala', to: 'Kribi', duration: '2h30', frequency: '4 départs/jour', price: '3000 XAF' }
  ];

  const travelTips = [
    { title: 'Arrivez à l\'avance', desc: 'Présentez-vous 30 minutes avant le départ', icon: Clock },
    { title: 'Pièce d\'identité', desc: 'CNI ou passeport obligatoire pour voyager', icon: Info },
    { title: 'Ticket & QR Code', desc: 'Gardez votre ticket et QR code prêts', icon: MapTrifold },
    { title: 'Voyages d\'agence à agence', desc: 'Choisissez vos quartiers de départ et d\'arrivée', icon: MapPin }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-yellow-50 to-blue-100">
      <NavBar />
      <div className="pt-28 pb-16 max-w-6xl mx-auto px-6">
        <Fade triggerOnce>
          <div className="bg-white rounded-3xl shadow-2xl p-6 md:p-10 border-t-4 border-yellow-500">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-yellow-500 to-yellow-600 flex items-center justify-center shadow-lg">
                <MapPin size={28} weight="fill" className="text-white" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-black bg-gradient-to-r from-blue-600 to-yellow-500 bg-clip-text text-transparent">
                  Voyages & Itinéraires
                </h1>
                <p className="text-sm md:text-base text-gray-600">Routes populaires, horaires et conseils de voyage</p>
              </div>
            </div>

            {/* Routes populaires */}
            <div className="mt-8">
              <h2 className="text-2xl font-black text-gray-900 mb-6">Nos Routes Principales</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {popularRoutes.map((route, index) => (
                  <Fade key={index} triggerOnce delay={index * 50}>
                    <div className="p-5 rounded-xl border-2 border-yellow-100 bg-gradient-to-br from-yellow-50 to-white hover:shadow-lg transition-all duration-300 hover:border-yellow-300">
                      <div className="flex items-center gap-2 mb-3">
                        <MapPin size={20} weight="fill" className="text-yellow-600" />
                        <h3 className="font-bold text-gray-900 text-sm">
                          {route.from} → {route.to}
                        </h3>
                      </div>
                      <div className="space-y-1 text-xs text-gray-600">
                        <p className="flex items-center gap-2">
                          <Clock size={14} className="text-blue-500" />
                          <span>Durée: <strong>{route.duration}</strong></span>
                        </p>
                        <p>Fréquence: <strong>{route.frequency}</strong></p>
                        <p className="text-lg font-bold text-yellow-600 mt-2 pt-2 border-t border-gray-200">
                          {route.price}
                        </p>
                      </div>
                    </div>
                  </Fade>
                ))}
              </div>
            </div>

            {/* Système d'agences */}
            <div className="mt-10 p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-white border-2 border-blue-100">
              <h2 className="text-xl font-black text-gray-900 mb-3">Voyage d'Agence à Agence</h2>
              <p className="text-gray-700 mb-4">
                KCTrip vous permet de choisir vos <strong>agences de quartier</strong> pour le départ et l'arrivée. 
                Plus besoin d'aller au centre-ville ! Partez et arrivez directement dans votre quartier.
              </p>
              <div className="grid md:grid-cols-3 gap-4 text-sm">
                <div className="p-3 bg-white rounded-lg border border-blue-200">
                  <p className="font-bold text-blue-600 mb-1">Yaoundé</p>
                  <p className="text-xs text-gray-600">Mvan, Tsinga, Bastos, Emana...</p>
                </div>
                <div className="p-3 bg-white rounded-lg border border-blue-200">
                  <p className="font-bold text-blue-600 mb-1">Douala</p>
                  <p className="text-xs text-gray-600">Akwa, Bonanjo, Bonabéri, Makepe...</p>
                </div>
                <div className="p-3 bg-white rounded-lg border border-blue-200">
                  <p className="font-bold text-blue-600 mb-1">Bafoussam</p>
                  <p className="text-xs text-gray-600">Centre-ville, Famla, Tamdja...</p>
                </div>
              </div>
            </div>

            {/* Conseils de voyage */}
            <div className="mt-8">
              <h2 className="text-2xl font-black text-gray-900 mb-6">Conseils de Voyage</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {travelTips.map((tip, index) => (
                  <Fade key={tip.title} triggerOnce delay={index * 100}>
                    <div className="flex items-start gap-4 p-4 rounded-xl bg-gradient-to-br from-white to-gray-50 border border-gray-200 hover:shadow-md transition-shadow">
                      <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                        <tip.icon size={20} weight="fill" className="text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 mb-1 text-sm">{tip.title}</h3>
                        <p className="text-xs text-gray-600">{tip.desc}</p>
                      </div>
                    </div>
                  </Fade>
                ))}
              </div>
            </div>
          </div>
        </Fade>
      </div>
      <Footer />
    </div>
  );
};

export default TravelsPage;
