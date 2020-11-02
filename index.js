const express = require('express');
const passport = require('passport');
const bodyParser = require('body-parser');
const LdapStrategy = require('passport-ldapauth');
const jwt = require('jwt-simple')
const passportJwt = require('passport-jwt')
const { Strategy, ExtractJwt } = passportJwt
 
var OPTS = {
  server: {
    url: 'ldap://localhost:389',
    bindDN: 'cn=admin,dc=nardy,dc=com,dc=br',
    bindCredentials: 'admin',
    searchBase: 'dc=nardy,dc=com,dc=br',
    searchFilter: '(uid={{username}})'
  }
};
 
var app = express();
 
passport.use(new LdapStrategy(OPTS));

const params = {
    secretOrKey: 'secret',
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken()
}

const strategy = new Strategy(params, (payload, done) => {
    done(null, { ...payload })
})

passport.use(strategy)
 
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(passport.initialize());
 
app.post('/login', (req, res, next) => {
    passport.authenticate('ldapauth', {session: false}, (err, user) => {
        console.log(user)
        if (err) {
            return next(err); // will generate a 500 error
        }
        if (!user) {
            return res.status(401).send({ message : 'Authentication failed' });
        }
        const now = Math.floor(Date.now() / 1000)
        const payload = {
            user: user.uid,
            department: user.departmentNumber,
            iat: now,
            exp: now * (60 * 60 * 24 * 3)
        }
        res.send({
            ...payload,
            token: jwt.encode(payload, 'secret')
        });
    })(req, res, next);
});

app.get('/dash', passport.authenticate('jwt', {session: false}), (req, res) => {
    res.send({msg: "OK"})
})

app.get('/department', passport.authenticate('jwt', {session: false}), (req, res) => {
    if (req.user.department === 'rh') {
    res.send({msg: "OK again"})
    } else {
        return res.status(401).send({ message : 'Not authorized' });
    }
})
 
app.listen(3000);