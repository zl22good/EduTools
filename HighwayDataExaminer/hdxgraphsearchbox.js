//
// HDX Graph search box functionality
//
// METAL Project
//
// Primary Author: Michael Dagostino
//

/***********************************************************************/
/* Code formerly in basic-sch.js mainly, Michael Dagostino Summer 2018 */
/* Mainly involved in managing the search box to load graphs by typing */
/* a word contained in the graph's name/description.                   */
/***********************************************************************/

// adapted from the example provided by
// http://twitter.github.io/typeahead.js/examples/ The Basics also
// thanks to https://codepen.io/jonvadillo/details/NrGWEX for
// providing a working example in which to work off of

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

function returnInput() {
    
    var input = document.getElementById("searchBox").value;
    var getGraph = graphs[input];
    return graphs[input];
}

// first ajax request to get all of the values for the descriptions
var description = ['Choose A Graph']; 
function getDescriptions(){
    var xmlhttp = new XMLHttpRequest();
    var descr;
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

$(document).ready(function(){
    $('#the-basics .typeahead').typeahead(
        {
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
});

