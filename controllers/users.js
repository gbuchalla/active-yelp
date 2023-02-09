const User = require('./../models/user');
const { joiUserSchema } = require('../joiSchemas');
const ExpressError = require('../utils/newExpressError');

const renderRegister = (req, res) => {
    res.render('register');
};

const register = async (req, res, next) => {
    const { username, password } = req.body;
    await joiUserSchema.validateAsync({ username, password });
    User.register({ username }, password, (err, newUser) => {
        if (err) {
            return next(new ExpressError(err.status, `Algo deu errado no registro de usuário: ${err.message}`));
        }
        req.login(newUser, error => {
            if (error) {
                return next(new ExpressError(error.status, `Um erro ocorreu no login do usuário: ${error.message}`));
            };
            res.redirect('/gyms');
        });
    });
};

const renderLogin = (req, res) => {
    res.render('login');
};

const login = (req, res) => {
    res.redirect('/gyms');
};

const logout = (req, res, next) => {
    req.logout(err => {
        if (err) return next(err);
    });
    res.redirect('/gyms');
};

module.exports = { renderRegister, register, renderLogin, login, logout };