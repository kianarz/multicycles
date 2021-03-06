import querystring from 'querystring'
import got from 'got'

const BASE_URL = 'https://mwx.mobike.com/mobike-api'

class Mobike {
  constructor({ timeout } = {}) {
    this.config = {
      timeout: timeout && parseInt(timeout, 10)
    }
  }

  static getProviderDetails() {
    return {
      name: 'Mobike',
      slug: 'mobike',
      website: 'https://mobike.com/',
      app: {
        android: 'https://play.google.com/store/apps/details?id=com.mobike.mobikeapp',
        ios: 'https://itunes.apple.com/app/id1044535426'
      }
    }
  }

  getBicyclesByLatLng({ lat: latitude, lng: longitude } = {}, config = {}) {
    if (!latitude || !longitude) {
      throw new Error('Missing lat/lng')
    }

    return got.post(`${BASE_URL}/rent/nearbyBikesInfo.do`, {
      json: true,
      form: true,
      body: {
        latitude,
        longitude
      },
      timeout: this.config.timeout,
      ...config
    })
  }
}

export default Mobike
