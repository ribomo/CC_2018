import React, { Component } from 'react';
import './App.css';
import Helper from './Helper'
var AWS = require('aws-sdk')
var AmazonCognitoIdentity  = require('amazon-cognito-identity-js');

// const axios = require('axios');
// var apigClientFactory = require('aws-api-gateway-client').default;
var apigClientFactory = require('aws-api-gateway-client').default;
// var AmazonCognitoIdentity  = require('amazon-cognito-identity-js');
// var CognitoUserPool = AmazonCognitoIdentity.CognitoUserPool;

class App extends Component {
  constructor(props){
    super(props);

    this.state = {
      value: '', 
      result: '',
      username: '',
      password: ''
    }
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
    // this.handleLogin = this.handleLogin.bind(this);
  }

  handleChange(event){
    this.setState({value: event.target.value})
  }

  handleInputChange(event) {
    const target = event.target;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const name = target.name;
    this.setState({
      [name]: value
    });
  }


  handleSubmit(event){
    event.preventDefault();
    var config = {
      invokeUrl:'https://1kptyukchh.execute-api.us-east-1.amazonaws.com',
      // apiKey: 'BGlBOG8E4u1BvGrMGLYyN2Zc2VOuCafgIUGD3bt3',
      accessKey: AWS.config.credentials.accessKeyId,
      secretKey: AWS.config.credentials.secretAccessKey,
      sessionToken: AWS.config.credentials.sessionToken,
      region: 'us-east-1'
    }
    console.log(config)
    var apigClient = apigClientFactory.newClient(config);
    var pathParams = {
      //This is where path request params go. 
  };
    var pathTemplate = '/prod/chatbot';
    var method = 'POST';
    var body = {
      //This is where you define the body of the request
      messages: [
        {
          type: "String", 
          unstructured: {
            id: "999",
            text: this.state.value,
            timestamp: ""
          }
        }
      ]
    };
    var additionalParams = {

    }
    apigClient.invokeApi(pathParams, pathTemplate, method, additionalParams, body)
    .then((result)=>{
        //This is where you would put a success callback
        this.setState({result: result.data})
        console.log(result)
    }).catch( function(result){
        //This is where you would put an error callback
        console.log(result)
    });
  }
  login(username, password){
        var authenticationData = {
        Username : username,
        Password : password,
    };
    var authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails(authenticationData);
    var poolData = {
      UserPoolId : 'us-east-1_GFawAR3Wt', // Your user pool id here
      ClientId : '2p8s8cuqagb4vke9dumb98vigq' // Your client id here
  }
    var userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);
    var userData = {
        Username : username,
        Pool : userPool
    };
    var cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);
    cognitoUser.authenticateUser(authenticationDetails, {
        onSuccess: (result) =>{
            // console.log("Success!", result)
            var accessToken = result.getAccessToken().getJwtToken();
            var idToken = result.idToken.jwtToken;
            console.log(idToken)
            //POTENTIAL: Region needs to be set if not already set previously elsewhere.
            AWS.config.region = 'us-east-1';

            AWS.config.credentials = new AWS.CognitoIdentityCredentials({
                IdentityPoolId : 'us-east-1:46d964e1-251a-420f-ae15-4846309b635e', // your identity pool id here
                Logins : {
                    // Change the key below according to the specific region your user pool is in.
                    'cognito-idp.us-east-1.amazonaws.com/us-east-1_GFawAR3Wt' : result.getIdToken().getJwtToken()
                }
            });

            //refreshes credentials using AWS.CognitoIdentity.getCredentialsForIdentity()
            AWS.config.credentials.refresh((error) => {
                if (error) {
                    console.error(error);
                } else {
                    // Instantiate aws sdk service objects now that the credentials have been updated.
                    // example: var s3 = new AWS.S3();
                    console.log('Successfully logged!', AWS.config.credentials);
                }
            });
        },

        onFailure: (err) =>{
            alert(err.message || JSON.stringify(err));
        },

        newPasswordRequired: function(userAttributes, requiredAttributes) {
            // User was signed up by an admin and must provide new 
            // password and required attributes, if any, to complete 
            // authentication.

            // userAttributes: object, which is the user's current profile. It will list all attributes that are associated with the user. 
            // Required attributes according to schema, which don’t have any values yet, will have blank values.
            // requiredAttributes: list of attributes that must be set by the user along with new password to complete the sign-in.

            
            // Get these details and call 
            // newPassword: password that user has given
            // attributesData: object with key as attribute name and value that the user has given.
            // cognitoUser.completeNewPasswordChallenge(newPassword, attributesData, this)
            console.log("Need new password")
        }
    });
  }
  handleLogin = (event)=>{
    event.preventDefault();
    this.login(this.state.username, this.state.password)
  }
  
  handleSignup = (event)=>{
    event.preventDefault();
    Helper.signup(this.state.username, this.state.password)
  }

  render() {
    return (
      <div className="main-app">
        <form onSubmit={this.handleLogin}>
          <div className="field">
          <p className="control has-icons-left has-icons-right">
            <input className="input" type="text" placeholder="username" name="username" value={this.state.username} onChange={this.handleInputChange}/>
            <span className="icon is-small is-left">
              <i className="fas fa-envelope"></i>
            </span>
            <span className="icon is-small is-right">
              <i className="fas fa-check"></i>
            </span>
          </p>
        </div>
        <div className="field">
          <p className="control has-icons-left">
            <input className="input" type="password" placeholder="Password" name="password" value={this.state.password} onChange={this.handleInputChange}/>
            <span className="icon is-small is-left">
              <i className="fas fa-lock"></i>
            </span>
          </p>
        </div>
        <div className="field">
          <p className="control">
            <button className="button is-success">
              Login
            </button>
            <button className="button is-success" onClick={this.handleSignup}>
              Signup
            </button>
          </p>
        </div>
        </form>


        <p>
          Try "Hello" or "Nihao" or other whatever you want
        </p>
          <form onSubmit={this.handleSubmit}>
            <label>
              Name:
              <input type="text" value={this.state.value} onChange={this.handleChange}/>
            </label>
            <input type="submit" value="Submit" />
          </form>
          <p>{this.state.result}</p>
      </div>
    );
  }
}

export default App;
