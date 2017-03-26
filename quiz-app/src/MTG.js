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
          {(this.props.data.text || "").split("\n").map(function(line, index) {
            return <div className="Card-text-line" key={index}>{line}</div>
          })}
        </div>
        <div className="Card-pt">
          {this.props.data.pt()}
        </div>
      </div>
    )
  }
}

function Manager(props) {
  const card1 = props.data['Cryptic Command'];
  // const card2 = props.data['Fog'];
  // const card1 = props.data['Glory Seeker'];
  // const card2 = props.data['Soulless One'];
  const card2 = props.data['Monastery Mentor'];
  console.log(card1);
  return (
    <div className="Manager">
      <div className="Title">
        MTG QUIZ
      </div>
      <div className="Container">
        <Card data={card1} />
        <Card data={card2} />
      </div>
      <div className="Options">
        Question
      </div>
    </div>
  )
}

var MTG = {};
window.MTG = MTG;
MTG.rigData = function(data){
  Object.keys(data).map(function (key) {
    var item = data[key];
    item.pt = function(){
      if (item.hasOwnProperty('power')){
        return item.power + '/' + item.toughness;
      }
      return "";
    };
  });
  MTG.data = data;
  return MTG.data;
}
MTG.init = function(){
  fetch('./AllCards.json')
    .then(function(response) {
      if (response.status >= 400) {
         throw new Error("Bad response from server");
      }
      return response.json();
    })
    .then(function(data) {
      data = MTG.rigData(data);
      ReactDOM.render(
        <Manager data={data} />,
        document.getElementById('root')
      );
    });
}

export default MTG;
