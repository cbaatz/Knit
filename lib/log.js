(function() {
  var log, winston;

  winston = require('winston');

  log = new winston.Logger({
    transports: [new winston.transports.Console],
    exceptionHandlers: [new winston.transports.Console]
  });

  log.setLevels(winston.config.syslog.levels);

  log.cli();

  module.exports = log;

}).call(this);
