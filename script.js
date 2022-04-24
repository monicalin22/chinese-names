BASE_URL = "https://monicalin22.github.io/chinese-names/"

ALL_URLS = [
	"data/top50char.json",
	"data/char_to_definition.json",
	"data/char_override_dict.json",
	"data/name_parallel_ranks_m_final.json"
]

ALL_URLS = ALL_URLS.map(url => BASE_URL + url);

var top50char_data;
var char_to_definition_data;
var char_override_dict_data;

var ALL_DATA_LOADED = false;
Promise.all(ALL_URLS.map(u => fetch(u)))
.then(responses =>
    Promise.all(responses.map(res => res.json()))
).then(json => {
	top50char_data          = json[0]
	char_to_definition_data = json[1];
	char_override_dict_data = json[2];
	name_parallel_ranks_m = json[3];
	
	ALL_DATA_LOADED = true;
	createVisual(top50char_data, char_to_definition_data, char_override_dict_data);
});


var decade2 = 1950;

update_decade_in_html = () => {
	document.getElementById("output").innerHTML = decade2;
}

document.addEventListener("DOMContentLoaded", evt => {
	update_decade_in_html();
	
	decade_select_slider = document.getElementById("decade-selector");
	
	decade_select_slider.addEventListener("input", evt => {
		year_select   = decade_select_slider.value;
		decade_select = Math.floor(year_select / 10) * 10;
		
		if (ALL_DATA_LOADED && (decade_select != decade2)) {
			let svg = d3.selectAll("#decade-prevalence-vis");
			svg.selectAll("*").remove();
			
			// Create decade prevalance visualization
			decade2 = decade_select;
			update_decade_in_html();
			createVisual(top50char_data, char_to_definition_data, char_override_dict_data);
			
			console.log("Decade selected: " + decade_select);
			console.log("Visual created/updated!");	
		}	
	});
});


