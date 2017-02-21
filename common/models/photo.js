module.exports = function(Photo) {
    var app = require('../../server/server');
    Photo.cleanDatabase = function (cb) {
        var Contributeur = app.models.CompteContributeur,
            Proposeur = app.models.CompteProposeur, 
            Categorie = app.models.Categorie, 
            Projet = app.models.Projet, 
            Tag = app.models.Tag, 
            Transaction = app.models.Transaction,
            Contrepartie = app.models.Contrepartie,
            User = app.models.CompteUser,
            Role = app.models.Role; 
        
        Contrepartie.destroyAll()
            .then(function(){
                return Projet.destroyAll();
            })
            .then(function(){
                return Categorie.destroyAll();
            })
            .then(function(){
                return Tag.destroyAll();
            })
            .then(function(){
                return Transaction.destroyAll();
            })
            .then(function(){
                return Proposeur.destroyAll();
            })
            .then(function(){
                return Contributeur.destroyAll();
            })
            .then(function(){
                return User.destroyAll();
            })
            .then(function(){
                return Role.destroyAll();
            })
            .then(function(){
                cb(null, {
                    data : "OK"
                });
            })
            .catch(function(err){
                cb(err, null);
            })
    };

    Photo.remoteMethod(
        'cleanDatabase', {
            returns: {
                arg: 'data',
                type: 'object'
            },
            description: 'Clean database'
        }
    );
};
