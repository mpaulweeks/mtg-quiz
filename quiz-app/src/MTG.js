import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import './MTG.css';

class Card extends Component {
  render() {
    return (
      <div className="Card" onClick={() => this.props.onClick()}>
        <div className="Card-name">
          {this.props.data.name}
        </div>
        <div className="Card-type">
          {this.props.data.type}
        </div>
        <div className="Card-text">
          {this.props.data.text.split("\n").map(function(line, index) {
            return <div className="Card-text-line" key={index}>{line}</div>
          })}
        </div>
      </div>
    )
  }
}

function Manager(props) {
  const card1 = props.data['Masticore'];
  const card2 = props.data['Fog'];
  console.log(card1);
  return (
    <div className="Manager">
      MTG QUIZ
      <div className="Container">
        <Card data={card1} />
        <Card data={card2} />
      </div>
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
