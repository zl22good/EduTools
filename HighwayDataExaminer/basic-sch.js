// addapted from the example provided by http://twitter.github.io/typeahead.js/examples/ The Basics
// also thanks to https://codepen.io/jonvadillo/details/NrGWEX for providing a working example in which to work off of

var substringMatcher = function(strs) {
  return function findMatches(q, cb) {
    var matches, substringRegex;

    // an array that will be populated with substring matches
    matches = [];

    // regex used to determine if a string contains the substring `q`
    substrRegex = new RegExp(q, 'i');

    // iterate through the pool of strings and for any string that
    // contains the substring `q`, add it to the `matches` array
    $.each(strs, function(i, str) {
      if (substrRegex.test(str)) {
        matches.push(str);
      }
    });

    cb(matches);
  };
};


function returnInput()
{
	var input = document.getElementById("searchBox").value;
	var getGraph = graphs[input];
	return graphs[input];
}
// first ajax request to get all of the values for the descriptions

	var description = ['Choose A Graph']; 
function getDescriptions(){
	var xmlhttp = new XMLHttpRequest();
	var descr;
	//var descr;
	var i =0;
	xmlhttp.onreadystatechange = function() {
		if(this.readyState==4 && this.status ==200) {
		  descr = Array.from(JSON.parse(this.responseText));
		for(i=0; i < descr.length; i++)
		{
			description.push(descr[i]);
		}
		}
	};
	xmlhttp.open("GET", "jsdataLoadDescr.php", true);
	xmlhttp.send();
}

getDescriptions();

// Make a new ajax request for the graphs object created in php
var graphs = {};
function getGraphs(){
var graphsResponse;
var xmlhttp = new XMLHttpRequest();
xmlhttp.onreadystatechange = function() {
		if(this.readyState==4 && this.status ==200) {
		  graphsResponse = JSON.parse(this.responseText);
		  graphs=graphsResponse;
		}
	};
	xmlhttp.open("GET", "jsLoadDataGraphs.php", true);
	xmlhttp.send();
}
getGraphs();

function hideSearchBar(){
	document.getElementById("searchTest").style.display ="none";
}
function ShowSearchBar()
{
	document.getElementById("searchTest").style.display = "table";
	document.getElementById("hideSearchBar").disabled=false;
}
 function hideAlgorithmControls()
{
	document.getElementById("algorithmControls2").style.display="none";
} 
function showAlgorithmControls()
{
	document.getElementById("algorithmControls2").style.display="table";
}
function showAlgStats()
{
	document.getElementById("algStats").style.display="table";
}

function hideAlgStats()
{
	document.getElementById("algStats").style.display="none";
}

function showTopAlgControls()
{
	document.getElementById("algorithmControls3").style.display="table";
}
function hideTopAlgControls()
{
	document.getElementById("algorithmControls3").style.display="none";
}






$(document).ready(function(){
	$('#the-basics .typeahead').typeahead({
	  hint: true,
	  highlight: true,
	  minLength: 1,
	  
	},
	{
	  name: 'description',
	  source: substringMatcher(description)
	});	
	
	// adapted from https://howtodoinjava.com/scripting/jquery/jquery-detect-if-enter-key-is-pressed/
	$("#searchBox").keypress(function(event) {
		var keycode = (event.keycode ? event.keycode : event.which);
		if(keycode == '13'){
			var getFile = returnInput(); 
			readServerSearch(getFile);
		}
	});
	$("#hideSearchBar").click(function() {
		hideSearchBar();
	});
	$("#searchBarShow").click(function() {
		ShowSearchBar();
	});
	$("#algOptionsDone").click(function() {
		hideAlgorithmControls();
		showAlgStats();
		
	});
});





