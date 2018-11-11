// import AWS from './App';
var AmazonCognitoIdentity  = require('amazon-cognito-identity-js');

// var CognitoUserPool = AmazonCognitoIdentity.CognitoUserPool;

export default{
    poolData: {
        UserPoolId : 'us-east-1_GFawAR3Wt', // Your user pool id here
        ClientId : '2p8s8cuqagb4vke9dumb98vigq' // Your client id here
    },
    signup(username, password){
        var userPool = new AmazonCognitoIdentity.CognitoUserPool(this.poolData);
 
        var attributeList = [];
     
        // var dataEmail = {
        //     Name : 'email',
        //     Value : 'email@mydomain.com'
        // };
     
        // var dataPhoneNumber = {
        //     Name : 'phone_number',
        //     Value : '+15555555555'
        // };
        // var attributeEmail = new AmazonCognitoIdentity.CognitoUserAttribute(dataEmail);
        // var attributePhoneNumber = new AmazonCognitoIdentity.CognitoUserAttribute(dataPhoneNumber);
     
        // attributeList.push(attributeEmail);
        // attributeList.push(attributePhoneNumber);
     
        userPool.signUp(username, password, attributeList, null, function(err, result){
            if (err) {
                alert(err.message || JSON.stringify(err));
                return;
            }
            var cognitoUser = result.user;
            console.log('user name is ' + cognitoUser.getUsername());
        });
    }
}