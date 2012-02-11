winston = require 'winston'

# Create Winston logger and set it to use syslog levels
log = new (winston.Logger)(
  transports: [new winston.transports.Console]
  exceptionHandlers: [new winston.transports.Console])
log.setLevels(winston.config.syslog.levels)
log.cli()
module.exports = log