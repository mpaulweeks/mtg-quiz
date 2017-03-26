import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import './App.css';

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

var MTG = {};
MTG.init = function(){
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
}

export default MTG;
