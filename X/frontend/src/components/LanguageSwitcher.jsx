import { useTranslation } from 'react-i18next'
import './LanguageSwitcher.css'

function LanguageSwitcher() {
  const { i18n } = useTranslation()

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng)
    localStorage.setItem('i18nextLng', lng)
  }

  return (
    <div className="language-switcher">
      <button
        className={i18n.language === 'en' ? 'active' : ''}
        onClick={() => changeLanguage('en')}
        title="English"
      >
        EN
      </button>
      <button
        className={i18n.language === 'fr' ? 'active' : ''}
        onClick={() => changeLanguage('fr')}
        title="Français"
      >
        FR
      </button>
      <button
        className={i18n.language === 'tr' ? 'active' : ''}
        onClick={() => changeLanguage('tr')}
        title="Türkçe"
      >
        TR
      </button>
    </div>
  )
}

export default LanguageSwitcher


