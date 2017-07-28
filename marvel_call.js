//var dataset = 
this.svg_attrs = {
		// Using a 16:9 ratio for a canvas ensures the entire surface is visible on all mobile devices.
		"viewBox":"0 0 " + 1600 + " " + 900,
		"preserveAspectRatio":"xMinYMin meet",
	};

//Limit 1484 characters
 var paramsArray = [];

function waveform(audio_context, oscillator_type, frequency, amplitude) {
    var self = this;
    this.context = audio_context;
    this.oscillator = context.createOscillator();
    this.oscillator.type = oscillator_type;
    this.oscillator.frequency.value = frequency;
    this.gainNode = context.createGain();
    this.amplitude = amplitude;
    this.gainNode.gain.value = 0;
    this.oscillator.connect(this.gainNode);
    this.gainNode.connect(context.destination);
    this.oscillator.start();



    this.on_ramp = function()
    {
        this.gainNode.gain.setTargetAtTime(self.amplitude, self.context.currentTime, 0.05);
    }

    this.off_ramp = function()
    {
        this.gainNode.gain.setTargetAtTime(0, self.context.currentTime, 0.05);
    }

}
    
    // var playsnd2 = svg.append("rect").attr("x", 200).attr("y", 0).attr("width", 100).attr("height", 200).attr("fill", "yellow");
    // var stopsnd2 = svg.append("rect").attr("x", 300).attr("y", 0).attr("width", 100).attr("height", 200).attr("fill", "orange");

    // playsnd2.on("mouseover", function(){testwave.on_ramp();});
    // stopsnd2.on("mouseover", function(){testwave.off_ramp();});


    window.AudioContext = window.AudioContext || window.webkitAudioContext;
    context = new AudioContext();

 for(var i = 0; i <= 5; i++ ) {
    paramsArray.push({
        apikey: "80ed3514e84f518d99f886a22a09ddda",
        ts: "973501fef7f94908864b9adcab91983b",
        hash: "90830a1e57d174afce457e11aca36893",
        offset: i*10+"",
        limit:"100"

    })

 } 
 var requests = paramsArray.map(function(d) {
    return $.ajax({url: 'http://gateway.marvel.com/v1/public/characters', data: d});
 })

  


var getNamesEvents = function(data) {
    let events = [];
     //console.log(data.events.items)
    if (typeof data.events.items !== 'undefined' && data.events.items !== null && data.events.items.length > 0) {
        for(var evt in data.events.items) {
            events.push(data.events.items[evt].name);
        }
    } 

    return {
        name: data.name,
        events: events,
        thumbnail: data.thumbnail.path+".jpg"
    };
};

var findPairs = function(a, b) {

    var sorted_a = a.concat().sort();
    var sorted_b = b.concat().sort();
    var common = [];
    var a_i = 0;
    var b_i = 0;

    while(a_i < a.length && b_i < b.length) {
        if(sorted_a[a_i] === sorted_b[b_i]) {
            common.push(sorted_a[a_i]);
            a_i++;
            b_i++;
        }
        else if(sorted_a[a_i] < sorted_b[b_i]) {
            a_i++;
        }
        else {
            b_i++;
        }
    }
    return common;
}

