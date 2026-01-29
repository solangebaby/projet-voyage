import { useTranslation } from 'react-i18next';
import { Globe } from '@phosphor-icons/react';

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div className="flex items-center gap-2">
      <Globe size={20} weight="duotone" className="text-gray-700" />
      <select
        value={i18n.language}
        onChange={(e) => changeLanguage(e.target.value)}
        className="border-none outline-none font-light text-sm bg-transparent cursor-pointer text-gray-700"
      >
        <option value="en">English</option>
        <option value="fr">Français</option>
      </select>
    </div>
  );
};

export default LanguageSwitcher;
