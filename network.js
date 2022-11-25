'use strict';
d3.json("assign_part2_dhyey.json").then(function (data){
    let svg = d3.select('body').append("svg").attr("viewBox","-800 -900 3200 3200")
    simulate(data,svg)
})

function simulate(data,svg)
{
    const width = 1400
    const height = -300
    const main_group = svg.append("g")
        .attr("transform", "translate(-530, 160) scale(1.6)")

    let node_degree={};
    d3.map(data.links, (d)=>{
        if(d.source in node_degree)
        {
            node_degree[d.source]++
        }
        else{
            node_degree[d.source]=0
        }
        if(d.target in node_degree)
        {
            node_degree[d.target]++
        }
        else{
            node_degree[d.target]=0
        }
    })

    let scale_radius=d3.scaleSqrt()
        .domain(d3.extent(Object.values(node_degree)))
        .range([5,10])

    let color=d3.scaleSequential()
        .domain([1990,2020])
        .interpolator(d3.interpolateRgbBasis(["blue","yellow","purple"]))

    let link_elements = main_group.append("g")
        .attr('transform',`translate(${width/2},${height/2})`)
        .selectAll(".line")
        .data(data.links)
        .enter()
        .append("line")

    const treatPublisherClass=(Publisher)=>{
        let year=Publisher.toString().split(' ').join('');
        year= year.split(".").join('');
        year= year.split(",").join('');
        year= year.split("/").join('');
        return "yr-"+year
    }

    let node_elements = main_group.append("g")
        .attr('transform', `translate(${width / 2}, ${height / 2})`)
        .selectAll(".circle")
        .data(data.nodes)
        .enter()
        .append('g')
        .attr("class", function (d){
            return `node ${treatPublisherClass(d.Year)}`
        })


    node_elements.append("circle")
        .attr("r", function(d){
            if(node_degree[d.id]!==undefined){
                return scale_radius(node_degree[d.id])
            }
            else{
                return scale_radius(0)
            }
        }).attr("fill",d=>color(d.Year))

    node_elements.append("text")
        .text(function(d) {  return `${d.Title}  (${d.Year})`; });

    let ForceSimulation=d3.forceSimulation(data.nodes)
        .force("collide",
            d3.forceCollide().radius(function (d){
                return scale_radius(node_degree[d.id])*1.2
            })
        )
        .force("x", d3.forceX())
        .force("y", d3.forceY())
        .force("charge", d3.forceManyBody())
        .force("link", d3.forceLink(data.links)
            .id(function (d){
                return d.id
            })
        )
        .on("tick", ticked);

    function ticked()
    {
        node_elements
            .attr('transform', function(d){return `translate(${d.x}, ${d.y})`})
        link_elements
            .attr("x1", function(d){return d.source.x})
            .attr("x2", function(d){return d.target.x})
            .attr("y1", function(d){return d.source.y})
            .attr("y2", function(d){return d.target.y})
    }

    svg.call(d3.zoom()
        .extent([[0, 0], [width, height]])
        .scaleExtent([1,8])
        .on("zoom", zoomed)

    );

    function zoomed({transform}){
        main_group.attr("transform", transform);
    }
}