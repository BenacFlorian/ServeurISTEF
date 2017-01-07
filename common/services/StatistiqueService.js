if (typeof global.Promise.promisify !== 'function')
    global.Promise = require('bluebird');
var _ = require('underscore')._,

    DataService = require('./DataService.js'),
    ComputeService = require('./ComputeService.js');
module.exports = {
    getStatistiques: function (userId, app) {
        return DataService.getData(userId, app)
            .then(function (data) {
                var stats = ComputeService.calculeStats(data);
                return Promise.resolve(stats);
            });
    }
};