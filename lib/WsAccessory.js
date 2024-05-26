// homebridge/lib/WsAccessory.js
// Copyright © 2018-2022 Erik Baauw. All rights reserved.
//
// Homebridge plugin for virtual weather station.
//
// Modified by: Kai Lauterbach (05/2022)

'use strict'

const homebridgeLib = require('homebridge-lib')
const WsService = require('./WsService')

class WsAccessory extends homebridgeLib.AccessoryDelegate {
  constructor(platform, context) {
    const params = {
      name: context.location,
      id: 'homebridge-http-weatherstation',
      manufacturer: context.manufacturer,
      model: context.model,
      category: platform.Accessory.Categories.Sensor
    }
    super(platform, params)
    this.context.location = context.location
    this.context.cityId = context.cityId
    this.context.lat = 0
    this.context.lon = 0
    this.json_data = {}
    this.wsServices = {
      temperature: new WsService.Temperature(this),
      humidity: new WsService.Humidity(this),
      pressure: new WsService.AirPressure(this),
      weather: new WsService.Weather(this, { noLeak: context.noLeak })
    }
    this.manageLogLevel(this.wsServices.weather.characteristicDelegate('logLevel'))
    this.wsServices.history = new homebridgeLib.ServiceDelegate.History.Weather(
      this, params,
      this.wsServices.temperature.characteristicDelegate('temperature'),
      this.wsServices.humidity.characteristicDelegate('humidity'),
      this.wsServices.pressure.characteristicDelegate('pressure')
    )
    if (context.hourlyForecasts > 0 || context.dailyForecasts > 0) {
      this.forecasts = new Forecasts(this, context)
      for (let h = 1; h <= context.hourlyForecasts; h++) {
        this.wsServices['h' + h] = new WsService.HourlyForecast(
          this.forecasts, { hour: h, noLeak: context.noLeak }
        )
      }
      for (let d = 1; d <= context.dailyForecasts; d++) {
        this.wsServices['d' + d] = new WsService.DailyForecast(
          this.forecasts, { day: d, noLeak: context.noLeak }
        )
      }
    }
    this.heartbeatEnabled = true
    this.on('heartbeat', this.heartbeat.bind(this))
    setImmediate(() => {
      this.emit('initialised')
    })
  }

  async heartbeat(beat) {
    let tmp_json_data
    const heartrate = this.wsServices.weather.values.heartrate * 60
    if (beat % heartrate === 1) {
      try {
        const result = await this.platform.onecall(
          this.context.lat, this.context.lon
        )

        tmp_json_data = result.body

        if (tmp_json_data.temperature === undefined) {
          tmp_json_data = tmp_json_data.weather

          if (tmp_json_data.temperature === undefined) {
            this.log('WsAccessory:81: Error processing received information: ' + result.body)
            throw "Can't parse json data: " + result.body;
          }

        }

        this.log("WsAccessory:82: -> json_data=" + tmp_json_data +
        "\n    temperature = " + tmp_json_data.temperature +
        "\n    windspeed = " + tmp_json_data.windspeed +
        "\n    humidity = " + tmp_json_data.humidity +
        "\n    pressure = " + tmp_json_data.pressure +
        "\n    lightlevel = " + tmp_json_data.lightlevel +
        "\n    timestamp = " + tmp_json_data.timestamp +
        "\n    valid = " + tmp_json_data.valid
        )

        for (const id in this.wsServices) {
          if (typeof this.wsServices[id].checkObservation === 'function') {

            this.wsServices[id].checkObservation(tmp_json_data)

          }
        }
      } catch (error) {
        if (error.request == null) {
          this.error(error)
        }

        tmp_json_data = {
          weather: {
            temperature: 0,
            lightlevel: 0,
            humidity: 0,
            pressure: 0,
            windspeed: 0,
            timestamp: 0,
            valid: 0 }
          };

          this.log("WsAccessory:115: setting default values because of read error -> json_data=" + tmp_json_data +
          "\n    temperature = " + tmp_json_data.temperature +
          "\n    windspeed = " + tmp_json_data.windspeed +
          "\n    humidity = " + tmp_json_data.humidity +
          "\n    pressure = " + tmp_json_data.pressure +
          "\n    lightlevel = " + tmp_json_data.lightlevel +
          "\n    timestamp = " + tmp_json_data.timestamp +
          "\n    valid = " + tmp_json_data.valid);

        for (const id in this.wsServices) {
          if (typeof this.wsServices[id].checkObservation === 'function') {

            this.wsServices[id].checkObservation(tmp_json_data)

          }
        }
      }
    }
  }
}

class Forecasts extends homebridgeLib.AccessoryDelegate {
  constructor(wsAccessory, context) {
    const params = {
      name: context.location + ' Forecast',
      id: 'WS-' + context.location.toUpperCase().replace(/[^A-Z0-9]/g, '') + '-F',
      manufacturer: 'homebridge-ws',
      model: 'OpenWeatherMap',
      firmware: '1.0',
      category: wsAccessory.Accessory.Categories.Sensor
    }
    super(wsAccessory.platform, params)
    this.context.location = context.location
    this.inheritLogLevel(wsAccessory)
    setImmediate(() => {
      this.emit('initialised')
    })
  }
}

module.exports = WsAccessory
