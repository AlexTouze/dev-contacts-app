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
        result.instance.onInvitation(function (controller, identity) {
            notificationHandler(controller, identity);
        });
    }).catch(function (err) {

        console.log("err");

    });
}


function notificationHandler(controller, identity) {

    console.log('controller', controller);
    console.log('identity', identity);
    $('#inComingCall').modal();
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
        showVideo(controller)
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

function showVideo() {
    controller.onAddStream(function (event) {
        processVideo(event);
    });

    controller.onDisconnect(function (identity) {
        hideVideo();
        disconnecting();
    });

    $('.videoSection .camera.btn').on('click', function (event) {
        event.preventDefault();
        controller.disableVideo().then(function (status) {
            console.log(status, 'camera');
            var icon = 'videocam_off';
            var text = 'Disable Camera';
            if (!status) {
                text = 'Enable Camera';
                icon = 'videocam';
            }

            var iconEl = '<i class="material-icons left">' + icon + '</i>';
            $(event.currentTarget).html(iconEl);
        }).catch(function (e) {
            console.error(e);
        });

    });
}

