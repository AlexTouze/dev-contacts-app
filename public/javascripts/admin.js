// DOM Ready =============================================================
$(document).ready(function () {
    /******* Admin View************/
    // Populate the user table on initial page load
    getLocalUsers();

    // Delete User link click
    $('#userList table tbody').on('click', 'td button.deleteUser', removeLocalUser);
});

function getLocalUsers() {

    var tableContent = '';

    $.getJSON('/users/getLocalUsers', function (data) {

        // Stick our user data array into a userlist variable in the global object
        contactsList = data;
        $.each(data, function () {
            tableContent += '<tr>';
            tableContent += '<td>' + (this.local ? this.local.email : 'undefined') + '</td>';
            tableContent += '<td>' + (this.local ? this.local.guid : 'undefined') + '</td>';
            tableContent += '<td><button type="button" class="deleteUser btn btn-xs btn-danger" rel="' + this._id + '" >delete</button></td>';
            tableContent += '</tr>';
        });

        // Inject the whole content string into our existing HTML table
        $('#userList table tbody').html(tableContent);
    });
}

function removeLocalUser(event) {
    event.preventDefault();
    $.ajax({
        type: 'DELETE',
        url: '/users/removeLocalUsers/' + $(this).attr('rel')
    }).done(function (response) {
        // Check for a successful (blank) response
        if (response.msg != '') alert('Error: ' + response.msg);

        // Update the table
        getLocalUsers();
    });
}