// homebridge-ws/lib/WsService.js
// Copyright © 2018-2022 Erik Baauw. All rights reserved.
//
// Homebridge plugin for virtual weather station.
//
// Modified by: Kai Lauterbach (05/2022)
//
// Removed all except of Windspeed

'use strict'

const homebridgeLib = require('homebridge-lib')

class WsService extends homebridgeLib.ServiceDelegate {

  static get Windspeed () { return WindspeedService }

}

class WindspeedService extends WsService {

  constructor (wsAccessory, params = {}) {
    params.name = wsAccessory.name + ' Windspeed'

    super(wsAccessory, params)

    this.addCharacteristicDelegate({
      key: 'windSpeed',
      Characteristic: this.Characteristics.eve.WindSpeed
    })
  }

  setData (data) {
    const d = data.current
    this.vdebug('data: %j', d)

    this.values.windSpeed = d.wind_speed
  }
}

module.exports = WsService
