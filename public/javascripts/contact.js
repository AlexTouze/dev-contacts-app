var contactsList = [];
//var url = 'http://130.149.22.133:5002';

function addContactEvent() {
    // Delete User link click
    $('#userList table tbody').on('click', 'td button.deleteUser', removeContact);

    // Show User link click
    $('#userList table tbody').on('click', 'td button.infoUser', contactInfo);

    // Show User link click
    $('#userList table tbody').on('click', 'td button.callUser', callUser);
    //$('#userList table tbody').on('click', 'td button.callUser', callWebRTC);

    $('.addContact').on('click', addContact);

}

function addContact(event) {
    event.preventDefault();
    var emptyInput = 0;
    var exist = false;

    $('#addUser input').each(function (index, val) {
        if ($(this).val() === '') { emptyInput++; }
    });

    var newUser = {
        'firstname': $('#inputFirstName').val(),
        'lastname': $("#inputLastName").val(),
        'age': $("#inputAge").val(),
        'guid': $("#inputGuid").val(),
        'mail': $("#inputEmail").val()
    }

    $.each(contactsList, function () {
        if (this.contactlist.mail === newUser.mail) exist = true
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
                else { alert('Error: ' + response.msg); }  // If something goes wrong, alert the error message that our service returned
            });
        }
        else {
            alert('User is already add');
        }
    }
}

function removeContact(event) {
    event.preventDefault();
    $.ajax({
        type: 'DELETE',
        url: '/users/removecontact/' + $(this).attr('rel')
    }).done(function (response) {
        // Check for a successful (blank) response
        if (response.msg != '') alert('Error: ' + response.msg);

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
            var callId = "";
            var uids = "";
            $.each(JSON.parse(this.contactlist.uids), function () {
                if (this.domain.indexOf("orange-labs.fr") != -1) {
                    callId = this.uid
                    domainId = this.domain
                }
                uids += "uid: " + this.uid + "<br>" + "domain: " + this.domain + "<br>";
            });
            tableContent += '<tr>';
            tableContent += '<td>' + this.contactlist.firstname + ' ' + this.contactlist.lastname + '</td>';
            tableContent += '<td>' + this.contactlist.mail + '</td>';
            tableContent += '<td>' + this.contactlist.age + '</td>';
            tableContent += '<td id="" rel="">' + uids + '</td>';
            tableContent += '<td><button type="button" class="infoUser btn btn-xs btn-info" rel="' + this.contactlist.guid + '">Info</button></td>';
            tableContent += '<td><button type="button" class="deleteUser btn btn-xs btn-danger" rel="' + this._id + '" >delete</button></td>';
            if(callId != "")  tableContent += '<td><button type="button" class="callUser btn btn-xs btn-success" uid="' + callId + '" domain="' + domainId + '">call</button></td>';
            //else tableContent +='<td><button type="button" class="callUser btn btn-xs btn-default">call</button></td>';
            tableContent += '</tr>';
        });
        // Inject the whole content string into our existing HTML table
        $('#userList table tbody').html(tableContent);

    });
}

function contactInfo(event) {
    event.preventDefault();

    var thisGuid = $(this).attr('rel');
    var thisContact;

    $.each(contactsList, function () {
        if (this.contactlist.guid === thisGuid) thisContact = this.contactlist
    });

    $('#userFirstName').text(thisContact.firstname);
    $('#userLastName').text(thisContact.lastname);
    $('#userAge').text(thisContact.age);
    $('#userGuid').text(thisContact.guid);
    $('#userMail').text(thisContact.mail);

    $.ajax({
        type: 'GET',
        url: '/users/globalcontact/' + thisContact.guid
    }).done(function (response) {
        console.log(response)
    });

}

function callUser(event) {
    event.preventDefault();
    $.ajax({
        type: 'GET',
        url: '/users/getRoom/' + $(this).attr('uid') 
    }).done(function (response) {
        if(response.url != ''){
           window.location.href = response.url
        }
        else{
            alert("Your contact is offline");
        }
    });
}