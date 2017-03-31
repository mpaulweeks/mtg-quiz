import React from 'react';

const MTG = {};

// Namespace for stateless helper functions
MTG.Calc = {};
MTG.Calc.graphCost = function(cData){
  if (cData._graphCost !== undefined){
    return cData._graphCost;
  }
  if (!cData.manaCost || cData.manaCost.indexOf('/') > -1){
    cData._graphCost = null;
    return null;
  }
  const bins = {
    'A': 0,
    'C': 0,
    'W': 0,
    'U': 0,
    'B': 0,
    'R': 0,
    'G': 0,
  };
  const symbols = cData.manaCost.replace(/\{/g, '').split('}');
  symbols.forEach(function (s){
    if (s.length > 0){
      var num = parseInt(s, 10);
      if (!isNaN(num)){
        bins.A += num;
      } else {
        bins[s] += 1;
      }
    }
  });
  var functionalCost = 0;
  Object.keys(bins).forEach(function(key){
    var count = bins[key];
    if (key === 'A'){
      functionalCost += count;
    } else {
      functionalCost += 100 * count;
    }
  });
  cData._graphCost = functionalCost;
  return cData._graphCost;
}
MTG.Calc.cardDistance = function(cData1, cData2){
  const cost1 = MTG.Calc.graphCost(cData1);
  const cost2 = MTG.Calc.graphCost(cData2);
  if (cost1 && cost2){
    return Math.abs(cost1 - cost2);
  }
  return null;
}
MTG.Calc.random = function(arr){
  return arr[Math.floor(Math.random()*arr.length)];
}
MTG.Calc.drawGraph = function(dataArray){
  var byColors = {};
  // console.log('binning', dataArray.length);
  dataArray.forEach(function(cData){
    var colorKey = (cData.colors || []).join('|');
    byColors[colorKey] = byColors[colorKey] || [];
    byColors[colorKey].push(cData);
  });
  Object.keys(byColors).forEach(function(colorKey){
    var colorData = byColors[colorKey];
    // console.log('graphing', colorKey, colorData.length);
    colorData.forEach(function(cData1){
      cData1.neighbors = [];
      colorData.forEach(function(cData2){
        if(MTG.Calc.cardDistance(cData1, cData2) === 1){
          cData1.neighbors.push(cData2);
        }
      });
    });
  });
}
MTG.Calc.filterData = function(data){
  var dataArray = [];
  Object.keys(data).forEach(function (key){
    dataArray.push(data[key]);
  });
  dataArray = dataArray.filter(function(cData){
    const cmc = cData.cmc || 0;
    const isComplicated = (cData.text || "").split('\n').length > 1;
    const isWalker = (cData.type || '').indexOf("Planeswalker") !== -1;
    return (
      cmc >= 1 &&
      cmc <= 8 &&
      isComplicated &&
      !isWalker
    );
  })
  return dataArray;
};
MTG.Calc.filterDataArray = function(dataArray){
  return dataArray.filter(function(cData){
    return cData.neighbors.length > 0;
  });
};
MTG.Calc.addMetaData = function(dataArray){
  MTG.Calc.drawGraph(dataArray);
  return dataArray;
};

// Stateful container of card info
MTG.Data = {};
MTG.Data.randomPair = function(){
  const cData1 = MTG.Calc.random(MTG.Data.dataArray);
  const cData2 = MTG.Calc.random(cData1.neighbors);
  var winningCard = cData1;
  if (MTG.Calc.graphCost(cData1) < MTG.Calc.graphCost(cData2)){
    winningCard = cData2;
  }
  return {
    card1: cData1,
    card2: cData2,
    winningCard: winningCard,
  }
}
MTG.Data.init = function(data){
  MTG.Data.rawData = data;
  MTG.Data.dataArray = MTG.Calc.filterDataArray(
    MTG.Calc.addMetaData(
      MTG.Calc.filterData(data)
    )
  );
};

// ViewHelper is stateless funcs for Views
MTG.ViewHelper = {};
MTG.ViewHelper.parseText = function(line) {
  const parts = [];
  const openers = line.split('{');
  openers.forEach(function (opener){
    const oParts = opener.split('}');
    if (oParts.length < 1 || oParts.length > 2){
      throw line
    }
    let vanilla = oParts[0];
    if (oParts.length === 2){
      vanilla = oParts[1];
      parts.push({
        text: oParts[0],
        isSymbol: true,
      });
    }
    parts.push({
      text: vanilla,
      isSymbol: false,
    });
  })
  return parts;
};
MTG.ViewHelper.getTextNode = function(line) {
  const parts = MTG.ViewHelper.parseText(line);
  return parts.map(function(part, index) {
    if (part.isSymbol){
      return <img key={index} className="symbol" alt={part.text} src={`symbol/${part.text}.svg`} />;
    }
    return part.text;
  });
};
MTG.ViewHelper.cardDisplay = function(cData, anonymize, callback){
  const display = {
    id: cData.name,
    key: cData.name + anonymize,
    anonymize: anonymize,
    name: cData.name,
    cost: (cData.manaCost || '{0}'),
    type: cData.type,
    body: cData.text || '',
    pt: "",
    color: 'Colorless',
    callback: function(){},
  };
  if (anonymize){
    display.name = 'CARDNAME';
    display.cost = '???';
    display.type = cData.types.join(' ');
    if (cData.type.indexOf(' — Equipment') !== -1){
      display.type += ' — Equipment';
    }
    if (cData.type.indexOf(' — Aura') !== -1){
      display.type += ' — Aura';
    }
    display.body = display.body.replace(new RegExp(cData.name, 'g'), display.name);
    display.callback = function(){callback(display)};
  }
  if (cData.hasOwnProperty('power')){
    display.pt = cData.power + '/' + cData.toughness;
  }
  if (cData.colors){
    if (cData.colors.length > 1){
      display.color = 'Gold';
    } else if (cData.colors.length === 1){
      display.color = cData.colors[0];
    }
  }
  return display;
};

MTG.Public = function(){
  return MTG;
};
window.MTG = MTG.Public();

export default MTG;
