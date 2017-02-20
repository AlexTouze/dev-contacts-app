# dev-contactapp
This application is an example that illustrate the identity concepts of rethink and extends it to the legacy.


Prerequisites

The main requirement is for user to use a compatible IdP to login. It is not necessary for the user to be logged into the website with this IdP, the username+password method could be used. But the user must have an active session with the IdP.

IdPs: Compatibles IdPs are available at

    https://github.com/reTHINK-project/dev-IdPServer
    https://energyq.idp.rethink.orange-labs.fr (/profile/create to create a new user)
    https://oidc.rethink.orange-labs.fr (/profile/create to create a new user)

The connect login option uses a Firefox extension to let the user select his own Identity Provider rather than being locked by implementation choices made by the website.

Connect login: Use OIDC adapter extension for login on Firefox.

    https://github.com/Sparika/WebConnect
    https://addons.mozilla.org/fr/firefox/addon/web-identity-management/


A simple example is available here: https://contactsapp.rethink3.orange-labs.fr/
