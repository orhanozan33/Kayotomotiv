// Vehicle Image Service - Fetches vehicle images from external sources
// This service tries multiple strategies to find vehicle images

const getImageUrl = (imageUrl: string | null) => {
  if (!imageUrl) return null;
  if (imageUrl.startsWith('http')) return imageUrl;
  if (typeof window !== 'undefined') {
    return `${window.location.origin}${imageUrl}`;
  }
  return imageUrl;
};

// Function to get vehicle image from external source
// Uses backend endpoint which generates SVG car illustrations
const getVehicleImageFromExternal = async (brand: string, model: string, year: number | null = null) => {
  try {
    const cleanBrand = brand?.trim() || '';
    const cleanModel = model?.trim() || '';

    if (!cleanBrand || !cleanModel) return null;

    const API_BASE_URL = typeof window !== 'undefined' ? window.location.origin + '/api' : '/api';

    const params = new URLSearchParams({ brand: cleanBrand, model: cleanModel });
    if (year) {
      params.append('year', year.toString());
    }

    try {
      const response = await fetch(`${API_BASE_URL}/vehicle-image/external?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        const imageUrl = data.imageUrl || null;
        console.log('External image URL from backend:', imageUrl);
        return imageUrl;
      } else {
        console.warn('Backend external image endpoint returned non-ok status:', response.status);
      }
    } catch (fetchError) {
      console.warn('Backend external image endpoint failed:', fetchError);
    }

    return null;
  } catch (error) {
    console.error('Error getting external vehicle image:', error);
    return null;
  }
};

// Main function to find vehicle image (tries local first, then external)
export const findVehicleImage = async (
  vehiclesAPI: any,
  brand: string,
  model: string,
  year: number | null = null
) => {
  try {
    if (!brand || !model) return null;

    const cleanBrand = brand.trim();
    const cleanModel = model.trim();

    let params: any = { brand: cleanBrand, model: cleanModel, limit: 10, excludeSold: false };
    if (year !== null && year !== undefined) {
      const yearNum = typeof year === 'number' ? year : parseInt(String(year));
      if (!isNaN(yearNum)) {
        params.year = yearNum;
      }
    }

    const vehiclesRes = await vehiclesAPI.getAll(params);
    let vehicles = vehiclesRes.data?.vehicles || [];

    if (vehicles.length === 0 && year) {
      params = { brand: cleanBrand, model: cleanModel, limit: 10, excludeSold: false };
      const vehiclesResNoYear = await vehiclesAPI.getAll(params);
      vehicles = vehiclesResNoYear.data?.vehicles || [];
    }

    if (vehicles.length > 0) {
      vehicles.sort((a: any, b: any) => {
        const aImages = a.images || [];
        const bImages = b.images || [];
        const aHasPrimary = aImages.some((img: any) => img.is_primary);
        const bHasPrimary = bImages.some((img: any) => img.is_primary);

        if (aHasPrimary && !bHasPrimary) return -1;
        if (!aHasPrimary && bHasPrimary) return 1;
        if (aImages.length > 0 && bImages.length === 0) return -1;
        if (aImages.length === 0 && bImages.length > 0) return 1;
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });

      const vehicle = vehicles[0];
      const images = vehicle.images || [];
      const primaryImage = images.find((img: any) => img.is_primary) || images[0];
      if (primaryImage) {
        return {
          image: getImageUrl(primaryImage.image_url),
          vehicleId: vehicle.id,
          source: 'local',
        };
      }
    }

    const externalImage = await getVehicleImageFromExternal(brand, model, year);
    console.log('External image result for', brand, model, year, ':', externalImage);
    if (externalImage) {
      return {
        image: externalImage,
        vehicleId: null,
        source: 'external',
      };
    }

    console.log('No image found for', brand, model, year);
    return null;
  } catch (error) {
    console.error('Error finding vehicle image:', error);
    return null;
  }
};

