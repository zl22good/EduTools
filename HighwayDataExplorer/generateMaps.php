<?
// read information about graphs from our DB
$jsonArr = json_decode($_POST['params'], true);

// this should point to /home/www/courses/metal/lib/tm.conf on blizzard
$tmconffile = fopen($_SERVER['DOCUMENT_ROOT']."/metal/lib/tm.conf", "r");
$tmdbname = chop(fgets($tmconffile));
$tmdbuser = chop(fgets($tmconffile));
$tmdbpasswd = chop(fgets($tmconffile));
$tmdbhost = chop(fgets($tmconffile));


// make the connection
//echo "<!-- mysqli connecting to database ".$tmdbname." on ".$tmdbhost." -->\n";
mysqli_report(MYSQLI_REPORT_STRICT);
try {
    $tmdb = new mysqli($tmdbhost, $tmdbuser, $tmdbpasswd, $tmdbname);
}
catch ( Exception $e ) {
   //echoecho "<h1 style='color: red'>Failed to connect to database ".$tmdbname." on ".$tmdbhost." Please try again later.</h1>";
   exit;
}

$response = array('text'=>array(), 'values'=>array(), 'vertices'=>array());

if($jsonArr['order'] == "alpha")
	$result = $tmdb->query("SELECT * FROM graphs ORDER BY filename ASC");
else if($jsonArr['order'] == "small")
	$result = $tmdb->query("SELECT * FROM graphs ORDER BY vertices ASC");	
else if($jsonArr['order'] == "large")
	$result = $tmdb->query("SELECT * FROM graphs ORDER BY vertices DESC");

	if ($jsonArr['restrict'] == "collapsed"){
		while ($row = $result->fetch_array()) {
			if (strpos($row[0], "simple") == false && $row[2] >= $jsonArr['min'] && $row[2] <= $jsonArr['max']){
				array_push($response['text'], $row[1]);
				array_push($response['values'], $row[0]);
				array_push($response['vertices'], $row[2]);
			}			
		}
	}
	else if ($jsonArr['restrict'] == "simple"){
		while ($row = $result->fetch_array()) {
			if (strpos($row[0], "simple") != false && $row[2] >= $jsonArr['min'] && $row[2] <= $jsonArr['max']){
				array_push($response['text'], $row[1]);
				array_push($response['values'], $row[0]);
				array_push($response['vertices'], $row[2]);
			}
		}
	}
	else {
		while ($row = $result->fetch_array()) {
			if ($row[2] >= $jsonArr['min'] && $row[2] <= $jsonArr['max']){
				array_push($response['text'], $row[1]);
				array_push($response['values'], $row[0]);
				array_push($response['vertices'], $row[2]);
			}
		}
		
	} 

	$result->close();
	$tmdb->close();
	echo json_encode($response);
?>