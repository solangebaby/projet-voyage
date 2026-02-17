import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { Translate } from '@phosphor-icons/react';

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();
  const [showMenu, setShowMenu] = useState(false);

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    localStorage.setItem('language', lng);
    setShowMenu(false);
  };

  const currentLang = i18n.language || 'en';
  const currentLangLabel = currentLang === 'en' ? 'EN' : 'FR';
  const currentFlag = currentLang === 'en' ? '🇬🇧' : '🇫🇷';

  return (
    <div className="relative">
      {/* Bouton principal */}
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-all duration-200"
        aria-label="Change language"
      >
        <Translate size={20} weight="duotone" className="text-gray-700" />
        <span className="text-sm font-medium text-gray-700">{currentFlag} {currentLangLabel}</span>
      </button>

      {/* Menu déroulant */}
      {showMenu && (
        <>
          {/* Overlay pour fermer au clic */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setShowMenu(false)}
          />
          
          {/* Menu */}
          <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20 animate-fade-in">
            <button
              onClick={() => changeLanguage('en')}
              className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition flex items-center gap-2 ${
                currentLang === 'en' ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-700'
              }`}
            >
              <span className="text-lg">🇬🇧</span>
              <span>English</span>
              {currentLang === 'en' && <span className="ml-auto">✓</span>}
            </button>
            <button
              onClick={() => changeLanguage('fr')}
              className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition flex items-center gap-2 ${
                currentLang === 'fr' ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-700'
              }`}
            >
              <span className="text-lg">🇫🇷</span>
              <span>Français</span>
              {currentLang === 'fr' && <span className="ml-auto">✓</span>}
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default LanguageSwitcher;
