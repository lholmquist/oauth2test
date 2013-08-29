/*! AeroGear JavaScript Library - v1.3.0-dev - 2013-08-27
* https://github.com/aerogear/aerogear-js
* JBoss, Home of Professional Open Source
* Copyright Red Hat, Inc., and individual contributors
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
* http://www.apache.org/licenses/LICENSE-2.0
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/
/**
    The AeroGear namespace provides a way to encapsulate the library's properties and methods away from the global namespace
    @namespace
 */
this.AeroGear = {};

/**
    AeroGear.Core is a base for all of the library modules to extend. It is not to be instantiated and will throw an error when attempted
    @class
    @private
 */
AeroGear.Core = function() {
    // Prevent instantiation of this base class
    if ( this instanceof AeroGear.Core ) {
        throw "Invalid instantiation of base class AeroGear.Core";
    }

    /**
        This function is used by the different parts of AeroGear to add a new Object to its respective collection.
        @name AeroGear.add
        @method
        @param {String|Array|Object} config - This can be a variety of types specifying how to create the object. See the particular constructor for the object calling .add for more info.
        @returns {Object} The object containing the collection that was updated
     */
    this.add = function( config ) {
        var i,
            current,
            collection = this[ this.collectionName ] || {};

        if ( !config ) {
            return this;
        } else if ( typeof config === "string" ) {
            // config is a string so use default adapter type
            collection[ config ] = AeroGear[ this.lib ].adapters[ this.type ]( config );
        } else if ( AeroGear.isArray( config ) ) {
            // config is an array so loop through each item in the array
            for ( i = 0; i < config.length; i++ ) {
                current = config[ i ];

                if ( typeof current === "string" ) {
                    collection[ current ] = AeroGear[ this.lib ].adapters[ this.type ]( current );
                } else {
                    collection[ current.name ] = AeroGear[ this.lib ].adapters[ current.type || this.type ]( current.name, current.settings || {} );
                }
            }
        } else {
            // config is an object so use that signature
            collection[ config.name ] = AeroGear[ this.lib ].adapters[ config.type || this.type ]( config.name, config.settings || {} );
        }

        // reset the collection instance
        this[ this.collectionName ] = collection;

        return this;
    };
    /**
        This function is used internally by pipeline, datamanager, etc. to remove an Object (pipe, store, etc.) from the respective collection.
        @name AeroGear.remove
        @method
        @param {String|String[]|Object[]|Object} config - This can be a variety of types specifying how to remove the object. See the particular constructor for the object calling .remove for more info.
        @returns {Object} The object containing the collection that was updated
     */
    this.remove = function( config ) {
        var i,
            current,
            collection = this[ this.collectionName ] || {};

        if ( typeof config === "string" ) {
            // config is a string so delete that item by name
            delete collection[ config ];
        } else if ( AeroGear.isArray( config ) ) {
            // config is an array so loop through each item in the array
            for ( i = 0; i < config.length; i++ ) {
                current = config[ i ];

                if ( typeof current === "string" ) {
                    delete collection[ current ];
                } else {
                    delete collection[ current.name ];
                }
            }
        } else if ( config ) {
            // config is an object so use that signature
            delete collection[ config.name ];
        }

        // reset the collection instance
        this[ this.collectionName ] = collection;

        return this;
    };
};

/**
    Utility function to test if an object is an Array
    @private
    @method
    @param {Object} obj - This can be any object to test
*/
AeroGear.isArray = function( obj ) {
    return ({}).toString.call( obj ) === "[object Array]";
};

/**
    This callback is executed when an HTTP request completes whether it was successful or not.
    @callback AeroGear~completeCallbackREST
    @param {Object} jqXHR - The jQuery specific XHR object
    @param {String} textStatus - The text status message returned from the server
 */
/**
    This callback is executed when an HTTP error is encountered during a request.
    @callback AeroGear~errorCallbackREST
    @param {Object} jqXHR - The jQuery specific XHR object
    @param {String} textStatus - The text status message returned from the server
    @param {Object} errorThrown - The HTTP error thrown which caused the is callback to be called
 */
/**
    This callback is executed when an HTTP success message is returned during a request.
    @callback AeroGear~successCallbackREST
    @param {Object} data - The data, if any, returned in the response
    @param {String} textStatus - The text status message returned from the server
    @param {Object} jqXHR - The jQuery specific XHR object
 */
/**
    This callback is executed when an error is encountered saving to local or session storage.
    @callback AeroGear~errorCallbackStorage
    @param {Object} errorThrown - The HTTP error thrown which caused the is callback to be called
    @param {Object|Array} data - An object or array of objects representing the data for the failed save attempt.
 */
/**
    This callback is executed when data is successfully saved to session or local storage.
    @callback AeroGear~successCallbackStorage
    @param {Object} data - The updated data object after the new saved data has been added
 */

AeroGear.Authorization = function( config ) {
    // Allow instantiation without using new
    if ( !( this instanceof AeroGear.Authorization ) ) {
        return new AeroGear.Authorization( config );
    }

    // Super constructor
    AeroGear.Core.call( this );

    this.lib = "Authorization";
    this.type = config ? config.type || "OAuth2" : "OAuth2";

    /**
        The name used to reference the collection of pipe instances created from the adapters
        @memberOf AeroGear.Authorization
        @type Object
        @default pipes
     */
    this.collectionName = "services";

    this.add( config );
};

AeroGear.Authorization.prototype = AeroGear.Core;
AeroGear.Authorization.constructor = AeroGear.Authorization;

