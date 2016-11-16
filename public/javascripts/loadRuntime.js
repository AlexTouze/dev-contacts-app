/** Region Variables **/
var RUNTIME;
var runtimeURL;
var domain;
var hypertyConnector;

/** Region Constants **/
var hypertyURIC = (domain, hyperty) => `hyperty-catalogue://catalogue.${domain}/.well-known/hyperty/${hyperty}`;

/** Load Runtme reThink **/
function loadreThink() {
    //Rethink runtime is included in index.html
    registerDomain()
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
    });
}


function notificationHandler(controller, identity) {
    console.log('controller', controller);
    console.log('identity', identity);
}

function callUser() {
    var thisEmail = $(this).attr('rel');
    hypertyConnector.instance.search.users([thisEmail], [domain], ['audio', 'video']).then(emailDiscovered).catch(emailDiscoveredError);
    //console.log('mail', thisEmail);
}

function emailDiscovered(result) {

   console.log('result', result);
}