// DOM Ready =============================================================
$(document).ready(function () {
    /******* Admin View************/
    // Populate the user table on initial page load
    getUserInfo();
});

function getUserInfo() {

    var tableContent = '';

    $.getJSON('/users/getUserInfo', function (data) {

        // Stick our user data array into a userlist variable in the global object
        $.each(data, function () {
            tableContent += '<tr>';
            tableContent += '<td>' + this.uid + '</td>';
            tableContent += '<td>' + this.domain + '</td>';
            tableContent += '</tr>';
        });

        // Inject the whole content string into our existing HTML table
        $('#uidsList table tbody').html(tableContent);
    });
}
