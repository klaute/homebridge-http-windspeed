// homebridge-ws/lib/WsService.js
// Copyright © 2018-2022 Erik Baauw. All rights reserved.
//
// Homebridge plugin for virtual weather station.
//
// Modified by: Kai Lauterbach (05/2022)

'use strict'

const homebridgeLib = require('homebridge-lib')

function toDate (dt) {
  return String(new Date(dt * 1000)).slice(0, 24)
}

const weekDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
function toWeekDay (dt) {
  return weekDays[new Date(dt * 1000).getDay()]
}

const windDirections = [
  'North', 'NNE', 'NE', 'ENE', 'East', 'ESE', 'SE', 'SSE',
  'South', 'SSW', 'SW', 'WSW', 'West', 'WNW', 'NW', 'NNW', 'North'
]
function windDirection (degrees) {
  return windDirections[Math.round(degrees * 16 / 360)]
}

class WsService extends homebridgeLib.ServiceDelegate {
  static get Temperature () { return Temperature }

  static get Humidity () { return Humidity }

  static get AirPressure () { return AirPressure }

  static get Weather () { return Weather }

  static get DailyForecast () { return DailyForecast }

  static get HourlyForecast () { return HourlyForecast }
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
    
    this.values.temperature = Math.round(o.temperature * 10) / 10
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
    this.values.humidity = o.humidity
  }
}

class AirPressure extends WsService {
  constructor (wsAccessory, params = {}) {
    params.name = wsAccessory.name + ' Air Pressure'
    params.Service = wsAccessory.Services.eve.AirPressureSensor
    super(wsAccessory, params)
    this.addCharacteristicDelegate({
      key: 'pressure',
      Characteristic: this.Characteristics.eve.AirPressure
    })
    this.addCharacteristicDelegate({
      key: 'elevation',
      Characteristic: this.Characteristics.eve.Elevation,
      value: 0
    })
  }

  checkObservation (observation) {
    this.values.pressure = observation.pressure
  }
}

class Weather extends WsService {

  constructor (wsAccessory, params) {
    params.name = wsAccessory.name + ' Weather'
    params.Service = wsAccessory.Services.hap.LeakSensor
    super(wsAccessory, params)
    this.leak = !params.noLeak

    this.addCharacteristicDelegate({
      key: 'leak',
      Characteristic: this.Characteristics.hap.LeakDetected
    })
    if (params.noLeak) {
      this.values.leak = this.Characteristics.hap.LeakDetected.LEAK_NOT_DETECTED
    }
    this.addCharacteristicDelegate({
      key: 'apparentTemperature',
      Characteristic: this.Characteristics.my.ApparentTemperature,
      unit: '°C'
    })
    this.addCharacteristicDelegate({
      key: 'clouds',
      Characteristic: this.Characteristics.eve.Clouds,
      unit: '%'
    })
    this.addCharacteristicDelegate({
      key: 'condition',
      Characteristic: this.Characteristics.eve.Condition
    })
    this.addCharacteristicDelegate({
      key: 'conditionCategory',
      Characteristic: this.Characteristics.eve.ConditionCategory
    })
    this.addCharacteristicDelegate({
      key: 'dewPoint',
      Characteristic: this.Characteristics.eve.DewPoint,
      unit: '°C'
    })
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
      key: 'observationTime',
      Characteristic: this.Characteristics.eve.ObservationTime
    })
    this.addCharacteristicDelegate({
      key: 'rain',
      Characteristic: this.Characteristics.eve.Rain
    })
    this.addCharacteristicDelegate({
      key: 'rain1h',
      Characteristic: this.Characteristics.eve.Rain1h
    })
    this.addCharacteristicDelegate({
      key: 'rain24h',
      Characteristic: this.Characteristics.eve.Rain24h
    })
    this.addCharacteristicDelegate({
      key: 'snow',
      Characteristic: this.Characteristics.eve.Snow
    })
    this.addCharacteristicDelegate({
      key: 'sunrise',
      Characteristic: this.Characteristics.my.Sunrise
    })
    this.addCharacteristicDelegate({
      key: 'sunset',
      Characteristic: this.Characteristics.my.Sunset
    })
    this.addCharacteristicDelegate({
      key: 'temperatureMin',
      Characteristic: this.Characteristics.eve.MinimumTemperature,
      unit: '°C'
    })
    this.addCharacteristicDelegate({
      key: 'temperatureMax',
      Characteristic: this.Characteristics.my.TemperatureMax,
      unit: '°C'
    })
    this.addCharacteristicDelegate({
      key: 'uvIndex',
      Characteristic: this.Characteristics.eve.UvIndex
    })
    this.addCharacteristicDelegate({
      key: 'visibility',
      Characteristic: this.Characteristics.eve.Visibility
    })
    this.addCharacteristicDelegate({
      key: 'wind',
      Characteristic: this.Characteristics.eve.WindDirection
    })
    this.addCharacteristicDelegate({
      key: 'windSpeed',
      Characteristic: this.Characteristics.eve.WindSpeed
    })
    this.addCharacteristicDelegate({
      key: 'lightLevel',
      Characteristic: this.Characteristics.eve.LightLevel
    })
  }

  checkObservation (observation) {
    const o = observation
    this.vdebug('observation: %j', o)
    if (o == null) {
      return
    }

    this.values.apparentTemperature = Math.round(o.temperature * 10) / 10
    this.values.clouds = 0
    this.values.condition = 0 // TODO wtf?
    this.values.conditionCategory = 0
    this.values.dewPoint = 0
    this.values.observationTime = toDate(0)
    this.values.rain = false
    this.values.rain1h = 0
    this.values.rain24h = 0
    this.values.snow = false
    this.values.sunrise = toDate(0)
    this.values.sunset = toDate(0)
    this.values.temperatureMin = 0
    this.values.temperatureMax = 0
    this.values.visibility = 100
    this.values.uvIndex = 0
    this.values.wind = windDirection(0)
    this.values.windSpeed = o.windspeed
    this.values.lightLevel = o.lightlevel

    if (this.leak) {
      this.Characteristics.hap.LeakDetected.LEAK_NOT_DETECTED
    }
  }
}

