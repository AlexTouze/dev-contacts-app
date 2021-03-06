var contactsList = [];
var url = 'http://130.149.22.133:5002';
var port = '5002'


function addContactEvent() {
    // Delete User link click
    $('#userList table tbody').on('click', 'td button.deleteUser', removeContact);

    // Show User link click
    $('#userList table tbody').on('click', 'td button.infoUser', contactInfo);

    // Show User link click
    $('#userList table tbody').on('click', 'td button.callUser', callUser);

    $('.addContact').on('click', addContact);

}

function addContact(event) {
    event.preventDefault();
    var emptyInput = 0;
    var exist = false;

    $('#addUser input').each(function (index, val) {
        if ($(this).val() === '') { emptyInput++; }
    });

    var userGUID = generateGUID();
    /*$.ajax({
        type: 'GET',
        url: '/guidNode/getGUID/'
    }).done(function (data) {
        if (!salt || 0 === salt.length) generateSalt();
        privatePEM = data.private;
        publicPEM = data.public;
        var iterations = 10000;
        var guidBitArray = sjcl.misc.pbkdf2(publicPEM, salt, iterations);
        var guid = sjcl.codec.base64url.fromBits(guidBitArray);

        userGUID = { guid: guid, publicPEM: publicPEM, privatePEM: privatePEM, salt: salt };*/


        var newUser = {
            'firstname': $('#inputFirstName').val(),
            'lastname': $("#inputLastName").val(),
            'age': $("#inputAge").val(),
            'guid': userGUID.guid,
            'mail': $("#inputEmail").val()
        }

        $.each(contactsList, function () {
            if (this.guid === newUser.guid) exist = true
        });


        // Check and make sure errorCount's still at zero
        if (emptyInput === 0) {
            if (!exist) {
                $.ajax({
                    type: 'POST',
                    data: newUser,
                    url: '/users/addcontact/',
                    dataType: 'JSON'
                }).done(function (response) {

                    // Check for successful (blank) response
                    if (response.msg === '') {
                        // Clear the form inputs
                        $(".form-signin")[0].reset();
                        getContactList();
                    }
                    else {
                        // If something goes wrong, alert the error message that our service returned
                        alert('Error: ' + response.msg);
                    }
                });


            }
            else {
                alert('Error:  Guid already exists');
            }
        }


        var today = new Date();
        var dd = today.getDate();
        var mm = today.getMonth() + 1; //January is 0!
        var yyyy = today.getFullYear();
        var hours = today.getHours();
        var min = today.getMinutes();
        var sec = today.getSeconds();

        if (dd < 10) {
            dd = '0' + dd
        }

        if (mm < 10) {
            mm = '0' + mm
        }
        today = yyyy + '-' + mm + '-' + dd + 'T' + hours + ':' + min + ':' + sec + '+00:00';
        var timeout = yyyy + 10 + '-' + mm + '-' + dd + 'T' + hours + ':' + min + ':' + sec + '+00:00';

        var dataJSONUser = {
            "guid": userGUID.guid,
            "schemaVersion": 1,
            "userIDs": [{
                "uid": "user://machin.goendoer.net/",
                "domain": "google.com"
            }, {
                "uid": "user://bidule.com/fluffy123",
                "domain": "google.com"
            }],
            "lastUpdate": today,
            "timeout": timeout,
            "publicKey": userGUID.publicPEM,
            "salt": userGUID.salt,
            "active": 1,
            "revoked": 0,
            "defaults": {
                "voice": "a",
                "chat": "b",
                "video": "c"
            }
        }
        console.log("userGUID", userGUID);
        var test = JSON.stringify({ data: dataJSONUser });
        var oHeader = { alg: 'ES256', typ: 'JWT' };
        var sHeader = JSON.stringify(oHeader);
        var sPayload = JSON.stringify(dataJSONUser);

        //var sJWT = KJUR.jws.JWS.sign("ES256", sHeader, sPayload, userGUID.privatePEM);
        console.log(sPayload);
        var path = '/guid/' + userGUID.guid;
        var dataUser = { url: url, port: port, path, sHeader: sHeader, sPayload: sPayload, privateKey: userGUID.privatePEM, expire: timeout };

        /*$.ajax({
            type: 'PUT',
            url: '/users/addcontact/',
            data: dataUser
        }).done(function (response) {
            console.log(response)
        })
    })*/
}

function removeContact(event) {

    event.preventDefault();
    $.ajax({
        type: 'DELETE',
        url: '/users/removecontact/' + $(this).attr('rel')
    }).done(function (response) {

        // Check for a successful (blank) response
        if (response.msg === '') {
        }
        else {
            alert('Error: ' + response.msg);
        }

        // Update the table
        getContactList();

    });
}

function getContactList() {
    // Empty content string
    var tableContent = '';

    $.getJSON('/users/getcontactlists', function (data) {

        // Stick our user data array into a userlist variable in the global object
        contactsList = data;

        $.each(data, function () {
            tableContent += '<tr>';
            tableContent += '<td>' + this.firstname + ' ' + this.lastname + '</td>';
            tableContent += '<td>' + this.mail + '</td>';
            tableContent += '<td>' + this.age + '</td>';
            tableContent += '<td><button type="button" class="infoUser btn btn-xs btn-info" rel="' + this.guid + '">Info</button></td>';
            tableContent += '<td><button type="button" class="deleteUser btn btn-xs btn-danger" rel="' + this._id + '" >delete</button></td>';
            tableContent += '<td><button type="button" class="callUser btn btn-xs btn-success" rel="' + this.mail + '" >call</button></td>';
            tableContent += '</tr>';
        });

        // Inject the whole content string into our existing HTML table
        $('#userList table tbody').html(tableContent);
    });

    /*$.ajax({
        crossDomain: true,
        contentType: "application/json; charset=utf-8",
        type: 'GET',
        dataType: "json",
        success: function (data) {
            console.log("success", data);
        },
    })*/

}

function logResults(json) {
    console.log(json);
}

function contactInfo(event) {

    event.preventDefault();

    var thisGuid = $(this).attr('rel');
    var thisContact;

    $.each(contactsList, function () {
        if (this.guid === thisGuid) thisContact = this
    });

    console.log(thisContact);

    $('#userFirstName').text(thisContact.firstname);
    $('#userLastName').text(thisContact.lastname);
    $('#userAge').text(thisContact.age);
    $('#userGuid').text(thisContact.guid);
    $('#userMail').text(thisContact.mail);
}