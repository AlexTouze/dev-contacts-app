// DOM Ready =============================================================
$(document).ready(function () {

    /*** Load Runtime reThink ****/

    // Load domain Runtime or local 
    
     $('#login').modal().show();

    /*=============================================================*/

    /******* Contact View************/

    // Populate the user table on initial page load
    getContactList();

    // Add Contact event 
    addContactEvent();
    //setTimeout(loadreThink, 3000);

});