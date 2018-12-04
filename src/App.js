import React, { Component } from 'react';
import './App.css';
import Helper from './Helper'
import Upload from './Upload'
import Button from '@material-ui/core/Button';
import axios from 'axios'
import CloudUploadIcon from '@material-ui/icons/CloudUpload';
import TextField from '@material-ui/core/TextField';
import Grid from '@material-ui/core/Grid';


var AWS = require('aws-sdk')
var AmazonCognitoIdentity = require('amazon-cognito-identity-js');

var apigClientFactory = require('aws-api-gateway-client').default;

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      value: '',
      result: '',
      username: '',
      password: '',
      loggedIn: false,
      file: '',
      imagePreviewUrl: '',
      pictureList: [],
      photoQuery: ''
    }
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.handlePhotoQuery = this.handlePhotoQuery.bind(this);
  }

  handleChange(event) {
    this.setState({ value: event.target.value })
  }

  handleInputChange(event) {
    const target = event.target;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const name = target.name;
    this.setState({
      [name]: value
    });
  }
  getBase64(file) {
    var reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = function () {
      // console.log(reader.result);
    };
    reader.onerror = function (error) {
      console.log('Error: ', error);
    };
  }

  handleUpload = (e) => {
    e.preventDefault();

    var s3 = new AWS.S3({
      params: {Bucket: "photos-hw3-virginia"},
      endpoint: "https://8yy5i9xx32.execute-api.us-east-1.amazonaws.com/test/upload",
      s3BucketEndpoint: true
    });

    let file = this.state.file;
    let fileName = file.name;

    s3.upload({
      Key: fileName,
      Body: file,
      ContentType: file.type,
      ACL: 'public-read'
    }, (err, data) =>{
      if (err) {
        return alert('There was an error uploading your photo: ', err.message);
      }
      alert('Successfully uploaded photo.');
    });

    let data = this.state.imagePreviewUrl;
    var formData = new FormData();
    let load = JSON.stringify({user_avatar: data})
    // console.log(data);
    // console.log('handle uploading-', this.state.file, this.state.imagePreviewUrl);
    axios.put('https://7xe94za154.execute-api.us-east-1.amazonaws.com/default/upload',
      { user_avatar: data, filename: this.state.file.name })
      .then(function (response) {
        alert("Success");
        console.log(response);
      })
      .catch(function (error) {
        console.log(error);
      });
  }

  handleSubmit(event) {
    event.preventDefault();
    var config = {
      invokeUrl: 'https://1kptyukchh.execute-api.us-east-1.amazonaws.com',
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
      .then((result) => {
        //This is where you would put a success callback
        this.setState({ result: result.data })
        console.log(result)
      }).catch(function (result) {
        //This is where you would put an error callback
        console.log(result)
      });
  }
  login(username, password) {
    var authenticationData = {
      Username: username,
      Password: password,
    };
    var authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails(authenticationData);
    var poolData = {
      UserPoolId: 'us-east-1_GFawAR3Wt', // Your user pool id here
      ClientId: '2p8s8cuqagb4vke9dumb98vigq' // Your client id here
    }
    var userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);
    var userData = {
      Username: username,
      Pool: userPool
    };
    var cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);
    cognitoUser.authenticateUser(authenticationDetails, {
      onSuccess: (result) => {
        // console.log("Success!", result)
        var accessToken = result.getAccessToken().getJwtToken();
        var idToken = result.idToken.jwtToken;
        console.log(idToken)
        //POTENTIAL: Region needs to be set if not already set previously elsewhere.
        AWS.config.region = 'us-east-1';

        AWS.config.credentials = new AWS.CognitoIdentityCredentials({
          IdentityPoolId: 'us-east-1:46d964e1-251a-420f-ae15-4846309b635e', // your identity pool id here
          Logins: {
            // Change the key below according to the specific region your user pool is in.
            'cognito-idp.us-east-1.amazonaws.com/us-east-1_GFawAR3Wt': result.getIdToken().getJwtToken()
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

      onFailure: (err) => {
        alert(err.message || JSON.stringify(err));
      },

      newPasswordRequired: function (userAttributes, requiredAttributes) {
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
  handleLogin = (event) => {
    event.preventDefault();
    this.login(this.state.username, this.state.password)
    this.setState({ loggedIn: true })
  }

  handleSignup = (event) => {
    event.preventDefault();
    Helper.signup(this.state.username, this.state.password)
  }

  handleImageChange = (e) => {
    e.preventDefault();

    let reader = new FileReader();
    let file = e.target.files[0];
    // console.log("Yep")
    if (e.target.files.length !== 0) {
      reader.onloadend = () => {
        console.log(file)
        this.setState({
          file: file,
          imagePreviewUrl: reader.result
        });
      }
      reader.readAsDataURL(file)
    }

  }

  handlePhotoQuery(e) {
    e.preventDefault();

    var config = {
      invokeUrl: 'https://8yy5i9xx32.execute-api.us-east-1.amazonaws.com',
      // apiKey: 'BGlBOG8E4u1BvGrMGLYyN2Zc2VOuCafgIUGD3bt3',
      accessKey: AWS.config.credentials.accessKeyId,
      secretKey: AWS.config.credentials.secretAccessKey,
      sessionToken: AWS.config.credentials.sessionToken,
      region: 'us-east-1'
    }
    // console.log(AWS.config.credentials)
    // console.log(config)
    var apigClient = apigClientFactory.newClient(config);
    var pathParams = {
      //This is where path request params go. 
    };
    // this.state.photoQuery
    var pathTemplate = '/test/search';
    // console.log(pathTemplate)
    var method = 'GET';
    var body = {
      //This is where you define the body of the request
    };
      var additionalParams = {
        queryParams: {
          q: this.state.photoQuery
        }
      }
    apigClient.invokeApi(pathParams, pathTemplate, method, additionalParams, body)
      .then((result) => {
        //This is where you would put a success callback
        // this.setState({result: result.data})
        this.setState({
          pictureList: result.data
        })
        alert("Queryed");
        console.log(result)
      }).catch(function (result) {
        //This is where you would put an error callback
        console.log(result)
      });
  }

  handlePhotoText = (event) => {
    this.setState({ photoQuery: event.target.value })
  }
  render() {
    return (
      <div className="main-app">
        <section className="hero is-primary">
          <div className="hero-body">
            <div className="container">
              <h1 className="title">
                A chat bot
                </h1>
              <h2 className="subtitle">
                Cloud Computing 6998 2018
                </h2>
            </div>
          </div>
        </section>
        <hr />
        <div className="container">
          {this.state.loggedIn > 0 &&
            <h3 className="title is-3" >You have logged in</h3>
          }
          <form onSubmit={this.handleLogin}>
            <div className="field">
              <p className="control has-icons-left">
                <input className="input" type="text" placeholder="username" name="username" value={this.state.username} onChange={this.handleInputChange} />
                <span className="icon is-small is-left">
                  <i className="fas fa-user"></i>
                </span>
              </p>
            </div>
            <div className="field">
              <p className="control has-icons-left">
                <input className="input" type="password" placeholder="Password" name="password" value={this.state.password} onChange={this.handleInputChange} />
                <span className="icon is-small is-left">
                  <i className="fas fa-lock"></i>
                </span>
              </p>
            </div>
            <div className="field is-grouped">
              <p className="control">
                <button className="button is-success">
                  Login
            </button>
              </p>
              <p className="control">
                <button className="button is-success" onClick={this.handleSignup}>
                  Signup
            </button>
              </p>
            </div>
          </form>
        </div>
        <hr />
        <div className="container">
          <h2 className="title is-2">{this.state.result}</h2>
          <form onSubmit={this.handleSubmit}>
            <div className="control">
              <label className="label">Talk to it:</label>
            </div>
            <div className="field is-grouped">
              <div className="control">
                <input className="input" type="text" value={this.state.value} onChange={this.handleChange} disabled={!this.state.loggedIn} />
              </div>
              <p className="control">
                <input className="button is-info" type="submit" value="Submit" disabled={!this.state.loggedIn} />
              </p>
            </div>
          </form>
        </div>

        <hr />
        <div className="container" >
          <Grid container spacing={16}>
          <input
            accept="image/*"
            id="flat-button-file"
            multiple
            type="file"
            style={{ display: "none" }}
            onChange={this.handleImageChange}
          />
          <label htmlFor="flat-button-file">
            <Button component="span" variant="contained" color="primary" size="medium" disabled={!this.state.loggedIn}>
              <CloudUploadIcon />
            </Button>
          </label>
          <Button onClick={this.handleUpload} variant="contained" size="medium" disabled={!this.state.loggedIn}>Upload</Button>
        </Grid>
          <Grid
            container
            spacing={16}
          >
            <TextField
              value={this.state.photoQuery}
              onChange={this.handlePhotoText}
              margin="normal"
              disabled={!this.state.loggedIn}
            />
            <Button onClick={this.handlePhotoQuery} variant="contained" disabled={!this.state.loggedIn}>Send</Button>
          </Grid>

          <br></br>
          <Grid container spacing={16}>
            {this.state.pictureList.map((v, i) => { return <Grid item xs={4}><img src={"https://s3.amazonaws.com/photos-hw3-virginia/" + v} key={i}></img></Grid> })}
          </Grid>
        </div>
      </div>
    );
  }
}

export default App;
