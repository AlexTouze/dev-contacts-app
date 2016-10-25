var contactsList = [];


// DOM Ready =============================================================
$(document).ready(function () {

    // Populate the user table on initial page load
    getContactList();

    // Delete User link click
    $('#userList table tbody').on('click', 'td button.deleteUser', removeContact);

    // Show User link click
    $('#userList table tbody').on('click', 'td button.infoUser', contactInfo);
    

});

function addContact(event) {
    var emptyInout = 0;

    $('#addUser input').each(function (index, val) {
        if ($(this).val() === '') { emptyInout++; }
    });

    var newUser = {
        'firstname': $('#inputFirstName').val(),
        'lastname': $("#inputLastName").val(),
        'age': $("#inputAge").val(),
        'guid': $("#inputGuid").val(),
        'mail': $("#inputEmail").val()
    }

    // Check and make sure errorCount's still at zero
    if (emptyInout === 0) {
        $.ajax({
            type: 'POST',
            data: newUser,
            url: '/users/addcontact',
            dataType: 'JSON'
        }).done(function (response) {

            // Check for successful (blank) response
            if (response.msg === '') {
                // Clear the form inputs
                $('#addUser fieldset input').val('');

                getContactList();
            }
            else {
                // If something goes wrong, alert the error message that our service returned
                alert('Error: ' + response.msg);
            }
        });
    }
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

    $.getJSON('/users/getcontactlist', function (data) {

        // Stick our user data array into a userlist variable in the global object
        contactsList = data;
       
        $.each(data, function () {
            tableContent += '<tr>';
            tableContent += '<td><a href="#" class="linkshowuser" rel="' + this.firstname + '" title="Show Details">' + this.firstname + '</a></td>';
            tableContent += '<td>' + this.mail + '</td>';
            tableContent += '<td>' + this.guid + '</td>';
            tableContent += '<td>' + this.age + '</td>';
            tableContent += '<td><button type="button" class="infoUser btn btn-xs btn-info" rel="' + this.guid + '">Info</button></td>';
            tableContent += '<td><button type="button" class="deleteUser btn btn-xs btn-danger" rel="' + this._id + '" >delete</button></td>';
            tableContent += '</tr>';
        });

        // Inject the whole content string into our existing HTML table
        $('#userList table tbody').html(tableContent);
    });
}

function contactInfo(event){

    event.preventDefault();

    var thisGuid = $(this).attr('rel');
    var thisContact;

    $.each(contactsList, function(){
        if(this.guid === thisGuid) thisContact = this 
    });
   
   console.log(thisContact);

   $('#userFirstName').text(thisContact.firstname);
   $('#userLastName').text(thisContact.lastname);
   $('#userAge').text(thisContact.age);
   $('#userGuid').text(thisContact.guid);
   $('#userMail').text(thisContact.mail);
}