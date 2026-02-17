import NavBar from '../organs/NavBar';
import Footer from '../organs/Footer';
import { Bus, ArmchairIcon as Armchair, ShieldCheck, Users, Wind } from '@phosphor-icons/react';
import { Fade } from 'react-awesome-reveal';

const BusPage = () => {
  const busTypes = [
    {
      type: 'VIP',
      color: 'blue',
      features: [
        'Sièges inclinables premium',
        'Climatisation puissante',
        'Espace pour les jambes étendu',
        'Prises USB pour chargement',
        'Wi-Fi à bord (sélectionné)',
        'Toilettes à bord'
      ],
      capacity: '30-35 places',
      price: 'À partir de 5000 XAF'
    },
    {
      type: 'Standard',
      color: 'yellow',
      features: [
        'Sièges confortables',
        'Climatisation',
        'Espace de rangement',
        'Chauffeurs professionnels',
        'Départs réguliers',
        'Tarifs abordables'
      ],
      capacity: '40-50 places',
      price: 'À partir de 3000 XAF'
    }
  ];

  const safetyFeatures = [
    { icon: ShieldCheck, title: 'Sécurité certifiée', desc: 'Tous nos bus sont contrôlés et certifiés' },
    { icon: Users, title: 'Chauffeurs expérimentés', desc: 'Plus de 10 ans d\'expérience moyenne' },
    { icon: Wind, title: 'Confort optimal', desc: 'Climatisation et ventilation de qualité' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-yellow-50 to-blue-100">
      <NavBar />
      <div className="pt-28 pb-16 max-w-6xl mx-auto px-6">
        <Fade triggerOnce>
          <div className="bg-white rounded-3xl shadow-2xl p-6 md:p-10 border-t-4 border-blue-600">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center shadow-lg">
                <Bus size={28} weight="fill" className="text-white" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-black bg-gradient-to-r from-blue-600 to-yellow-500 bg-clip-text text-transparent">
                  Notre Flotte de Bus
                </h1>
                <p className="text-sm md:text-base text-gray-600">Confort, sécurité et fiabilité à travers le Cameroun</p>
              </div>
            </div>

            {/* Types de bus */}
            <div className="grid md:grid-cols-2 gap-6 mt-8">
              {busTypes.map((bus, index) => (
                <Fade key={bus.type} direction={index === 0 ? 'left' : 'right'} triggerOnce delay={index * 100}>
                  <div className={`p-6 rounded-2xl bg-gradient-to-br from-${bus.color}-50 to-white border-2 border-${bus.color}-100 hover:shadow-xl transition-shadow duration-300`}>
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-2xl font-black text-gray-900">Bus {bus.type}</h2>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold bg-${bus.color}-500 text-white`}>
                        {bus.capacity}
                      </span>
                    </div>
                    <ul className="space-y-2 mb-4">
                      {bus.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-gray-700">
                          <span className="text-green-500 mt-1">✓</span>
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <p className="text-lg font-bold text-gray-900 mt-4 pt-4 border-t border-gray-200">
                      {bus.price}
                    </p>
                  </div>
                </Fade>
              ))}
            </div>

            {/* Caractéristiques de sécurité */}
            <div className="mt-10">
              <h2 className="text-2xl font-black text-gray-900 mb-6 text-center">Pourquoi voyager avec KCTrip ?</h2>
              <div className="grid md:grid-cols-3 gap-6">
                {safetyFeatures.map((feature, index) => (
                  <Fade key={feature.title} triggerOnce delay={index * 100}>
                    <div className="p-5 rounded-xl bg-gradient-to-br from-white to-blue-50 border border-blue-100 text-center hover:shadow-lg transition-shadow">
                      <feature.icon size={40} weight="fill" className="text-blue-600 mx-auto mb-3" />
                      <h3 className="font-bold text-gray-900 mb-2">{feature.title}</h3>
                      <p className="text-sm text-gray-600">{feature.desc}</p>
                    </div>
                  </Fade>
                ))}
              </div>
            </div>

            {/* Avantages supplémentaires */}
            <div className="mt-8 p-6 rounded-2xl border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white">
              <h2 className="text-xl font-black text-gray-900 mb-4">Nos Engagements</h2>
              <ul className="grid md:grid-cols-2 gap-3 text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">→</span>
                  <span className="text-sm">Départs ponctuels et horaires respectés</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">→</span>
                  <span className="text-sm">Plusieurs agences dans les grandes villes</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">→</span>
                  <span className="text-sm">Bus propres et bien entretenus</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">→</span>
                  <span className="text-sm">Support client rapide et efficace</span>
                </li>
              </ul>
            </div>
          </div>
        </Fade>
      </div>
      <Footer />
    </div>
  );
};

export default BusPage;
