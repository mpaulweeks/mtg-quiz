import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import logo from './logo.svg';
import './App.css';

class App extends Component {
  render() {
    return (
      <div className="App">
        <div className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h2>Welcome to React</h2>
        </div>
        <p className="App-intro">
          To get started, edit <code>src/App.js</code> and save to reload.
        </p>
      </div>
    );
  }
}

class Game extends Component {
  render() {
    return (
      <h3 className="card" onClick={() => this.props.onClick()}>
        Hello <br/>
        {this.props.card.name}
      </h3>
    )
  }
}

fetch('./AllCards.json')
  .then(function(response) {
    console.log('loaded')
    if (response.status >= 400) {
       throw new Error("Bad response from server");
    }
    return response.json();
  })
  .then(function(data) {
     console.log(data);
     const card = data['Masticore'];
     console.log(card);
     ReactDOM.render(
      <Game card={card} />,
      document.getElementById('root')
    );
  });

export default App;
