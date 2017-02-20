function authConnect() {
    wid_connect({})
        .then(jwt => {
            window.location.href = "/auth/connect?jwt=" + jwt
        })
    return false;
}