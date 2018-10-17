import React, { Component } from 'react';
import './App.css';
// const axios = require('axios');
// var apigClientFactory = require('aws-api-gateway-client').default;
var apigClientFactory = require('aws-api-gateway-client').default;

class App extends Component {
  constructor(props){
    super(props);

    this.state = {value: '', result: ''}
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(event){
    this.setState({value: event.target.value})
  }

  handleSubmit(event){
    event.preventDefault();
    var config = {
      invokeUrl:'https://1kptyukchh.execute-api.us-east-1.amazonaws.com',
      apiKey: 'BGlBOG8E4u1BvGrMGLYyN2Zc2VOuCafgIUGD3bt3',
      region: 'us-east-1'
    }
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
            id: "",
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


    // axios.get('http://example.com/')
    //   .then(function (response) {
    //     // handle success
    //     console.log(response);
    //   })
    //   .catch(function (error) {
    //     // handle error
    //     console.log(error);
    //   })
    //   .then(function () {
    //     // always executed
    //   });
    // this.setState({result:this.state.value})
  }

  render() {
    return (
      <div className="main-app">
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
