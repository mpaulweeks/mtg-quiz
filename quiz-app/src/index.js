import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import MTG from './MTG';
import './index.css';

ReactDOM.render(
  <App />,
  document.getElementById('root')
);

MTG.init();
