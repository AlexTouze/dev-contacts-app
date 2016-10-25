var contactListData = [];


// DOM Ready =============================================================
$(document).ready(function() {

    // Populate the user table on initial page load
    getContactList();

    // Delete User link click
    $('#userList table tbody').on('click', 'td a.linkdeleteuser', removeContact);

});

function addContact() {

    /*var firstname = $("#firstname").val();
    var lastname = $("#lastname").val();
    var age = $("#age").val();
    var guid =  $("#guid").val();
    var mail =  $("#mail").val();*/
    
    var newUser = {
        'firstname': $('#fname').val(),
        'lastname': $("#lastname").val(),
        'age': $("#age").val(),
        'guid': $("#guid").val(),
        'mail': $("#mail").val()
    }

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

function removeContact() {

    console.log($(this).attr('rel'));
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
        userListData = data;
        console.log(userListData);
        $.each(data, function(){
            tableContent += '<tr>';
            tableContent += '<td><a href="#" class="linkshowuser" rel="' + this.firstname + '" title="Show Details">' + this.firstname + '</a></td>';
            tableContent += '<td>' + this.mail + '</td>';
            tableContent += '<td>' + this.guid + '</td>';
            tableContent += '<td>' + this.age + '</td>';
            tableContent += '<td><a href="#" class="linkdeleteuser" rel="' + this._id + '">delete</a></td>';
            tableContent += '</tr>';
        });

        // Inject the whole content string into our existing HTML table
        $('#userList table tbody').html(tableContent);

    });

}