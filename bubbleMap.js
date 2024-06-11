// Adjust width and height to fill container dynamically
const width = document.getElementById("viz_container").clientWidth;
const height = document.getElementById("viz_container").clientHeight;

const svg = d3
  .select("#viz_container")
  .append("svg")
  .attr("width", width)
  .attr("height", height)
  .attr("viewBox", `0 0 ${width} ${height}`)
  .attr("preserveAspectRatio", "xMidYMid meet");

const projection = d3
  .geoRobinson()
  .scale(200) // Adjust scale for larger map size
  .center([0, 0])
  .translate([width / 2, height / 2]);

const pathGenerator = d3.geoPath().projection(projection);

const poly = svg.append("g");
const line = svg.append("g");
const bubble = svg.append("g");

const dataURL = "data/Updated_Merged_Country_Locations.csv"; // Updated data URL
const polygonsURL =
  "https://raw.githubusercontent.com/GDS-ODSSS/unhcr-dataviz-platform/master/data/geospatial/world_polygons_simplified.json";
const polylinesURL =
  "https://raw.githubusercontent.com/GDS-ODSSS/unhcr-dataviz-platform/master/data/geospatial/world_lines_simplified.json";

// Tooltip container
const tooltip = d3
  .select("#viz_container")
  .append("div")
  .attr("class", "tooltip")
  .style("position", "absolute")
  .style("background-color", "#ffffff")
  .style("padding", "8px")
  .style("box-shadow", "0px 0px 3px 0px #E6E6E6")
  .style("border", "1px solid #0072BC")
  .style("border-radius", "4px")
  .style("pointer-events", "none")
  .style("display", "none")
  .style("z-index", "1000"); // Ensure tooltip is above other elements

// Load and draw polygons
d3.json(polygonsURL).then(function (topology) {
  poly
    .selectAll("path")
    .data(
      topojson.feature(topology, topology.objects.world_polygons_simplified)
        .features
    )
    .enter()
    .append("path")
    .attr("fill", "#CCCCCC")
    .attr("d", pathGenerator);
});

// Load and draw lines
d3.json(polylinesURL).then(function (topology) {
  line
    .selectAll("path")
    .data(
      topojson.feature(topology, topology.objects.world_lines_simplified)
        .features
    )
    .enter()
    .append("path")
    .style("fill", "none")
    .attr("d", pathGenerator)
    .attr("class", (d) => d.properties.type);
});

d3.csv(dataURL).then((population) => {
  // Log population data for debugging
  console.log("Population data loaded:", population);

  const mouseover = function (event, d) {
    tooltip.style("display", "block");
    d3.select(this)
      .style("fill", "#7dad7d")
      .style("stroke", "#7dad7d")
      .style("opacity", 1);

    console.log("Mouseover event triggered:", d);
  };

  const mousemove = function (event, d) {
    const format = d3.format(",");
    const tooltipWidth = tooltip.node().offsetWidth;
    const tooltipHeight = tooltip.node().offsetHeight;

    // Calculate the position relative to the circle
    const circle = d3.select(this);
    const circleX = +circle.attr("cx");
    const circleY = +circle.attr("cy");

    // Adjust the tooltip position based on the circle's coordinates
    let left = circleX + 15; // Adjust this value to move tooltip closer
    let top = circleY - tooltipHeight / 2; // Center vertically

    // Get the bounding box of the SVG
    const svgRect = document
      .querySelector("#viz_container svg")
      .getBoundingClientRect();

    // Ensure tooltip stays within SVG bounds
    if (left + tooltipWidth > svgRect.width) {
      left = svgRect.width - tooltipWidth - 10;
    }
    if (left < 0) left = 10; // Ensure tooltip doesn't go off the left edge
    if (top + tooltipHeight > svgRect.height) {
      top = svgRect.height - tooltipHeight - 10;
    }
    if (top < 0) top = 10; // Ensure tooltip doesn't go off the top edge

    console.log(`Tooltip position - top: ${top}px, left: ${left}px`); // Debug tooltip position

    tooltip
      .html(
        `<div style='color: #7dad7d'><b>${d.country}</b></div>
         <div>จำนวนคนอีสาน: ${format(d.amount)}</div>`
      )
      .style("left", `${left}px`)
      .style("top", `${top}px`);
  };

  const mouseleave = function () {
    tooltip.style("display", "none");
    d3.select(this).style("stroke", "#0072BC").style("opacity", 0.6);

    console.log("Mouseleave event triggered.");
  };

  const valueScale = d3
    .scaleSqrt()
    .domain(d3.extent(population, (d) => +d.amount))
    .range([5, 30]); // Adjust range for larger bubbles

  bubble
    .selectAll("circle")
    .data(population)
    .enter()
    .append("circle")
    .attr("cx", (d) => projection([+d.lon, +d.lat])[0])
    .attr("cy", (d) => projection([+d.lon, +d.lat])[1])
    .attr("r", (d) => valueScale(+d.amount))
    .style("fill", "#b8424c")
    .attr("stroke", "#0072BC")
    .attr("stroke-width", 0.5)
    .attr("fill-opacity", 0.6)
    .on("mouseover", mouseover)
    .on("mousemove", mousemove)
    .on("mouseleave", mouseleave);
});
