import React, { Component } from 'react';
import Helper from './Helper'
import Button from '@material-ui/core/Button';

// const axios = require('axios');

class Upload extends Component {
 
  render() {
    return (
        <div>
          <input
              accept="image/*"
              id="outlined-button-file"
              multiple
              type="file"
              style={{display:"none"}}
            />
            <label htmlFor="outlined-button-file">
              <Button variant="outlined" component="span">
                Upload
              </Button>
            </label>
        </div>
    );
  }
}

export default Upload;
