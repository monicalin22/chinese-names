BASE_URL = "https://monicalin22.github.io/chinese-names/"

// Order matters here!
ALL_URLS = [
	"data/top50char.json",
	"data/char_to_definition.json",
	"data/char_override_dict.json",
	"data/name_parallel_ranks_m_final.json",
	"data/name_parallel_ranks_f_final.json",
	"data/givenname.json"
]

ALL_URLS = ALL_URLS.map(url => BASE_URL + url);

var top50char_data;
var char_to_definition_data;
var char_override_dict_data;
var given_name_data;

var ALL_DATA_LOADED = false;
Promise.all(ALL_URLS.map(u => fetch(u)))
	.then(responses =>
		Promise.all(responses.map(res => res.json()))
	).then(json => {
		top50char_data = json[0];
		char_to_definition_data = json[1];
		char_override_dict_data = json[2];
		name_parallel_ranks_m = json[3];
		name_parallel_ranks_f = json[4];
		given_name_data = json[5];

		ALL_DATA_LOADED = true;

		// Jeffrey's visualization
		createVisual(top50char_data, char_to_definition_data, char_override_dict_data);

		// Brian's visualization
		rank_chart("decade-rank-m", name_parallel_ranks_m, [], true);
		rank_chart("decade-rank-f", name_parallel_ranks_f, [], true);
		rank_chart("decade-rank-m-nation", name_parallel_ranks_m, ["nation"]);
		rank_chart("decade-rank-f-nation", name_parallel_ranks_f, ["nation"]);
		rank_chart("decade-rank-m-red", name_parallel_ranks_m, ["red", "army"]);
		rank_chart("decade-rank-f-red", name_parallel_ranks_f, ["red"]);
		rank_chart("decade-rank-m-ocp", name_parallel_ranks_m, ["one"]);
		rank_chart("decade-rank-f-ocp", name_parallel_ranks_f, ["one"]);

		// Yu-Ying's visualization
		createAllYYVisuals();
		appendNameCharOptions(given_name_data, char_to_definition_data)
	});

createAllYYVisuals = function () {
	var data = getYYData();
	var interactive_chart_data = data[0];
	var combined_interactive_chart_data = data[1];
	var avg_value = data[2];
	var m_avg_value = data[3];
	var f_avg_value = data[4];
	var line_chart_data = data[5]
	var char_input = data[6]
	createYYVisualization(top50char_data, interactive_chart_data, avg_value);
	createYYCombinedVisualization(top50char_data, m_avg_value, f_avg_value);
	// remove the name ppm chart first so the red rects opacity won't get affected
	d3.selectAll("#character_ppm").selectAll("*").remove();
	createYYCharPpmVis(line_chart_data, char_input)
}

var decade2 = 1950;
var decade3 = 1950;

// Settings
num_of_char = 25;
gender = "m"

update_decade_in_html = () => {
	document.getElementById("output").innerHTML = decade2;
	document.getElementById("decade-yy-output").innerHTML = decade3;
	document.getElementById("num-char-output").innerHTML = num_of_char;
}

document.addEventListener("DOMContentLoaded", evt => {
	update_decade_in_html();

	// Slider for Jeffrey
	decade_select_slider = document.getElementById("decade-selector");

	// Sliders and dropdowns for Yu-Ying
	decade_select_slider_yy = document.getElementById("decade-selector-yy");
	num_char_slider_yy = document.getElementById("num-char-selector");
	gender_dropdown_yy = document.getElementById("gender-selector");
	character_input_yy = document.getElementById("char_input")
	character_select_yy = document.getElementById("char_select")

	decade_select_slider_yy.addEventListener("input", evt => {
		year_select_yy = decade_select_slider_yy.value;
		decade_select_yy = Math.floor(year_select_yy / 10) * 10;
		if (ALL_DATA_LOADED) {
			if (decade_select_yy != decade3) {
				decade3 = decade_select_yy;
				d3.selectAll("#warmth-competence-vis").selectAll("*").remove();
				d3.selectAll("#combined-warmth-competence-vis").selectAll("*").remove();
				createAllYYVisuals();
				update_decade_in_html();
			}
		}
	});

	num_char_slider_yy.addEventListener("input", evt => {
		num_char_select_yy = num_char_slider_yy.value;
		if (ALL_DATA_LOADED) {
			if (num_char_select_yy != num_of_char) {
				num_of_char = num_char_select_yy;
				d3.selectAll("#warmth-competence-vis").selectAll("*").remove();
				d3.selectAll("#combined-warmth-competence-vis").selectAll("*").remove();
				createAllYYVisuals();
				update_decade_in_html();
			}
		}
	});

	gender_dropdown_yy.addEventListener("change", evt => {
		gender_select_yy = gender_dropdown_yy.value;
		if (ALL_DATA_LOADED) {
			if (gender_select_yy != gender) {
				gender = gender_select_yy;
				d3.selectAll("#warmth-competence-vis").selectAll("*").remove();
				d3.selectAll("#combined-warmth-competence-vis").selectAll("*").remove();
				createAllYYVisuals();
				update_decade_in_html();
			}
		}
	});

	decade_select_slider.addEventListener("input", evt => {

		// For Jeffrey's visual
		year_select = decade_select_slider.value;
		decade_select = Math.floor(year_select / 10) * 10;

		if (ALL_DATA_LOADED) {

			if (decade_select != decade2) {
				d3.selectAll("#decade-prevalence-vis").selectAll("*").remove();

				// Create decade prevalance visualization
				decade2 = decade_select;
				update_decade_in_html();
				createVisual(top50char_data, char_to_definition_data, char_override_dict_data);
			}

			if (decade_select_yy != decade3) {
				// Create Yu-Ying's visual updated on new inputs
				createYYVisualization(top50char_data, interactive_chart_data, avg_value);
				createYYCombinedVisualization(top50char_data, m_avg_value, f_avg_value);
			}

			if (num_char_select_yy != num_of_char) {
				// Create Yu-Ying's visual updated on new inputs
				createYYVisualization(top50char_data, interactive_chart_data, avg_value);
				createYYCombinedVisualization(top50char_data, m_avg_value, f_avg_value);
			}

			if (gender_select_yy != gender) {
				// Create Yu-Ying's visual updated on new inputs
				createYYVisualization(top50char_data, interactive_chart_data, avg_value);
				createYYCombinedVisualization(top50char_data, m_avg_value, f_avg_value);
			}
		}
	});

	character_input_yy.addEventListener("input", evt => {
		name_char = character_input_yy.value
		if (ALL_DATA_LOADED) {
			d3.selectAll("#character_ppm").selectAll("*").remove();
			// make char ppm data using input value
			const name_char_ppm_data = makeCharPpmData(name_char, given_name_data, char_to_definition_data)
			createYYCharPpmVis(name_char_ppm_data, name_char)
			// change selected option to char if input char available
			if (given_name_data[name_char]) {
				character_select_yy.value = name_char
			}
		}
	})

	character_select_yy.addEventListener("change", evt => {
		name_char = evt.target.value
		// change input value to selected char
		character_input_yy.value = name_char
		if (ALL_DATA_LOADED) {
			d3.selectAll("#character_ppm").selectAll("*").remove();
			// make char ppm data using input value
			const name_char_ppm_data = makeCharPpmData(name_char, given_name_data, char_to_definition_data)
			createYYCharPpmVis(name_char_ppm_data, name_char)
		}
	})
});


