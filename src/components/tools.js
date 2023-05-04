import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import Navbar from './navbar';

function tools() {
  return (
    <Router>
      <div>
        <Navbar />
        
      </div>
    </Router>
  );
}

export default tools;