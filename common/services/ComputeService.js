if (typeof global.Promise.promisify !== 'function')
    global.Promise = require('bluebird');

module.exports = {
    calculeStats: function (data) {

        var data = JSON.parse(JSON.stringify(data)),
            result = {
                tabAverage: getTabAverageProjects(data),
                dataChart: getDataChart(data),
                averageGlobal: averageGlobal(data),
                countProject: countProject(data)
            };

        return result;

        function getTabAverageProjects(user) {
            var result = [],
                size = user.projets.length;
            for (var i = 0; i < size; i++) {
                result.push({
                    titre: user.projets[i].titre,
                    average: averageProject(user.projets[i])
                });
            }
            return result;
        }

        // average somme contribution by project
        function averageProject(project) {
            var contributions = project.contributions,
                size = contributions.length,
                totalContribution = 0;
            for (var i = 0; i < size; i++) {
                totalContribution += contributions[i].somme;
            }
            return totalContribution / size;
        }

        // nb project archivé complet / nb project archivé pas complet / nb project archivé dépassé 50%
        function getDataChart(user) {
            var notCompleted = 0,
                completed = 0,
                depassed = 0,
                projects = user.projets,
                size = projects.length;
            for (var i = 0; i < size; i++) {
                if (projects[i].estArchive) {
                    if (parseFloat(projects[i].sommeRecoltee) >= (parseFloat(projects[i].objectifFinancier) * 1.5)) {
                        depassed++;
                    } else {
                        if (parseFloat(projects[i].sommeRecoltee) >= parseFloat(projects[i].objectifFinancier)) {
                            completed++;
                        } else {
                            notCompleted++;
                        }
                    }
                }
            }
            return ({
                completed: completed,
                depassed: depassed,
                notCompleted: notCompleted
            });
        }
        // average of contribution general
        function averageGlobal(user) {
            var projects = user.projets,
                sizeProjects = projects.length,
                totalContribution = 0,
                sizeContributions,
                sizeTotal = 0;
            for (var i = 0; i < sizeProjects; i++) {
                sizeContributions = projects[i].contributions.length;
                for (var j = 0; j < sizeContributions; j++) {
                    totalContribution += projects[i].contributions[j].somme;
                }
                sizeTotal += sizeContributions;
            }
            return totalContribution / sizeTotal;
        }

        // nb projet proposé
        function countProject(user) {
            return user.projets.length;
        }
    }
};