//Create historical rank chart
chart =  (data_rank, keyz = null, theme_colours = d3.scaleOrdinal(d3.schemeCategory10)) => {//(data, data_maxrank, keyz, theme_colours, height) => 
	const margin = ({top: 20, right: 10, bottom: 20, left: 30})
	const height = data_rank.length * 3
	const name_peak_rank_func = (name_parallel_ranks) => {
	// create map with key rank and year and if a name peaks there, return it
	let m = new Map();
	name_parallel_ranks.forEach(obj => {
	  let maxrank = 200;
	  let maxyear = "1950";
	  
	  if (obj.rank_1950 < maxrank) {
		maxrank = obj.rank_1950;
		maxyear = "1950";
	  }
	  if (obj.rank_1960 < maxrank) {
		maxrank = obj.rank_1960;
		maxyear = "1960";
	  }
	  if (obj.rank_1970 < maxrank) {
		maxrank = obj.rank_1970;
		maxyear = "1970";
	  }
	  if (obj.rank_1980 < maxrank) {
		maxrank = obj.rank_1980;
		maxyear = "1980";
	  }
	  if (obj.rank_1990 < maxrank) {
		maxrank = obj.rank_1990;
		maxyear = "1990";
	  }
	  if (obj.rank_2000 < maxrank) {
		maxrank = obj.rank_2000;
		maxyear = "2000";
	  }
  
	  m.set(String(maxrank) + "rank_" + maxyear, obj.name)
  
	})
  
	return m;
  }
  
	const line = d3.line()
	  .curve(d3["curveNatural"])
	  .defined(([key, value]) => (value != null && value <= 100))//&& value <= 100
	  .y(([key, value]) => name_x.get(key)(value))
	  .x(([key, value]) => {
		console.log(key)
		return name_y(key) - (value>100 ? name_y.step()/2 : 0)
	})
  
  
	const name_x = new Map(Array.from(name_keys, key => [key, d3.scaleLinear([1,100], [margin.top, height - margin.bottom])]))
	const name_y = d3.scalePoint(name_keys, [margin.left, (width - margin.right)/1.5])
  
	const data_maxrank = name_peak_rank_func(name_parallel_ranks_m)
  
  
	
	const svg = d3.selectAll("#decade-rank-m")
		.attr("viewBox", [0, 0, windowWidth, height]);
  
	const nameDisp = svg.append("text")
	  .attr("x", (width)/1.5)
	  .attr("y", "55")
	  .attr("opacity", "0.0")
	  .attr("lang", "zh-CN")
	const themeDisp = svg.append("text")
	  .attr("x", (width)/1.5)
	  .attr("y", "75")
	  .attr("opacity", "0.0")
	  .attr("lang", "zh-CN")
  
	//let focus_theme = keyz;
	let focus_theme = String(keyz).length > 0 ? String(keyz) : null;
  
	//draw lines
	svg.append("g")
		.attr("fill", "none")
		.attr("stroke-width", 4.5)
		.attr("stroke-opacity", 0.1)
	  .selectAll("path")
	  .data(data_rank)
	  .join("path")
		//.attr("stroke", d => d["theme"] === focus_theme ? theme_colours(d["theme"]) : theme_colours(d["theme"]))
		//.attr("stroke", d => d["theme"] === "nation_recovery" ? theme_colours(d["theme"]) : "none")
		//.attr("stroke", d => d["theme"] === "red" ? theme_colours(d["theme"]) : "none")
		//.attr("stroke", d => d["theme"] === "moral" ? theme_colours(d["theme"]) : "none")
		//.attr("stroke", d => d["theme"] == focus_theme ? theme_colours(d["theme"]) : "none")
		.attr("stroke", d => {
		  let themes = d["theme"].split(';');
  
		  //filter mode
		  if(focus_theme != null){
			return (themes.includes(focus_theme)) ? theme_colours(themes[0]) : "none";
		  }
		  else{
			return theme_colours(themes[0])
		  }
		  
		  
		})
	  
		.attr("d", d => {
			return line(d3.cross(name_keys, [d], (key, d) => [key, d[key]]))
		})
		.attr("data-name", d => d.name)
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
  
			d3.selectAll("rect")
			  .filter(function() {
				return d3.select(this).attr("data-name") == d.target.__data__.name; // filter by name
			  })
			  //.attr("width", height/50)
			  .attr("stroke", "white")
			  .attr("stroke-width", 2)
			  
	   })
	   .on('mouseout', function (d, i) {
			d3.select(this).transition()
				 .duration('50')
				 .attr('stroke-opacity', '0.1')
				 .attr('stroke-width', 4.5);
			d3.selectAll("rect")
			  .filter(function() {
				return d3.select(this).attr("data-name") == d.target.__data__.name; // filter by name
			  })
			.attr("width", height/100)
			.attr("stroke-width", 0)
	   })
	  .append("title")
		.text(d => d.name);
  
	
		
  
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
			  if(data_maxrank.has(code)){
				return data_maxrank.get(code);
			  }
			  else{
				return ""
			  }
			  
			}));
		})
		.call(g => g.append("text")
		  .attr("y", margin.top)
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
  
	//draw points
	svg.append("g")
	  .selectAll("rect")
	  .data(data_rank)
	  .join((enter) => {
		  let g = enter;
		  
		  console.log(enter)
		  name_keys.forEach(year => {
			g.append('rect')
				.attr("width", height/100)
				.attr("height", height/100)
				.attr("x", d => name_y(year) - height/200)
				.attr("y", d => name_x.get(year)(d[year]) - height/200)
				.attr("fill", d => {
				  let themes = d["theme"].split(';');
				  return (themes[0] === focus_theme) ? theme_colours(themes[0]) : focus_theme != null ? "none": theme_colours(themes[0]);
				})
				.attr("data-name", d => d.name)
				
				.on('mouseover', function (d, i) {
					  nameDisp.html(`${d.target.__data__.name}`);
					  nameDisp.transition()
						   .duration(50)
						   .style("opacity", 1)
			
					  themeDisp.html(`${d.target.__data__.meaning}`);
					  themeDisp.transition()
						   .duration(50)
						   .style("opacity", 1)
			
					  d3.selectAll("path")
						.filter(function() {
						  return d3.select(this).attr("data-name") == d.target.__data__.name; // filter by name
						}).transition()
						   .duration('50')
						   .attr('stroke-opacity', '1')
						   .attr('stroke-width', 7.5);
  
					d3.selectAll("rect")
						.filter(function() {
						  return d3.select(this).attr("data-name") == d.target.__data__.name; // filter by name
						}).transition()
						   .duration('50')
						   .attr("stroke", "white")
							.attr("stroke-width", 2)
				 })
				 .on('mouseout', function (d, i) {
						d3.selectAll("rect")
						.filter(function() {
						  return d3.select(this).attr("data-name") == d.target.__data__.name; // filter by name
						}).transition()
						   .duration('50')
						   .attr("stroke", "white")
							.attr("stroke-width", 0)
						
				   
						d3.selectAll("path")
						.filter(function() {
						  return d3.select(this).attr("data-name") == d.target.__data__.name; // filter by name
						}).transition()
						   .duration('50')
						   .attr('stroke-opacity', '0.1')
						   .attr('stroke-width', 4.5);
				 })
			}
			
		  )
		  
  
	  })
  
  }


