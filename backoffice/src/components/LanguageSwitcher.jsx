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
        <img 
          className="flag-icon" 
          src="https://upload.wikimedia.org/wikipedia/commons/thumb/8/83/Flag_of_the_United_Kingdom_%283-5%29.svg/1200px-Flag_of_the_United_Kingdom_%283-5%29.svg.png" 
          alt="UK Flag"
        />
      </button>
      <button
        className={i18n.language === 'fr' ? 'active' : ''}
        onClick={() => changeLanguage('fr')}
        title="Français"
      >
        <img 
          className="flag-icon" 
          src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/Flag_of_France.svg/1200px-Flag_of_France.svg.png" 
          alt="France Flag"
        />
      </button>
      <button
        className={i18n.language === 'tr' ? 'active' : ''}
        onClick={() => changeLanguage('tr')}
        title="Türkçe"
      >
        <img 
          className="flag-icon" 
          src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/b4/Flag_of_Turkey.svg/1200px-Flag_of_Turkey.svg.png" 
          alt="Turkey Flag"
        />
      </button>
    </div>
  )
}

export default LanguageSwitcher