/**
    The adapters object is provided so that adapters can be added to the AeroGear.Authorization namespace dynamically and still be accessible to the add method
    @augments AeroGear.Authorization
 */
AeroGear.Authorization.adapters = {};

AeroGear.Authorization.adapters.OAuth2 = function( name, settings ) {
    // Allow instantiation without using new
    if ( !( this instanceof AeroGear.Authorization.adapters.OAuth2 ) ) {
        return new AeroGear.Authorization.adapters.OAuth2( name, settings );
    }

    settings = settings || {};

    // Private Instance vars
    var type = "OAuth2",
        redirectURL = settings.redirectURL, //optional in the spec, but doesn't make sense without it
        tokenValidationEndpoint = settings.tokenValidationEndpoint, //spec says nothing about validating the token
        state = settings.state || "1234567890", //TODO: make this autogenerated. Recommended in the spec,
        clientId = settings.clientId, //NEED
        accessToken,
        prompt = settings.prompt || "auto", //not standard
        scopes = settings.scopes, //NEED
        baseScopeURL, //TODO: use this
        localStorageName = "ag-oauth2-" + clientId,
        authEndpoint = settings.authEndpoint + "?" +
            "response_type=token" +
            "&approval_prompt=" + encodeURIComponent( prompt ) +
            "&redirect_uri=" + encodeURIComponent( redirectURL ) +
            "&scope=" + encodeURIComponent( scopes ) +
            "&state=" + encodeURIComponent( state ) +
            "&client_id=" + encodeURIComponent( clientId );

    //Probably need some better way for more options

    // Privileged Methods
    this.getClientId = function() {
        return clientId;
    };

    this.getAccessToken = function() {
        if( localStorage[ localStorageName ] ) {
            accessToken = JSON.parse( localStorage[ localStorageName ] ).accessToken;
        }

        return accessToken;
    };

    this.getAuthEndpoint = function() {
        return authEndpoint;
    };

    this.getTokenValidationEndpoint = function() {
        return tokenValidationEndpoint;
    };

    this.getState = function() {
        return state;
    };

    this.getLocalStorageName = function() {
        return localStorageName;
    };

    this.createError = function( options ) {
        options = options || {}; //maybe this should be an extend?
        return {
            status: options.status,
            authURL: authEndpoint,
            statusText: options.statusText
        };
    };

    this.parseQueryString = function( locationString ) {
        //taken from https://developers.google.com/accounts/docs/OAuth2Login
        // First, parse the query string
        var params = {},
            queryString = locationString.substr( locationString.indexOf( "#" ) + 1 ),
            regex = /([^&=]+)=([^&]*)/g,
            m;
        while ( m = regex.exec(queryString) ) {
            params[decodeURIComponent(m[1])] = decodeURIComponent(m[2]);
        }
        return params;
    };
};

// Public Methods

//Takes the querystring that is returned after the "dance" unparsed.
AeroGear.Authorization.adapters.OAuth2.prototype.validate = function( queryString, options ) {
    options = options || {};

    var that = this,
        parsedQuery = this.parseQueryString( queryString ),
        state = this.getState(),
        error,
        success,
        tokenValidationEndpoint = this.getTokenValidationEndpoint();

    success = function( response ) {
        // From https://developers.google.com/accounts/docs/OAuth2Login
        // Important: When verifying a token, it is critical to ensure the audience field in the response exactly
        // matches your client_id registered in the APIs Console.
        // This is the mitigation for the confused deputy issue, and it is absolutely vital to perform this step.
        if( that.getClientId() === response.audience ) {
            localStorage.setItem( that.getLocalStorageName(), JSON.stringify( { "accessToken": parsedQuery.access_token } ) );
            if( options.success ) {
                options.success.apply( this, arguments );
            }
        } else {
            //bad
            error.call( this, { status: 401 } ); //maybe this should be an extend? proper code?
        }
    };

    error = function( response ) {
        if( options.error ) {
            options.error.call( this, that.createError( response ) );
        }
    };

    //Make sure that the "state" value returned is the same one we sent
    if( parsedQuery.state !== state ) {
        //No Good
        error.call( this, { status: 401 } ); //maybe this should be an extend?
        return;
    }

    // The Spec does not specify that you need to validate the token,
    // but this does help with confused deputy issue and is recommended to do in the google flow
    if( !tokenValidationEndpoint ) {
        localStorage.setItem( that.getLocalStorageName(), JSON.stringify( { "accessToken": parsedQuery.access_token } ) );
        success.call( this, parsedQuery );
        //call success
    } else {
        //This can look nicer actually, maybe
        jQuery.ajax({
            url: tokenValidationEndpoint + "?access_token=" + parsedQuery.access_token,
            contentType: "application/json",
            success: success,
            error: error
        });
    }
};

AeroGear.Authorization.adapters.OAuth2.prototype.callService = function( options ) {
    //TODO: perhaps check that there is an access token first?
    //TODO: is this totally secure here
    //TODO: perhaps there can be more options sent?
    options = options || {};
    var that = this,
        url = options.serviceURL + "?access_token=" + this.getAccessToken(),
        contentType = "application/json",
        success,
        error;

    success = function( response ) {
        if( options.success ) {
            options.success.apply( this, arguments );
        }
    };
    error = function( response ) {
        if( options.error ) {
            options.error.call( this, that.createError( response ) );
        }
    };

    return jQuery.ajax({
        url: url,
        contentType: contentType,
        success: success,
        error: error
    });
};
