/*function authConnect() {
    wid_connect({})
        .then(jwt => {
            window.location.href = "/auth/connect?jwt=" + jwt
        })
}*/

function authConnect() {
    wid_connect({}).then(jwt => {
        $.ajax({
            type: 'POST',
            url: '/auth/connect?jwt=' + jwt,
        }).done(function(response) {
           console.log("ok");
        });
    })
}