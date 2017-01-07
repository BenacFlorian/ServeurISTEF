if (typeof global.Promise.promisify !== 'function')
    global.Promise = require('bluebird');

var _ = require('underscore')._;
module.exports = function (Projet) {

    Projet.search = function (searchValue, cb) {

        console.log(searchValue);
        searchValue = searchValue.trim();
        var tabOfPoint = [];
        var arrayWordSearch = searchValue.split(' ');
        Projet.find({
                include: [
                    {
                        relation: "tags"
                    },
                    {
                        relation: "compteProposeur"
                    }
                ]
            })
            .then(function (projets) {
                return Promise.all(arrayWordSearch.map(function (wordSearch) {

                        return Promise.all(projets.map(function (projet) {
                            var tags = JSON.parse(JSON.stringify(projet)).tags,
                                description = projet.description,
                                titre = projet.titre,
                                domainSearch = [description, titre],
                                size = tags.length,
                                counter = 0;

                            for (var i = 0; i < size; i++) {
                                domainSearch.push(tags[i].label);
                            }

                            size = domainSearch.length;

                            for (var i = 0; i < size; i++) {
                                if (domainSearch[i].indexOf(wordSearch) != -1) {
                                    tabOfPoint = addOnePoint(projet, tabOfPoint);
                                }
                            }
                            return Promise.resolve(projet);

                        }));
                    }))
                    .then(function (results) {
                        var data = getTab(projets, tabOfPoint);
                        cb(null, data);
                    });
            })
    };

    function getTab(projets, tabOfPoint) {
        var size = tabOfPoint.length,
            tab = [],
            tabOfPoint = _.sortBy(tabOfPoint, function (result) {
                return result.counter * -1;
            });
        for (var i = 0; i < size; i++) {
            var index = _.findIndex(projets, function (projet) {
                return projet.id == tabOfPoint[i].projetId;
            });
            if (index != -1) {
                tab.push(projets[index]);
            }
        }
        return tab;
    }

    function addOnePoint(projet, tabOfPoint) {
        var index = _.findIndex(tabOfPoint, function (point) {
            return point.projetId == projet.id
        });
        if (index != -1) {
            tabOfPoint[index].counter++;
        } else {
            tabOfPoint.push({
                projetId: projet.id,
                counter: 1
            })
        }
        return tabOfPoint;
    }

    Projet.remoteMethod(
        'search', {
            accepts: {
                arg: 'searchValue',
                type: 'string'
            },
            returns: {
                arg: 'results',
                type: 'array'
            },
            description: 'search projects with a string'
        }
    );
};