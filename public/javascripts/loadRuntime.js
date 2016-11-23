/** Region Variables **/
var RUNTIME;
var runtimeURL;
var domain;
var hypertyConnector;

/** Region Constants **/
var hypertyURIC = (domain, hyperty) => `hyperty-catalogue://catalogue.${domain}/.well-known/hyperty/${hyperty}`;

/** Load Runtme reThink **/
function loadreThink() {
    RUNTIME = runtimeURL = domain = hypertyConnector = null;
    //Rethink runtime is included in index.html
    registerDomain();
}

function registerDomain() {
    $.getJSON('/getdomain', function (data) {
        var protomatch = /^(https?|ftp):\/\//;
        domain = data.replace(protomatch, '');
        runtimeURL = 'hyperty-catalogue://catalogue.' + domain + '.well-known/runtime/Runtime';
    }).done(function () {
        loadRuntime();
    });
}

// Loads the runtime.
function loadRuntime() {
    var start = new Date().getTime();
    rethink.default.install({
        domain: domain,
        development: false,
        runtimeURL: runtimeURL
    }).then((runtime) => {
        RUNTIME = runtime
        var time = (new Date().getTime()) - start;
        console.log('Runtime has been successfully launched in ' + time / 1000 + ' seconds');
        loadHypertyConnector()
    });
}


function loadHypertyConnector() {
    RUNTIME.requireHyperty(hypertyURIC(domain, 'Connector')).then((hyperty) => {
        isLoaded = true;
        hypertyConnector = hyperty;
        hyperty.instance.onInvitation(function (controller, identity) {
            notificationHandler(controller, identity);
        });
    }).catch(function (err) {

        console.log("err");

    });
}


function notificationHandler(controller, identity) {
    $('#avatar').attr("src", identity.avatar)
    $('#calleeName').text(identity.cn);
    $('#calleeUsername').text(identity.username);
    $('#calleLocale').text(identity.locale);
    $('#calleUserURL').text(identity.userURL);
    $('#acceptedCall').click(function (event) {
        acceptCall(event, controller)
    });
    $('#rejectedCall').click(function (event) {
        rejectCall(event, controller)
    });
    $('#inComingCall').modal().show();
}

function acceptCall(event, controller) {
    $('#inComingCall').modal().hide();
    $('.videoSection').removeClass('hide');
    $('#rejectedCall').click();
    showVideo(controller);
    event.preventDefault();
    var options = options || { video: true, audio: true };
    getUserMedia(options).then(function (mediaStream) {
        processMyVideo(mediaStream);
        return controller.accept(mediaStream);
    })
        .then(function (result) {
            console.log(result);
        }).catch(function (reason) {
            endCall();
            console.error(reason);
        });
}

function rejectCall(event, controller) {
    controller.decline().then(function (result) {
        console.log(result);
    }).catch(function (reason) {
        console.error(reason);
    });
    event.preventDefault();
}

function callUser() {
    var thisEmail = $(this).attr('rel');
    hypertyConnector.instance.search.users([thisEmail], [domain], ['connection'], ['audio', 'video']).then(emailDiscovered).catch(emailDiscoveredError);
}

function emailDiscovered(result) {
    result.forEach((hyperty) => {
        var userURL = hyperty.userID;
        var hypertyURL = hyperty.hypertyID;
        var domain = hypertyURL.substring(hypertyURL.lastIndexOf(':') + 3, hypertyURL.lastIndexOf('/'));
        openVideo(userURL, domain);
    });
}

function emailDiscoveredError(err) {

    console.log('err', err);
}

function openVideo(userUrl, userdomain) {
    var options = { video: true, audio: true };
    getUserMedia(options).then(function (mediaStream) {

    }).then(function (controller) {
        showVideo(controller);
        $('.videoSection').removeClass('hide');
        $('.my-video')[0].src = URL.createObjectURL(mediaStream);
    }).catch(function (reason) {
        console.log(reason);
    })
}

/**
* Video management
*/
function getUserMedia(constraints) {
    return new Promise(function (resolve, reject) {
        navigator.mediaDevices.getUserMedia(constraints)
            .then(function (mediaStream) {
                resolve(mediaStream);
            })
            .catch(function (reason) {
                reject(reason);
            });
    });
}

function showVideo(controller) {
    controller.onAddStream(function (event) {
        processVideo(event);
    });


    controller.onDisconnect(function (identity) {
        endCall();
    });
    
    /*** End call ***/
    $('.videoSection .hangout.btn').on('click', function (event) {
        controller.disconnect(function (identity) {
            endCall();
        });
    });

    /*** Video Off/On ***/
    $('.videoSection .camera.btn').on('click', function (event) {
        event.preventDefault();
        controller.disableVideo().then(function () {
            var el = $(this);
            el.text() == el.data("text-swap") ? el.text(el.data("text-original")) : el.text(el.data("text-swap"));
        }).catch(function (e) {
            console.error(e);
        });
    });

    /*** Mute ***/
    $('.videoSection .mute.btn').on('click', function (event) {
        event.preventDefault();
        controller.mute().then(function () {
            var el = $(this);
            el.text() == el.data("text-swap") ? el.text(el.data("text-original")) : el.text(el.data("text-swap"));
        }).catch(function (e) {
            console.error(e);
        });
    });

    /*** Micro ***/
    $('.videoSection .mic.btn').on('click', function (event) {
        event.preventDefault();
        controller.disableAudio().then(function () {
            var el = $(this);
            el.text() == el.data("text-swap") ? el.text(el.data("text-original")) : el.text(el.data("text-swap"));
        }).catch(function (e) {
            console.error(e);
        });
    });
}

function endCall() {
    $('.videoSection').addClass('hide');
    $('.video')[0].src = $('.my-video')[0].src = '';
}

function processVideo(event) {
    console.log('Process Video: ', event);
    $('.video')[0].src = URL.createObjectURL(event.stream);
}

function processMyVideo(mediaStream) {
    console.log('Process Local Video: ', mediaStream);
    $('.my-video')[0].src = URL.createObjectURL(mediaStream);
}

