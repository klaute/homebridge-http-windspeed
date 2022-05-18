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

  static get Windspeed () { return Windspeed }

}

class Windspeed extends WsService {

  constructor (wsAccessory) {
    params.name = wsAccessory.name + ' Windspeed'

    super(wsAccessory, params)

    this.addCharacteristicDelegate({
      key: 'windSpeed',
      Characteristic: this.Characteristics.eve.WindSpeed
    })
  }

  checkObservation (observation) {
    const o = observation
    this.vdebug('observation: %j', o)
    if (o == null) {
      return
    }

    this.values.windSpeed = o.windspeed
  }
}

module.exports = WsService
