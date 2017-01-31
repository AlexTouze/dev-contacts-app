var STATUS_DISCONNECTED;
var STATUS_CONNECTED;

var HYPERTY_NAME = "DTWebRTC";
var hyperty;
var runtimeLoader;
var autoConnect = false;
var status = STATUS_DISCONNECTED;


function loadHypertyWebRTC() {
    RUNTIME.loadHyperty(hypertyURIC(domain, 'DTWebRTC')).then((hyperty) => {
       hypertyLoaded(hyperty);
    }).catch(function (err) {

        console.log("err");

    });
}


function hypertyLoaded(result) {

    STATUS_DISCONNECTED = 0;
    STATUS_CONNECTED = 1;
    status = STATUS_DISCONNECTED;

    hyperty = result.instance;
    hyperty.myUrl = result.runtimeHypertyURL;
    // init some click handlers
    /*$('#gosearch').on('click', discoverEmail);
    $('#settings').on('submit', saveProfile);
    $('#settings').on('submit', toggleSettings);

    //fillResoultionSelector();
    //loadProfile();

    $('#content').removeClass('hide');
    $('#hangup').on('click', hangup);
    $('#local-audio').on('click', () => {
        // let the hyperty switch stream-tracks
        hyperty.switchLocalAudio($('#local-audio').is(":checked"))
    });
    $('#local-video').on('click', () => {
        // let the hyperty switch stream-tracks
        hyperty.switchLocalVideo($('#local-video').is(":checked"))
    });

    $('#remote-audio').on('click', () => {
        console.log('[DTWebRTC] --> setting remote audio to: ' + $('#remote-audio').is(":checked"));
        let rv = document.getElementById('remoteVideo');
        rv.muted = $('#remote-audio').is(":checked");
    })
        ;
    $('#remote-video').on('click', () => {
        console.log('[DTWebRTC] --> setting remote video to: ' + $('#remote-video').is(":checked"));
        let rv = document.getElementById('remoteVideo');
        if ($('#remote-video').is(":checked"))
            rv.play();
        else
            rv.pause();
    });*/


    // get registered user
    hyperty.identityManager.discoverUserRegistered().then((identity) => {
        console.log("[DTWebRTC.main]: registered user is: ", identity);
        hyperty.myIdentity = identity;
        /*let info = "Authenticated as:</br>" + identity.cn + ",  " + identity.username + '<img src="' + hyperty.myIdentity.avatar + '" class="logo" /></br>' +
            "Hyperty URL:</br>" + result.runtimeHypertyURL;
        $('.hyperty-panel').html(info);*/
    }).catch((reason) => {
        console.log("[DTWebRTC.main]: error while discovery of registered user. Error is ", reason);
       // $('.hyperty-panel').html('<p>Hyperty URL:   ' + result.runtimeHypertyURL + '</p>');
    });

    initListeners();
    // $.getScript("../src/adapter.js");

    console.log("[DTWebRTC.main]:############ hyperty loaded, result is:", result);

}

function callWebRTC(event) {
  if (event) {
    event.preventDefault();
  }

  var email = $(this).attr('rel');
  var domain =  "hello.rethink3.orange-labs.fr";//$('.searchemail').find('.friend-domain').val();
  console.log('>>>email', email, domain);

  var msg = 'searching for:  ' + email + ' in domain:  ' + 'domain' + ' ...';
  if ( ! domain )
    msg = 'searching for:  ' + email + ' in the own domain ...';

  $('.send-panel').html(msg);

  hyperty.discovery.discoverHypertyPerUser(email, domain).then( (result) => {
      console.log(result);
      $('.send-panel').html(
        '<br><form class="webrtcconnect">' +
          '<input type="text" class="webrtc-hyperty-input form-control " style="font-size: 18px; font-size: bold;">' +
          '<button type="submit" class="btn btn-default btn-sm btn-block ">webRTC to Hyperty </button>' +
        '</form><br>');
      $('.send-panel').find('.webrtc-hyperty-input').val(result.hypertyURL);
      $('.webrtcconnect').on('submit', webrtcconnectToHyperty);
      $('.webrtcconnect').find("button").focus();
    }).catch((err) => {
      $('.send-panel').html(
        '<div>No hyperty found!</div>'
      );
      console.error('Email Discovered Error: ', err);
    });
}

