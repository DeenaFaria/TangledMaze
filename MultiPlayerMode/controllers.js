app.controller('GameController', function($scope, $interval) {
    var mazeSize = 8; // Updated board size
    var characters = {
        rapunzel: 'rapunzel.png',
        gothel: 'gothel.jpg',
        stabbington: 'stabbington.png',
        guard: 'guard.jpg',
        wall: 'wall.jpg',
        eugene: 'eugene.jpg',
        lights: 'lantern.png'
    };

    var rapunzelSteps = 1;
    var eugeneFound = false;
	var eugeneAlive=true;
    var healingIncantations = 2;
    var lightCount = 5; // Number of light locations
    var intervalPromises = [];
    var rapunzelChances = 3;
    var score = 0;
	$scope.healingIncantations = 2;
	$scope.rapunzelChances = 5;
    $scope.score = 0;
	var gameOver=false;
	var gothelFound=false;
	var stabbingtonFound=false;
	var guardsFound=false;
	var success=0;
	


$scope.resetGame = function() {
    // Clear existing intervals
    intervalPromises.forEach(function(promise) {
        $interval.cancel(promise);
    });
    intervalPromises = [];

    // Initialize the maze
    $scope.maze = [];
    for (var i = 0; i < mazeSize * mazeSize; i++) {
        $scope.maze.push({ type: 'empty', images: [] });
    }
    placeTower();
    rapunzelSteps = 1;
    eugeneFound = false;
    $scope.healingIncantations = 2;
    $scope.rapunzelChances = 5;
    $scope.score = 0;
    $scope.message = "Help Rapunzel find the lights!";
    placeCharacters();
    startCharacterMovement();
	gameOver=false;
	gothelFound=false;
	stabbingtonFound=false;
	guardsFound=false;
};

$scope.startOver = function() {
    // Clear existing intervals
    intervalPromises.forEach(function(promise) {
        $interval.cancel(promise);
    });
    intervalPromises = [];

    // Initialize the maze
    $scope.maze = [];
    for (var i = 0; i < mazeSize * mazeSize; i++) {
        $scope.maze.push({ type: 'empty', images: [] });
    }
    placeTower();
    rapunzelSteps = 1;
    eugeneFound = false;
	gothelFound=false;
	stabbingtonFound=false;
	guardsFound=false;
    //healingIncantations = 2;
    //$scope.rapunzelChances = 5;
    //$scope.score = 0;
    //$scope.message = "Help Rapunzel find the lights!";
    placeCharacters();
    startCharacterMovement();
};

// Call the resetGame function to initialize the game on load
$scope.resetGame();


    function placeTower() {
        var startPosition = getRandomPosition();
        $scope.maze[startPosition].type = 'rapunzel';
        $scope.maze[startPosition].images.push(characters.rapunzel);
        $scope.maze[startPosition].images.push('tower.jpg');
    }

    function placeCharacters() {
        placeCharacter('gothel');
        placeCharacter('stabbington');
        placeCharacter('guard');
        placeCharacter('guard');
        placeCharacter('eugene');
        for (var i = 0; i < lightCount; i++) {
            placeCharacter('lights');
        }
        placeWalls();
    }

    function placeCharacter(characterType) {
        var position = getRandomPosition();
        $scope.maze[position].type = characterType;
        $scope.maze[position].images.push(characters[characterType]);
    }

    function placeWalls() {
        var wallPositions = getRandomPositions(10); // Place 10 walls
        wallPositions.forEach(position => {
            $scope.maze[position].type = 'wall';
            $scope.maze[position].images.push(characters.wall);
        });
    }

    function getRandomPositions(count = 1) {
        var positions = [];
        while (positions.length < count) {
            var position = Math.floor(Math.random() * mazeSize * mazeSize);
            if ($scope.maze[position].type === 'empty' && !positions.includes(position)) {
                positions.push(position);
            }
        }
        return count === 1 ? positions[0] : positions;
    }

    function getRandomPosition() {
        return getRandomPositions(1);
    }

    $scope.move = function(index) {
    // Check if Eugene is dead and not healed
    if (eugeneFound && !eugeneAlive) {
        $scope.message = "Eugene is dead! Use the healing incantation before moving.";
        if (prompt("Enter the healing incantation:") === "Flower gleam and glow...") {
            eugeneAlive = true;
            $scope.message = "Eugene is healed!";
        } else {
            $scope.message = "Incorrect incantation! Eugene is still dead.";
            return;
        }
    }

    var rapunzelIndex = $scope.maze.findIndex(cell => cell.images.includes(characters.rapunzel));
    var rowIndex = Math.floor(index / mazeSize);
    var colIndex = index % mazeSize;
    var rapunzelRowIndex = Math.floor(rapunzelIndex / mazeSize);
    var rapunzelColIndex = rapunzelIndex % mazeSize;
    var rowDifference = Math.abs(rowIndex - rapunzelRowIndex);
    var colDifference = Math.abs(colIndex - rapunzelColIndex);

    if (rowDifference > rapunzelSteps || colDifference > rapunzelSteps) {
        $scope.message = "You can only move " + rapunzelSteps + " cell(s) at a time!";
        return;
    }

    handleCellInteraction(index);
};


    function handleCellInteraction(index) {
    if ($scope.maze[index].type === 'gothel' || $scope.maze[index].type === 'stabbington' || $scope.maze[index].type === 'guard') {
        if (eugeneFound && eugeneAlive) {
            $scope.message = "Oh no! Rapunzel and Eugene are caught! Eugene is dead. Use healing incantation.";
            eugeneAlive = false;
			moveRapunzel(index, false);
			$scope.rapunzelChances--;

 
			if ($scope.healingIncantations <= 0 || $scope.rapunzelChances <=0) {
				stopCharacterMovement();
				gameOver=true;
                $scope.message = "Game Over! No healing incantations left.";
				if (prompt("Game over! Would you like to start over?(yes/no)") === "yes") {
					$scope.resetGame();
					return;
				}

               else{
				   $scope.message = "Thanks for helping Rapunzel!";
				   stopCharacterMovement();
				   
				   return;
			   }
                return;
            }
			
			else{
				if (prompt("Enter the healing incantation:") === "Flower gleam and glow...") {
                eugeneAlive = true;
				$scope.message = "Eugene is healed!";
				$scope.healingIncantations--;
				$scope.startOver();
				return;
				}
				
				 else {
                $scope.message = "Incorrect incantation! Eugene is still dead.";
				scope.rapunzelChances--;
                return;
				
			}
				
			}
			
			
        } else {
            $scope.rapunzelChances--;
            if (rapunzelChances <= 0) {
                $scope.message = "Game Over! Rapunzel has no more chances left.";
				stopCharacterMovement();
				moveRapunzel(index, false);
				gameOver=true;
                $scope.resetGame();
                return;
            }
            if ($scope.maze[index].type === 'gothel') {
				gothelFound=true;
                $scope.message = "Oh no! Rapunzel is caught by Gothel! Starting over...";
                $scope.startOver();
            } else if ($scope.maze[index].type === 'stabbington') {
				stabbingtonFound=true;
                $scope.message = "Rapunzel is caught by the Stabbington Brothers! Moving to a random position...";
                moveToRandomPosition();
            } else if ($scope.maze[index].type === 'guard') {
                $scope.message = "Oh no! Rapunzel is caught by the guards! Starting over...";
				guardsFound=true;
                moveToRandomPosition();
            }
        }
    } else if ($scope.maze[index].type === 'eugene'&& !checkAllLightsVisited()) {
        eugeneFound = true;
        rapunzelSteps = 2;
        $scope.message = "Eugene found! Rapunzel can move faster now!";
        moveRapunzel(index, true);
    } else if ($scope.maze[index].type === 'lights') {
        $scope.maze[index].type = 'visited';
        $scope.maze[index].images = $scope.maze[index].images.filter(image => image !== characters.lights);
        $scope.score += 10; // Increase score when a light is found
        if (checkAllLightsVisited()) {
            if (eugeneFound) {
                $scope.message = "At last I see the light!";
				$scope.score+=50;
				$scope.stopCharacterMovement(); 
				success=1;
				
            } else {
                $scope.message = "At last I see the light!";
				$scope.stopCharacterMovement(); 
				success=1;
            }
           // Stop character movement
        } else {
            $scope.message = "Rapunzel sees one of the lights!";
        }
        moveRapunzel(index, false);
    } else if ($scope.maze[index].type === 'wall') {
        $scope.message = "Ouch! Rapunzel hit a wall! Try another path.";
    } else {
        moveRapunzel(index, false);
    }
}


    function moveRapunzel(index, withEugene) {
        var rapunzelIndex = $scope.maze.findIndex(cell => cell.images.includes(characters.rapunzel));
        $scope.maze[rapunzelIndex].images = $scope.maze[rapunzelIndex].images.filter(image => image !== characters.rapunzel);
        if (withEugene) {
            $scope.maze[rapunzelIndex].images = $scope.maze[rapunzelIndex].images.filter(image => image !== characters.eugene);
        }
        $scope.maze[index].type = withEugene ? 'rapunzel-eugene' : 'rapunzel';
        $scope.maze[index].images.push(characters.rapunzel);
        if (withEugene) {
            $scope.maze[index].images.push(characters.eugene);
        }
    }


	
function moveGothelTowardRapunzel() {
    var gothelIndex = $scope.maze.findIndex(cell => cell.images.includes(characters.gothel));
    var rapunzelIndex = $scope.maze.findIndex(cell => cell.images.includes(characters.rapunzel));

    if (gothelIndex !== -1 && rapunzelIndex !== -1) {
        var gothelRowIndex = Math.floor(gothelIndex / mazeSize);
        var gothelColIndex = gothelIndex % mazeSize;
        var rapunzelRowIndex = Math.floor(rapunzelIndex / mazeSize);
        var rapunzelColIndex = rapunzelIndex % mazeSize;

        var newRow = gothelRowIndex;
        var newCol = gothelColIndex;

        if (gothelRowIndex < rapunzelRowIndex) {
            newRow++;
        } else if (gothelRowIndex > rapunzelRowIndex) {
            newRow--;
        }

        if (gothelColIndex < rapunzelColIndex) {
            newCol++;
        } else if (gothelColIndex > rapunzelColIndex) {
            newCol--;
        }

        var newIndex = newRow * mazeSize + newCol;

        if ($scope.maze[newIndex].type === 'empty' || $scope.maze[newIndex].type === 'visited') {
            // Clear Gothel's previous position
            $scope.maze[gothelIndex].type = 'empty';
            $scope.maze[gothelIndex].images = $scope.maze[gothelIndex].images.filter(image => image !== characters.gothel);

            // Move Gothel to the new position
            $scope.maze[newIndex].type = 'gothel';
            $scope.maze[newIndex].images.push(characters.gothel);

            // Check if Gothel has entered Rapunzel's cell
            if (newIndex === rapunzelIndex) {
                $scope.startOver();
            }
        }
    }
}




// Start character movement
function startCharacterMovement() {
    intervalPromises.push($interval(function() {
        console.log("Moving Gothel...");
        moveGothelTowardRapunzel();
    }, 2000));

    intervalPromises.push($interval(function() {
        moveCharacter('stabbington');
    }, 3000));

    intervalPromises.push($interval(function() {
        moveCharacter('guard');
    }, 5000));
}


    function moveCharacter(characterType) {
        var characterIndex = $scope.maze.findIndex(cell => cell.images.includes(characters[characterType]));
        if (characterIndex !== -1) {
            $scope.maze[characterIndex].type = 'empty';
            $scope.maze[characterIndex].images = $scope.maze[characterIndex].images.filter(image => image !== characters[characterType]);
            var newPosition = getRandomPosition();
            if ($scope.maze[newPosition].type === 'empty') {
                $scope.maze[newPosition].type = characterType;
                $scope.maze[newPosition].images.push(characters[characterType]);
            }
        }
    }

    function stopCharacterMovement() {
        intervalPromises.forEach(function(promise) {
            $interval.cancel(promise);
        });
        intervalPromises = [];
    }

    function checkAllLightsVisited() {
        return $scope.maze.filter(cell => cell.type === 'lights').length === 0;
    }

    function moveToRandomPosition() {
        var newPosition = getRandomPosition();
        var rapunzelIndex = $scope.maze.findIndex(cell => cell.images.includes(characters.rapunzel));
        $scope.maze[rapunzelIndex].images = $scope.maze[rapunzelIndex].images.filter(image => image !== characters.rapunzel);
        $scope.maze[newPosition].type = 'rapunzel';
        $scope.maze[newPosition].images.push(characters.rapunzel);
    }
	function moveToRandomPositionEugene() {
        var newPosition = getRandomPosition();
        var eugeneIndex = $scope.maze.findIndex(cell => cell.images.includes(characters.eugene));
        $scope.maze[eugeneIndex].images = $scope.maze[rapunzelIndex].images.filter(image => image !== characters.eugene);
        $scope.maze[newPosition].type = 'eugene';
        $scope.maze[newPosition].images.push(characters.eugene);
    }

    // Call the resetGame function to initialize the game on load
    $scope.resetGame();
});
