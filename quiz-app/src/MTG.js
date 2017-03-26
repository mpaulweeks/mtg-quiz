import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import './App.css';

class Card extends Component {
  render() {
    return (
      <h3 className="card" onClick={() => this.props.onClick()}>
        {this.props.data.name}
      </h3>
    )
  }
}

function Manager(props) {
  const card = props.data['Masticore'];
  return (
    <div>
      Hello
      <Card data={card} />
    </div>
  )
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
      ReactDOM.render(
        <Manager data={data} />,
        document.getElementById('root')
      );
    });
}

export default MTG;
