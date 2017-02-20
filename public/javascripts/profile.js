// DOM Ready =============================================================
$(document).ready(function () {
    /******* Admin View************/
    // Populate the user table on initial page load
    getUserInfo();
    toggleFields();
    addProfileEvents();
});

function buildUidArray(record)
{
      if (!record.legacyIDs)
      {
        record.legacyIDs = [];
      }
      if (!record.userIDs)
      {
        record.userIDs = [];
      }
      return record.userIDs.concat(record.legacyIDs);
}

function addProfileEvents() {
    $("#reTHINKCheck").change(function(){ toggleFields();} );
    $('.btnaddcontact').on('click', addContact);
   if ($("#GUIDCheck")[0])
    {
        $("#GUIDCheck").change(function(){ toggleFields();} );
        $('.btnpublish').on('click', publishGUID);
        $('.btnimport').on('click', importGUID);
    }
//    else {
//        $('.btnunpublish').on('click', unpublishGUID);
//    }
//    $('.btnpublish').on('click', publishGUID);
}

function toggleFields()
{
/*
    if ($("#reTHINKCheck").is(":checked") == true)
        $("#divInputReTHINKID").show();
    else
        $("#divInputReTHINKID").hide();
*/
    // GUID Checkbox is only present when there is no GUID.
    if ($("#GUIDCheck")[0])
    {
        if ($("#GUIDCheck").is(":checked") == true){
            $("#divInputGUID").show();
            $(".btnpublish").addClass("disabled");
        }else{
            $("#divInputGUID").hide();
            $(".btnpublish").removeClass("disabled");
        }
    }
};

function remove(id, domain)
{
    $.post('/users/removeContactFromGlobal',{ id: id, domain: domain }, function (data, response) {
        // Check for successful (blank) response
        if (response == 'success') {
            getUserInfo();
            return false;
        }
        else { alert('Error: failure');return false; }  // If something goes wrong, alert the error message that our service returned
    });
}

function getUserInfo() {
    var tableContent = '';
    if ($("#spanGUID")[0])
    {
        var guid = $("#spanGUID")[0].firstChild.data;
        var requestUrl = gregUrl + '/guid/' + guid;
        $.get(requestUrl, function (data) {
            var record = JSON.parse(atob(JSON.parse(atob(data.Value.split(".")[1])).data));
            var tab = buildUidArray(record);
            // Stick our user data array into a userlist variable in the global object
            $.each(tab, function () {
                var id = this.uid?this.uid:this.id;
                var domain = this.domain?this.domain:this.category;
                tableContent += '<tr><td>';
                if (this.uid){tableContent += '<img src="/favicon.ico"/>'};
                tableContent += id;
                tableContent += '</td><td>';
                tableContent += domain;
                tableContent += '</td><td>';
                tableContent += '<button type="submit" class="btnremove btn-xs btn-warning" onclick="remove(\'' +id +'\',\''+ domain + '\');">Remove</button>';
                tableContent += '</td></tr>';
            });

            // Inject the whole content string into our existing HTML table
            $('#uidsList table tbody').html(tableContent);
        });
    }
}

function publishGUID(event)
{
    event.preventDefault(); 
    $.ajax({
        type: 'PUT',
        data: "{}",
        url: '/users/globalcontact/',// + value,
        dataType: 'JSON'
    }).done(function (response) {
        // Check for successful (blank) response
        if (response.msg === '') {
            location.reload();
        }
        else { alert('Error: ' + response.msg); }  // If something goes wrong, alert the error message that our service returned
    });
}

function importGUID(event)
{
    if (($("#GUIDCheck")[0].checked == true) && ($('#userGUID').val() == "" || $('#inputPrKey').val() == ""))
    {
        return ;
    }
    event.preventDefault(); 
    var guid = $('#userGUID').val();
    $.ajax({
        type: 'PUT',
        data: {"key":$('#inputPrKey').val()},
        url: '/users/globalcontact/' + guid,
        dataType: 'JSON'
    }).complete(function (response) {
        // Check for successful (blank) response
        if (response.responseJSON.msg === '') {
            location.reload();
        }
        else { alert('Error: ' + response.responseJSON.msg); }  // If something goes wrong, alert the error message that our service returned
    });
}

function addContact(event)
{
    if (($('#uid').val() == "") || 
    (($("#reTHINKCheck").is(":checked") == true) && ($('#idpDomain').val() == "" || $('#serviceDomain').val() == "" )))
    {
        return ;
    }
    event.preventDefault();
    $.post('/users/addContactToGlobal',$("#contactForm").serialize(), function (data, response) {
        // Check for successful (blank) response
        if (response == 'success') {
            getUserInfo();
            // clear fields
            $('#uid').val("");
            $('#serviceDomain').val("");
            $('#idpDomain').val("");
            $("#reTHINKCheck")[0].checked = false
            toggleFields();
        }
        else { alert('Error: ' + response.msg); }  // If something goes wrong, alert the error message that our service returned
    });
}

function unpublishGUID(event)
{
/*wid_connect({})
.then(jwt => {
	var payload = atob(jwt.split('.')[1])
	var iss= payload.iss
	var sub= payload.sub
	// Set joignability information as
	// uid:iss/sub
})
*/
}