if (typeof global.Promise.promisify !== 'function')
    global.Promise = require('bluebird');

module.exports = {
    getData: function (userId, app) {

        return getUser(userId, app);

        // JSON.parse(JSON.stringify(data[0]))
        function getUser(userId, app) {
            var Proposeur = app.models.CompteProposeur;
            return Proposeur.findById(userId, {
                    include: {
                        relation: "projets",
                        scope: {
                            include: {
                                relation: "contributions"
                            }
                        }
                    }
                })
                .then(function (user) {
                    return Promise.resolve(user);
                })
        }
    }
}