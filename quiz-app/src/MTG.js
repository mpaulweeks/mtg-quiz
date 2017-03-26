import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import './App.css';

class Card extends Component {
  render() {
    return (
      <div className="card" onClick={() => this.props.onClick()}>
        <div className="name">
          {this.props.data.name}
        </div>
        <div className="type">
          {this.props.data.type}
        </div>
        <div className="text">
          {this.props.data.text.split("\n").map(function(line, index) {
            return <div className="line" key={index}>{line}</div>
          })}
        </div>
      </div>
    )
  }
}

function Manager(props) {
  const card = props.data['Masticore'];
  console.log(card);
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