// Create the decades-prevalence visualization
createVisual = function(data, char_to_definition, char_override_dict) {

	let char1950 = new Set(data.map(obj => obj["char.all.1950"]));
	let char1960 = new Set(data.map(obj => obj["char.all.1960"]));
	let char1970 = new Set(data.map(obj => obj["char.all.1970"]));
	let char1980 = new Set(data.map(obj => obj["char.all.1980"]));
	let char1990 = new Set(data.map(obj => obj["char.all.1990"]));
	let char2000 = new Set(data.map(obj => obj["char.all.2000"]));
	let post1960 = new Set([...char1950].filter(i => char1960.has(i)));
	let post1970 = new Set([...post1960].filter(i => char1970.has(i)));
	let post1980 = new Set([...post1970].filter(i => char1980.has(i)));
	let post1990 = new Set([...post1980].filter(i => char1990.has(i)));
	let post2000 = new Set([...post1990].filter(i => char2000.has(i)));
	post = [char1950, post1960, post1970, post1980, post1990, post2000];

	// Ratios for each of the characters
	let top_50_1950_chars = data.map(obj => obj["char.all.1950"]);
	let top_50_1960_chars = data.map(obj => obj["char.all.1960"]);
	let top_50_1970_chars = data.map(obj => obj["char.all.1970"]);
	let top_50_1980_chars = data.map(obj => obj["char.all.1980"]);
	let top_50_1990_chars = data.map(obj => obj["char.all.1990"]);
	let top_50_2000_chars = data.map(obj => obj["char.all.2000"]);
	let top_50_1950_ratios = data.map(obj => obj["n.m.1950"] / obj["n.all.1950"]);
	let top_50_1960_ratios = data.map(obj => obj["n.m.1960"] / obj["n.all.1960"]);
	let top_50_1970_ratios = data.map(obj => obj["n.m.1970"] / obj["n.all.1970"]);
	let top_50_1980_ratios = data.map(obj => obj["n.m.1980"] / obj["n.all.1980"]);
	let top_50_1990_ratios = data.map(obj => obj["n.m.1990"] / obj["n.all.1990"]);
	let top_50_2000_ratios = data.map(obj => obj["n.m.2000"] / obj["n.all.2000"]);
	var res_1950 = {}; var res_1960 = {}; var res_1970 = {}; var res_1980 = {}; var res_1990 = {}; var res_2000 = {}
	top_50_1950_chars.forEach((char, i) => res_1950[char] = top_50_1950_ratios[i]);
	top_50_1960_chars.forEach((char, i) => res_1960[char] = top_50_1960_ratios[i]);
	top_50_1970_chars.forEach((char, i) => res_1970[char] = top_50_1970_ratios[i]);
	top_50_1980_chars.forEach((char, i) => res_1980[char] = top_50_1980_ratios[i]);
	top_50_1990_chars.forEach((char, i) => res_1990[char] = top_50_1990_ratios[i]);
	top_50_2000_chars.forEach((char, i) => res_2000[char] = top_50_2000_ratios[i]);

	post_ratios = [res_1950, res_1960, res_1970, res_1980, res_1990, res_2000]


	// Number of square tiles
	const num_width  = 10;
	const num_height = 5;

	// Display settings
	const windowHeight = 400;
	const windowWidth  = 600;
	const MULT         = 0.96;
	const squareHeight = windowHeight / num_height * MULT;
	const squareWidth  = windowWidth  / num_width  * MULT;
	
	// const svg = d3.create("svg").attr('viewBox', [0, 0, windowWidth, windowHeight]);
	const svg = d3.selectAll("#decade-prevalence-vis").attr('viewBox', [0, 0, windowWidth, windowHeight]);
	
	let dict = {};
	
	let x = d3.scaleLinear().domain([0,  num_width]).range([0, windowWidth]);
	let y = d3.scaleLinear().domain([0, num_height]).range([0, windowHeight]);

	// Text settings
	let font_size         = "1.50rem";

	const x_text_offset   = 15; // 15;
	const y_text_offset   = 44; // 44;
	
	const x_def_offset    = -2;
	const y_def_offset    = 20;

	// 1950 characters
	let chars1950 = post[0];

	function get_male_to_total_ratio(char, ind) {
		return post_ratios[ind][char];
	}

	let k = 0;
	for (let row = 0; row < num_height; row++) {
		for (let col = 0; col < num_width; col++) {
			let ind   = (-1950 + decade2) / 10;
			let chars = post[ind];
			let char_ = Array.from(chars)[k];

			let g    = svg.append("g");  
			let rect = g
				.append("rect")
				.attr("x", x(col))
				.attr("y", y(row))
				.attr("width", squareWidth)
				.attr("height", squareHeight)
				.attr("fill",  "#ff69b4");

			let ratio = get_male_to_total_ratio(char_, ind);

			let rect2 = null;
			if (ratio != null) {
				rect2 = g
				  .append("rect")
				  .attr("x", x(col))
				  .attr("y", y(row))
				  .attr("width", squareWidth)
				  .attr("height", squareHeight * ratio)
				  .attr("fill",  "#72bcd4");
			}

			// 
			let text = g
				.append("text")
				.attr("x", x(col) + x_text_offset)
				.attr("y", y(row) + y_text_offset)
				.style("font-size", font_size)
				.style("fill", "#FFFFFF")
				.text(Array.from(chars1950)[k]);

			//let defn = char_to_definition[Array.from(chars1950)[k]].split(";")[0].split(",")[0];
			let defn = !char_override_dict.hasOwnProperty(Array.from(chars1950)[k]) ? char_to_definition[Array.from(chars1950)[k]].split(";")[0].split(",")[0] : String(char_override_dict[Array.from(chars1950)[k]]);

			let definition_size   = "0.50rem";
			if (defn.length >= 15) {definition_size = "0.40rem"};
			if (defn.length <= 5)  {definition_size = "0.75rem"};

			// Definition text
			let text2 = g
				.append("text")
				.attr("x", x(col) + x_text_offset + x_def_offset)
				.attr("y", y(row) + y_text_offset + y_def_offset)
				.style("font-size", definition_size)
				.style("fill", "#FFFFFF")
				.text(defn);

			if (!(chars1950.has(char_))) { // If doesn't exist, make it partly transparent
				rect.attr("opacity", 0.15);
				text.style("fill", "#BBBBBB");
				text2.style("fill", "#BBBBBB");
			}
			
			k++;
		}
	}
}