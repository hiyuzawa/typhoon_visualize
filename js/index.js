import d3 from "d3";
import topojson from "topojson";

(function(){

    const width = window.innerWidth;
    const height = window.innerHeight;

    const svg = d3.select("body").append("svg")
                .attr("width", width)
                .attr("height", height);
    const projection = d3.geo.orthographic()
                        .scale(width * 1.0)
                        .translate([width / 2, height /2])
                        .clipAngle(90)
                        .rotate([225, -36]);
    const typhoon_list = d3.select("body").append("div")
                    .attr("class", "typhoon_list");

    const hpagraph = d3.select("body")
                    .append("svg")
                    .attr("class", "hpagraph")
                    .attr("width", 600)
                    .attr("height", 150)
                    .append("g");


    const path = d3.geo.path().projection(projection);


    const graticule = d3.geo.graticule().step([5, 5]);
    svg.append("path")
        .datum(graticule)
        .attr("class", "graticule")
        .attr("d", path);

    var lastSelected = "";

    d3.json("./data/map_topo.json", (error, dat) => {
        const shape = svg.append("g");
        shape.selectAll(".land")
            .data(topojson.feature(dat, dat.objects.map_geo).features)
            .enter()
            .append("path")
            .attr("d", path)
            .attr("class", "land");

    })

    var hpa_list = {};

    d3.json("./data/typhoon_2015.json", (error, dat) => {
        let labels = [];
        dat.forEach((v, i) => {
            const label = v.header[1].substr(2,2) + " (" + v.header[7] + ") " +  v.header[8];
            labels.push({"c": v.header[7], "l": label});

            let track = [];
            let hpa = [];

            v.track.forEach((v, i) => {
                track.push([parseInt(v[4])/10, parseInt(v[3])/10]);
                hpa.push([i, v[5]]);
            });

            hpa_list[v.header[7]] = hpa;

            const track_line = svg.append("g")
                                    .attr("class", "track_lines")
                                    .selectAll(".line")
                                    .data([{"type": "LineString", "coordinates": track}])
                                    .enter()
                                    .append("path")
                                    .attr("d", path)
                                    .attr("class", v.header[7])
                                    .classed("selected_track_line", false);

            const track_points = svg.append("g")
                                    .attr("class", "track_points")
                                    .selectAll(".point")
                                    .data(track)
                                    .enter()
                                    .append("circle")
                                    .attr({
                                        "cx": function(d){ return projection(d)[0];},
                                        "cy": function(d){ return projection(d)[1];},
                                        "r" : 3,
                                    })
                                    .attr("class", v.header[7] + "point")
                                    .classed("selected_track_point", false);

        });
        typhoon_list.selectAll(".label").append("ul")
            .data(labels)
            .enter()
            .append("li")
            .text((d) => {
                return d.l;
            })
            .on("mouseover", (d) => {
                if(lastSelected) {
                    svg.select("."+lastSelected)
                        .classed("selected_track_line", false);
                    svg.selectAll("."+lastSelected+"point")
                        .classed("selected_track_point", false);
                }
                svg.select("."+d.c)
                    .classed("selected_track_line", true);
                svg.selectAll("."+d.c+"point")
                    .classed("selected_track_point", true);
                lastSelected = d.c;

                d3.select(".hpagraph").select("g").html("");


                const xScale = d3.scale.linear()
                        .domain([d3.min(hpa_list[d.c], function(dd){ return parseInt(dd[0])}) -1 , d3.max(hpa_list[d.c], function(dd){ return parseInt(dd[0])}) + 1])
                        .range([0, 600]);

                const yScale = d3.scale.linear()
                        .domain([d3.max(hpa_list[d.c], function(dd){ return parseInt(dd[1])}) + 10, d3.min(hpa_list[d.c], function(dd){ return parseInt(dd[1])}) - 10])
                        .range([0, 150]);

                const line = d3.svg.line()
                        .x( (d, i) => { return xScale(parseInt(d[0]));})
                        .y( (d, i) => { return yScale(parseInt(d[1]));});

                hpagraph.append("path")
                        .attr("class", "hpaline")
                        .attr("d", line(hpa_list[d.c]));
            });

    })


})();