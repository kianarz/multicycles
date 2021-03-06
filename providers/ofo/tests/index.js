import test from 'ava'
import Ofo from '../lib'

test('overwrite timeout on constructor', async t => {
  const ofo = new Ofo({ timeout: 1 })

  await ofo
    .getBicyclesByLatLng({
      lat: 48.852775,
      lng: 2.369336
    })
    .then(() => {
      t.fail()
    })
    .catch(err => {
      t.is(err.code, 'ETIMEDOUT')
      t.pass()
    })
})

test('overwrite timeout on method', async t => {
  const ofo = new Ofo({})

  await ofo
    .getBicyclesByLatLng(
      {
        lat: 48.852775,
        lng: 2.369336
      },
      { timeout: 1 }
    )
    .then(() => {
      t.fail()
    })
    .catch(err => {
      t.is(err.code, 'ETIMEDOUT')
      t.pass()
    })
})

test('get bicycles by positions', async t => {
  const ofo = new Ofo({ token: process.env.OFO_AUTH_TOKEN })

  await ofo
    .getBicyclesByLatLng({
      lat: 48.852775,
      lng: 2.369336
    })
    .then(result => {
      t.is(result.statusCode, 200)
      t.truthy(result.body.values.cars.length)
      t.pass()
    })
    .catch(err => {
      console.log(err)
      t.fail()
    })
})

test('get bicycles without token', async t => {
  const ofo = new Ofo()

  await ofo
    .getBicyclesByLatLng({
      lat: 48.852775,
      lng: 2.369336
    })
    .then(resp => {
      console.log(resp)
      t.fail()
    })
    .catch(() => {
      t.pass()
    })
})
