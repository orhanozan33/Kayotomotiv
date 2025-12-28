import { Link } from 'react-router-dom'
import './ServiceCard.css'

function ServiceCard({ title, description, image, link }) {
  return (
    <Link to={link} className="service-card">
      <div className="service-card-image">
        <img src={image} alt={title} />
      </div>
      <div className="service-card-content">
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
    </Link>
  )
}

export default ServiceCard


