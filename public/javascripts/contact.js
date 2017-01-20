var contactsList = [];
var url = 'http://130.149.22.133:5002';
var urlOrange = 'http://161.106.2.23:5002';
var port = '5002'


function addContactEvent() {
    // Delete User link click
    $('#userList table tbody').on('click', 'td button.deleteUser', removeContact);

    // Show User link click
    $('#userList table tbody').on('click', 'td button.infoUser', contactInfo);

    // Show User link click
    //$('#userList table tbody').on('click', 'td button.callUser', callUser);
    $('#userList table tbody').on('click', 'td button.callUser', callWebRTC);

    $('.addContact').on('click', addContact);

}

function addContact(event) {
    event.preventDefault();
    var emptyInput = 0;
    var exist = false;

    $('#addUser input').each(function (index, val) {
        if ($(this).val() === '') { emptyInput++; }
    });

    var currentGraphConnector = getGraphConnector();
    currentGraphConnector.generateGUID();
    currentGraphConnector.globalRegistryRecord.userIDs.push({ uid: "user://machin.goendoer.net/", domain: "google.com" }, { uid: "user://bidule.com/fluffy123", domain: "google.com" });
    currentGraphConnector.globalRegistryRecord.defaults.push({ voice: "a", chat: "b", video: "c" })
    var token = currentGraphConnector.signGlobalRegistryRecord();

    /*var newUser = {
        'firstname': $('#inputFirstName').val(),
        'lastname': $("#inputLastName").val(),
        'age': $("#inputAge").val(),
        'guid': currentGraphConnector.globalRegistryRecord.guid,
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
    }*/



    //currentGraphConnector.signGlobalRegistryRecord();
    /*console.log("userGUID", userGUID);
    var test = JSON.stringify({ data: dataJSONUser });
    var oHeader = { alg: 'ES256', typ: 'JWT' };
    var sHeader = JSON.stringify(oHeader);
    var base64Data = btoa(JSON.stringify(dataJSONUser));
    var sPayload = JSON.stringify({
        "data": base64Data
    });

    var sJWT = KJUR.jws.JWS.sign("ES256", sHeader, sPayload, userGUID.privatePEM);
    //console.log(sPayload);
    var path = '/guid/' + userGUID.guid;
    var dataUser = { url: urlOrange, port: port, path, sHeader: sHeader, sPayload: test, privateKey: userGUID.privatePEM, publickey: userGUID.publicPEM, expire: timeout, token: sJWT };
    */  

    var urlRequest =  urlOrange + '/guid/' + currentGraphConnector.globalRegistryRecord.guid;


    $.ajax({
        type: 'PUT',
        url: '/users/addcontact/',
        data: {token: token, urlRequest: urlRequest }
    }).done(function (response) {
        console.log(response)
    })

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