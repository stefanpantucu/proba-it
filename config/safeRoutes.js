const ActiveSession = require('../models/activeSession');

function parseJwt (token) {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(Buffer.from(base64, 'base64').toString().split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
};

const reqAuth = (req, res, next) => {
    const token = String(req.headers.authorization);
    ActiveSession.find({ token: token }, (err, session) => {
        if (session.length == 1) { // there is one element in the array
            
            let user = parseJwt(token).user;
            if (user.role != 'teacher'){
                console.log('User is a student, not a teacher');
                return res.status(403).send();
            }
            req.body.teacher_id = user._id;
            return next();
        }
        else {
            console.log('User is not logged in');
            return res.status(401).send(); // unauthorized
        }
    })
}

module.exports = {
    reqAuth: reqAuth
};