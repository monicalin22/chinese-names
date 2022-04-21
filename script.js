const width  = 500
const height = 500

let dataset = new Map();

for(let year = 1950; year <= 2000; year+=10 ){
	for(let rank = 0; rank < 100; rank++){
		if(dataset.has(name_data[rank][`name.m.${year}`])){
			dataset.get(name_data[rank][`name.m.${year}`])[`rank_${year}`] = rank+1;
		}
		else {
			let tosetobj = {
			  name: name_data[rank][`name.m.${year}`],
			  rank_1950: 101,
			  rank_1960: 101,
			  rank_1970: 101,
			  rank_1980: 101,
			  rank_1990: 101,
			  rank_2000: 101,
			  theme: "h",
			  meaning: "",
		}
		tosetobj[`rank_${year}`] = rank+1;
		dataset.set(name_data[rank][`name.m.${year}`], tosetobj);

		}
	}
}
  
name_parallel_ranks_m2 = Array.from(dataset.values());

const svg = d3.create("svg")
	.attr("viewBox", [0, 0, width, height]);

const nameDisp = svg.append("text")
	.attr("x", (width)/2)
	.attr("y", "55")
	.attr("opacity", "0.0")
	.attr("lang", "zh-CN")
	
const themeDisp = svg.append("text")
	.attr("x", (width)/2)
	.attr("y", "75")
	.attr("opacity", "0.0")
	.attr("lang", "zh-CN")

//draw lines
svg.append("g")
  .attr("fill", "none")
  .attr("stroke-width", 4.5)
  .attr("stroke-opacity", 0.2)
.selectAll("path")
.data(name_parallel_ranks_m)
.join("path")
  .attr("stroke", d => theme_colours(d["theme"]))
  .attr("d", d => {
	  return line(d3.cross(name_keys, [d], (key, d) => [key, d[key]]))
  })
  .on('mouseover', function (d, i) {
	  console.log(d)
	  d3.select(this).transition()
		   .duration('50')
		   .attr('stroke-opacity', '1')
		   .attr('stroke-width', 7.5);
	  
	  nameDisp.html(`${d.target.__data__.name}`);
	  nameDisp.transition()
		   .duration(50)
		   .style("opacity", 1)

	  themeDisp.html(`${d.target.__data__.meaning}`);
	  themeDisp.transition()
		   .duration(50)
		   .style("opacity", 1)
 })
 .on('mouseout', function (d, i) {
	  d3.select(this).transition()
		   .duration('50')
		   .attr('stroke-opacity', '0.4')
		   .attr('stroke-width', 4.5);
 })
.append("title")
  .text(d => d.name);

//draw points
//svg.append("g")

//draw axis
svg.append("g")
.selectAll("g")
.data(name_keys)
.join("g")
  .attr("transform", d => `translate(${name_y(d)},0)`)
  .each(function(d) { d3.select(this).call(
	d3.axisLeft(name_x.get(d))
	  .ticks(100)
	  .tickFormat(d2 => {
		let code = String(d2) + d;
		if(name_peak_rank.has(code)){
		  return name_peak_rank.get(code);
		}
		else{
		  return ""
		}
		
	  }));
  })
  .call(g => g.append("text")
	.attr("y", margin.left)
	.attr("x", -6)
	.attr("text-anchor", "start")
	.attr("fill", "currentColor")
	.text(d => d))
  .call(g => g.selectAll("text")
	.clone(true).lower()
	.attr("fill", "none")
	.attr("stroke-width", 5)
	.attr("stroke-linejoin", "round")
	.attr("stroke", "white"));