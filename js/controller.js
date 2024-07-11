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
    var healingIncantations = 3;
    var lightCount = 3; // Number of light locations
    var intervalPromises = [];
    var rapunzelChances = 5;
    var score = 0;

    $scope.resetGame = function() {
        // Clear existing intervals
        intervalPromises.forEach(function(promise) {
            $interval.cancel(promise);
        });
        intervalPromises = [];

        $scope.maze = [];
        for (var i = 0; i < mazeSize * mazeSize; i++) {
            $scope.maze.push({ type: 'empty', images: [] });
        }
        placeTower();
        rapunzelSteps = 1;
        eugeneFound = false;
        healingIncantations = 3;
        rapunzelChances = 5;
        score = 0;
        $scope.message = "Help Rapunzel find the lights!";
        placeCharacters();
        startCharacterMovement();
    };

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
            if (eugeneFound) {
                $scope.message = "Oh no! Rapunzel and Eugene are caught! Eugene is dead. Use healing incantation.";
                eugeneFound = false;
                rapunzelSteps = 1;
            } else {
                rapunzelChances--;
                if (rapunzelChances <= 0) {
                    $scope.message = "Game Over! Rapunzel has no more chances left.";
                    $scope.resetGame();
                    return;
                }
                if ($scope.maze[index].type === 'gothel') {
                    $scope.message = "Oh no! Rapunzel is caught by Gothel! Starting over...";
                    $scope.resetGame();
                } else if ($scope.maze[index].type === 'stabbington') {
                    $scope.message = "Rapunzel is caught by the Stabbington Brothers! Moving to a random position...";
                    moveToRandomPosition();
                } else if ($scope.maze[index].type === 'guard') {
                    $scope.message = "Oh no! Rapunzel is caught by the guards! Starting over...";
                    $scope.resetGame();
                }
            }
        } else if ($scope.maze[index].type === 'eugene') {
            eugeneFound = true;
            rapunzelSteps = 2;
            $scope.message = "Eugene found! Rapunzel can move faster now!";
            moveRapunzel(index, true);
        } else if ($scope.maze[index].type === 'lights') {
            $scope.maze[index].type = 'visited';
            $scope.maze[index].images = $scope.maze[index].images.filter(image => image !== characters.lights);
            score += 10; // Increase score when a light is found
            if (checkAllLightsVisited()) {
                if (eugeneFound) {
                    $scope.message = "At last I see the light!";
                } else {
                    $scope.message = "At last I see the light!";
                }
                stopCharacterMovement(); // Stop character movement
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

    function startCharacterMovement() {
        intervalPromises.push($interval(function() {
            moveCharacter('gothel');
            moveCharacter('stabbington');
        }, 5000));
        intervalPromises.push($interval(function() {
            moveCharacter('guard');
        }, 7000));
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

    // Call the resetGame function to initialize the game on load
    $scope.resetGame();
});
