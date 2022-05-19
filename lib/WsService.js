// homebridge-ws/lib/WsService.js
// Copyright © 2018-2022 Erik Baauw. All rights reserved.
//
// Homebridge plugin for virtual weather station.
//
// Modified by: Kai Lauterbach (05/2022)
//
// Removed all except of Windspeed, Temperature, Humidity

'use strict'

const homebridgeLib = require('homebridge-lib')

class WsService extends homebridgeLib.ServiceDelegate {
  static get Temperature () { return Temperature }

  static get Humidity () { return Humidity }

  static get Weatherstation () { return Weatherstation }

}

class Temperature extends WsService {
  constructor (wsAccessory, params = {}) {
    params.name = wsAccessory.name + ' Temperature'
    params.Service = wsAccessory.Services.eve.TemperatureSensor
    super(wsAccessory, params)
    this.addCharacteristicDelegate({
      key: 'temperature',
      Characteristic: this.Characteristics.eve.CurrentTemperature,
      unit: '°C'
    })
    this.addCharacteristicDelegate({
      key: 'temperatureUnit',
      Characteristic: this.Characteristics.hap.TemperatureDisplayUnits,
      value: this.Characteristics.hap.TemperatureDisplayUnits.CELSIUS
    })
  }

  checkObservation (observation) {
    const o = observation
    this.vdebug('observation: %j', o)
    
    this.values.temperature = Math.round(JSON.parse(o.replace(/ /g, '')).temperature * 10) / 10
  }
}

class Humidity extends WsService {
  constructor (wsAccessory, params = {}) {
    params.name = wsAccessory.name + ' Humidity'
    params.Service = wsAccessory.Services.hap.HumiditySensor
    super(wsAccessory, params)
    this.addCharacteristicDelegate({
      key: 'humidity',
      Characteristic: this.Characteristics.hap.CurrentRelativeHumidity,
      unit: '%'
    })
  }

  checkObservation (observation) {
    const o = observation
    this.vdebug('observation: %j', o)
    
    this.values.humidity = JSON.parse(o.replace(/ /g, '')).humidity
  }
}

class Weatherstation extends WsService {

  constructor (wsAccessory, params) {
    params.name = wsAccessory.name + ' Weatherstation'

    super(wsAccessory, params)

    this.addCharacteristicDelegate({
      key: 'heartrate',
      Characteristic: this.Characteristics.my.Heartrate,
      // the minimum value cant be lower than 10 (minutes) because Eve cant read faster than every 10 minutes
      props: { unit: 'min', minValue: 10, maxValue: 120, minStep: 10 },
      value: 10
    })

    this.addCharacteristicDelegate({
      key: 'logLevel',
      Characteristic: this.Characteristics.my.LogLevel,
      value: wsAccessory.platform.logLevel
    })

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

    this.values.windSpeed = JSON.parse(o.replace(/ /g, '')).windspeed

  }
}

module.exports = WsService
