// homebridge-ws/lib/WsAccessory.js
// Copyright © 2018-2022 Erik Baauw. All rights reserved.
//
// Homebridge plugin for virtual weather station.
//
// Modified by: Kai Lauterbach (05/2022)
//
// Removed all except of Windspeed

'use strict'

const homebridgeLib = require('homebridge-lib')
const WsService = require('./WsService')

class WsAccessory extends homebridgeLib.AccessoryDelegate {
  constructor (platform, context) {
    const params = {
      name: context.name,
      id: 'homebridge-http-windspeed',
      manufacturer: context.manufacturer,
      model: "oko-weatherstation",
      category: platform.Accessory.Categories.Sensor
    }
    super(platform, params)
    this.wsServices = {
      windspeed: new WsService.Windspeed(this, params)
    }
    this.manageLogLevel(this.wsServices.windspeed.characteristicDelegate('logLevel'))
    this.heartbeatEnabled = true
    this.on('heartbeat', this.heartbeat.bind(this))
    setImmediate(() => {
      this.emit('initialised')
    })
  }

  async heartbeat (beat) {
    const heartrate = this.wsServices.windspeed.values.heartrate * 60
    if (beat % heartrate === 1) {
      try {
        const result = await this.platform.onecall() // get the windspeed from device

        for (const id in this.wsServices) {
          if (typeof this.wsServices[id].setData === 'function') {
            this.wsServices[id].setData(result.body) // set the date to the windspeed service
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
