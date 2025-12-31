import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import './HomePage.css'

function HomePage() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const handleServiceClick = (path) => {
    navigate(path)
  }

  return (
    <div className="home-page">
      <div className="services-showcase">
        <div 
          className="service-panel service-panel-left"
          onClick={() => handleServiceClick('/auto-sales')}
        >
          <div className="service-overlay">
            <h2>{t('home.autoSales.title')}</h2>
            <p>{t('home.autoSales.description')}</p>
            <button className="service-btn">{t('home.viewMore')}</button>
          </div>
        </div>
        
        <div 
          className="service-panel service-panel-center"
          onClick={() => handleServiceClick('/auto-repair')}
        >
          <div className="service-content">
            <h1>{t('home.autoRepair.title')}</h1>
            <p>{t('home.autoRepair.description')}</p>
            <button className="service-btn">{t('home.viewMore')}</button>
          </div>
        </div>
        
        <div 
          className="service-panel service-panel-right"
          onClick={() => handleServiceClick('/car-wash')}
        >
          <div className="service-overlay">
            <h2>{t('home.carWash.title')}</h2>
            <p>{t('home.carWash.description')}</p>
            <button className="service-btn">{t('home.viewMore')}</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HomePage

