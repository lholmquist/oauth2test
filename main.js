var thing = AeroGear.Authorization();

var responseFromAuthEndpoint;

thing.add({
    name: "coolThing",
    settings: {
        clientId: "1038594593085.apps.googleusercontent.com",
        redirectURL: "http://localhost:8000/redirector.html",
        tokenValidationEndpoint: "https://www.googleapis.com/oauth2/v1/tokeninfo",
        authEndpoint: "https://accounts.google.com/o/oauth2/auth",
        revokeURL: "https://accounts.google.com/o/oauth2/revoke",
        scopes: "https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/calendar.readonly",
        prompt: "force"
    }
});

function validate() {
    thing.services.coolThing.validate( responseFromAuthEndpoint, {
        success: function( response ){
            console.log( "Should be response from Validating the access token", response );
            callService();
        },
        error: function( error ) {
            console.log( "error", error );
        }
    });
}


function callService() {
    thing.services.coolThing.callService({
        serviceURL: "https://www.googleapis.com/oauth2/v2/userinfo",
        success: function( response ){
            console.log( "Should be the response from the call", response );
        },
        error: function( error ) {
            console.log( "error", error );
        }
    });
}

callService();
