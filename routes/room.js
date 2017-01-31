var express = require('express');
var router = express.Router();


// ROOM ==============================
/*router.get('/room/', isLoggedIn, function (req, res) {
    res.render('rooms.ejs', {
        user: req.user,
        rooms: app.get('rooms')
    });
})
router.get('/room/:roomId', isLoggedIn, function (req, res) {
    res.render('room.ejs', {
        user: req.user,
        room: req.params.roomId
    });
})*/

module.exports = router;