'use strict'
var mainData = [];
var playerWinData = {};
var countryWiseListing = {};
var i = 0;
var margin = {
    top: 20,
    bottom: 30,
    left: 10,
    right: 10
};
var svgHeight = 500;
var svgWidth = 600;
var innerWidth = svgWidth - margin.left - margin.right;
var innerHeight = svgHeight - margin.bottom - margin.top;
var alphaCode = [];
d3.csv('../data/iso-alpha3.csv', function (data) {
    alphaCode[data.Alpha3code.trim()] = data.Country;
});

d3.csv('../data/10yearAUSOpenMatches.csv', function (data) {
    mainData[i] = data;


    if (!countryWiseListing[data.country1]) {
        countryWiseListing[data.country1] = {};
        countryWiseListing[data.country1].country = data.country1;
        countryWiseListing[data.country1].count = 0;
        countryWiseListing[data.country1].players = [];

    }
    if (!countryWiseListing[data.country2]) {

        countryWiseListing[data.country2] = {};
        countryWiseListing[data.country2].country = data.country2;
        countryWiseListing[data.country2].count = 0;
        countryWiseListing[data.country2].players = [];

    }
    if (data.winner === data.player1) {
        countryWiseListing[data.country1].count += 1;
    } else {
        countryWiseListing[data.country2].count += 1;
    }

    if (!(_.includes(countryWiseListing[data.country1].players, data.player1))) {
        countryWiseListing[data.country1].players[countryWiseListing[data.country1].players.length] = data.player1;
    }
    if (!(_.includes(countryWiseListing[data.country2].players, data.player2))) {
        countryWiseListing[data.country2].players[countryWiseListing[data.country2].players.length] = data.player2;
    }

    i++;
    if (!playerWinData[data.player1]) {
        playerWinData[data.player1] = {};
        playerWinData[data.player1].lost = 0;
        playerWinData[data.player1].win = 0;
        playerWinData[data.player1].name = data.player1;
        playerWinData[data.player1].totalGames = 0;
        playerWinData[data.player1].country = data.country1;
    }
    if (!playerWinData[data.player2]) {
        playerWinData[data.player2] = {};
        playerWinData[data.player2].lost = 0;
        playerWinData[data.player2].win = 0;
        playerWinData[data.player2].name = data.player2;
        playerWinData[data.player2].totalGames = 0;
        playerWinData[data.player2].country = data.country2;
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

    var newPlayerWinData = _.toArray(playerWinData);
    countryWiseListing = _.toArray(countryWiseListing);
    var color = d3.scaleLinear().domain([0, 186]).range([0, 1]);
    var svg = d3.select('#bubble').append('svg')
        .attr('height', svgHeight)
        .attr('width', svgWidth)
        .attr('transform', 'translate(0,0)');


    svg.append('text')
        .attr('x', svgWidth / 2)
        .attr('y', margin.top)
        .attr("text-anchor", "middle")
        .style("font-size", "15px")
        .text("Number of wins for different countries - Australian open (Men's)");

    svg.append('text')
        .attr('x', svgWidth / 2)
        .attr('y', svgHeight - 10)
        .attr("text-anchor", "middle")
        .style("font-size", "10px")
        .text("Figure - 1");

    var g = svg.selectAll('g').data(countryWiseListing).enter().append('g');
    var scaleForRadius = d3.scaleSqrt().domain([0, 186]).range([0, 50]); //Maximum count is 186
    var simulation = d3.forceSimulation()
        .force('force_x', d3.forceX(svgWidth / 2).strength(0.05))
        .force('force_y', d3.forceY(svgHeight / 2).strength(0.05))
        .force('anti_collide', d3.forceCollide(function (d) {
            return scaleForRadius(d.count) + 10;
        }));


    var description = d3.select("body")
        .append("div")
        .style("position", "absolute")
        .style("z-index", "10")
        .style("visibility", "hidden")
        .style("color", "white")
        .style("padding", "8px")
        .style("background-color", "rgba(0, 0, 0, 0.75)")
        .style("border-radius", "6px")
        .style("font", "12px sans-serif")
        .text("tooltip");

    var circles = g.append('circle')
        .attr('class', 'player')
        .attr('r', function (d) {
            return scaleForRadius(d.count); //for varying circle radius
        })
        .style("fill", function (d) {
            return d3.interpolateGreens(color(d.count))
        })
        .on('mouseover', function (d) {
            description.text(alphaCode[d.country]);
            description.style("visibility", "visible");
        })
        .on("mousemove", function () {
            return description.style("top", (d3.event.pageY - 10) + "px").style("left", (d3.event.pageX + 10) + "px");
        })
        .on("mouseout", function () {
            return description.style("visibility", "hidden");
        })
        .on('click', drillDown);

    function mouseOver(d, i) {
        d3.select(this).attr('fill', 'red');
    }

    function mouseOut(d, i) {

    }
    simulation.nodes(countryWiseListing).on('tick', updateNodes); // just for updating cx and cy randomly with every second.

    function updateNodes() {
        circles.attr('cx', function (d) {
                return d.x;
            })
            .attr('cy', function (d) {
                return d.y;
            });

        text.attr('x', function (d) {
                return d.x;
            })
            .attr('y', function (d) {
                return d.y
            });
    }

    var text = g.append("text")
        .attr("dy", ".2em")
        .style("text-anchor", "middle")
        .attr("font-family", "Gill Sans", "Gill Sans MT")
        .text(function (d) {
            return d.country;
        })
        .style("font-size", "0.6rem")
        .attr("fill", "black");
    circles.exit().remove();


    function drillDown(chartData) {


        d3.select('#pie').html('');
        d3.select('#drill').html('');
        var div = document.getElementById('figure2');
        div.style.display = "block";
        var winArray = [];
        _.forEach(chartData.players, function (d) {
            if (playerWinData[d].win > 0) {
                winArray.push(playerWinData[d]);
            }
        });
        winArray.sort(function (a, b) {
            return d3.descending(a.win, b.win)
        });

        if (winArray.length > 7) {
            winArray = _.slice(winArray, 0, 7);
        }


        var xScale = d3.scaleBand().rangeRound([margin.left, innerWidth]).padding(0.2);
        var yScale = d3.scaleLinear().rangeRound([innerHeight, margin.top]);
        xScale.domain(winArray.map(function (d) {
            return d.name;
        }));



        yScale.domain(makeYDomain());
        var yAxis = d3.axisLeft()
            .scale(yScale)
            .ticks(10);

        var xAxis = d3.axisBottom();

        var svg = d3.select('#drill').append('svg')
            .attr('id', 'interact')
            .attr('height', svgHeight)
            .attr('width', svgWidth)
            .attr('transform', 'translate(5,5)');

        svg.append('text')
            .attr('x', svgWidth - 200)
            .attr('y', margin.top)
            .attr("text-anchor", "middle")
            .style("font-size", "15px")
            .text('Top players of ' + alphaCode[chartData.country]);
        svg.append('text')
            .attr('x', svgWidth / 2)
            .attr('y', svgHeight - 10)
            .attr("text-anchor", "middle")
            .style("font-size", "10px")
            .text("Figure - 2");


        var numberWins = d3.tip()
            .attr('class', 'tip')
            .offset([-5, 0])
            .direction('s')
            .html(function (d) {
                return "<strong>Wins:</strong> <span style='color:red'>" + d.win + "</span>";
            })

        svg.call(numberWins); //for tooltip
        var bars = svg.selectAll("bar")
            .data(_.toArray(winArray))
            .enter()
            .append("rect")
            .attr('class', 'bar')
            .attr('transform', 'translate(10,0)')
            .attr("x", function (d) {
                return xScale(d.name);
            })
            .attr("width", xScale.bandwidth())
            .attr("y", function (d) {
                return yScale(d.win);
            })
            .attr("height", function (d) {
                return innerHeight - yScale(d.win);
            })
            .on("mouseover", numberWins.show)
            .on("mouseout", numberWins.hide)
            .on('click', makePieChart);



        svg.append("g")
            .attr("transform", "translate(0," + innerHeight + ")")
            .call(d3.axisBottom(xScale));

        svg.append("text")
            .attr("transform",
                "translate(" + (innerWidth - 50) + " ," +
                (innerHeight + margin.top + 20) + ")")
            .style("text-anchor", "middle")
            .text("Players");

        svg.append("g")
            .attr("transform", 'translate(20,0)')
            .attr("class", "axis")
            .call(yAxis)
            .append("text")
            .attr("transform", "rotate(-90)")
            .attr("x", -15)
            .attr("y", 2)
            .attr("dy", ".71em")
            .style("text-anchor", "end")
            .style("fill", "black")
            .text("Number of wins");


        function makeYDomain() {

            var temp = [];
            _.forEach(winArray, function (d) {
                temp.push(d.win);
            })
            return [0, d3.max(temp)];
        }

        function makePieChart(data) {

            d3.select('#pie').html('');
            
            var radius = 100;
            var newSvgWidth = 1250;
            var newSvgHeight = 300;
            var arc = d3.arc()
                .outerRadius(radius)
                .innerRadius(0);
            var labelArc = d3.arc()
                .outerRadius(radius - 50)
                .innerRadius(radius - 50);

            var color = d3.scaleOrdinal().range(['#11fc7b', '#019142']);

            //Pie
            var pie = d3.pie()
                .sort(null)
                .value(function (d) {
                    return d;
                });
            var svg = d3.select('#pie').append('svg')
                .attr('height', newSvgHeight)
                .attr('width', newSvgWidth)
                .append('g')
                .attr('transform', 'translate(' + newSvgWidth / 2 + ',' + newSvgHeight / 2 + ')');

            var g = svg.selectAll('.arc')
                .data(pie([data.win, data.lost]))
                .enter().append('g')
                .attr('class', 'arc');

            g.append('path')
                .attr('d', arc)
                .style('fill', '#189651');

            svg.append('text')
                .attr('x', '400')
                .attr('y', '0')
                .attr("text-anchor", "middle")
                .style("font-size", "15px")
                .text("Victories and losses of: " + data.name);

            svg.append('text')
                .attr('x', '35')
                .attr('y', '10')
                .attr("text-anchor", "middle")
                .style("font-size", "15px")
                .text("wins: " + data.win);

            svg.append('text')
                .attr('x', '-50')
                .attr('y', '-10')
                .attr("text-anchor", "middle")
                .style("font-size", "15px")
                .text("losses: " + data.lost);

            svg.append('text')
                .attr('x', '0')
                .attr('y', '130')
                .attr("text-anchor", "middle")
                .style("font-size", "10px")
                .text("Figure - 3");
        }

    }
}
