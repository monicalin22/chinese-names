// Helpers to read in JSON file from web and retrieve data
function readTextFile(file, callback) {
    var rawFile = new XMLHttpRequest();
    rawFile.overrideMimeType("application/json");
    rawFile.open("GET", file, true);
    rawFile.onreadystatechange = function() {
        if (rawFile.readyState === 4 && rawFile.status == "200") {
            callback(rawFile.responseText);
        }
    }
    rawFile.send(null);
}

readTextFile("https://monicalin22.github.io/chinese-names/data/top50char.json", function(text){
	var top50char_data = JSON.parse(text);
	
	readTextFile("https://monicalin22.github.io/chinese-names/data/char_to_definition.json", function(text) {
		var char_to_definition_data = JSON.parse(text);
		
		readTextFile("https://monicalin22.github.io/chinese-names/data/char_override_dict.json", function(text) {
			var char_override_dict_data = JSON.parse(text);
			
			createVisual(top50char_data, char_to_definition_data, char_override_dict_data);
		});
	});
});


const decade2 = 1960;


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
	const windowHeight  = 400;
	const windowWidth   = 600;
	const MULT          = 0.96;
	const squareHeight  = windowHeight / num_height * MULT;
	const squareWidth   = windowWidth / num_width   * MULT;

	const svg = d3.create("svg").attr('viewBox', [0, 0, windowWidth, windowHeight]);

	let dict = {};

	let x = d3.scaleLinear().domain([0, num_width]).range([0, windowWidth]);
	let y = d3.scaleLinear().domain([0, num_height]).range([0, windowHeight]);

	// Text settings
	let font_size         = "1.50rem";

	const x_text_offset   = 15;
	const y_text_offset   = 44;

	// 1950 characters
	let chars1950 = post[0];

	function get_male_to_total_ratio(char, ind) {
	return post_ratios[ind][char];
	}

	let k     = 0;
	for (let row = 0; row < num_height; row++) {
		for (let col = 0; col < num_width; col++) {
			let ind   = (-1950 + decade2) / 10;
			let chars = post[ind];
			let char = Array.from(chars)[k];

			let g    = svg.append("g");  
			let rect = g
				.append("rect")
				.attr("x", x(col))
				.attr("y", y(row))
				.attr("width", squareWidth)
				.attr("height", squareHeight)
				.attr("fill",  "#ff69b4");

			let ratio = get_male_to_total_ratio(char, ind);

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
			if (defn.length >= 15) {definition_size = "0.35rem"};
			if (defn.length <= 5)  {definition_size = "0.65rem"};

			// Definition text
			let text2 = g
				.append("text")
				.attr("x", x(col) + x_text_offset - 7)
				.attr("y", y(row) + y_text_offset + 17)
				.style("font-size", definition_size)
				.style("fill", "#FFFFFF")
				.text(defn);

			if (!(chars1950.has(char))) { // If doesn't exist, make it partly transparent
				rect.attr("opacity", 0.15);
				text.style("fill", "#BBBBBB");
				text2.style("fill", "#BBBBBB");
			}

			k++;
		}
	}

}