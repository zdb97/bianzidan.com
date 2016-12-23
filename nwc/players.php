<!DOCTYPE html>
<html>
<head>
<title>Players</title>
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">	
<meta name="keywords" content="Zidan Bian." />
<meta name="description" content="Norwest Cougars (AKA Dundas United) players" />
<meta name="author" content="Zidan Bian." />
<link href="../css/bianzidan.css?v=1.0" rel="stylesheet" type="text/css" /> 
<script src="../js/lib/require.js"></script> 	

</head>

<body class="bodyPlayers">

	<?php
		//Variables for connecting to your database.
		//These variable values come from your hosting account.
		$hostname = "zidan.db.11040701.hostedresource.com";
		$username = "zidan";
		$dbname = "zidan";

		//These variable values need to be changed by you before deploying
		$password = "goDaddy@1";
		$usertable = "player_roster";

		//Connecting to your database
		mysql_connect($hostname, $username, $password) OR DIE ("Unable to connect to database! Please try again later.");
		mysql_select_db($dbname);

		//Fetching from your database table.
		$query = "SELECT * FROM $usertable";
		$result = mysql_query($query);
	?>
	
		<div class="row collapse">
			<div class="columns large-1 medium-1 small-1"><strong  class="">#</strong></div>
			<div class="columns large-2 medium-2 small-3"><strong  class="">name</strong></div>
			<div class="columns large-2 medium-2 small-2 hide-for-small"><strong  class="">phone</strong></div>
			<div class="columns large-1 medium-1 small-2"><strong  class="">games</strong></div>
			<div class="columns large-1 medium-1 small-2"><strong  class="">played</strong></div>
			<div class="columns large-1 medium-1 small-2"><strong  class="">absent</strong></div>
			<div class="columns large-1 medium-1 small-1 left"><strong  class="">%</strong></div>
		</div>
	
	
		<?php
			if ($result) {
				$counter = 1;
				while($row = mysql_fetch_array($result)) {
					
					if ($row["visible"] == 1) {
						$number = $row["number"];
						$name = $row["name"];
						$phone = $row["phone"];
						$games = $row["games"];
						$played = $row["played"];
						$absent = $row["absent"];
						$attendance = number_format(100*($played/($played+$absent)), 2);
						$counter++;
		?>			
						<div class="row collapse <?php if($counter%2 == 0) { ?> even <?php } ?> ">
							<div class="columns large-1 medium-1 small-1">
								<?php echo $number; ?>&nbsp;
							</div>
							<div class="columns large-2 medium-2 small-3">
								<?php echo $name; ?>&nbsp;
							</div>
							<div class="columns large-2 medium-2 small-2 hide-for-small">
								<?php echo $phone; ?>&nbsp;
							</div>
							<div class="columns large-1 medium-1 small-2">
								<?php echo $games; ?>&nbsp;
							</div>
							<div class="columns large-1 medium-1 small-2">
								<?php echo $played; ?>&nbsp;
							</div>
							<div class="columns large-1 medium-1 small-2">
								<?php echo $absent; ?>&nbsp;
							</div>
							<div class="columns large-1 medium-1 small-1 left">
								<?php echo $attendance; ?>%&nbsp;
							</div>
						</div>
		<?php		
					}
				}
			}
		?>
	

</body>

</html>