//Create a function that accepts an array that then is filtered and iterated over.
var createLinks = function(array) {
    let filter_array = array.filter(function(d){
        return (d.events.length > 0 && d.thumbnail != "http://i.annihil.us/u/prod/marvel/i/mg/b/40/image_not_available.jpg") ? true : false;
    })
    let compareArray = [...filter_array];
    let link_data = [];
    let links = filter_array.forEach(function(d0, i, a) {
        compareArray.shift();
        compareArray.forEach(function(d1) {
            let commons = findPairs(d0.events, d1.events);
            if (commons.length > 0) {
                link_data.push({
                    source: d0,
                    target: d1,
                    stroke_width: commons.length
                })
            }
        })
    })
    return link_data;
} 
//For each datum check if they have similar events.
//Need source and target

 var createNodes = function(simulated_data, link_data) {

    simulated_data = simulated_data.filter(function(d) {
        return d.thumbnail === "http://i.annihil.us/u/prod/marvel/i/mg/b/40/image_not_available.jpg" ? false:true;
    })
 	
   for(i = 0; i < link_data.length; i++) {
      if(link_data[i].stroke_width > 3) {
        testwave = new waveform(context, "square", 700, 1.0);
      }
      else if(link_data[i].stroke_width < 2) {
        testwave = new waveform(context, "sawtooth", 50, 1.0);
      }
      //console.log(link_data[i].stroke_width);
   }

 	var svg = d3.select("body")
				.append("svg")
				.attrs(self.svg_attrs);

    var link = svg.append("g")
            .attr("class", "links")
            .selectAll("line")
            .data(link_data)
            .enter()
            .append("line")
            .attr("stroke", "black")
            //.attr("stroke-width", function(d) {return d.stroke_width});

   	var nodes = svg.append("g")
    	.attr("class", "nodes")
        .selectAll("circle")
        .data(simulated_data)
        .enter().append("circle")
        .attrs({
        	cx: function(d){return d.x},
        	cy: function(d){return d.y},
        	r:  20
        })

 nodes.each(function(d){ svg.append("pattern").attr("id", d.index)
                                              .attr("height", "100%")
                                              .attr("width", "100%")
                                              .attr("patternContentUnits", "objectBoundingBox")
                                              .append("image")
                                                    .attr("xlink:href", d.thumbnail)
                                                    .attr("preserveAspectRatio", "none")
                                                    .attr("width", 1)
                                                    .attr("height", 1)});
 d3.selectAll("circle")
   .attr("fill", function(d) { return "url(#"+d.index+")";})


  return {nodes, link};
       
 }

 var createForce = function(...req) {
   let array = [...req];
   let newarray = [];

   array.forEach(function(d) {
        newarray.push(...d[0].data.results);
   });

 	function dragstarted(d) {
    	if (!d3.event.active) simulation.alphaTarget(0.3).restart();
        	d.fx = d.x;
        	d.fy = d.y;
            testwave.on_ramp();
  	}

	function dragged(d) {
	    d.fx = d3.event.x;
	    d.fy = d3.event.y;
        testwave.on_ramp();
	}

	function dragended(d) {
	    if (!d3.event.active) simulation.alphaTarget(0);
	        d.fx = null;
	        d.fy = null;
            testwave.off_ramp();
	} 

 	let names = newarray.map(getNamesEvents);
    //console.log(names);
    let g_link = createLinks(names);
 	let simulation = d3.forceSimulation(names)
                       .force("link", d3.forceLink().id(function(d) { return d.index; }).distance(600))
 					   .force("collide",d3.forceCollide(10).iterations(5) )
 					   .force("charge", d3.forceManyBody())
 					   .force("center", d3.forceCenter(1600 / 2, 900 / 2))
 					   .force("y", d3.forceY(0))
 					   .force("x", d3.forceX(0));

 	let nodesLinks = createNodes(names, g_link);
    let nodes = nodesLinks.nodes;
    //console.log(nodes);
 	nodes.call(d3.drag().on("start", dragstarted)
 						 .on("drag", dragged)
 						 .on("end", dragended));


 	let ticked = function() {
    	nodes.attr("cx", function(d) { return d.x; })
    	     .attr("cy", function(d) { return d.y; });

        nodesLinks.link
                .attr("x1", function(d) { return d.source.x; })
                .attr("y1", function(d) { return d.source.y; })
                .attr("x2", function(d) { return d.target.x; })
                .attr("y2", function(d) { return d.target.y; });
    }

    simulation.on("tick", ticked);
    simulation.force("link")
              .links(g_link);
 }

 window.onload = function() {
    $.when(...requests).then(createForce);
 }



