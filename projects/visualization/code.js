// URL: https://beta.observablehq.com/d/a622c917118d5e61
// Title: COGS 220 EventDrops Demo
// Based on https://beta.observablehq.com/@mbostock/hello-eventdrops
// and https://github.com/marmelab/EventDrops/blob/fc0d8ca4001156ddfc5738133b53bf479ffb190f/demo/demo.js


var tooltip = d3
  .select('body')
  .append('div')
  .classed('tooltip', true)
  .style('opacity', 0)
  .style('pointer-events', 'auto');

function makeTooltip(e) {
  tooltip.html(
    `
    <div class="content">
      <strong>${e.date.toString().substring(0, 24)}</strong>
      <br />
      ${e.tooltip.toString()}
    </div>
    `
  ).style('left', `${d3.event.pageX - 30}px`).style('top', `${d3.event.pageY + 20}px`);
  // Make the tooltip visible
  tooltip.transition().duration(200).style("opacity", 1).style("pointer-events", "auto");
}

// NOTE this is just makeTooltip() but it doesn't include time of day
// (literally all that's different is the end value in the substring)
// ideally this would be combined with makeTooltip() but for now a bit of
// redundancy is ok
function makeTooltipNews(e) {
  tooltip.html(
    `
    <div class="content">
      <strong>${e.date.toString().substring(0, 15)}</strong>
      <br />
      ${e.tooltip.toString()}
    </div>
    `
  ).style('left', `${d3.event.pageX - 30}px`).style('top', `${d3.event.pageY + 20}px`);
  // Make the tooltip visible
  tooltip.transition().duration(200).style("opacity", 1).style("pointer-events", "auto");
}

function rmTooltip(e) {
  // Make the tooltip invisible
  tooltip.transition().duration(500).style("opacity", 0).style("pointer-events", "none");
}

function getRandomNoise(){
  return randn_bm(4*3600);
}

function addJittering(d){
  var dates = [new Date('10/02/2017 8:00:00 AM'), new Date('10/03/2017 8:00:00 AM'), new Date('10/04/2017 8:00:00 AM')
           ,new Date('10/05/2017 8:00:00 AM'),new Date('10/06/2017 8:00:00 AM'),new Date('10/07/2017 8:00:00 AM'),
           new Date('10/08/2017 8:00:00 AM')];
  var noise = getRandomNoise();
  var temp = dates[d];
  temp.setSeconds(temp.getSeconds() + noise);
  return temp;
}

function objLength(obj) {
  return Object.keys(obj).length - 1;
}

/*function unifyStuff(hist) {

   var outputData = [];
   for (var t = 0; t < hist.length; t++) {
     //console.log(t);
     //console.log("T " + hist[t]);
     var dates = [];
     for (var d = 0; d < objLength(hist[t]); d++) {
       //console.log("D" + hist[t][d]);
       for (var multiplicity = 0; multiplicity < parseInt(hist[t][d]); multiplicity++) {
         //console.log("M " + multiplicity);
         dates.push({date: addJittering(d)});
        }
      }
     var dataInstance = {name: t.toString(), data: dates};
     outputData.push(dataInstance);
   }
   return outputData;
}
*/
function randn_bm(scaleFactor) {
    var u = 0, v = 0;
    while(u === 0) u = Math.random(); //Converting [0,1) to (0,1)
    while(v === 0) v = Math.random();
    let num = Math.sqrt( -2.0 * Math.log( u ) ) * Math.cos( 2.0 * Math.PI * v );
    num = num / 10.0 + 0.5; // Translate to 0 -> 1
    if (num > 1 || num < 0) return randn_bm(scaleFactor); // resample between 0 and 1
    num = num - 0.5;
    num = num * 2 * scaleFactor;
    return num;
}

/* These replicate functions sync up zoom events detected on one chart to
 * the other chart. Ideally these would just redraw the chart, but right now we
 * actually destroy the chart's interior and then redraw it (which is laggy,
 * but works).
 *
 * A TODO here is to add some sort of polling, akin to what's mentioned
 * in https://developer.mozilla.org/en-US/docs/Web/Events/scroll#Example.
 */
function replicateTweetsZoom(e) {
    replaceChart("news");
}

function replicateNewsZoom(e) {
    replaceChart("tweets");
    //console.log(e);

    // So this function *should* redraw the tweets chart with the news chart's
    // scale, but instead it just returns a function without seeming to do
    // anything else. That function takes as input a d3 selection, apparently?
    // But we haven't been able to successfully call it with a d3 selection.
    //
    // Even trying to mimic "root" in this test code --
    // https://github.com/marmelab/EventDrops/blob/master/src/index.spec.js#L151
    // -- doesn't seem to be working (I get this sort of error:
    // https://github.com/marmelab/EventDrops/issues/246).
    //tweetsChart.draw(tweetsConfig, newsChart.scale())(e);

    // Below here is a mishmash of test code from us trying to solve this.
    //var root = d3.select("#tweetsChart").data(tweetsHist);
    //root.call(tweetsChart);
    //var newScale = d3.scaleTime(newsChart.scale().domain());
    //d = tweetsChart.draw(tweetsConfig, newScale);
    //data2 = d3.select("#tweetsChart").datum(tweetsData).data();
    //d(d3.select("#tweetsChart").datum(tweetsData).data());
}


function createEventsFromTweets(jsonData){
  console.log('Entered json processor');
  var outputData = [];
  //console.log(jsonData)
  //console.log(jsonData.length());
  for (var group in jsonData){
    console.log('Processing group ' + group + 'with ' + jsonData[group].length);
    var group_events = jsonData[group];
    var topic_data = [];
    for (var event in group_events){
      topic_data.push({date: new Date(group_events[event]['date']), 
                        tooltip: group_events[event]['content']});
    }
    var dataInstance = {name: group, data: topic_data};
    outputData.push(dataInstance);
  }
  return outputData;
}

