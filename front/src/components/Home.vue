<template>
  <div class="flex-container">
    <div class="map-container">
      <v-progress v-if="fetchingVehicles !== 0" />
      <l-map ref="map" :zoom=map.zoom :center=map.center @moveend="moveCenter" @dragstart="moveStart" @zoomend="zoomEnd" style="height: 100%">
        <l-tile-layer v-if="$store.state.lang === 'cn'" url="http://www.google.cn/maps/vt?pb=!1m5!1m4!1i{z}!2i{x}!3i{y}!4i256!2m3!1e0!2sm!3i342009817!3m9!2sen-US!3sCN!5e18!12m1!1e47!12m3!1e37!2m1!1ssmartmaps!4e0&token=32965"></l-tile-layer >
        <l-tile-layer v-else url="https://api.mapbox.com/v4/mapbox.streets/{z}/{x}/{y}{r}.png?access_token={mapboxKey}" :options="options" :attribution="attribution"></l-tile-layer>

        <l-marker v-if="$store.state.geolocation" :lat-lng="$store.state.geolocation" :icon="getIconByProvider('geo')" />

        <l-marker v-for="vehicle in filterVehicles(vehicles)" :lat-lng="[vehicle.lat, vehicle.lng]" :icon="getIconByProvider(vehicle)" :key="vehicle.id" @click="selectVehicle(vehicle)"></l-marker>
      </l-map>
      <ul class="map-ui">
        <li><a @click="centerOnGeolocation" href="#"><i data-feather="compass"></i></a></li>
      </ul>
      <transition name="custom-classes-transition"
        enter-active-class="fadeInUp"
        leave-active-class="fadeOutDown"
      >
        <selected-vehicle v-if="$store.state.selectedVehicle" :vehicle="$store.state.selectedVehicle"></selected-vehicle>
      </transition>
    </div>
  </div>
</template>

<script>
import { LMap, LTileLayer, LMarker } from 'vue2-leaflet'
import gql from 'graphql-tag'
import { mapActions } from 'vuex'

import Progress from './Progress'
import SelectedVehicle from './SelectedVehicle.vue'

let geolocationWatcher

function degreesToRadians(degrees) {
  return degrees * Math.PI / 180
}

function distanceInKmBetweenEarthCoordinates(lat1, lon1, lat2, lon2) {
  var earthRadiusKm = 6371

  var dLat = degreesToRadians(lat2 - lat1)
  var dLon = degreesToRadians(lon2 - lon1)

  lat1 = degreesToRadians(lat1)
  lat2 = degreesToRadians(lat2)

  var a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2)
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return earthRadiusKm * c
}