class DailyForecast extends WsService {
  constructor (wsAccessory, params = {}) {
    params.name = wsAccessory.name
    params.name += ' ' + params.day + 'd'
    params.Service = wsAccessory.Services.hap.LeakSensor
    params.subtype = params.day + 'd'
    super(wsAccessory, params)
    this.day = params.day
    this.leak = !params.noLeak

    this.addCharacteristicDelegate({
      key: 'leak',
      Characteristic: this.Characteristics.hap.LeakDetected
    })
    if (params.noLeak) {
      this.values.leak = this.Characteristics.hap.LeakDetected.LEAK_NOT_DETECTED
    }

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

    this.addCharacteristicDelegate({
      key: 'humidity',
      Characteristic: this.Characteristics.hap.CurrentRelativeHumidity,
      unit: '%'
    })

    this.addCharacteristicDelegate({
      key: 'pressure',
      Characteristic: this.Characteristics.eve.AirPressure
    })
    this.addCharacteristicDelegate({
      key: 'elevation',
      Characteristic: this.Characteristics.eve.Elevation,
      value: 0
    })

    this.addCharacteristicDelegate({
      key: 'apparentTemperature',
      Characteristic: this.Characteristics.my.ApparentTemperature,
      unit: '°C'
    })
    this.addCharacteristicDelegate({
      key: 'clouds',
      Characteristic: this.Characteristics.eve.Clouds,
      unit: '%'
    })
    this.addCharacteristicDelegate({
      key: 'condition',
      Characteristic: this.Characteristics.eve.Condition
    })
    this.addCharacteristicDelegate({
      key: 'conditionCategory',
      Characteristic: this.Characteristics.eve.ConditionCategory
    })
    this.addCharacteristicDelegate({
      key: 'day',
      Characteristic: this.Characteristics.eve.Day
    })
    this.addCharacteristicDelegate({
      key: 'dewPoint',
      Characteristic: this.Characteristics.eve.DewPoint,
      unit: '°C'
    })
    this.addCharacteristicDelegate({
      key: 'observationTime',
      Characteristic: this.Characteristics.eve.ObservationTime
    })
    this.addCharacteristicDelegate({
      key: 'rain',
      Characteristic: this.Characteristics.eve.Rain
    })
    this.addCharacteristicDelegate({
      key: 'rain24h',
      Characteristic: this.Characteristics.eve.Rain24h
    })
    this.addCharacteristicDelegate({
      key: 'snow',
      Characteristic: this.Characteristics.eve.Snow
    })
    this.addCharacteristicDelegate({
      key: 'sunrise',
      Characteristic: this.Characteristics.my.Sunrise
    })
    this.addCharacteristicDelegate({
      key: 'sunset',
      Characteristic: this.Characteristics.my.Sunset
    })
    this.addCharacteristicDelegate({
      key: 'temperatureMin',
      Characteristic: this.Characteristics.eve.MinimumTemperature,
      unit: '°C'
    })
    this.addCharacteristicDelegate({
      key: 'temperatureMax',
      Characteristic: this.Characteristics.my.TemperatureMax,
      unit: '°C'
    })
    this.addCharacteristicDelegate({
      key: 'uvIndex',
      Characteristic: this.Characteristics.eve.UvIndex
    })
    this.addCharacteristicDelegate({
      key: 'wind',
      Characteristic: this.Characteristics.eve.WindDirection
    })
    this.addCharacteristicDelegate({
      key: 'windSpeed',
      Characteristic: this.Characteristics.eve.WindSpeed
    })
    this.addCharacteristicDelegate({
      key: 'lightLevel',
      Characteristic: this.Characteristics.eve.LightLevel
    })
  }

