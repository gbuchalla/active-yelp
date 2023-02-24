const User = require('./../models/user');
const { joiUserSchema } = require('../joiSchemas');
const ExpressError = require('../utils/newExpressError');

const renderRegister = (req, res) => {
    res.render('users/register');
};

const register = async (req, res, next) => {
    const { username, password } = req.body;
    await joiUserSchema.validateAsync({ username, password });
    User.register({ username }, password, (err, newUser) => {
        if (err) {
            req.flash('error', `Erro no registro: ${err.message}`);
            return res.redirect('register');
        }
        req.login(newUser, error => {
            if (error) {
                return next(new ExpressError(error.status, `Um erro ocorreu no login do usuário: ${error.message}`));
            };
            req.flash('success', 'Seja bem vindo(a) ao ActiveYelp!')
            res.redirect('/gyms');
        });
    });
};

const renderLogin = (req, res) => {
    res.render('users/login');
};

const login = (req, res) => {
    const originalUrl = req.session.returnTo;
    delete req.session.returnTo;
    req.flash('success', 'Seja bem vindo(a) ao ActiveYelp!')
    res.redirect(originalUrl || '/gyms');
};

const logout = (req, res, next) => {
    req.logout(async err => {
        if (err) return next(err);
        req.session.destroy();
        res.redirect('/gyms');
    });
};

module.exports = { renderRegister, register, renderLogin, login, logout };