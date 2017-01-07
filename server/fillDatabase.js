if (typeof global.Promise.promisify !== 'function')
    global.Promise = require('bluebird');

/*
 This script file allow to fill database
*/
module.exports = function (app) {

    // récupération des initial-data
    var projetData = require('./initialData/Projet.json');
    var photoData = require('./initialData/Photo.json');
    var proposeurData = require('./initialData/Proposeur.json');
    var categorieData = require('./initialData/Categorie.json');
    var contributeurData = require('./initialData/Contributeur.json');
    var contrepartieData = require('./initialData/Contrepartie.json');

    console.log("XXXXXXXXXXXXXXXXXXXXX STARTING INITIAL DATA CREATION XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX");
    //---------------------------------------------------------------------------------------------------------

    manageCategorie()
        .then(
            function () {
                console.log("Categorie done - next is Proposeur");
                return manageProposeur();
            }
        )
        .then(
            function () {
                console.log("Proposeur done - next is Contributeur");
                return manageContributeur();
            }
        )
        .then(
            function () {
                console.log("Contributeur done - next is Projet his contriand his tags");
                return manageProjetAndTagsAndContributions();
            }
        )
        .then(
            function () {
                console.log("Projet and his tags done - next is Photo");
                return managePhoto();
            }
        )
        .then(
            function () {
                console.log("Photo done - next is Tag");
                return manageContrepartie();
            }
        )
        .then(
            function () {
                console.log("Tag done - next is AdminUser");
                return createAdminUser();
            }
        )
        .catch(showError);


    function showError(err) {
        if (err) {
            console.log(err);
            process.exit();
        }
    }

    function createAdminUser() {

        var User = app.models.User;
        console.log("Try creating User Admin...");
        User.create([
            {
                username: 'admin',
                email: 'admin@admin.fr',
                password: 'root'
			}
		], function (err, users) {
            if (err) return showError(err);
            console.log("Creating User Admin role");

            var Role = app.models.Role;
            Role.create({
                name: 'admin'
            }, function (err, role) {
                if (err) return showError(err);
                console.log("User Admin created");
                console.log("OK ALL DONE!!!");
                /*var RoleMapping = app.models.RoleMapping;
                role.principals.create({
                	principalType: RoleMapping.USER,
                	principalId: users[0].id
                }, showError);*/
            });
        });
    }

    function manageCategorie() {
        var Categorie = app.models.Categorie;
        console.log("Creating categorie");
        return Promise.all(categorieData.map(function (categorie) {

            Categorie.create(categorie).then(function (result) {
                return Promise.resolve(result);
            });
        }));
    }

    function manageProposeur() {
        var Proposeur = app.models.CompteProposeur;
        console.log("Creating proposeur");
        return Promise.all(proposeurData.map(function (proposeur) {

            Proposeur.create(proposeur).then(function (result) {
                return Promise.resolve(result);
            });
        }));
    }

    function manageContrepartie() {
        var Contrepartie = app.models.Contrepartie;
        console.log("Creating contrepartie");
        return Promise.all(contrepartieData.map(function (contrepartie) {

            Contrepartie.create(contrepartie).then(function (result) {
                return Promise.resolve(result);
            });
        }));
    }

    function manageContributeur() {
        var Contributeur = app.models.CompteContributeur;
        console.log("Creating contributeur");
        return Promise.all(contributeurData.map(function (contributeur) {

            Contributeur.create(contributeur).then(function (result) {
                return Promise.resolve(result);
            });
        }));
    }

    function managePhoto() {
        var Photo = app.models.Photo;
        console.log("Creating photo");
        return Promise.all(photoData.map(function (photo) {
            Photo.create(photo).then(function (result) {
                return Promise.resolve(result);
            });
        }));
    }

    function manageProjetAndTagsAndContributions() {
        var Projet = app.models.Projet;
        console.log("Creating projet");
        return Promise.all(projetData.map(function (projet) {
            var tagList = projet.tagList,
                contributionList = projet.contributionList;
            Projet.create(projet).then(function (result) {
                return Promise.all(tagList.map(function (tag) {
                    return Promise.resolve(Promise.promisify(Projet.prototype.__create__tags).call(result, tag));
                })).then(function () {
                    return Promise.all(contributionList.map(function (contribution) {
                        return Promise.resolve(Promise.promisify(Projet.prototype.__create__contributions).call(result, contribution));
                    }));
                });
            });
        }));
    }
};