  checkObservation (observation) {
    const o = observation.daily[this.day]
    this.vdebug('observation: %j', o)
    if (o == null) {
      return
    }

    this.values.apparentTemperature = Math.round(o.temperature * 10) / 10
    this.values.clouds = 0
    this.values.condition = 0 // TODO wtf?
    this.values.conditionCategory = 0
    this.values.day = 'Sunday'
    this.values.dewPoint = 0
    this.values.humidity = o.humidity
    this.values.observationTime = toDate(0)
    this.values.pressure = o.pressure
    this.values.rain = false
    this.values.rain24h = 0
    this.values.snow = false
    this.values.sunrise = toDate(0)
    this.values.sunset = toDate(0)
    this.values.temperature = Math.round(o.temperature * 10) / 10    
    this.values.temperatureMin = 0
    this.values.temperatureMax = 0
    this.values.uvIndex = 0
    this.values.wind = windDirection(0)
    this.values.windSpeed = o.windspeed
    this.values.lightLevel = o.lightlevel

    if (this.leak) {
      this.Characteristics.hap.LeakDetected.LEAK_NOT_DETECTED
    }
  }
}

class HourlyForecast extends WsService {
  constructor (wsAccessory, params = {}) {
    params.name = wsAccessory.name
    params.name += ' ' + params.hour + 'h'
    params.Service = wsAccessory.Services.hap.LeakSensor
    params.subtype = params.hour + 'h'
    super(wsAccessory, params)
    this.hour = params.hour
    this.leak = !params.noLeak

    this.addCharacteristicDelegate({
      key: 'leak',
      Characteristic: this.Characteristics.hap.LeakDetected
    })
    if (params.noLeak) {
      this.values.leak = this.Characteristics.hap.LeakDetected.LEAK_NOT_DETECTED
    }

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

    this.addCharacteristicDelegate({
      key: 'humidity',
      Characteristic: this.Characteristics.hap.CurrentRelativeHumidity,
      unit: '%'
    })

    this.addCharacteristicDelegate({
      key: 'pressure',
      Characteristic: this.Characteristics.eve.AirPressure
    })
    this.addCharacteristicDelegate({
      key: 'elevation',
      Characteristic: this.Characteristics.eve.Elevation,
      value: 0
    })

    this.addCharacteristicDelegate({
      key: 'apparentTemperature',
      Characteristic: this.Characteristics.my.ApparentTemperature,
      unit: '°C'
    })
    this.addCharacteristicDelegate({
      key: 'clouds',
      Characteristic: this.Characteristics.eve.Clouds,
      unit: '%'
    })
    this.addCharacteristicDelegate({
      key: 'condition',
      Characteristic: this.Characteristics.eve.Condition
    })
    this.addCharacteristicDelegate({
      key: 'conditionCategory',
      Characteristic: this.Characteristics.eve.ConditionCategory
    })
    this.addCharacteristicDelegate({
      key: 'dewPoint',
      Characteristic: this.Characteristics.eve.DewPoint,
      unit: '°C'
    })
    this.addCharacteristicDelegate({
      key: 'observationTime',
      Characteristic: this.Characteristics.eve.ObservationTime
    })
    this.addCharacteristicDelegate({
      key: 'rain',
      Characteristic: this.Characteristics.eve.Rain
    })
    this.addCharacteristicDelegate({
      key: 'rain1h',
      Characteristic: this.Characteristics.eve.Rain1h
    })
    this.addCharacteristicDelegate({
      key: 'snow',
      Characteristic: this.Characteristics.eve.Snow
    })
    this.addCharacteristicDelegate({
      key: 'wind',
      Characteristic: this.Characteristics.eve.WindDirection
    })
    this.addCharacteristicDelegate({
      key: 'windSpeed',
      Characteristic: this.Characteristics.eve.WindSpeed
    })
    this.addCharacteristicDelegate({
      key: 'lightLevel',
      Characteristic: this.Characteristics.eve.LightLevel
    })
  }

  checkObservation (observation) {
    const o = observation.hourly[this.hour]
    this.vdebug('observation: %j', o)
    if (o == null) {
      return
    }

    this.values.apparentTemperature = Math.round(o.temperature * 10) / 10
    this.values.clouds = 0
    this.values.condition = 0
    this.values.conditionCategory = 0
    this.values.dewPoint = 0
    this.values.humidity = o.humidity
    this.values.observationTime = toDate(0)
    this.values.pressure = o.pressure
    this.values.rain = false
    this.values.rain1h = 0
    this.values.snow = false
    this.values.temperature = Math.round(o.temperature * 10) / 10
    this.values.wind = windDirection(0)
    this.values.windSpeed = o.windspeed
    this.values.lightLevel = o.lightlevel

    if (this.leak) {
      this.Characteristics.hap.LeakDetected.LEAK_NOT_DETECTED
    }
  }
}

module.exports = WsService