export default {
  name: 'Home',
  components: {
    LMap,
    LTileLayer,
    LMarker,
    'v-progress': Progress,
    SelectedVehicle
  },
  data() {
    return {
      options: {
        mapboxKey: process.env.MAPBOX_KEY
      },
      attribution:
        '© <a href="https://www.mapbox.com/about/maps/">Mapbox</a> © <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> <strong><a href="https://www.mapbox.com/map-feedback/" target="_blank">Improve this map</a></strong>',
      fetchingVehicles: 0,
      moved: false,
      location: {
        lat: this.$store.state.geolocation[0],
        lng: this.$store.state.geolocation[1]
      },
      map: {
        center: this.$store.state.geolocation,
        zoom: 18,
        detectRetina: true
      },
      vehicles: []
    }
  },
  created() {
    this.startGeolocation()
    this.getVehicles(this.map.center[0], this.map.center[1])
  },
  destroyed() {
    if (geolocationWatcher && navigator.geolocation) {
      navigator.geolocation.clearWatch(geolocationWatcher)
    }
  },
  watch: {
    $route: 'getVehicles'
  },
  methods: {
    ...mapActions(['getCapacities', 'setGeolocation', 'selectVehicle']),
    roundLocation(l) {
      return Math.round(l * 1000) / 1000
    },
    getVehicles(lat, lng) {
      this.loading = true

      const diff = distanceInKmBetweenEarthCoordinates(this.location.lat, this.location.lng, lat, lng)

      if (diff > 0.2) {
        this.location = {
          lat: this.roundLocation(lat),
          lng: this.roundLocation(lng)
        }
      }
    },
    startGeolocation() {
      if (!navigator.geolocation) {
        console.warn('haha navigator.geolocation doesnt exist')
      } else {
        navigator.geolocation.getCurrentPosition(position => {
          this.map.center = [position.coords.latitude, position.coords.longitude]
          this.setGeolocation(this.map.center)
          this.getVehicles(this.map.center[0], this.map.center[1])
          this.getCapacities({ lat: this.map.center[0], lng: this.map.center[1] })
        })
        geolocationWatcher = navigator.geolocation.watchPosition(position => {
          this.setGeolocation([position.coords.latitude, position.coords.longitude])

          if (!this.moved) {
            this.map.center = [position.coords.latitude, position.coords.longitude]
            this.getVehicles(this.map.center[0], this.map.center[1])
          }
        })
      }
    },
    zoomEnd(event) {
      this.map.zoom = this.$refs.map.mapObject.getZoom()
    },
    moveStart() {
      if (this.$store.state.selectedVehicle) {
        this.selectVehicle(false)
      }
      this.moved = true
    },
    moveCenter(event) {
      this.getVehicles(this.map.center[0], this.map.center[1])
    },
    getIconByProvider(vehicle) {
      if (vehicle === 'geo') {
        return L.icon({
          prefix: '',
          iconUrl: '/static/glyph-marker-dot.png',
          iconSize: [24, 24]
        })
      }

      let glyph = ''
      let iconUrl = `/static/marker-${vehicle.provider.slug}.png`
      let iconRetinaUrl = `/static/marker-${vehicle.provider.slug}-2x.png`

      if (vehicle.provider.slug === 'mobike') {
        iconUrl = vehicle.attributes.includes('GEARS') ? '/static/marker-mobike-2.png' : '/static/marker-mobike.png'
        iconRetinaUrl = vehicle.attributes.includes('GEARS')
          ? '/static/marker-mobike-2-2x.png'
          : '/static/marker-mobike-2x.png'
      }

      return L.icon({
        iconUrl,
        iconRetinaUrl,
        iconSize: [24, 37]
      })
    },
    centerOnGeolocation() {
      const geolocation = this.$store.state.geolocation
      if (geolocation) {
        this.moved = false
        this.map.center = geolocation
      }
    },
    filterVehicles(vehicles) {
      return vehicles.filter(v => !this.$store.state.disabledProviders.includes(v.provider.slug))
    }
  },
  apollo: {
    vehicles() {
      return {
        loadingKey: 'fetchingVehicles',
        query() {
          return gql`
            query($lat: Float!, $lng: Float!) {
              vehicles(lat: $lat, lng: $lng) {
                id
                lat
                lng
                type
                attributes
                provider {
                  name
                  slug
                  website
                  app {
                    android
                    ios
                  }
                }
                ... on Station {
                  available_vehicles
                  available_stands
                }
              }
            }
          `
        },
        variables() {
          return { lat: this.location.lat, lng: this.location.lng }
        },
        update(data) {
          return data.vehicles
        }
      }
    }
  }
}
</script>

<style lang="scss">
@import '../../node_modules/leaflet/dist/leaflet.css';

.flex-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  flex-wrap: nowrap;
  justify-content: flex-start;
  align-content: flex-start;
  align-items: stretch;
}

.map-container {
  flex: 1;
}

.map-ui {
  position: absolute;
  bottom: 15px;
  left: 20px;
  padding: 0;

  z-index: 1000;

  li {
    list-style: none;

    text-align: center;
    border-radius: 50%;
    line-height: 54px;
    border: 2px solid rgba(0, 0, 0, 0.2);

    background-color: #fff;

    a {
      display: block;
      height: 45px;
      width: 45px;
      font-size: 22px;
    }
  }
}
</style>


