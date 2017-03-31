
const MTG = {};

MTG.get = {};
MTG.get.graphCost = function(cData){
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
MTG.get.cardDistance = function(cData1, cData2){
  const cost1 = MTG.get.graphCost(cData1);
  const cost2 = MTG.get.graphCost(cData2);
  if (cost1 && cost2){
    return Math.abs(cost1 - cost2);
  }
  return null;
}
MTG.drawGraph = function(dataArray){
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
        if(MTG.get.cardDistance(cData1, cData2) === 1){
          cData1.neighbors.push(cData2);
        }
      });
    });
  });
}
MTG.filterData = function(data){
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
MTG.filterDataArray = function(dataArray){
  return dataArray.filter(function(cData){
    return cData.neighbors.length > 0;
  });
};
MTG.addMetaData = function(dataArray){
  MTG.drawGraph(dataArray);
  return dataArray;
};
MTG.rigData = function(data){
  MTG.rawData = data;
  MTG.dataArray = MTG.filterDataArray(
    MTG.addMetaData(
      MTG.filterData(data)
    )
  );
  return MTG.dataArray;
};
MTG.random = function(arr){
  return arr[Math.floor(Math.random()*arr.length)];
}
MTG.randomPair = function(){
  const cData1 = MTG.random(MTG.dataArray);
  const cData2 = MTG.random(cData1.neighbors);
  var winningCard = cData1;
  if (MTG.get.graphCost(cData1) < MTG.get.graphCost(cData2)){
    winningCard = cData2;
  }
  return {
    card1: cData1,
    card2: cData2,
    winningCard: winningCard,
  }
}
MTG.publicAPI = function(){
  return MTG;
};
window.MTG = MTG.publicAPI();

export default MTG;