function createEventsFromNews(jsonData){
  var outputData = [];
  //console.log(jsonData)
  //console.log(jsonData.length());
  for (var group in jsonData){
    console.log('Processing news group ' + group + 'with ' + jsonData[group].length);
    var group_events = jsonData[group];
    var topic_data = [];
    for (var event in group_events){
      var noise = getRandomNoise();
      var temp = new Date(group_events[event]['date']);
      // console.log(temp)
      temp.setSeconds(temp.getSeconds() + noise + 60*60*8);
      topic_data.push({date: temp, 
                      tooltip: group_events[event]['content']});
    }

    var dataInstance = {name: group, data: topic_data};
    
    outputData.push(dataInstance);
    
  }
  return outputData;
}


var rowColors = [];
for (ci = 0; ci < 25; ci++) {
    rowColors.push(colorLine());
}



  var newsConfig = {
    range: {
      start: new Date('10/01/2017 6:55:11 PM'),
      end: new Date('10/09/2017 7:15:11 PM')
    },
    //metaballs: {
    //  blurDeviation: 25
    //},
    drop: {
      date: d => d.date,
      onMouseOver: makeTooltipNews,
      onMouseOut: rmTooltip
    },
    zoom: {
      onZoom: replicateNewsZoom
    },
    line: {
      color: (data, index) => rowColors[index],
    }
  };

  var tweetsConfig = {
    range: {
      start: new Date('10/01/2017 6:55:11 PM'),
      end: new Date('10/09/2017 7:15:11 PM')
    },
    //metaballs: {
    //  blurDeviation: 25
    //},
    drop: {
      date: d => d.date,
      // color: data => colorDrop(data),
      onMouseOver: makeTooltip,
      onMouseOut: rmTooltip
    },
    zoom: {
      onZoom: replicateTweetsZoom
    },
    line: {
      color: (data, index) => rowColors[index],
    }
  };

  var counter = 0;
  var y = 16777215
  var first_date = 0;

var tweet_file ="https://raw.githubusercontent.com/sid-dinesh94/sid-dinesh94.github.io/master/projects/textIntegration/news_sourced/tweets.json";
var news_file ="https://raw.githubusercontent.com/sid-dinesh94/sid-dinesh94.github.io/master/projects/textIntegration/news_sourced/news.json";

var tweetsData;
var data_copy;
d3.queue()
  .defer(d3.json, tweet_file)
  .defer(d3.json, news_file)
  .await(render);

function render(error, tweet_json, news_json) {
  if(error){
    console.log(error)
  }
  data_copy = news_json;
  var tweetsData = createEventsFromTweets(tweet_json);
  var newsData = createEventsFromNews(news_json);
  console.log(newsData)

  //var tweetsData = unifyStuff(tweetsHist);
  //var newsData = unifyStuff(newsHist);

  createChart("tweets", tweetsData);
  createChart("news", newsData);
};
//console.log(tweets_data)
//tweetData = createEventsFromTweets(tweet_data);



function colorDrop(data){
  counter = counter + 1;
  //console.log("Counter: ", counter);
  var valuee = data.date.getTime();
  if (counter == 1) {
    first_date = valuee;
  }
  else {
    valuee =  Math.abs(first_date - valuee)
  }
  var z = Math.round(valuee % y);
  //console.log("Value: ", valuee.toString(16));
  //console.log("Quotient: ", z.toString(16));
  var col = "#".concat(z.toString(16));
  //console.log("Color:", col)
  return col;
  // if (counter > 0 && counter <= 100) {return 'red';}
  // if (counter > 100 && counter < 200) {return 'blue';}
  // if (counter > 200) {return 'green';}
  // var colorDigits = '0123456789ABCDEF';
  // var col = "#";
  // var id = 0;
  // for (var i = 0; i < 6; i++){
  //     id = Math.floor(Math.random() * 16);
  //     col += (colorDigits.charAt(id));
  // }
  // return col;
}

function colorLine(data){
  //console.log(parseInt(data.name));
  var colorDigits = '0123456789ABCDEF';
  var col = "#";
  var id = 0;
  for (var i = 0; i < 6; i++){
      id = Math.floor(Math.random() * 16);
      col += (colorDigits.charAt(id));
  }
  //console.log(col)
  return col;
}


var tweetsChart, newsChart;

function createChart(chartType, data, otherScale) {
    var chart;
    var data;
    var divID = "#";
    var config = (chartType === "news") ? newsConfig : tweetsConfig;
    if (otherScale !== undefined) {
        config["range"]["start"] = otherScale[0];
        config["range"]["end"] = otherScale[1];
    }
    if (chartType === "news") {
        newsChart = eventDrops(config);
        divID += "newsChart";
        chart = newsChart;
    } else {
        tweetsChart = eventDrops(config);
        divID += "tweetsChart";
        chart = tweetsChart;
    }
    d3.select(divID).datum(data).call(chart);
}

function replaceChart(chartType) {
    var divID, newScale;
    if (chartType === "news") {
        divID = "newsChart";
        newScale = tweetsChart.scale().domain();
        data = newsChart.filteredData()
        //console.log(data)
    } else {
        divID = "tweetsChart";
        newScale = newsChart.scale().domain();
        data = tweetsChart.filteredData();
        //console.log(data);
    }
    //console.log(data)
    d3.select("#" + divID + " *").remove();
    createChart(chartType, data, newScale);
}



