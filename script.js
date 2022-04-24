BASE_URL = "https://monicalin22.github.io/chinese-names/"

ALL_URLS = [
	"data/top50char.json",
	"data/char_to_definition.json",
	"data/char_override_dict.json",
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
		given_name_data = json[3];

		ALL_DATA_LOADED = true;
		createVisual(top50char_data, char_to_definition_data, char_override_dict_data);


		var data = getYYData();
		var interactive_chart_data = data[0];
		var combined_interactive_chart_data = data[1];
		var avg_value = data[2];
		createYYVisualization(interactive_chart_data, avg_value);
	});


var decade2 = 1950;

update_decade_in_html = () => {
	document.getElementById("output").innerHTML = decade2;
}

document.addEventListener("DOMContentLoaded", evt => {
	update_decade_in_html();

	decade_select_slider = document.getElementById("decade-selector");

	decade_select_slider.addEventListener("input", evt => {
		year_select = decade_select_slider.value;
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

makeChartData = function makeChartData(data, num, gender, year) {
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
	let char_data = makeChartData(top50char_data, 50, gender, year)
	let avg_warmth = char_data.reduce((total, next) => total + next.warmth, 0) / 50;
	let weighted_avg_warmth = char_data.reduce((total, next) => total + next.weight * next.warmth, 0);
	let avg_competence = char_data.reduce((total, next) => total + next.competence, 0) / 50;
	let weighted_avg_competence = char_data.reduce((total, next) => total + next.weight * next.competence, 0);
	return { avg_warmth, weighted_avg_warmth, avg_competence, weighted_avg_competence }
}

// Settings
num_of_char = 26;
year = 1980;
gender = "m"

getYYData = function () {
	interactive_chart_data = makeChartData(top50char_data, num_of_char, gender, year);
	top_f = makeChartData(top50char_data, num_of_char, 'f', year);
	top_m = makeChartData(top50char_data, num_of_char, 'm', year);

	combined_interactive_chart_data = top_f.concat(top_m);

	avg_value = calculateAvg(gender, year);
	f_avg_value = calculateAvg('f', year);
	m_avg_value = calculateAvg('m', year);

	return [interactive_chart_data, combined_interactive_chart_data, avg_value];
}


createYYVisualization = function (interactive_chart_data, avg_value) {
	var margin = { top: 30, right: 30, bottom: 30, left: 60 };
	var width = 1100 - margin.left - margin.right;
	var height = 900 - margin.top - margin.bottom;

	const svg = d3.selectAll("#warmth-competence-vis")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom)
		.style('border', '1px dotted #999')

	// Add X axis label
	svg.append("text")
		.attr("text-anchor", "end")
		.attr("x", width)
		.attr("y", height + margin.bottom)
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
		//.domain([0, top10CharFemale1970Properties.length])
		//.domain(top10CharFemale1970Properties.map(char => char["char"]))
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
		.attr("y", height + 5)
		.attr("font-size", 12)
		.text("medium likelihood")
	svg.append("text")
		.attr("text-anchor", "middle")
		.attr("x", xMargin(1))
		.attr("y", height + 5)
		.attr("font-size", 12)
		.text("strongly unlikely to have")
	svg.append("text")
		.attr("text-anchor", "middle")
		.attr("x", xMargin(5))
		.attr("y", height + 5)
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