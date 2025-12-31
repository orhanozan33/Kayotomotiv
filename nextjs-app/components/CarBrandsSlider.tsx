'use client';

import { usePathname } from 'next/navigation';
import styles from './CarBrandsSlider.module.css';

const CAR_BRANDS = [
  'Toyota',
  'Honda',
  'Ford',
  'Chevrolet',
  'Dodge',
  'GMC',
  'Jeep',
  'Nissan',
  'Hyundai',
  'Kia',
  'Subaru',
  'Mazda',
  'Volkswagen',
  'BMW',
  'Mercedes-Benz',
  'Audi',
  'Lexus',
  'Acura',
  'Infiniti',
  'Cadillac',
  'Lincoln',
  'Volvo',
  'Tesla',
  'Genesis',
  'Porsche',
  'Land Rover',
  'Jaguar',
  'Mitsubishi',
  'Buick',
  'Chrysler',
];

export default function CarBrandsSlider() {
  const pathname = usePathname();
  const showOnPages = ['/', '/auto-sales'];
  const shouldShow = showOnPages.includes(pathname);

  if (!shouldShow) return null;

  // Duplicate brands for seamless infinite scroll
  const brandsDuplicated = [...CAR_BRANDS, ...CAR_BRANDS];

  return (
    <div className={styles.carBrandsSlider}>
      <div className={styles.brandsTrack}>
        {brandsDuplicated.map((brand, index) => (
          <div key={`${brand}-${index}`} className={styles.brandItem}>
            <span className={styles.brandName}>{brand}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