//Create historical rank chart
const theme_colours = d3.scaleOrdinal(d3.schemeCategory10);
rank_chart =  (svgname, data_rank, keyz = null, interactable = false) => {//(data, data_maxrank, keyz, theme_colours, height) => 
	
	let height = 400;
	let width = 700;
	if (!interactable){
		height = 400;
		width = 500;
	}
	const svg = d3.selectAll(`#${svgname}`)
		.attr("viewBox", `0 0 ${width} ${height}`)
		.attr("preserveAspectRatio", "xMinYMin meet")
		.attr("xmlns", "http://www.w3.org/2000/svg")
		.attr("xmlns:xlink", "http://www.w3.org/1999/xlink")
		.attr("xmlns:xhtml", "http://www.w3.org/1999/xhtml")
	
	const margin = ({top: 20, right: 10, bottom: 20, left: 30})
	
	const meaning_dict = new Map();
	const name_keys = ["rank_1950", "rank_1960", "rank_1970", "rank_1980", "rank_1990", "rank_2000"];
  
  
	const line_transp = []
  const line_size = []

  const dispTextDict = new Map([
	['rank_1950', 'pre-1960s'],
	['rank_1960', '1960s'],
	['rank_1970', '1970s'],
	['rank_1980', '1980s'],
	['rank_1990', '1990s'],
	['rank_2000', '2000s'],
	['one', 'Single Character'],
	['family', 'Family'],
	['happy', 'Joy and Happiness'],
	['red', 'Red'],
	['color', 'Colour'],
	['quality', 'Positive Qualities'],
	['strong', 'Strength'],
	['smart', 'Intelligence'],
	['precious', 'Preciousness'],
	['good_life', 'Long or Auspicous Life'],
	['achievement', 'Achievement'],
	['army', 'Military'],
	['moral', 'Morals and Ethics'],
	['nation', 'Nation and Nationhood'],
	['plants', 'Flora'],
	['nature', 'Natural Phenomena'],
	['beauty', 'Beauty'],
  ])
  
  
  let curr_highlighted = "";
  let node_to_delete;

  const intersects = (arr1, arr2) => {
    for(let i = 0; i < arr2.length; i++){
      if(arr1.includes(arr2[i])) return true;
    }
    return false;
  }
  
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
  
      meaning_dict.set(obj.name, {meaning: obj.meaning, theme: obj.theme})
  
    })
  
    return m;
  }

  const line = d3.line()
    .curve(d3["curveNatural"])
    .defined(([key, value]) => (value != null && value <= 100))//&& value <= 100
    .y(([key, value]) => name_x.get(key)(value))
    .x(([key, value]) => {
      return name_y(key) - (value>100 ? name_y.step()/2 : 0)
  })


  const name_x = new Map(Array.from(name_keys, key => [key, d3.scaleLinear([1,100], [margin.top, height - margin.bottom])]))
  const name_y = d3.scalePoint(name_keys, [margin.left, (width - margin.right)/1.5])

  const data_maxrank = name_peak_rank_func(data_rank)



  const nameDisp = svg.append("text")
    .attr("x", (width)/1.5 + 10)
    .attr("y", "35")
    .attr("opacity", "0.0")
    .attr("lang", "zh-CN")
  //const themeDisp = svg.append("text")
    //.attr("x", (width)/1.5 + 10)
    //.attr("y", "75")
    //.attr("opacity", "0.0")
    //.attr("lang", "zh-CN")
  const meaningDispContainer = svg.append("foreignObject")
  	.attr("x", (width)/1.5 + 10)
	.attr("y", "45")
	//.attr("opacity", "1")
	.attr("width", (width)/4 - 10)
	//.attr("width", "20")
	.attr("height", "300")
  const meaningDisp = meaningDispContainer.append("xhtml:text")
  	

  	

  //let focus_theme = keyz;
  let focus_theme = keyz.length > 0 ? keyz : [];

  
  

  //draw lines
  const renderPaths = () => {
    svg.selectAll(".pathsG").remove();
  svg.append("g").attr("class", "pathsG")
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
		theme_colours(themes[0]);

        //filter mode
        if(focus_theme.length > 0){
          return (intersects(themes, focus_theme)) ? theme_colours(themes[0]) : "none";
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
          d3.select(this).transition()
               .duration('50')
               .attr('stroke-opacity', '1')
               .attr('stroke-width', 7.5);
          
          nameDisp.html(`${d.target.__data__.name}`);
          nameDisp.transition()
               .duration(50)
               .style("opacity", 1)

		  /*themeDisp.html(`${d.target.__data__.theme}`)
		  themeDisp.transition()
               .duration(50)
               .style("opacity", 1)
*/
          meaningDisp.html(`${d.target.__data__.meaning}`);
          meaningDisp.transition()
            .duration(50)
            .style("opacity", 1)

          svg.selectAll("rect")
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
          svg.selectAll("rect")
            .filter(function() {
              return d3.select(this).attr("data-name") == d.target.__data__.name; // filter by name
            })
          .attr("width", height/100)
          .attr("stroke-width", 0)
     })
    .append("title")
      .text(d => d.name);

  }
  renderPaths();
      

  //draw axis
  const renderAxis = () => {
    svg.selectAll(".axisG").remove();
    //d3.selectAll(".axisText").remove();
  svg.append("g").attr("class", "axisG")
    .selectAll("g")
    .data(name_keys)
    .join("g")
      .attr("transform", d => `translate(${name_y(d)},0)`)
      .each(function(d) { d3.select(this).call(
        d3.axisLeft(name_x.get(d))
          .ticks(100)
		  .tickSize(1)
          .tickFormat(d2 => {
            let code = String(d2) + d;
            if(data_maxrank.has(code)){
              
              if(focus_theme.length > 0){
                  let themes = meaning_dict.get(data_maxrank.get(code))["theme"].split(';');
                  return (intersects(themes,focus_theme)) ? data_maxrank.get(code) : "";
                }
                else{
                  return data_maxrank.get(code);
              }
              
            }
            else{
              return ""
            }
            
          }));
      })
      .call(g => g.append("text")
        .attr("y", margin.top - 6)
        .attr("x", -6)
        .attr("text-anchor", "start")
        .attr("fill", "currentColor")
        .attr("class", "axisText")
        .text(d => dispTextDict.get(d)))
      .call(g => g.selectAll("text")
        .clone(true).lower()
        .attr("fill", "none")
        .attr("stroke-width", 2)
        .attr("stroke-linejoin", "round")
        .attr("stroke", "white")
        .attr("class", "axisText"))
      .call(g => g.selectAll(".tick>text"))
        /**/
        .on('mouseover', function (d, i) {
          if(name_keys.includes(d.toElement.innerHTML) || d.toElement.innerHTML === "") return;
          //d3.select(this)
          //console.log("mousein " + d.toElement.innerHTML)
          curr_highlighted = d.toElement.innerHTML;
                    
          
                  svg.selectAll(".tick>text")
                      .nodes()
                      .filter(t => t.innerHTML == d.toElement.innerHTML)
                                .forEach(a => {
                                    a.parentNode.parentNode.appendChild(a.parentNode);
                                })
                        
          
                    nameDisp.html(`${d.toElement.innerHTML}`);
                    nameDisp.transition()
                         .duration(50)
                         .style("opacity", 1)
          
					meaningDisp.text(`${meaning_dict.get(d.toElement.innerHTML).meaning}`);
                    meaningDisp.transition()
                        .duration(50)
                        .style("opacity", 1)
          
                    svg.selectAll("path")
                      .filter(function() {
                        return d3.select(this).attr("data-name") == d.toElement.innerHTML; // filter by name
                      }).transition()
                         .duration('50')
                         .attr('stroke-opacity', '1')
                         .attr('stroke-width', 7.5);

                  svg.selectAll("rect")
                      .filter(function() {
                        return d3.select(this).attr("data-name") == d.toElement.innerHTML; // filter by name
                      }).transition()
                         .duration('50')
                         .attr("stroke", "white")
                          .attr("stroke-width", 2)
               })
              

        .on('mouseout', function (d, i) {
                  
                    svg.selectAll("path")
                      .filter(function() {
                        return d3.select(this).attr("data-name") == curr_highlighted; // filter by name
                      }).transition()
                         .duration('50')
                         .attr('stroke-opacity', '0.1')
                         .attr('stroke-width', 4.5);

                    svg.selectAll("rect")
                      .filter(function() {
                        return d3.select(this).attr("data-name") == curr_highlighted; // filter by name
                      }).transition()
                         .duration('50')
                         .attr("stroke", "white")
                          .attr("stroke-width", 0)

               }) 
  } 
    
  renderAxis();

  
  
  
  //draw points
  const renderPoints = () => {
    
  svg.selectAll(".cubePointG").remove();
  svg.append("g").attr("class", "cubePointG")
    .selectAll(".cubePoint rect")
    .data(data_rank)
    .join((enter) => {
        let g = enter;
        
        name_keys.forEach(year => {
          g.append('rect')
              .attr("width", height/100)
              .attr("height", height/100)
              .attr("x", d => name_y(year) - height/200)
              .attr("y", d => name_x.get(year)(d[year]) - height/200)
              .attr("class", "cubePoint")
              .attr("fill", d => {
                let themes = d["theme"].split(';');
                //return (themes[0] === focus_theme) ? theme_colours(themes[0]) : focus_theme != null ? "none": theme_colours(themes[0]);

                //filter mode
                if(focus_theme.length > 0){
                  return (intersects(themes, focus_theme)) ? theme_colours(themes[0]) : "none";
                }
                else{
                  return theme_colours(themes[0])
                }
              })
              .attr("data-name", d => d.name)
              
              .on('mouseover', function (d, i) {
                    nameDisp.html(`${d.target.__data__.name}`);
                    nameDisp.transition()
                         .duration(50)
                         .style("opacity", 1)

                    meaningDisp.text(`${meaning_dict.get(d.target.__data__.name).meaning}`);
                    meaningDisp.transition()
                         .duration(50)
                         .style("opacity", 1)
          
                    svg.selectAll("path")
                      .filter(function() {
                        return d3.select(this).attr("data-name") == d.target.__data__.name; // filter by name
                      }).transition()
                         .duration('50')
                         .attr('stroke-opacity', '1')
                         .attr('stroke-width', 7.5);

                  svg.selectAll("rect")
                      .filter(function() {
                        return d3.select(this).attr("data-name") == d.target.__data__.name; // filter by name
                      }).transition()
                         .duration('50')
                         .attr("stroke", "white")
                          .attr("stroke-width", 2)
               })
               .on('mouseout', function (d, i) {
                      svg.selectAll("rect")
                      .filter(function() {
                        return d3.select(this).attr("data-name") == d.target.__data__.name; // filter by name
                      }).transition()
                         .duration('50')
                         .attr("stroke", "white")
                          .attr("stroke-width", 0)
                      
                 
                      svg.selectAll("path")
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

  renderPoints();
  
  //draw legend
  
  let extendedThemes = interactable ? theme_colours.domain() : focus_theme;
  if(interactable) extendedThemes.push("one");

  const renderLegend = () => {
    svg.selectAll(".labelPointG").remove();
    const legend = svg.append("g").attr("class", "labelPointG")
      .selectAll(".labelPoint g")
      .data(extendedThemes).enter().append("g")
      //.attr("transform", (d, i) => { return `translate(${parseInt((width)/1.5)} ${75 + 20*i})`});
      .attr("transform", (d, i) => `translate(${(width)/1.5} ${height - 25 - 17*i})`)
      .attr("class", "labelPoint")
    
    legend.append("rect")
        .attr("width", height/75)
        .attr("height", height/75)
        .attr("x", (d,i) => 10)
        .attr("y", (d,i) =>  0)
        .attr("class", "labelBox")
        .attr("fill", d => {
          if(focus_theme.includes(d)){
            return (d === "one") ? "black" : theme_colours(d)
          }
          else{
            return "white";
          }
          
        })
        .attr("stroke", d => {
            return (d === "one") ? "black" : theme_colours(d)
        })
        .attr("stroke-width", 2)
        .on("click", (d,i) => {
			if(interactable){
				const index = focus_theme.indexOf(d.target.__data__);
				if (index > -1) {
					focus_theme.splice(index, 1); // 2nd parameter means remove one item only
				}
				else{
					focus_theme.push(d.target.__data__);
				}

				renderPaths();
				renderAxis();
				renderPoints();
				renderLegend();
			}
          
          
        })
    legend.append("text")
        .attr("x", (d,i) => 30)
        .attr("y", (d,i) =>  3 )
        .attr("dy", "0.25em")
		.attr("font-size", "0.7em")
        .attr("fill", "black")
        .text(d => dispTextDict.get(d))
		.on("click", (d,i) => {
			if(interactable){
				const index = focus_theme.indexOf(d.target.__data__);
				if (index > -1) {
					focus_theme.splice(index, 1); // 2nd parameter means remove one item only
				}
				else{
					focus_theme.push(d.target.__data__);
				}

				renderPaths();
				renderAxis();
				renderPoints();
				renderLegend();
			}
		})
  }

  renderLegend();
  
  
	//return svg.node();
  }


// Create the decades-prevalence visualization
createVisual = function (data, char_to_definition, char_override_dict) {

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
	const num_width = 10;
	const num_height = 5;

	// Display settings
	const windowHeight = 400;
	const windowWidth = 600;
	const MULT = 0.96;
	const squareHeight = windowHeight / num_height * MULT;
	const squareWidth = windowWidth / num_width * MULT;

	// const svg = d3.create("svg").attr('viewBox', [0, 0, windowWidth, windowHeight]);
	const svg = d3.selectAll("#decade-prevalence-vis").attr('viewBox', [0, 0, windowWidth, windowHeight]);

	let dict = {};

	let x = d3.scaleLinear().domain([0, num_width]).range([0, windowWidth]);
	let y = d3.scaleLinear().domain([0, num_height]).range([0, windowHeight]);

	// Text settings
	let font_size = "1.50rem";

	const x_text_offset = 15; // 15;
	const y_text_offset = 44; // 44;

	const x_def_offset = -2;
	const y_def_offset = 20;

	// 1950 characters
	let chars1950 = post[0];

	function get_male_to_total_ratio(char, ind) {
		return post_ratios[ind][char];
	}

	let k = 0;
	for (let row = 0; row < num_height; row++) {
		for (let col = 0; col < num_width; col++) {
			let ind = (-1950 + decade2) / 10;
			let chars = post[ind];
			let char_ = Array.from(chars)[k];

			let g = svg.append("g");
			let rect = g
				.append("rect")
				.attr("x", x(col))
				.attr("y", y(row))
				.attr("width", squareWidth)
				.attr("height", squareHeight)
				.attr("fill", "#ff69b4");

			let ratio = get_male_to_total_ratio(char_, ind);

			let rect2 = null;
			if (ratio != null) {
				rect2 = g
					.append("rect")
					.attr("x", x(col))
					.attr("y", y(row))
					.attr("width", squareWidth)
					.attr("height", squareHeight * ratio)
					.attr("fill", "#72bcd4");
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

			let definition_size = "0.50rem";
			if (defn.length >= 15) { definition_size = "0.40rem" };
			if (defn.length <= 5) { definition_size = "0.75rem" };

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

makeChartData = function makeChartData(data, charData, char_to_definition, num, gender, year) {
	let total = 0;

	let top_char_array = data.slice(0, num).map(obj => {
		total += obj[`n.${gender}.${year}`];
		return {
			rank: obj["top50"],
			char: obj[`char.${gender}.${year}`],
			num: obj[`n.${gender}.${year}`]
		}
	})

	let topCharProperties = []
	for (const c of top_char_array) {
		if (charData.hasOwnProperty(c["char"])) {
			let currentChar = charData[c["char"]]
			topCharProperties.push({
				char: c["char"],
				rank: c["rank"],
				weight: c["num"] / total,
				warmth: currentChar["name.warmth"],
				competence: currentChar["name.competence"],
				gender: gender,
				pinyin: currentChar["pinyin"],
				translation: char_to_definition[c["char"]] ? char_to_definition[c["char"]] : "Not Available"
			})
		}
	}

	return topCharProperties;
}

calculateAvg = function calculateAvg(gender, year) {
	let char_data = makeChartData(top50char_data, given_name_data, char_to_definition_data, 50, gender, year)
	let avg_warmth = char_data.reduce((total, next) => total + next.warmth, 0) / 50;
	let weighted_avg_warmth = char_data.reduce((total, next) => total + next.weight * next.warmth, 0);
	let avg_competence = char_data.reduce((total, next) => total + next.competence, 0) / 50;
	let weighted_avg_competence = char_data.reduce((total, next) => total + next.weight * next.competence, 0);
	return { avg_warmth, weighted_avg_warmth, avg_competence, weighted_avg_competence }
}

makeCharPpmData = function makeCharPpmData(name_char, charData, char_to_definition) {
	const translation = char_to_definition[name_char] ? char_to_definition[name_char] : "Not Available"
	const characher = charData[name_char]
	if (characher) {
		return {
			...charData[name_char],
			n_1960s: characher["n.1960_1969"],
			n_1970s: characher["n.1970_1979"],
			n_1980s: characher["n.1980_1989"],
			n_1990s: characher["n.1990_1999"],
			n_2000s: characher["n.2000_2008"],
			years_of_n: [{ year: 1960, value: characher["n.1960_1969"] }, { year: 1970, value: characher["n.1970_1979"] }, { year: 1980, value: characher["n.1980_1989"] }, { year: 1990, value: characher["n.1990_1999"] }, { year: 2000, value: characher["n.2000_2008"] }],
			ppm_1960s: characher["ppm.1960_1969"],
			ppm_1970s: characher["ppm.1970_1979"],
			ppm_1980s: characher["ppm.1980_1989"],
			ppm_1990s: characher["ppm.1990_1999"],
			ppm_2000s: characher["ppm.2000_2008"],
			years_of_ppm: [{ year: 1960, value: characher["ppm.1960_1969"] }, { year: 1970, value: characher["ppm.1970_1979"] }, { year: 1980, value: characher["ppm.1980_1989"] }, { year: 1990, value: characher["ppm.1990_1999"] }, { year: 2000, value: characher["ppm.2000_2008"] }],
			translation
		}
	} else {
		return undefined
	}
}

appendNameCharOptions = function appendNameCharOptions(given_name_data, char_to_definition) {
	const select_element = document.getElementById("char_select")
	const chars = Object.keys(given_name_data)
	let emptyOption = document.createElement("option")
	emptyOption.text = "select a char"
	emptyOption.value = undefined
	select_element.appendChild(emptyOption)
	chars.forEach(char => {
		let option = document.createElement("option")
		const translation = char_to_definition[char] ? char_to_definition[char] : "Translation Not Available"
		option.text = `${char} - ${translation}`
		option.value = char
		select_element.appendChild(option)
	})
}

getYYData = function () {
	interactive_chart_data = makeChartData(top50char_data, given_name_data, char_to_definition_data, num_of_char, gender, decade3);
	top_f = makeChartData(top50char_data, given_name_data, char_to_definition_data, num_of_char, 'f', decade3);
	top_m = makeChartData(top50char_data, given_name_data, char_to_definition_data, num_of_char, 'm', decade3);
	combined_interactive_chart_data = top_f.concat(top_m);

	
	avg_value = calculateAvg(gender, decade3);
	f_avg_value = calculateAvg('f', decade3);
	m_avg_value = calculateAvg('m', decade3);

	// get name char line chart data
	var char_input = document.getElementById("char_input").value ? document.getElementById("char_input").value : "英"
	line_chart_data = makeCharPpmData(char_input, given_name_data, char_to_definition_data)

	return [interactive_chart_data, combined_interactive_chart_data, avg_value, m_avg_value, f_avg_value, line_chart_data, char_input];
}


createYYVisualization = function (data, interactive_chart_data, avg_value) {
	var margin = { top: 30, right: 30, bottom: 60, left: 60 };
	var width = 1100 - margin.left - margin.right;
	var height = 900 - margin.top - margin.bottom;
	const svg = d3.selectAll("#warmth-competence-vis").attr("viewBox", [0, 0, width, height])
	//const svg = d3.selectAll("#warmth-competence-vis")
		//.attr("width", width + margin.left + margin.right)
		//.attr("height", height + margin.top + margin.bottom)
		.style('border', '1px dotted #999');

	// Add X axis label
	svg.append("text")
		.attr("text-anchor", "end")
		.attr("x", width)
		.attr("y", height - margin.bottom/3.5)
		.text("Warmth")

	// Add Y axis label
	svg.append("text")
		.attr("text-anchor", "middle")
		.attr("x", margin.left)
		.attr("y", margin.top / 2)
		.text("Competence")

	// Add X axis
	var xScale = d3.scaleLinear()
		.domain([1, 5])
		.range([0, width]);

	// Add Y axis
	var yScale = d3.scaleLinear()
		.domain([5, 1])
		.range([height, 0]);

	// Margins for X, Y Axis
	let xMargin = xScale.copy().range([margin.left, width - margin.right])
	let yMargin = yScale.copy().range([margin.top, height - margin.bottom])

	// Add axis notes
	svg.append("text")
		.attr("text-anchor", "middle")
		.attr("x", xMargin(3))
		.attr("y", height-margin.bottom/2)
		.attr("font-size", 12)
		.text("medium likelihood")
	svg.append("text")
		.attr("text-anchor", "middle")
		.attr("x", xMargin(1))
		.attr("y", height-margin.bottom/2)
		.attr("font-size", 12)
		.text("strongly unlikely to have")
	svg.append("text")
		.attr("text-anchor", "middle")
		.attr("x", xMargin(5))
		.attr("y", height-margin.bottom/2)
		.attr("font-size", 12)
		.text("strongly likely to have")

	// Add avg line of competence 
	svg.append("line")
		.attr('x1', xMargin(1))
		.attr('x2', xMargin(5))
		.attr('y1', yMargin(avg_value.weighted_avg_competence))
		.attr('y2', yMargin(avg_value.weighted_avg_competence))
		.attr("stroke-width", 2)
		.attr("stroke", "blue")
		.attr("stroke-dasharray", "10,10")
	// Add avg line of competence 
	svg.append("line")
		.attr('x1', xMargin(avg_value.weighted_avg_warmth))
		.attr('x2', xMargin(avg_value.weighted_avg_warmth))
		.attr('y1', yMargin(1))
		.attr('y2', yMargin(5))
		.attr("stroke-width", 2)
		.attr("stroke", "blue")
		.attr("stroke-dasharray", "10,10")

	// Append X axis
	svg.append("g")
		.attr("transform", `translate(0, ${height - margin.bottom})`)
		.call(d3.axisBottom(xMargin));
	// Append Y axis
	svg.append("g")
		.attr('transform', `translate(${margin.left}, 0)`)
		.call(d3.axisLeft(yMargin))

	// Append instruction
	var instruction = svg.append("g")
		.attr("id", "instruction")
		.attr("transform", (d, i) => `translate(100,100)`)

	instruction.append("text")
		.style("fill", "black")
		.style("opacity", "1")
		.text("Hover on the dots")
		.attr("x", 10)
		.attr("y", 25);

	// mousemove event function
	var showTooltip = function (evt) {
		const data = d3.select(this).datum()

		var xpos = d3.select(this).attr('x') || d3.select(this).attr('cx');
		var ypos = d3.select(this).attr('y') || d3.select(this).attr('cy');

		xpos = Number(xpos) + 25;

		// Create the tooltip label as an SVG group `tgrp` with a text and a rect inside
		var tgrp = svg.append("g")
			.attr("id", "tooltip")
			.attr("transform", (d, i) => `translate(100,100)`);
		//.attr("transform", (d, i) => `translate(${xpos},${ypos})`)

		// tgrp.append("rect")
		//     .attr("width", "400px")
		//     .attr("height", "180px")
		//     .style("fill", "#d9d9d9")
		//     .style("opacity", "0.5")
		tgrp.append("text")
			.style("fill", "black")
			.style("opacity", "1")
			.append("tspan")
			.text(`Char: ${data.char}`)
			.attr("x", 0)
			.attr("dx", 10)
			.attr("dy", 25)
			.append("tspan")
			.text(`Pinyin: ${data.pinyin}`)
			.attr("x", 0)
			.attr("dx", 10)
			.attr("dy", 25)
			.append("tspan")
			.text(`Gender: ${data.gender === 'f' ? "Female" : "Male"}`)
			.attr("x", 0)
			.attr("dx", 10)
			.attr("dy", 25)
			.append("tspan")
			.text(`Rank: ${data.rank}`)
			.attr("x", 0)
			.attr("dx", 10)
			.attr("dy", 25)
			.append("tspan")
			.text(`Warmth: ${data.warmth}`)
			.attr("x", 0)
			.attr("dx", 10)
			.attr("dy", 25)
			.append("tspan")
			.text(`Competence: ${data.competence}`)
			.attr("x", 0)
			.attr("dx", 10)
			.attr("dy", 25)
			.append("tspan")
			.text(`Translation: ${data.translation}`)
			.attr("x", 0)
			.attr("dx", 10)
			.attr("dy", 25)

		// hide instruction
		d3.select("#instruction").style("visibility", "hidden")
	}

	// Add dots
	var gdots = svg.selectAll("g.dot")
		.data(interactive_chart_data)
		.enter().append('g')

	gdots.append("circle")
		.attr("class", "dot")
		.attr("r", 18)
		.attr("cx", function (d) { return xMargin(d.warmth); })
		.attr("cy", function (d) { return yMargin(d.competence); })
		.style("fill", "#69b3a2")
		.style("fill-opacity", .4)
		.on("mouseover", showTooltip)
		.on("mouseout", function (d) {
			d3.select("#tooltip").remove()
			d3.select("#instruction").style("visibility", "visible")
		});

	gdots.append("text")
		.text(function (d) { return d.char })
		.attr("x", function (d) { return xMargin(d.warmth); })
		.attr("y", function (d) { return yMargin(d.competence); })
		.style("text-anchor", "middle")
		.style("alignment-baseline", "middle")
		.on("mouseover", showTooltip)
		.on("mouseout", function (d) {
			d3.select("#tooltip").remove()
			d3.select("#instruction").style("visibility", "visible")
		});

	console.log("Finished with visualization")
};

createYYCombinedVisualization = function (data, m_avg_value, f_avg_value) {
	var margin = { top: 30, right: 30, bottom: 60, left: 60 };
	var width = 1100 - margin.left - margin.right;
	var height = 900 - margin.top - margin.bottom;
	const svg = d3.selectAll("#combined-warmth-competence-vis").attr("viewBox", [0, 0, width, height])
	//const svg = d3.selectAll("#combined-warmth-competence-vis")
		//.attr("width", width + margin.left + margin.right)
		//.attr("height", height + margin.top + margin.bottom)
		.style('border', '1px dotted #999')

	// Add X axis label
	svg.append("text")
		.attr("text-anchor", "end")
		.attr("x", width)
		.attr("y", height-margin.bottom/3.5)
		.text("Warmth")
	// Add Y axis label
	svg.append("text")
		.attr("text-anchor", "middle")
		.attr("x", margin.left)
		.attr("y", margin.top / 2)
		.text("Competence")

	// Add X axis
	var xScale = d3.scaleLinear()
		.domain([1, 5])
		.range([0, width]);

	// Add Y axis
	var yScale = d3.scaleLinear()
		.domain([5, 1])
		.range([height, 0]);

	// Margins for X, Y Axis
	let xMargin = xScale.copy().range([margin.left, width - margin.right])
	let yMargin = yScale.copy().range([margin.top, height - margin.bottom])

	// Add axis notes
	svg.append("text")
		.attr("text-anchor", "middle")
		.attr("x", xMargin(3))
		.attr("y", height-margin.bottom/2)
		.attr("font-size", 12)
		.text("medium likelihood")
	svg.append("text")
		.attr("text-anchor", "middle")
		.attr("x", xMargin(1))
		.attr("y", height-margin.bottom/2)
		.attr("font-size", 12)
		.text("strongly unlikely to have")
	svg.append("text")
		.attr("text-anchor", "middle")
		.attr("x", xMargin(5))
		.attr("y", height-margin.bottom/2)
		.attr("font-size", 12)
		.text("strongly likely to have")

	// Add Male avg line of competence 
	svg.append("line")
		.attr('x1', xMargin(1))
		.attr('x2', xMargin(5))
		.attr('y1', yMargin(m_avg_value.weighted_avg_competence))
		.attr('y2', yMargin(m_avg_value.weighted_avg_competence))
		.attr("stroke-width", 2)
		.attr("stroke", "lightblue")
		.attr("stroke-dasharray", "15,15")
	// Add Male avg line of warmth 
	svg.append("line")
		.attr('x1', xMargin(m_avg_value.weighted_avg_warmth))
		.attr('x2', xMargin(m_avg_value.weighted_avg_warmth))
		.attr('y1', yMargin(1))
		.attr('y2', yMargin(5))
		.attr("stroke-width", 2)
		.attr("stroke", "lightblue")
		.attr("stroke-dasharray", "15,15")

	// Add Female avg line of competence 
	svg.append("line")
		.attr('x1', xMargin(1))
		.attr('x2', xMargin(5))
		.attr('y1', yMargin(f_avg_value.weighted_avg_competence))
		.attr('y2', yMargin(f_avg_value.weighted_avg_competence))
		.attr("stroke-width", 2)
		.attr("stroke", "pink")
		.attr("stroke-dasharray", "2,2")
	// Add Female avg line of warmth 
	svg.append("line")
		.attr('x1', xMargin(f_avg_value.weighted_avg_warmth))
		.attr('x2', xMargin(f_avg_value.weighted_avg_warmth))
		.attr('y1', yMargin(1))
		.attr('y2', yMargin(5))
		.attr("stroke-width", 2)
		.attr("stroke", "pink")
		.attr("stroke-dasharray", "2,2")

	// Append X axis
	svg.append("g")
		.attr("transform", `translate(0, ${height - margin.bottom})`)
		.call(d3.axisBottom(xMargin));
	// Append Y axis
	svg.append("g")
		.attr('transform', `translate(${margin.left}, 0)`)
		.call(d3.axisLeft(yMargin));

	// Append instruction
	var instruction = svg.append("g")
		.attr("id", "instruction2")
		.attr("transform", (d, i) => `translate(100,100)`)

	instruction.append("text")
		.style("fill", "black")
		.style("opacity", "1")
		.text("Hover on the dots")
		.attr("x", 10)
		.attr("y", 25)

	// mousemove event function
	var showTooltip = function (evt) {
		// hide instruction
		d3.select("#instruction2").style("visibility", "hidden")

		const data = d3.select(this).datum()

		var xpos = d3.select(this).attr('x') || d3.select(this).attr('cx')
		var ypos = d3.select(this).attr('y') || d3.select(this).attr('cy')
		// Create the tooltip label as an SVG group `tgrp` with a text and a rect inside
		var tgrp = svg.append("g")
			.attr("id", "tooltip")
			.attr("transform", (d, i) => `translate(100,100)`)
		//.attr("transform", (d, i) => `translate(${xpos},${ypos})`)

		tgrp.append("text")
			.style("fill", "black")
			.style("opacity", "1")
			.append("tspan")
			.text(`Char: ${data.char}`)
			.attr("x", 0)
			.attr("dx", 10)
			.attr("dy", 25)
			.append("tspan")
			.text(`Pinyin: ${data.pinyin}`)
			.attr("x", 0)
			.attr("dx", 10)
			.attr("dy", 25)
			.append("tspan")
			.text(`Gender: ${data.gender === 'f' ? "Female" : "Male"}`)
			.attr("x", 0)
			.attr("dx", 10)
			.attr("dy", 25)
			.append("tspan")
			.text(`Rank: ${data.rank}`)
			.attr("x", 0)
			.attr("dx", 10)
			.attr("dy", 25)
			.append("tspan")
			.text(`Warmth: ${data.warmth}`)
			.attr("x", 0)
			.attr("dx", 10)
			.attr("dy", 25)
			.append("tspan")
			.text(`Competence: ${data.competence}`)
			.attr("x", 0)
			.attr("dx", 10)
			.attr("dy", 25)
			.append("tspan")
			.text(`Translation: ${data.translation}`)
			.attr("x", 0)
			.attr("dx", 10)
			.attr("dy", 25)
	}

	// Add dots
	var gdots = svg.selectAll("g.dot")
		.data(combined_interactive_chart_data)
		.enter().append('g')

	// append circle for female
	gdots.append("circle")
		.filter(d => d.gender === 'f')
		.attr("class", "dot")
		.attr("r", 18)
		.attr("cx", function (d) { return xMargin(d.warmth); })
		.attr("cy", function (d) { return yMargin(d.competence); })
		.style("fill", (d) => d.gender === "f" ? "pink" : "lightblue")
		.style("fill-opacity", .4)
		.on("mouseover", showTooltip)
		.on("mouseout", function (d) {
			d3.select("#tooltip").remove()
			d3.select("#instruction2").style("visibility", "visible")
		});

	// append rect for male
	const rectWidth = 30
	gdots.append("rect")
		.filter(d => d.gender === 'm')
		.attr("x", d => { return xMargin(d.warmth) - rectWidth / 2 })
		.attr("y", d => { return yMargin(d.competence) - rectWidth / 2 })
		.attr("width", 30)
		.attr("height", 30)
		.style("fill", (d) => d.gender === "f" ? "pink" : "lightblue")
		.style("fill-opacity", .4)
		.on("mouseover", showTooltip)
		.on("mouseout", function (d) {
			d3.select("#tooltip").remove()
			d3.select("#instruction2").style("visibility", "visible")
		});

	gdots.append("text")
		.text(function (d) { return d.char })
		.attr("x", function (d) { return xMargin(d.warmth); })
		.attr("y", function (d) { return yMargin(d.competence); })
		.style("text-anchor", "middle")
		.style("alignment-baseline", "middle")
		.on("mouseover", showTooltip)
		.on("mouseout", function (d) {
			d3.select("#tooltip").remove()
			d3.select("#instruction2").style("visibility", "visible")
		});
};

createYYCharPpmVis = function (line_chart_data, name_char) {
	var margin = { top: 30, right: 30, bottom: 60, left: 60 };
	var width = 1100 - margin.left - margin.right;
	var height = 900 - margin.top - margin.bottom;
	const svg = d3.selectAll("#character_ppm").attr("viewBox", [0, 0, width, height])
		.style('border', '1px dotted #999')

	if (!line_chart_data) {
		svg.append("text").text("No data available, try another character:)").attr("x", width / 2)
			.attr("y", height / 2)
		return //svg.node();
	}

	// Add X axis label
	svg.append("text")
		.attr("text-anchor", "end")
		.attr("x", width)
		.attr("y", height + margin.bottom / 2)
		.text("Years")
	// Add Y axis label
	svg.append("text")
		.attr("text-anchor", "middle")
		.attr("x", margin.left)
		.attr("y", margin.top / 2)
		.text("ppm")
	// Add X axis
	const x_axis_years = [1960, 1970, 1980, 1990, 2000]
	const custom_x_axis_ticks = { 1960: "1960s", 1970: "1970s", 1980: "1980s", 1990: "1990s", 2000: "2000-2008" }
	//const x_axis_years = ["1960-1969", "1970-1979", "1980-1989", "1990-1999", "2000-2008"]
	var xScale = d3.scalePoint()
		.domain(x_axis_years)
		.rangeRound([0, width])
		.padding(0.5)
	const y_axis_values = line_chart_data["years_of_ppm"].map(obj => obj.value)
	// Add Y axis
	var yScale = d3.scaleLinear()
		.domain([Math.max(...y_axis_values), 0])
		.range([height, 0]);

	// Margins for X, Y Axis
	let xMargin = xScale.copy().range([margin.left, width - margin.right])
	let yMargin = yScale.copy().range([margin.top, height - margin.bottom])

	// x scale for historical events
	let eventXScale = d3.scaleLinear()
		.domain([1960, 2000])
		.range([xMargin(1960), xMargin(2000)])
	//console.log('event scale', xScale(1960), eventXScale(1960))
	let eventXMargin = eventXScale.copy().range([margin.left, width - margin.right])
	// add great leap
	svg.append("g")
		.append("rect")
		.attr("x", eventXScale(1958))
		.attr("y", margin.top)
		.attr("width", eventXMargin(1962) - eventXMargin(1958))
		.attr("height", height - margin.bottom - margin.top)
		.attr("fill", "#ffc4da")
		.attr("opacity", 0.5)
	// add great leap year and text
	svg.append("g")
		.attr("transform", `translate(${eventXMargin(1964.5)}, ${height / 2})`)
		.append("text")
		.attr("text-anchor", "middle")
		.text("1958-1962")
		.append("tspan")
		.text("The Great Leap")
		.attr("x", 0)
		.attr("dx", 0)
		.attr("dy", 20)
	// add cultural revolution rect
	svg.append("g")
		.append("rect")
		.attr("x", eventXScale(1966))
		.attr("y", margin.top)
		.attr("width", eventXMargin(1976) - eventXMargin(1966))
		.attr("height", height - margin.bottom - margin.top)
		.attr("fill", "#ffc4da")
		.attr("opacity", 0.5)
	// add cultural revolution year and text
	svg.append("g")
		.attr("transform", `translate(${eventXMargin(1973)}, ${height / 2})`)
		.append("text")
		.attr("text-anchor", "middle")
		.text("1966-1976")
		.append("tspan")
		.text("Cultural Revolution")
		.attr("x", 0)
		.attr("dx", 0)
		.attr("dy", 20)
	// add one-child policy rect
	svg.append("g")
		.append("rect")
		.attr("x", eventXMargin(1980))
		.attr("y", margin.top)
		.attr("width", eventXMargin(2000) - eventXMargin(1980))
		.attr("height", height - margin.bottom - margin.top)
		.attr("fill", "#ffc4da")
		.attr("opacity", 0.5)
	// add onc child policy year and text
	svg.append("g")
		.attr("transform", `translate(${eventXMargin(1990)}, ${height / 2})`)
		.append("text")
		.attr("text-anchor", "middle")
		.text("1980-2015")
		// .attr("x", eventXScale(1958))
		// .attr("y", height/2)
		.append("tspan")
		.text("One Child Policy")
		.attr("x", 0)
		.attr("dx", 0)
		.attr("dy", 20)
	// Append X axis
	svg.append("g")
		.attr("transform", `translate(0, ${height - margin.bottom})`)
		.call(d3.axisBottom(xMargin).tickFormat(d => custom_x_axis_ticks[d]));
	// Append Y axis
	svg.append("g")
		.attr('transform', `translate(${margin.left}, 0)`)
		.call(d3.axisLeft(yMargin))

	// Add the line
	svg.append("path")
		.datum(line_chart_data.years_of_ppm)
		.attr("fill", "none")
		.attr("stroke", "#69b3a2")
		.attr("stroke-width", 3)
		.attr("d", d3.line()
			.x((d, index) => xMargin(x_axis_years[index]))
			.y((d, index) => yMargin(d.value))
		)
	// Add the dots
	svg
		.append("g")
		.selectAll("dot")
		.data(line_chart_data.years_of_ppm)
		.enter()
		.append("circle")
		.attr("id", "dots")
		.attr("cx", (d, index) => xMargin(x_axis_years[index]))
		.attr("cy", (d, index) => yMargin(d.value))
		.attr("r", 10)
		.attr("fill", "#69b3a2")
		.attr("stroke", "#b0e8db")
		.attr("stroke-width", 0)
		.on("mouseover", function () {
			const data = d3.select(this).datum()
			let xpos = d3.select(this).attr('x') || d3.select(this).attr('cx')
			let ypos = d3.select(this).attr('y') || d3.select(this).attr('cy')
			xpos = Number(xpos) + 20
			let tooltip = d3.select("#character_ppm")
				.append("g")
				.attr("id", "tooltip")
				.attr("transform", `translate(${xpos}, ${ypos})`)
				.append("text")
				.text(`Value: ${data.value}`)
				.append("tspan")
				.text(`Year: ${custom_x_axis_ticks[data.year]}`)
				.attr("x", 0)
				.attr("dx", 0)
				.attr("dy", 25)
			console.log(d3.select(this).attr("stroke"))
			d3.select(this).attr("stroke-width", 3)
		})
		.on("mouseout", function () {
			d3.select("#tooltip").remove()
			d3.select(this).attr("stroke-width", 0)
		})

	// add charachter data
	svg.append("g")
		.attr("transform", `translate(${width}, ${margin.top} )`)
		.append("text")
		.attr("text-anchor", "end")
		.text(`${name_char}`)
		.append("tspan")
		.text(line_chart_data.pinyin)
		.attr("x", 0)
		.attr("dx", 0)
		.attr("dy", 20)
		.append("tspan")
		.text(line_chart_data.translation)
		.attr("x", 0)
		.attr("dx", 0)
		.attr("dy", 20)
	//return svg.node();
}