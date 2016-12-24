<!DOCTYPE html>
<html>
<head>
<title>game management</title>
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">	
<meta name="keywords" content="Zidan Bian." />
<meta name="description" content="Norwest Cougars (AKA Dundas United) players" />
<meta name="author" content="Zidan Bian." />
<link href="../css/bianzidan.css?v=1.0" rel="stylesheet" type="text/css" /> 
<link href="../css/foundation5.min.css?v=1.0" rel="stylesheet" type="text/css" /> 
<script src="../js/lib/require.js"></script> 	

<script src="https://code.jquery.com/jquery-2.2.4.min.js" integrity="sha256-BbhdlvQf/xTY9gja0Dq3HiwQF8LaCRTXxZKRutelT44=" crossorigin="anonymous"></script>
<script>
	$(function () {
		
	});
</script>

</head>

<body class="bodyGameMgmt">

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
		<form method="post" name="updateGameForm" class="updateGameForm" action="<?php $_PHP_SELF ?>">
		<div class="row collapse">
			<div class="columns large-1 medium-1 small-1"><strong class="">#</strong></div>
			<div class="columns large-2 medium-2 small-3"><strong class="">name</strong></div>
			<div class="columns large-2 medium-2 small-2"><strong class="">phone</strong></div>
			<div class="columns large-2 medium-2 small-2"><strong class="">attend</strong></div>
			<div class="columns large-2 medium-2 small-1">&nbsp;</div>
			<div class="columns large-2 medium-2 small-2 left"><strong class="">first-11</strong></div>
		</div>
	
		<?php
			if ($result) {
				$counter = 1;
				while($row = mysql_fetch_array($result)) {
					
					if ($row["visible"] == 1) {
						$number = $row["number"];
						$name = $row["name"];
						$phone = $row["phone"];
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
							<div class="columns large-2 medium-2 small-2">
								<?php echo $phone; ?>&nbsp;
							</div>
							<div class="columns large-2 medium-2 small-2">
								<div class="switch">
									<input name="attend" id="attend<?php echo $counter?>" type="checkbox">
									<label for="attend<?php echo $counter?>"></label>
								</div> 
							</div>
							<div class="columns large-2 medium-2 small-1">&nbsp;</div>
							<div class="columns large-2 medium-2 small-2 left">
								<div class="switch">
								  <input name="attend" id="firstEleven<?php echo $counter?>" type="checkbox">
								  <label for="firstEleven<?php echo $counter?>"></label>
								</div> 
							</div>
						</div>
		<?php		
					}
				}
			}
		?>
	
		<div class="row collapse">
			<div class="columns large-1 medium-1 small-1">
				&nbsp;
			</div>
			<div class="columns large-5 medium-5 small-5">
				<input name="reset" type="submit" value="reset" class="button tiny round" />
			</div>
			<div class="columns large-5 medium-5 small-5">
				<input name="update" type="submit" value="update" class="button tiny round right" />
			</div>
			<div class="columns large-1 medium-1 small-1">
				&nbsp;
			</div>
		</div>
		</form>
</body>

</html>