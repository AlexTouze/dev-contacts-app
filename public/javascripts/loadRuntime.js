/** Region Variables **/
var RUNTIME;
var runtimeURL;
var domain;


/** Region Constants **/
var hypertyURIC = (domain, hyperty) => `hyperty-catalogue://catalogue.${domain}/.well-known/hyperty/${hyperty}`;

/** Load Runtme reThink **/
function loadreThink() {
    //RUNTIME = runtimeURL = domainhypertyConnector = null;
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
        loadHypertyWebRTC();
    });
}

// Loads the runtime.
function loadRuntime() {
    var start = new Date().getTime();
    window.rethink.default.install({
        domain: domain,
        development: false,
        runtimeURL: runtimeURL
    }).then((runtime) => {
        RUNTIME = runtime
        var time = (new Date().getTime()) - start;
        console.log('Runtime has been successfully launched in ' + time / 1000 + ' seconds');
        //loadHypertyConnector(runtime, domain);
        loadHypertyWebRTC();
    });
}


