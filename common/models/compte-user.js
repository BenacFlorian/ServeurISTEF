module.exports = function (CompteUser) {
    var app = require('../../server/server');

    CompteUser.SeConnecter = function (email, password, cb) {

        var Contributeur = app.models.CompteContributeur,
            Proposeur = app.models.CompteProposeur;

        if (email == "admin@admin.fr" && password == "root") {
            CompteUser.find({
                    where: {
                        email: email
                    }
                })
                .then(function () {
                    CompteUser.login({
                            email: email,
                            password: password
                        })
                        .then(function (token) {
                            token.typeUser = "Admin";
                            console.log(token);
                            cb(null, token);
                        });
                })
        }else{
            Contributeur.find({
                where: {
                    email: email
                }
            })
            .then(function (contributeurs) {
                var size = contributeurs.length;
                if (size > 0) {
                    // contributeur exist
                    var contributeur = contributeurs[0];
                    if (contributeur.estCompteActif) {
                        Contributeur.login({
                                email: email,
                                password: password
                            })
                            .then(function (token) {
                                token.typeUser = "Contributeur";
                                cb(null, token);
                            });
                    } else {
                        // error : user don't exist 
                        cb("Compte non actif", null);
                    }
                } else {
                    // contributeur don't exist
                    Proposeur.find({
                            where: {
                                email: email
                            }
                        })
                        .then(function (proposeurs) {
                            if (proposeurs.length > 0) {
                                var proposeur = proposeurs[0];
                                if (proposeur.estCompteActif) {
                                    Proposeur.login({
                                            email: email,
                                            password: password
                                        })
                                        .then(function (token) {
                                            token.typeUser = "Proposeur";
                                            cb(null, token);
                                        })
                                } else {
                                    // error : user don't exist 
                                    cb("No user", null);
                                }
                            } else {
                                // error : user don't exist 
                                cb("Compte non actif", null);
                            }
                        });
                }
            })
            .catch(function (err) {
                console.log(err);
            })
        }
    };

    CompteUser.remoteMethod(
        'SeConnecter', {
            description: 'Login whatever the type of compte',
            accepts: [{
                arg: 'email',
                type: 'string'
            }, {
                arg: 'password',
                type: 'string'
            }],
            returns: {
                arg: 'token',
                type: 'object'
            }
        }
    );

    CompteUser.getUser = function (userId, typeUser, cb) {
        var Contributeur = app.models.CompteContributeur,
            Proposeur = app.models.CompteProposeur;

        if (userId) {
            if (typeUser == "Admin") {
                CompteUser.findById(userId)
                    .then(function(user){
                        if (user) {
                            user.adresse = undefined;
                            cb(null, user);
                        } else {
                            // error : user don't exist 
                            cb("No user", null);
                        }
                    })
                    .catch(function(err){
                        console.log(err);
                    });
            }else if (typeUser == "Contributeur") {
                Contributeur.findById(userId)
                    .then(function (contributeur) {
                        if (contributeur) {
                            contributeur.adresse = undefined;
                            cb(null, contributeur);
                        } else {
                            // error : user don't exist 
                            cb("No user", null);
                        }
                    })
                    .catch(function (err) {
                        console.log(err);
                    });
            } else {
                Proposeur.findById(userId)
                    .then(function (proposeur) {
                        if (proposeur) {
                            proposeur.adresse = undefined;
                            cb(null, proposeur);
                        } else {
                            // error : user don't exist 
                            cb("No user", null);
                        }
                    });
            }
        } else {
            // error : userId undefined
            cb("No userId", null);
        }
    };

    CompteUser.remoteMethod(
        'getUser', {
            accepts: [{
                arg: 'userId',
                type: 'string'
            }, {
                arg: 'typeUser',
                type: 'string'
            }],
            returns: {
                arg: 'user',
                type: 'object'
            },
            description: 'get user without sensitive data (password...)'
        }
    );
    
    CompteUser.getUsers = function (cb) {
        var Contributeur = app.models.CompteContributeur,
            Proposeur = app.models.CompteProposeur;

        var resultTab = [];
        Contributeur.find()
            .then(function (contributeurs) {
                resultTab = contributeurs;
                return Proposeur.find()
            })
            .then(function (proposeurs) {
                var size = proposeurs.length;
                for(var i = 0; i < size; i++){
                    proposeurs[i].proposeur = true;
                    resultTab.push(proposeurs[i]);
                }
                cb(null, resultTab);
            })
            .catch(function (err) {
                cb("Error", null);
                console.log(err);
            });
    };

    CompteUser.remoteMethod(
        'getUsers', {
            returns: {
                arg: 'users',
                type: 'array'
            },
            description: 'get users'
        }
    );
};