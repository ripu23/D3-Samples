'use strict'
var mainData = [];
var playerWinData = {};
var i = 0;
var margin = {
    top: 10,
    bottom: 10,
    left: 10,
    right: 10
};
var svgHeight = 500;
var svgWidth = 1000;
var innerWidth = svgWidth - margin.left - margin.right;
var innerHeight = svgHeight - margin.bottom - margin.left;

d3.csv('./data/10yearAUSOpenMatches.csv', function (data) {
    mainData[i] = data;

    i++;
    if (!playerWinData[data.player1]) {
        playerWinData[data.player1] = {};
        playerWinData[data.player1].lost = 0;
        playerWinData[data.player1].win = 0;
        playerWinData[data.player1].name = data.player1;
        playerWinData[data.player1].totalGames = 0;
    }
    if (!playerWinData[data.player2]) {
        playerWinData[data.player2] = {};
        playerWinData[data.player2].lost = 0;
        playerWinData[data.player2].win = 0;
        playerWinData[data.player2].name = data.player2;
        playerWinData[data.player2].totalGames = 0;
    }
    if (data.winner == data.player1) {
        playerWinData[data.player1].win += 1;
        playerWinData[data.player2].lost += 1;
    } else {
        playerWinData[data.player1].lost += 1;
        playerWinData[data.player2].win += 1;
    }
    playerWinData[data.player1].totalGames += 1;
    playerWinData[data.player2].totalGames += 1;

}).then(callBack);

function callBack() {
    playerWinData = _.toArray(playerWinData);

    var svg = d3.select('body').append('svg')
        .attr('height', svgHeight)
        .attr('width', svgWidth);
    var g = svg.append('g').attr('transform', 'translate(' + margin.left + ',' + margin.right + ')');

    var scale = {
        xScale: d3.scaleBand().rangeRound([0, innerWidth]).padding(0.1),
        yScale: d3.scaleLinear().rangeRound([innerHeight, 0])
    }

    function display(data) {
        scale.xScale.domain(data.map(function (d) {
            return d.name;
        }));
        scale.yScale.domain([0, d3.max(data, function (d) {
            return d.totalGames;
        })]);
        
        var bars = g.selectAll(".bar").data(data);
        bars.enter().append("rect")
        .attr("class", "bar")
        .attr('x', function (d) {
                return scale.xScale(d.name);
            })
        .attr('y', function (d) {
                return scale.yScale(d.totalGames);
            })
        .attr('width', scale.xScale.bandwidth())
        .attr('height', function (d) {
                return innerHeight - d.totalGames;
            });

//        g.selectAll('.bar')
//            .data(data)
//            .enter().append('rect')
//            .attr("class", "bar")
//            .attr("x", function (d) {
//                return scale.xScale(d.name);
//            })
//            .attr("y", function (d) {
//                return scale.yScale(d.totalGames);
//            })
//            .attr("width", scale.xScale.bandwidth())
//            .attr("height", function (d) {
//                return innerHeight - scale.yScale(d.totalGames);
//            });
        //bars.exit().remove();
    }



    display(playerWinData);


}
