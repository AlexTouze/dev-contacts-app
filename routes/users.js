var express = require('express');
var router = express.Router();
var debug = require('debug')('users');

/*
 * GET userlist.
 */
router.get('/getcontactlist', function (req, res, next) {
  var db = req.db;
  var collection = db.get('contactlist');
   collection.find({},{},function(e,docs){
        res.json(docs);
    });
});

/*
 * POST to adduser.
 */
router.post('/addcontact', function (req, res, next) {
  var db = req.db;
  db.collection('contactlist').insert(req.body, function (err, result) {
    res.send(
      (err === null) ? { msg: '' } : { msg: err }
    );
  });
});

/*
 * DELETE to deleteuser.
 */
router.delete('/removecontact/:id', function(req, res) {
    var db = req.db;
    var collection = db.get('contactlist');
    var userToDelete = req.params.id;
    collection.remove({ '_id' : userToDelete }, function(err) {
        res.send((err === null) ? { msg: '' } : { msg:'error: ' + err });
    });
});




module.exports = router;
