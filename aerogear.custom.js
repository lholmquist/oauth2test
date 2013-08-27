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
    var endpoint = settings.endpoint,
        type = "OAuth2",
        redirectURL = settings.redirectURL,
        tokenValidationEndpoint = settings.tokenValidationEndpoint,
        state = settings.state || "1234567890", //TODO: make this autogenerated
        authEndpoint = settings.authEndpoint,
        revokeURL = settings.revokeURL,
        clientId = settings.clientId,
        accessToken,
        prompt = settings.prompt || "auto",
        scopes = settings.scopes,
        baseScopeURL; //TODO: use this

        //Probably need some better way for more options

    // Privileged Methods

    // TODO: maybe this shouldn't be a privileged method?
    this.validateToken = function( params, options ) {
        //validates the access token
        options = options || {};

        if( tokenValidationEndpoint ) {

            //This can look nicer actually, maybe
            jQuery.ajax({
                type: 'GET',
                url: tokenValidationEndpoint + "?access_token=" + params.access_token,
                contentType: "application/json",
                success: function( response ) {
                    // From https://developers.google.com/accounts/docs/OAuth2Login
                    // Important: When verifying a token, it is critical to ensure the audience field in the response exactly
                    // matches your client_id registered in the APIs Console.
                    // This is the mitigation for the confused deputy issue, and it is absolutely vital to perform this step.
                    if( clientId === response.audience ) {
                        accessToken = params.access_token;
                        options.success.call( this, response );
                    } else {
                        //bad
                        options.error.call( this, response );
                    }
                },
                error: function( response ) {
                    options.error.call( this, response );
                }
            });
        } else {
            //TODO: is this an error, or just a warning,  need to look at spec
            //this needs to be better
            options.error.apply( this, arguments );
        }
    };

    this.getClientId = function() {
        return clientId;
    };

    this.getAccessToken = function() {
        return accessToken;
    };

    this.setAccessToken = function( token ) {
        accessToken = token;
    };

    this.getAuthEndpoint = function() {
        return authEndpoint;
    };

    this.getRedirectURL = function() {
        return redirectURL;
    };

    this.getRevokeURL = function() {
        return revokeURL;
    };

    this.getScopes = function() {
        return scopes;
    };

    this.getState = function() {
        return state;
    };

    this.getPrompt = function() {
        return prompt;
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
AeroGear.Authorization.adapters.OAuth2.prototype.authorize = function( options ) {
    options = options ? options : {};

    var url,
        success,
        error,
        timer,
        childWindow,
        that = this,
        authURL = this.getAuthEndpoint() + "?" +
                  "response_type=token" +
                  "&approval_prompt=" + encodeURIComponent( this.getPrompt() ) +
                  "&redirect_uri=" + encodeURIComponent( this.getRedirectURL() ) +
                  "&scope=" + encodeURIComponent( this.getScopes() ) +
                  "&state=" + encodeURIComponent( this.getState() ) +
                  "&client_id=" + encodeURIComponent( this.getClientId() );

    success = function( data, textStatus, jqXHR ) {
        if ( options.success ) {
            options.success.apply( this, arguments );
        }
    };
    error = function() {
        if ( options.error ) {
            options.error.apply( this, arguments );
        }
    };

    this.checkChild = function(){
        //TODO: add a timeout to stop this if nothing happens for 30 secs?

        if( childWindow.location.href || childWindow.location.origin ) {
            //Need to get the query params
            var params = that.parseQueryString( childWindow.location.href );
            clearInterval( timer );

            //check the state variable
            if( params.error || that.getState() !== params.state ) {
                //error
                error.apply( that, arguments );
            } else {
                that.validateToken.call( that, params, options );
            }

            childWindow.close();

        } else if( childWindow.closed ) {
            clearInterval( timer );
        }
    };

    childWindow = window.open( authURL );
    timer = setInterval( this.checkChild, 500 );
};


AeroGear.Authorization.adapters.OAuth2.prototype.callService = function( options ) {
    options = options || {};

    return jQuery.ajax({
        type: 'GET',
        url: options.serviceURL + "?access_token=" + this.getAccessToken(),
        contentType: "application/json",
        success: function( response ) {
            if( options.success ) {
                options.success.apply( this, arguments );
            }
        },
        error: function( response ) {
            if( options.error ) {
                options.error.apply( this, arguments );
            }
        }
    });
};

AeroGear.Authorization.adapters.OAuth2.prototype.revoke = function( options ) {
    options = options || {};

    return jQuery.ajax({
        type: 'GET',
        url: this.getRevokeURL() + "?token=" + this.getAccessToken(),
        async: false,
        contentType: "application/json",
        dataType: 'jsonp',
        success: options.success,
        error: options.error
    });
};

