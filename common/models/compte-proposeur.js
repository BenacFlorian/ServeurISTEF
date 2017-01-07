module.exports = function (CompteProposeur) {
    var app = require('../../server/server'),
        StatsService = require('../services/StatistiqueService.js');

    CompteProposeur.getStatistiques = function (userId, cb) {
        StatsService.getStatistiques(userId, app)
            .then(function (data) {
                cb(null, data);
            }, function (err) {
                cb(err, null);
            })
    };

    CompteProposeur.remoteMethod(
        'getStatistiques', {
            description: 'Get all statistisque for this user',
            accepts: {
                arg: 'userId',
                type: 'string'
            },
            returns: {
                arg: 'stats',
                type: 'object'
            }
        }
    );
};