var hypertyConnector;

function loadHypertyConnector() {
    RUNTIME.requireHyperty(hypertyURIC(domain, 'Connector')).then((hyperty) => {
        isLoaded = true;
        hypertyConnector = hyperty.instance;
        hypertyConnector.onInvitation(function (controller, identity) {
            notificationHandler(controller, identity);
            var remoteStram = controller.mediaStream();
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

    showVideo(controller);

    $('#inComingCall').modal().hide();
    $('.videoSection').removeClass('hide');

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
    hypertyConnector.search.users([thisEmail], [domain], ['connection'], ['audio', 'video']).then(emailDiscovered).catch(emailDiscoveredError);
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
    var localMediaStream;

    getUserMedia(options).then(function (mediaStream) {
        localMediaStream = mediaStream;
        return hypertyConnector.connect(userUrl, mediaStream, '', userdomain);
    }).then(function (controller) {
        showVideo(controller);
        $('.videoSection').removeClass('hide');
        processMyVideo(localMediaStream);
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
        event.preventDefault();
        controller.disconnect().then(function (status) {
            endCall();
        }).catch(function (err) {
            console.log(err)
        });
    });


    /*** Video Off/On ***/
    var cameraBtn = $('.videoSection .camera.btn');
    cameraBtn.on('click', function (event) {
        event.preventDefault();
        controller.disableVideo().then(function () {
            cameraBtn.text() == cameraBtn.data("text-swap") ? cameraBtn.text(cameraBtn.data("text-original")) : cameraBtn.text(cameraBtn.data("text-swap"));
        }).catch(function (e) {
            console.error(e);
        });
    });

    /*** Mute ***/
    var muteBtn = $('.videoSection .mute.btn');
    muteBtn.on('click', function (event) {
        event.preventDefault();
        controller.mute().then(function () {
            muteBtn.text() == muteBtn.data("text-swap") ? muteBtn.text(muteBtn.data("text-original")) : muteBtn.text(muteBtn.data("text-swap"));
        }).catch(function (e) {
            console.error(e);
        });
    });

    /*** Micro ***/
    var micBtn = $('.videoSection .mic.btn');
    micBtn.on('click', function (event) {
        event.preventDefault();
        controller.disableAudio().then(function () {
            micBtn.text() == micBtn.data("text-swap") ? micBtn.text(micBtn.data("text-original")) : micBtn.text(micBtn.data("text-swap"));
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

