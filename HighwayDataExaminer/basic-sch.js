// addapted from the example provided by http://twitter.github.io/typeahead.js/examples/ The Basics
// also thanks to https://codepen.io/jonvadillo/details/NrGWEX for providing a working example in which to work off of

var substringMatcher = function(strs) {
  return function findMatches(q, cb) {
    var matches, substringRegex;

    // an array that will be populated with substring matches
    matches = [];
	//console.log(matches);

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
	console.log(input);
	var getGraph = graphs[input];
	console.log(getGraph);
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
	      console.log(descr);
		for(i=0; i < descr.length; i++)
		{
			description.push(descr[i]);
		}
		}
	};
	console.log("got to open ajax request in basic-sch.js")
	xmlhttp.open("GET", "jsdataLoadDescr.php", true);
	console.log("sent ajax request in basic-sch.js");
	xmlhttp.send();
}

console.log("did this run");
getDescriptions();
console.log(description);
	
	
	

	
	console.log("Can we still access description?");
	console.log(description);
	
	

	


//var description = [Afghanistan (Country), Africa All Routes on Continent, Alabama (State), Aland Islands (Autonomous Region), Alaska (State), Albania (Country), Alberta (Province), Albuquerque, NM (50 mi radius), All Travel Mapping Data, Andalusia (Autonomous Community), Andhra Pradesh (State), Andorra (Country), Anhui (Province), Aragon (Autonomous Community), Arizona (State), Arkansas (State), Armenia (Country), Aruba (Constituent Country), Asia All Routes on Continent, Assam (State), Asturias (Autonomous Community), Austin (25 mi radius), Austria (Country), Azerbaijan (Country), Baden-Wurttemberg (State), Bahrain (Country), Baja California (State), Baja California Sur (State), Balearic Islands (Autonomous Community), Baltimore (25 mi radius), Bangladesh (Country), Barbados (Country), Basque Country (Autonomous Community), Bavaria (State), Beijing (Municipality), Belarus (Country), Belgium (Country), Belize (Country), Berlin (State), Bhutan (Country), Bihar (State), Bosnia and Herzegovina (Country), Boston (20 mi radius), Brandenburg (State), Bremen (State), British Columbia (Province), British Isles, Brunei (Country), Bulgaria (Country), California (State), Cambodia (Country), Canada All Routes in Country, Canadian Maritimes, Canary Islands (Autonomous Community), Cantabria (Autonomous Community), cantch (Trans-Canada Highway), Castile and Leon (Autonomous Community), Castilla-La Mancha (Autonomous Community), Catalonia (Autonomous Community), Ceuta (Autonomous City), Chhattisgarh (State), Chiapas (State), Chicago (25 mi radius), Chihuahua (State), China All Routes in Country, Chongqing (Municipality), Coahuila (State), Colima (State), Colorado (State), Community of Madrid (Autonomous Community), Connecticut (State), Copenhagen (25 mi radius), Corsica (Region), Crimea (Autonomous Republic), Croatia (Country), Cyprus (Country), Czechia (Country), Delaware (State), Denmark (Country), Denmark All Routes in Country, District of Columbia (Capital District), Distrito Federal (Federal District), Durango (State), Egypt (Country), England (Constituent Country), Estonia (Country), eure (UNECE International ''E'' Roads), Europe All Routes on Continent, Europen Freeway Routes, Extremadura (Autonomous Community), Faroe Islands (Constituent Country), Finland (Country), Finland All Routes in Country, Florida (State), France (Country), France All Routes in Country, French Guiana (Overseas Region), French Polynesia (Overseas Collectivity), Fujian (Province), Gabon (Country), Galicia (Autonomous Community), Georgia (Asia) (Country), Georgia (USA) (State), Germany All Routes in Country, Grand Island, NE (50 mi radius), Greece (Country), Guadeloupe (Overseas Region), Guam (Territory), Guanajuato (State), Guangdong (Province), Guansu (Province), Guanxi Zhuang (Autonomous Region), Guerrero (State), Guizhou (Province), Gujarat (State), Hainan (Province), Hamburg (State), Haryana (State), Hawaii (State), Hebei (Province), Heliongjiang (Province), Henan (Province), Hesse (State), Hidalgo (State), Hong Kong (Special Administrative Region), Hubai (Province), Hunan (Province), Hungary (Country), Iceland (Country), Idaho (State), Illinois (State), India All Routes in Country, Indiana (State), Indonesia (Country), Innsbruck (25 mi radius), Iowa (State), Iran (Country), Ireland (Country), Isle of Man (Crown Dependency), Israel (Country), Italy (Country), Jalisco (State), Jamaica (Country), Japan (Country), Jersey (Crown Dependency), Jharkhand (State), Jiangsu (Province), Jiangxi (Province), Jilin (Province), Jordan (Country), Kansas (State), Kansas City (20 mi radius), Karnataka (State), Kazakhstan (Country), Kentucky (State), Korea (North) (Country), Korea (South) (Country), Kosovo (Country), Kuwait (Country), Kyrgyzstan (Country), La Rioja (Autonomous Community), Laos (Country), Latvia (Country), Lianoning (Province), Liechtenstein (Country), Lithuania (Country), London (25 mi radius), Louisiana (State), Lower Saxony (State), Luxembourg (Country), Macedonia (Country), Madhya Pradesh (State), Maharashtra (State), Maine (State), Malaysia (Country), Malta (Country), Manipur (State), Manitoba (Province), Martinique (Overseas Region), Maryland (State), Massachusetts (State), Mayotte (Overseas Region), Mecklenburg-Western Pomerania (State), Meghalaya (State), Melilla (Autonomous City), Mexico All Routes in Country, Michigan (State), Michoacán (State), Minnesota (State), Mississippi (State), Missouri (State), Moldova (Country), Mongolia (Country), Montana (State), Montenegro (Country), Montreal (25 mi radius), Morelos (State), Morocco (Country), Muhlenberg College (25 mi radius), Myanmar (Country), Nagaland (State), Namibia (Country), Naples, FL (25 mi radius), National Capital Territory of Delhi (Union Territory), Navarre (Autonomous Community), Nayarit (State), Nebraska (State), Nei Mongol (Autonomous Region), Nepal (Country), Netherlands (Country), Netherlands All Routes in Country, Nevada (State), New Brunswick (Province), New Caledonia (Special Collectivity), New England, New Hampshire (State), New Jersey (State), New Mexico (State), New York (State), New York City (20 mi radius), New Zealand (Country), Newfoundland and Labrador (Province), Ningxia Hui (Autonomous Region), North America All Routes on Continent, North Carolina (State), North Dakota (State), North Rhine-Westphalia (State), Northern Ireland (Province), Northern Mariana Islands (Territory), Northwest Territories (Territory), Norway (Country), Nova Scotia (Province), Nuevo León (State), Oaxaca (State), Oceania All Routes on Continent, Odisha (State), Ohio (State), Oklahoma (State), Omaha, NE (30 mi radius), Ontario (Province), Oregon (State), Pakistan (Country), Palestine (Country), Pennsylvania (State), Philippines (Country), Poland (Country), Portugal (Country), Prince Edward Island (Province), Puebla (State), Puerto Rico (Territory), Punjab (State), Qatar (Country), Qinghai (Province), Quebec (Province), Queretaro (State), Quintana Roo (State), Rajasthan (State), Region of Murcia (Autonomous Community), Reunion (Overseas Region), Rhineland-Palatinate (State), Rhode Island (State), Romania (Country), Russia (Country), Saarland (State), Saint Martin (Overseas Collectivity), Saint Pierre and Miquelon (Overseas Collectivity), San Francisco Bay Area (50 mi radius), San Luis Potosí (State), Saskatchewan (Province), Saxony (State), Saxony-Anhalt (State), Schleswig-Holstein (State), Scotland (Constituent Country), Seattle (25 mi radius), Senegal (Country), Serbia (Country), Shaanxi (Province), Shanghai (Municipality), Shangong (Province), Shanxi (Province), Sichuan (Province), Siena College (100 mi radius), Siena College (25 mi radius), Siena College (50 mi radius), Sinaloa (State), Singapore (Country), Slovakia (Country), Slovenia (Country), Sonora (State), South Africa (Country), South America All Routes on Continent, South Carolina (State), South Dakota (State), Spain All Routes in Country, Sri Lanka (Country), St. Louis (25 mi radius), Sweden (Country), Switzerland (Country), Tabasco (State), Taiwan (Independent Province), Tajikistan (Country), Tamaulipas (State), Tamil Nadu (State), Telangana (State), Tennes
// Make a new ajax request for the graphs object created in php
var graphs = {};
function getGraphs(){
var graphsResponse;
var xmlhttp = new XMLHttpRequest();
xmlhttp.onreadystatechange = function() {
		if(this.readyState==4 && this.status ==200) {
		  graphsResponse = JSON.parse(this.responseText);
	      console.log(graphsResponse);
		  graphs=graphsResponse;
		  console.log("Can we see the graphs object");
		  console.log(graphs);
		}
	};
	console.log("got to open ajax request in basic-sch.js")
	xmlhttp.open("GET", "jsLoadDataGraphs.php", true);
	console.log("sent ajax request in basic-sch.js");
	xmlhttp.send();
}
console.log("did this run?");
getGraphs();
console.log(graphs);

function hideSearchBar(){
	document.getElementById("searchTest").style.zIndex = 0;
}
function ShowSearchBar()
{
	document.getElementById("searchTest").style.zIndex = 5000;
	document.getElementById("hideSearchBar").disabled=false;
}
/* function hideAlgorithmControls()
{
	document.getElementById("AlgorithmControls2").style.zIndex=0;
} */
function showAlgorithmControls()
{
	document.getElementById("algorithmControls2").style.display="table";
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
	
	
	$("#searchBox").keypress(function(event) {
		var keycode = (event.keycode ? event.keycode : event.which);
		if(keycode == '13'){
			var getFile = returnInput(); 
			console.log(getFile);
			readServerSearch(getFile);
		}
	});
	$("#hideSearchBar").click(function() {
		hideSearchBar();
	});
	$("#searchBarShow").click(function() {
		ShowSearchBar();
	});
});





