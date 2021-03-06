import { GraphQLObjectType, GraphQLList, GraphQLFloat, GraphQLString, GraphQLInt, GraphQLNonNull } from 'graphql'

import Obike from '@multicycles/obike'

import { VehicleType } from './vehicles'
import { vehicleInterfaceType } from './vehicleDetailType'
import resolve from '../providersResolve'

function mapVehicles({ body }) {
  return body.data.list.map(bike => ({
    id: bike.id,
    lat: bike.latitude,
    lng: bike.longitude,
    type: 'BIKE',
    attributes: [],
    provider: Obike.getProviderDetails(),
    imei: bike.imei,
    iconUrl: bike.iconUrl,
    promotionActivityType: bike.promotionActivityType,
    countryId: bike.countryId,
    cityId: bike.cityId,
    helmet: bike.helmet
  }))
}

const client = new Obike({ timeout: process.env.PROVIDER_TIMEOUT || 3000 })

const ObikeType = new GraphQLObjectType({
  name: 'Obike',
  description: 'A Obike bike',
  interfaces: () => [VehicleType],
  fields: {
    ...vehicleInterfaceType,
    imei: { type: GraphQLString },
    iconUrl: { type: GraphQLString },
    promotionActivityType: { type: GraphQLString },
    countryId: { type: GraphQLInt },
    cityId: { type: GraphQLInt },
    helmet: { type: GraphQLInt }
  }
})

const obike = {
  type: new GraphQLList(ObikeType),
  description: 'Get Obike bikes by position',
  args: {
    lat: {
      type: new GraphQLNonNull(GraphQLFloat)
    },
    lng: {
      type: new GraphQLNonNull(GraphQLFloat)
    }
  },
  async resolve(root, args, ctx, info) {
    return resolve(args, ctx, info, Obike, client, mapVehicles)
  }
}

const provider = Obike.getProviderDetails()

export { ObikeType, obike, provider }
