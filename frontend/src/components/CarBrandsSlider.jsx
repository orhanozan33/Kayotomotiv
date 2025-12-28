import { useLocation } from 'react-router-dom'
import './CarBrandsSlider.css'

const CAR_BRANDS = [
  'Toyota', 'Honda', 'Ford', 'Chevrolet', 'Dodge', 'GMC', 'Jeep', 
  'Nissan', 'Hyundai', 'Kia', 'Subaru', 'Mazda', 'Volkswagen', 
  'BMW', 'Mercedes-Benz', 'Audi', 'Lexus', 'Acura', 'Infiniti', 
  'Cadillac', 'Lincoln', 'Volvo', 'Tesla', 'Genesis', 'Porsche', 
  'Land Rover', 'Jaguar', 'Mitsubishi', 'Buick', 'Chrysler'
]

function CarBrandsSlider() {
  const location = useLocation()
  const showOnPages = ['/', '/auto-sales']
  const shouldShow = showOnPages.includes(location.pathname)

  if (!shouldShow) return null

  // Duplicate brands for seamless infinite scroll
  const brandsDuplicated = [...CAR_BRANDS, ...CAR_BRANDS]

  return (
    <div className="car-brands-slider">
      <div className="brands-track">
        {brandsDuplicated.map((brand, index) => (
          <div key={`${brand}-${index}`} className="brand-item">
            <span className="brand-name">{brand}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default CarBrandsSlider

