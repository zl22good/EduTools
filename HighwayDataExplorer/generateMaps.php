<?
$jsonArr = json_decode($_POST['params'], true);

$mysqli = new mysqli("XXXXX");

$response = array('text'=>array(), 'values'=>array(), 'vertices'=>array());

if($jsonArr['order'] == "alpha")
	$result = $mysqli->query("SELECT * FROM graphs ORDER BY filename ASC");
else if($jsonArr['order'] == "small")
	$result = $mysqli->query("SELECT * FROM graphs ORDER BY vertices ASC");	
else if($jsonArr['order'] == "large")
	$result = $mysqli->query("SELECT * FROM graphs ORDER BY vertices DESC");

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
	$mysqli->close();
	echo json_encode($response);
?>