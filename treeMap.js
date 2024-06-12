const treemapContainer = document.getElementById("treemap-container");

if (!treemapContainer) {
  console.error("Treemap container not found.");
} else {
  const treemapWidth = treemapContainer.clientWidth || 1040;
  const treemapHeight = treemapContainer.clientHeight || 600;

  var treemapColor = d3
    .scaleOrdinal()
    .range(["#7dad7d", "#45589c", "#b9424dff"]);

  var treemapLayout = d3
    .treemap()
    .size([treemapWidth, treemapHeight])
    .padding(3)
    .round(true);

  var treemapSvg = d3
    .select("#treemap-container")
    .append("svg")
    .attr("width", treemapWidth)
    .attr("height", treemapHeight)
    .style("font", "10px sans-serif");

  // Unique tooltip for the treemap
  var treemapTool = d3
    .select("#treemap-container")
    .append("div")
    .attr("id", "treemap-tooltip") // Unique ID
    .attr("class", "treemap-tooltip") // Unique class
    .style("position", "absolute")
    .style("background-color", "#ffffff")
    .style("padding", "8px")
    .style("box-shadow", "0px 0px 3px 0px #E6E6E6")
    .style("border", "1px solid #0072BC")
    .style("border-radius", "4px")
    .style("pointer-events", "none")
    .style("display", "none")
    .style("z-index", "1000");

  function formatMoney(num) {
    return num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
  }

  function roundToTwo(num) {
    return +(Math.round(num + "e+2") + "e-2");
  }

  d3.json("data/treemap-data-json")
    .then(function (data) {
      var root = d3
        .hierarchy(data)
        .eachBefore(function (d) {
          d.data.id = (d.parent ? d.parent.data.id + "." : "") + d.data.name;
        })
        .sum(function (d) {
          return d.size;
        })
        .sort(function (a, b) {
          return b.height - a.height || b.value - a.value;
        });

      treemapLayout(root);

      var node = treemapSvg
        .selectAll(".node")
        .data(root.leaves())
        .enter()
        .append("g")
        .attr("class", "node")
        .attr("transform", function (d) {
          return "translate(" + d.x0 + "," + d.y0 + ")";
        });

      node
        .append("rect")
        .attr("id", function (d) {
          return d.data.id;
        })
        .attr("width", function (d) {
          return d.x1 - d.x0;
        })
        .attr("height", function (d) {
          return d.y1 - d.y0;
        })
        .attr("fill", function (d) {
          return d.parent
            ? treemapColor(d.parent.data.name)
            : treemapColor(d.data.name);
        });

      node
        .append("clipPath")
        .attr("id", function (d) {
          return "clip-" + d.data.id;
        })
        .append("use")
        .attr("xlink:href", function (d) {
          return "#" + d.data.id;
        });

      node
        .append("text")
        .attr("clip-path", function (d) {
          return "url(#clip-" + d.data.id + ")";
        })
        .attr("x", 4)
        .attr("y", 13)
        .attr("font-size", function (d) {
          var boxHeight = d.y1 - d.y0;
          var boxWidth = d.x1 - d.x0;
          var textLength = d.data.name.length;
          return Math.min(
            20,
            Math.max(10, Math.min(boxWidth / textLength, boxHeight / 2))
          );
        })
        .attr("dy", "0.35em")
        .text(function (d) {
          var boxWidth = d.x1 - d.x0;
          var charsToShow = Math.floor(boxWidth / 8);
          return d.data.name.length > charsToShow
            ? d.data.name.substring(0, charsToShow) + "..."
            : d.data.name;
        });

      node
        .on("mouseover", function (event, d) {
          treemapTool.style("display", "block");
          d3.select(this).style("stroke", "#c6ae73").style("stroke-width", 0);
        })
        .on("mousemove", function (event, d) {
          const format = d3.format(",");
          const tooltipWidth = treemapTool.node().offsetWidth;
          const tooltipHeight = treemapTool.node().offsetHeight;

          // Get the current mouse position
          const mouseX = event.clientX;
          const mouseY = event.clientY;

          // Calculate the position of the tooltip
          let left = mouseX + 5; // Closer offset to the cursor
          let top = mouseY + 5; // Closer offset to the cursor

          // Get the bounding box of the SVG container
          const svgRect = treemapContainer.getBoundingClientRect();

          // Adjust position if tooltip goes out of bounds
          if (left + tooltipWidth > svgRect.width) {
            left = mouseX - tooltipWidth - 5;
          }
          if (top + tooltipHeight > svgRect.height) {
            top = mouseY - tooltipHeight - 5;
          }

          treemapTool
            .html(
              `<div style='color: #7dad7d'><b>${d.data.name}</b></div>
                         <div>฿ ${formatMoney(
                           Math.round(d.value)
                         )} (${roundToTwo(
                (d.value / root.value) * 100
              )}%)</div>`
            )
            .style("left", `${left}px`)
            .style("top", `${top}px`);
        })
        .on("mouseout", function () {
          treemapTool.style("display", "none");
          d3.select(this).style("stroke", null).style("stroke-width", null);
        });
    })
    .catch(function (error) {
      console.log("Error loading JSON data: ", error);
    });
}
