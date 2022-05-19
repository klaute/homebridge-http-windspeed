// homebridge/lib/WsAccessory.js
// Copyright © 2018-2022 Erik Baauw. All rights reserved.
//
// Homebridge plugin for virtual weather station.
//
// Modified by: Kai Lauterbach (05/2022)
//
// Removed all except of Windspeed, Temperature, Preassure and Humidity

'use strict'

const homebridgeLib = require('homebridge-lib')
const WsService = require('./WsService')

class WsAccessory extends homebridgeLib.AccessoryDelegate {
  constructor (platform, context) {
    const params = {
      name: context.name,
      id: 'homebridge-http-weatherstation',
      manufacturer: context.manufacturer,
      category: platform.Accessory.Categories.Sensor
    }
    super(platform, params)
    this.wsServices = {
      temperature: new WsService.Temperature(this),
      humidity: new WsService.Humidity(this),
      pressure: new WsService.AirPressure(this),
      weatherstation: new WsService.Weatherstation(this, params)
    }
    this.manageLogLevel(this.wsServices.weatherstation.characteristicDelegate('logLevel'))
    this.heartbeatEnabled = true
    this.on('heartbeat', this.heartbeat.bind(this))
    setImmediate(() => {
      this.emit('initialised')
    })
  }

  async heartbeat (beat) {
    const heartrate = this.wsServices.wwather.values.heartrate * 60
    if (beat % heartrate === 1) {
      try {
        const result = await this.platform.onecall() // get the values from device

        for (const id in this.wsServices) {
          if (typeof this.wsServices[id].checkObservation === 'function') {
            this.wsServices[id].checkObservation(result.body)
          }
        }
      } catch (error) {
        if (error.request == null) {
          this.error(error)
        }
      }
    }
  }
}

module.exports = WsAccessory
