<!DOCTYPE html>
<html>
<head>
<title>Player Management</title>
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">	
<meta name="keywords" content="Zidan Bian." />
<meta name="description" content="Norwest Cougars (AKA Dundas United) roster" />
<meta name="author" content="Zidan Bian." />
<link href="../css/bianzidan.css?v=1.1" rel="stylesheet" type="text/css" /> 
<link href="../css/foundation5.min.css?v=1.0" rel="stylesheet" type="text/css" /> 
<script src="../js/lib/require.js"></script> 	

<script src="https://code.jquery.com/jquery-2.2.4.min.js" integrity="sha256-BbhdlvQf/xTY9gja0Dq3HiwQF8LaCRTXxZKRutelT44=" crossorigin="anonymous"></script>
<script>
	$(function () {
		$('form.updatePlayerForm').submit(function(evt) {
			var $visibleChkBox = $(evt.originalEvent.target).find('input[name="visible"]');
			if ($visibleChkBox.is(':checked')) {
				$visibleChkBox.val(1);
			} else {
				$visibleChkBox.val(0);
				$visibleChkBox.removeAttr("checked");
			}
		});
	});
</script>

</head>

<body class="bodyUpdatePlayer">
	
	<?php
		$hostname = "zidan.db.11040701.hostedresource.com";
		$username = "zidan";
		$dbname = "zidan";
		$password = "goDaddy@1";
		$usertable = "player_roster";
	
		$conn = mysqli_connect($hostname, $username, $password, $dbname);
            
		if(mysqli_connect_errno()) {
		   die('Could not connect: ' . mysqli_connect_error());
		} 
	
		if(isset($_POST['update']) || isset($_POST['add'])) {

			$id = $_POST['id'];
            $number = $_POST['number'];
			$name = $_POST['name'];
			$phone = (isset($_POST['phone']) ? $_POST['phone'] : 0);
            $games = (isset($_POST['games']) ? $_POST['games'] : 0);
			$played = (isset($_POST['played']) ? $_POST['played'] : 0);
			$absent = (isset($_POST['absent']) ? $_POST['absent'] : 0);
			$visible = (isset($_POST['visible']) ? $_POST['visible'] : 0);

			if (isset($_POST['update'])) {
				$sql = "UPDATE $usertable SET number = $number, ".
					"name = '$name', phone = $phone, games = $games, played=$played, absent=$absent, visible = $visible ".
					" WHERE id = $id" ;
            } else if (isset($_POST['add'])) {
				 $sql = "INSERT INTO $usertable (number, name, phone, games, played, absent, visible, goal, assist)".
					" VALUES ($number, '$name', $phone, 0, $played, $absent, $visible, 0, 0)";
			}
			
			$retval = mysqli_query($conn, $sql);
			
            if(! $retval ) {
	?>
			<h3 class="warning label">Could not update data: <?php echo mysqli_error($conn); ?></h3>
	<?php			
            } else {
	?>	
			<h3 class="success label">Updated data successfully at <?php echo gmDate("Y-m-d\TH:i:s\Z"); ?></h3>
	<?php
			}
		}
	?>
		
		<div class="row">
			<div class="columns large-1 medium-1 small-1 hide-for-small"><span class="label">id</span></div>
			<div class="columns large-1 medium-1 small-1"><span class="label">number</span></div>
			<div class="columns large-2 medium-2 small-2"><span class="label">name</span></div>
			<div class="columns large-2 medium-2 small-2"><span class="label">phone</span></div>
			<div class="columns large-1 medium-1 small-1"><span class="label">games</span></div>
			<div class="columns large-1 medium-1 small-1"><span class="label">played</span></div>
			<div class="columns large-1 medium-1 small-1"><span class="label">absent</span></div>
			<div class="columns large-1 medium-1 small-1"><span class="label">visible</span></div>
			<div class="columns large-1 medium-1 small-1 left"><span class="label">action</span></div>
		</div>
		
			
		<?php
			$query = "SELECT * FROM $usertable";
			$result = mysqli_query($conn, $query);
			
			if ($result) {
				while($row = mysqli_fetch_array($result, MYSQLI_ASSOC)) {
		?>
					<form method="post" name="updateForm" class="updatePlayerForm" action="<?php $_PHP_SELF ?>">
						<div class="row updateRow">
							<div class="columns large-1 medium-1 small-1 hide-for-small">
								<input name="id" value=<?php echo $row["id"]; ?> type="number" readonly />
							</div>
							<div class="columns large-1 medium-1 small-1">
								<input name="number" value=<?php echo $row["number"]; ?> type="number" />
							</div>
							<div class="columns large-2 medium-2 small-2">
								<input name="name" value="<?php echo $row["name"]; ?>" type="text" maxlength="30" />
							</div>
							<div class="columns large-2 medium-2 small-2">
								<input name="phone" value="<?php echo $row["phone"]; ?>" type="tel" maxlength="10" />
							</div>
							<div class="columns large-1 medium-1 small-1">
								<input name="games" value=<?php echo $row["games"]; ?> type="number" readonly />
							</div>
							<div class="columns large-1 medium-1 small-1">
								<input name="played" value=<?php echo $row["played"]; ?> type="number" />
							</div>
							<div class="columns large-1 medium-1 small-1">
								<input name="absent" value=<?php echo $row["absent"]; ?> type="number" />
							</div>
							<div class="columns large-1 medium-1 small-1">
								<input name="visible" type="checkbox" value=<?php echo $row["visible"]; ?> <?php if ($row["visible"] == 1)  { echo "checked"; } ?> /> 
							</div>
							<div class="columns large-1 medium-1 small-1 left">
								<input class="button tiny" value="update" name="update" type="submit" />
							</div>
						</div>
					</form>
			 
	<?php
			}
		}
	?>
	
	<form method="post" name="addForm" class="addPlayerForm" action="<?php $_PHP_SELF ?>">
		<div class="row">
			<hr/>
		</div>
		<div class="row">
			<div class="columns large-1 medium-1 small-1">&nbsp;</div>
			<div class="columns large-1 medium-1 small-1">
				<input name="number" placeholder="number" type="number" />
			</div>
			<div class="columns large-2 medium-2 small-2">
				<input name="name" placeholder="name" type="text" maxlength="30" />
			</div>
			<div class="columns large-2 medium-2 small-2">
				<input name="name" placeholder="phone" type="tel" maxlength="10" />
			</div>
			<div class="columns large-1 medium-1 small-1">
				<input name="games" placeholder="games" type="number" readonly />
			</div>
			<div class="columns large-1 medium-1 small-1">
				<input name="played" placeholder="played" type="number" />
			</div>
			<div class="columns large-1 medium-1 small-1">
				<input name="absent" placeholder="absent" type="number" />
			</div>
			<div class="columns large-1 medium-1 small-1">
				<input name="visible" type="checkbox" value="1" checked /> 
			</div>
			<div class="columns large-1 medium-1 small-1 left">
				<input id="add" class="button tiny round" value="add" name="add" type="submit" />
			</div>
		</div>
	</form>
	
	
	<?php
		mysqli_close($conn);
	?>	
		

		
	

</body>

</html>