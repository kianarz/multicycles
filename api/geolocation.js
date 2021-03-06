import MapboxClient from 'mapbox'

const mapboxClient = new MapboxClient(process.env.MAPBOX_KEY)

async function reverseGeocode({ lat, lng }) {
  let country, city

  try {
    const geocode = await mapboxClient.geocodeReverse(
      {
        latitude: lat,
        longitude: lng
      },
      {
        types: 'country,place',
        language: 'en'
      }
    )

    geocode.entity.features.forEach(ac => {
      if (ac.place_type.includes('country')) {
        country = ac.text
      }

      if (ac.place_type.includes('place')) {
        city = ac.text
      }
    })
  } catch (err) {
    logger.exception(err)
  }

  return {
    country,
    city
  }
}

export { reverseGeocode }
