


function addContact() {
   
   var age = $("#fname").val();
   var newUser = {
       'firstname': $('#fname').val(),
       'lasename': age,
       'guid': age,
       'age' :age
   }
   
    $.ajax({
        type: 'POST',
        data: newUser,
        url: '/users/adduser',
        dataType: 'JSON'
    }).done(function (response) {

        // Check for successful (blank) response
        if (response.msg === '') {

            // Clear the form inputs
            /*$('#addUser fieldset input').val('');

            // Update the table
            populateTable();*/
            console.log("OK");
        }
        else {

            // If something goes wrong, alert the error message that our service returned
            alert('Error: ' + response.msg);

        }
       // console.log(response.msg);
    });
}

function removeContact() {

}

function getContactList() {

}