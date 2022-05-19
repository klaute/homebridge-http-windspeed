// homebridge-ws/lib/WsPlatform.js
// Copyright © 2018-2022 Erik Baauw. All rights reserved.
//
// Homebridge plugin for virtual weather station.
//
// Modified by: Kai Lauterbach (05/2022)
//
// Removed all except of Windspeed and applied some other config settings

'use strict'

const events = require('events')
const homebridgeLib = require('homebridge-lib')
const WsAccessory = require('./WsAccessory')

class WsPlatform extends homebridgeLib.Platform {
  constructor (log, configJson, homebridge, bridge) {
    super(log, configJson, homebridge)
    this
      .on('accessoryRestored', this.accessoryRestored)
      .once('heartbeat', this.init)

    // Set default values in config
    this.config = {
      name: 'Homebridge HTTP Windspeed',
      timeout: 15,
      min_windspeed: 0,
      max_windspeed: 10000,
    }
    const optionParser = new homebridgeLib.OptionParser(this.config, true)
    optionParser.stringKey('platform')
    optionParser.stringKey('host')
    optionParser.stringKey('path')
    optionParser.stringKey('suffix')
    optionParser.stringKey('name')
    optionParser.stringKey('manufacturer')
    optionParser.stringKey('model')
    optionParser.stringKey('serial')
    optionParser.intKey('timeout', 0, 600) // TODO verify that the value is the time in seconds
    optionParser.intKey('min_windspeed', 0, 10000)
    optionParser.intKey('max_windspeed', 0, 10000)
    optionParser.on('userInputError', (message) => {
      this.warn('config.json: %s', message)
    })
    try {
      optionParser.parse(configJson)

      this.vdebug("Config read:")
      this.vdebug("host: %s", this.config.host)
      this.vdebug("path: %s", this.config.path)
      this.vdebug("suffix: %s", this.config.suffix)
      this.vdebug("name: %s", this.config.name)
      this.vdebug("manufacturer: %s", this.config.manufacturer)
      this.vdebug("model: %s", this.config.model)
      this.vdebug("serial: %s", this.config.serial)
      this.vdebug("timeout: %d", this.config.timeout)
      this.vdebug("min windspeed: %d", this.config.min_windspeed)
      this.vdebug("max windspeed: %d", this.config.max_windspeed)

      this.wsAccessories = {}
      this._client = new homebridgeLib.HttpClient({
        https: false,
        host: this.config.host,
        json: true,
        maxSockets: 1,
        path: this.config.path,
        suffix: '', // will be added in async windspeed/onecall
        timeout: this.config.timeout,
        validStatusCodes: [200, 404]
      })
      this._client
        .on('error', (error) => {
          this.log(
            'request %d: %s %s', error.request.id,
            error.request.method, error.request.resource
          )
          this.warn(
            'request %d: %s', error.request.id, error
          )
        })
        .on('request', (request) => {
          this.debug(
            'request %d: %s %s', request.id,
            request.method, request.resource
          )
          this.vdebug(
            'request %d: %s %s', request.id,
            request.method, request.url
          )
        })
        .on('response', (response) => {
          this.vdebug(
            'request %d: response: %j', response.request.id,
            response.body
          )
          this.debug(
            'request %d: %d %s', response.request.id,
            response.statusCode, response.statusMessage
          )
        })
    } catch (error) {
      this.error(error)
    }
  }

  async init (beat) {
    const jobs = []

    const params = {
      name: this.config.name,
      manufacturer: this.config.manufacturer
      model: this.config.model
    }
    const wsAccessory = new WsAccessory(this, params)
    jobs.push(events.once(wsAccessory, 'initialised'))
    this.wsAccessories[params.name] = wsAccessory

    for (const job of jobs) {
      await job
    }
    this.debug('initialised')
    this.emit('initialised')
  }

  accessoryRestored (className, version, id, name, context) {
    try {
    } catch (error) { this.error(error) }
  }

  // TODO One persisted logLevel for all accessories
  // get logLevel () { return 3 }

  async windspeed () {
    this.vdebug("%s : async windspeed", this.config.name)
    const response = await this._client.get(this.config.suffix)
    this.vdebug("%s : async windspeed response = %s", this.config.name, response)
    if (response.body.cod !== 200) {
      const error = new homebridgeLib.HttpClient.HttpError(
        `status: ${response.body.cod} ${response.body.message}`,
        response.request
      )
      this.log(
        'request %d: %s %s', error.request.id,
        error.request.method, error.request.resource
      )
      this.warn(
        'request %d: %s', error.request.id, error
      )
      throw error
    }
    return response
  }

  async onecall () {
    this.vdebug("%s : onecall", this.config.name)
    this.config.recv_data = this._client.get(this.config.suffix)
    this.vdebug("%s : onecall data = %s", this.config.name, this.config.recv_data)
    return this.config.recv_data
  }
}

module.exports = WsPlatform
