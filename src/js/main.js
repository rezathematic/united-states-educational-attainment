// Dataset URL
const educationData =
  "https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/for_user_education.json";

const countyData =
  "https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/counties.json";

// containers
const container = d3.select(".container");
const svg = d3.select("svg");

// tooltip init
const tooltip = container
  .append("div")
  .attr("class", "tooltip")
  .attr("id", "tooltip")
  .style("opacity", 0);

// Geo Path
const path = d3.geoPath();

// Visualize the data
d3.queue()
  .defer(d3.json, countyData)
  .defer(d3.json, educationData)
  .await(dataMap);

function dataMap(err, country, education) {
  if (err) {
    throw err;
  } else {
    // Calculate min and max
    const edudationArr = education.map((item) => {
      return item.bachelorsOrHigher;
    });
    const minEducation = d3.min(edudationArr);
    const maxEducation = d3.max(edudationArr);

    // Colors
    const color = d3
      .scaleThreshold()
      .domain(
        d3.range(minEducation, maxEducation, (maxEducation - minEducation) / 8)
      )
      .range(d3.schemeBlues[9]);

    ////////////
    // Legend //
    ////////////

    // X-Axis
    const x = d3.scaleLinear().domain([2.6, 75.1]).rangeRound([600, 860]);

    const g = svg
      .append("g")
      .attr("class", "legend")
      .attr("id", "legend")
      .attr("transform", "translate(0,40)");

    g.selectAll("rect")
      .data(
        color.range().map((d) => {
          d = color.invertExtent(d);
          if (d[0] === null) {
            d[0] = x.domain()[0];
          }
          if (d[1] === null) {
            d[1] = x.domain()[1];
          }
          return d;
        })
      )
      .enter()
      .append("rect")
      .attr("height", 10)
      .attr("x", (d) => {
        return x(d[0]);
      })
      .attr("width", (d) => {
        return x(d[1]) - x(d[0]);
      })
      .attr("fill", (d) => {
        return color(d[0]);
      });

    g.append("text")
      .attr("class", "caption")
      .attr("x", x.range()[0])
      .attr("y", -6)
      .attr("fill", "#000")
      .attr("text-anchor", "start")
      .attr("font-weight", "bold");

    g.call(
      d3
        .axisBottom(x)
        .tickSize(12)
        .tickFormat((item) => {
          return Math.round(item) + "%";
        })
        .tickValues(color.domain())
    )
      .select(".domain")
      .remove();

    svg
      .append("g")
      .attr("class", "counties")
      .selectAll("path")
      .data(topojson.feature(country, country.objects.counties).features)
      .enter()
      .append("path")
      .attr("class", "county")
      .attr("data-fips", (d) => {
        return d.id;
      })
      .attr("data-education", (d) => {
        var result = education.filter((obj) => {
          return obj.fips === d.id;
        });
        if (result[0]) {
          return result[0].bachelorsOrHigher;
        }
        return 0;
      })
      .attr("fill", (d) => {
        var result = education.filter((obj) => {
          return obj.fips === d.id;
        });
        if (result[0]) {
          return color(result[0].bachelorsOrHigher);
        }
        return color(0);
      })
      .attr("d", path)
      .on("mouseover", (d) => {
        tooltip.style("opacity", 0.9);
        tooltip
          .html(function () {
            var result = education.filter((obj) => {
              return obj.fips === d.id;
            });
            if (result[0]) {
              return (
                result[0]["area_name"] +
                ", " +
                result[0]["state"] +
                ": " +
                result[0].bachelorsOrHigher +
                "%"
              );
            }
            return 0;
          })
          .attr("data-education", () => {
            var result = education.filter((obj) => {
              return obj.fips === d.id;
            });
            if (result[0]) {
              return result[0].bachelorsOrHigher;
            }
            return 0;
          })
          .style("left", d3.event.pageX + 10 + "px")
          .style("top", d3.event.pageY - 28 + "px");
      })
      .on("mouseout", () => {
        tooltip.style("opacity", 0);
      });

    // Bind the data
    svg
      .append("path")
      .datum(
        topojson.mesh(country, country.objects.states, (a, b) => {
          return a !== b;
        })
      )
      .attr("class", "states")
      .attr("d", path);
  }
}