function initListeners() {

  hyperty.addEventListener('incomingcall', (identity) => {
		// preparing the modal dialog with the given identity info
    console.log('incomingcall event received from:', identity);
    $('.invitation-panel').html('<p> Invitation received from:\n ' + identity.email ? identity.email : identity.username + '</p>');
    fillmodal(identity);
    prepareMediaOptions();

    $('#myModal').find('#btn-accept').on('click', () => {
      hyperty.acceptCall();
    });
    $('#myModal').find('#btn-reject').on('click', () => {
      hangup();
    });
    $('#myModal').modal('show');
  });

  hyperty.addEventListener('localvideo', (stream) => {
    console.log('local stream received');
    document.getElementById('localVideo').srcObject = stream;
  });

  hyperty.addEventListener('remotevideo', (stream) => {
    $('#info').addClass('hide');
    $('#video').removeClass('hide');
    let rv = document.getElementById('remoteVideo');
    let lv = document.getElementById('localVideo');
    rv.srcObject = stream;
    $('#remoteVideo').removeClass('smallVideo').addClass('fullVideo');
    $('#localVideo').removeClass('fullVideo').addClass('smallVideo');
    console.log('remotevideo received');
    $('.invitation-panel').empty();
    status = STATUS_CONNECTED;
  });

  hyperty.addEventListener('disconnected', () => {
    console.log('>>>disconnected');
    $('.send-panel').removeClass('hide');
    $('.webrtcconnect').empty();
    $('.invitation-panel').empty();
    $('#myModal').modal('hide');
    let rv = document.getElementById('remoteVideo');
    let lv = document.getElementById('localVideo');
    $('#localVideo').removeClass('smallVideo').addClass('fullVideo');
    $('#remoteVideo').removeClass('fullVideo').addClass('smallVideo');
    rv.src = "";
    lv.src = "";

    $('#info').removeClass('hide');
    $('#video').addClass('hide');
  });
}


function webrtcconnectToHyperty() {
  if (event) {
    event.preventDefault();
  }
  //saveProfile();
  //getIceServers();
  prepareMediaOptions();

  status = STATUS_DISCONNECTED;
  let toHyperty = $(event.currentTarget).find('.webrtc-hyperty-input').val();
  let connect_html = '<center><br><i style="color: #e20074;" class="center fa fa-cog fa-spin fa-5x fa-fw"></i></center><p>wait for answer...</p>';
  $('.invitation-panel').html(connect_html);

  setTimeout( () => {
    if ( status == STATUS_DISCONNECTED ) {
      $('.invitation-panel').append( '<button id="cancel"  class="btn btn-default btn-sm ">Cancel</button>' );
      $('#cancel').on('click', hangup );
    }
  }, 6000);

  console.log(toHyperty);
  $('.send-panel').addClass('hide');
  hyperty.connect(toHyperty).then((obj) => {
      console.log('Webrtc obj: ', obj);
    })
    .catch(function(reason) {
      console.error(reason);
    });
}

function prepareMediaOptions() {
  var mediaOptions = {
    'audio': true,
    'video': true
  };
  /*var selectedRes = $("#camResolution").val();
  console.log("[DTWebRTC.main]:Selected Resolution: " + selectedRes);
  if (selectedRes !== "any") {
    var resolutionArr = selectedRes.split("x");
    console.log("[DTWebRTC.main]:minWidth: " + resolutionArr[0]);
    mediaOptions.video = {
      width: {
        exact: resolutionArr[0]
      },
      height: {
        exact: resolutionArr[1]
      }
    };
  }*/
  hyperty.setMediaOptions(mediaOptions);
}

function hangup() {
  hyperty.disconnect();
}