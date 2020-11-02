var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var Ship = /** @class */ (function () {
    function Ship(masts) {
        this.masts = masts;
        this.hits = [];
        for (var i = 0; i < this.masts; i++) {
            this.hits[i] = false;
        }
    }
    Ship.prototype.hasCollisionWith = function (otherShip) {
        for (var i = 1; i <= this.masts; i++) {
            if (this.hasMastCollision(otherShip, i)) {
                return true;
            }
        }
        return false;
    };
    Ship.prototype.hasMastCollision = function (otherShip, mast) {
        mast--; //convert to index
        if (this.x + mast >= otherShip.x - 1 &&
            this.x + mast <= otherShip.getLastMastsX() + 1 &&
            this.y >= otherShip.y - 1 &&
            this.y <= otherShip.y + 1) {
            return true;
        }
        return false;
    };
    Ship.prototype.hasMastAt = function (x, y) {
        return this.y === y && x >= this.x && x <= this.getLastMastsX();
    };
    Ship.prototype.getLastMastsX = function () {
        return this.x + this.masts - 1;
    };
    Ship.prototype.reactToHit = function (x, y) {
        if (!this.hasMastAt(x, y)) {
            return;
        }
        var mastIndex = x - this.x;
        this.hits[mastIndex] = true;
    };
    Ship.prototype.hasSunk = function () {
        for (var _i = 0, _a = this.hits; _i < _a.length; _i++) {
            var hit = _a[_i];
            if (!hit) {
                return false;
            }
        }
        return true;
    };
    return Ship;
}());
var FieldStatus;
(function (FieldStatus) {
    FieldStatus[FieldStatus["UNSHOOT"] = 0] = "UNSHOOT";
    FieldStatus[FieldStatus["MISS"] = 1] = "MISS";
    FieldStatus[FieldStatus["HIT"] = 2] = "HIT";
    FieldStatus[FieldStatus["SINK"] = 3] = "SINK";
})(FieldStatus || (FieldStatus = {}));
///////////////////////////// PLAYER //////////////////////////////////
var Player = /** @class */ (function () {
    function Player(name) {
        this.ships = [];
        //dodac tablice wielowymiarowa FieldStatus
        this.fields = []; //UNSHOT / HIT / MISS // wizualizacja trafien w plansze przeciwnika
        this.shipsCount = [1, 2, 3, 4];
        this.actualShipIndex = 0;
        this.allShipsCount = 10;
        this.name = name;
        this.creatShips();
        this.createFields();
    }
    Player.prototype.creatShips = function () {
        var mastsCount = [4, 3, 2, 1];
        for (var i = 0; i < mastsCount.length; i++) {
            for (var j = 0; j < this.shipsCount[i]; j++) {
                var ship = new Ship(mastsCount[i]);
                this.ships.push(ship);
            }
        }
    };
    Player.prototype.createFields = function () {
        for (var y = 0; y < 10; y++) {
            this.fields[y] = [];
            for (var x = 0; x < 10; x++) {
                this.fields[y][x] = FieldStatus.UNSHOOT;
            }
        }
    };
    Player.prototype.getShipsCount = function () {
        return this.shipsCount;
    };
    Player.prototype.isSelectionEnded = function () {
        return this.actualShipIndex >= this.allShipsCount;
    };
    Player.prototype.getActualShip = function () {
        return this.ships[this.actualShipIndex];
    };
    Player.prototype.decreaseShipsCount = function () {
        for (var i = 0; i < this.shipsCount.length; i++) {
            if (this.shipsCount[i] > 0) {
                this.shipsCount[i]--;
                break;
            }
        }
    };
    Player.prototype.placeShip = function (x, y) {
        var ship = this.ships[this.actualShipIndex];
        ship.x = x;
        ship.y = y;
    };
    Player.prototype.setNextShip = function () {
        this.actualShipIndex++;
    };
    Player.prototype.canPlaceShip = function () {
        var newShip = this.getActualShip();
        for (var i = 0; i < this.actualShipIndex; i++) {
            var otherShip = this.ships[i];
            if (newShip.hasCollisionWith(otherShip) && i !== this.actualShipIndex) {
                return false;
            }
        }
        return this.isOnBoard(newShip.x, newShip.y);
    };
    Player.prototype.isOnBoard = function (x, y) {
        if (x >= 0 && x + this.getActualShip().masts - 1 <= 9 && y >= 0 && y <= 9) {
            return true;
        }
        return false;
    };
    Player.prototype.getFieldStatus = function (x, y) {
        return this.fields[y][x];
    };
    Player.prototype.reactToHit = function (x, y) {
        // reakcja na trafienie
        var ship = this.findShip(x, y);
        if (ship === null) {
            this.fields[y][x] = FieldStatus.MISS;
            return FieldStatus.MISS;
        }
        ship.reactToHit(x, y);
        this.fields[y][x] = FieldStatus.HIT;
        if (ship.hasSunk()) {
            return FieldStatus.SINK;
        }
        else {
            return FieldStatus.HIT;
        }
    };
    Player.prototype.findShip = function (x, y) {
        for (var _i = 0, _a = this.ships; _i < _a.length; _i++) {
            var ship = _a[_i];
            if (ship.hasMastAt(x, y)) {
                return ship;
            }
        }
        return null;
    };
    Player.prototype.getFields = function () {
        return this.fields;
    };
    Player.prototype.hasLost = function () {
        for (var _i = 0, _a = this.ships; _i < _a.length; _i++) {
            var ship = _a[_i];
            if (!ship.hasSunk()) {
                return false;
            }
        }
        return true;
    };
    Player.prototype.getName = function () {
        return this.name;
    };
    return Player;
}());
///////////////////////////// HUMAN //////////////////////////////
var Human = /** @class */ (function (_super) {
    __extends(Human, _super);
    function Human() {
        return _super.call(this, 'komputer') || this;
    }
    return Human;
}(Player));
///////////////////////////// COMPUTER //////////////////////////////
var Computer = /** @class */ (function (_super) {
    __extends(Computer, _super);
    function Computer(enemyFields) {
        var _this = _super.call(this, 'gracz') || this;
        _this.chasing = false;
        _this.chasingLeft = false;
        _this.lastHitCoord = [];
        _this.firstHitCoord = [];
        _this.enemyFields = [];
        _this.placeAllShips();
        _this.enemyFields = enemyFields;
        return _this;
    }
    Computer.prototype.placeAllShips = function () {
        for (var _i = 0, _a = this.ships; _i < _a.length; _i++) {
            var ship = _a[_i];
            this.setRandomPosition(ship);
        }
        console.log(this.ships);
    };
    Computer.prototype.setRandomPosition = function (ship) {
        do {
            var x = randomInt(0, 10);
            var y = randomInt(0, 10);
            this.placeShip(x, y);
        } while (!this.canPlaceShip());
        this.decreaseShipsCount();
        this.setNextShip();
    };
    Computer.prototype.updateChasingState = function (x, y, status) {
        console.log('status: ', status);
        if (!this.chasing && status === FieldStatus.HIT) {
            // first hit
            console.log('komputer goni');
            this.chasing = true;
            this.lastHitCoord[0] = x;
            this.lastHitCoord[1] = y;
            this.firstHitCoord[0] = x;
            this.firstHitCoord[1] = y;
            this.lastHitStatus = status;
            this.chasingLeft = false;
            if (this.isSomethingInTheWay(x, y)) {
                console.log(' przeszkoda przy pierwszym trafieniu');
                this.changeChasingDirection();
            }
        }
        else if (status === FieldStatus.HIT) {
            // kolejne trafienie
            console.log('kolejne trafienie');
            this.lastHitCoord[0] = x;
            this.lastHitCoord[1] = y;
            this.lastHitStatus = status;
            console.log('is chasing left', this.chasingLeft);
            if (this.chasingLeft !== true && this.isSomethingInTheWay(x, y)) {
                console.log(' przeszkoda przy kolejnym trafieniu');
                this.changeChasingDirection();
            }
        }
        else if (this.chasing && status === FieldStatus.MISS) {
            console.log('miss! zmiana kierunku');
            this.changeChasingDirection();
        }
        else if (status === FieldStatus.SINK) {
            console.log('zatopiony, koniec gonienia');
            this.chasing = false;
        }
    };
    Computer.prototype.isSomethingInTheWay = function (x, y) {
        return x === 9 || this.enemyFields[y][x + 1] !== FieldStatus.UNSHOOT;
    };
    Computer.prototype.changeChasingDirection = function () {
        this.chasingLeft = true;
        this.lastHitCoord[0] = this.firstHitCoord[0];
        this.lastHitCoord[1] = this.firstHitCoord[1];
    };
    Computer.prototype.getTargetFiled = function () {
        if (this.chasing) {
            return this.chasingHitGenerator();
        }
        else {
            return this.randomHitGenerator();
        }
    };
    Computer.prototype.randomHitGenerator = function () {
        var x;
        var y;
        do {
            x = randomInt(0, 10);
            y = randomInt(0, 10);
        } while (this.enemyFields[y][x] !== FieldStatus.UNSHOOT);
        return [x, y];
    };
    Computer.prototype.chasingHitGenerator = function () {
        var modifier = this.chasingLeft ? -1 : 1;
        return [this.lastHitCoord[0] + modifier, this.lastHitCoord[1]];
    };
    return Computer;
}(Player));
///////////////////////////// GAME //////////////////////////////////
var Game = /** @class */ (function () {
    function Game() {
        this.players = [];
        this.actual = 0; // 0,1
        var human = new Human();
        this.players.push(human);
        this.computer = new Computer(human.getFields());
        this.players.push(this.computer);
    }
    Game.prototype.getPlayer = function (type) {
        if (type === "human") {
            return this.players[0];
        }
        else {
            return this.players[1];
        }
    };
    Game.prototype.shootField = function (x, y) {
        var player = this.getEnemy();
        if (!this.isAllowed(x, y)) {
            console.log('niedozwolony ruch!');
            console.log("pola w graczu0: ", this.players[0].getFields());
            console.log("pola w graczu1: ", this.players[1].getFields());
            shooting = false;
            return null;
        }
        var status = player.reactToHit(x, y);
        console.log("player nr:" + this.actual + " shoot field:" + x + " " + y);
        console.log("effect: " + status);
        if (this.actual === 1) {
            this.computer.updateChasingState(x, y, status);
        }
        this.nextPlayer(status);
        this.toggleComputerMove();
        return status;
    };
    Game.prototype.toggleComputerMove = function () {
        var _this = this;
        if (this.actual !== 1) {
            shooting = false; // kompter pozwala graczowi znowu sie ruszac
            return;
        }
        setTimeout(function () { return _this.computerMove(); }, 100);
    };
    Game.prototype.computerMove = function () {
        var fieldIndex = this.computer.getTargetFiled();
        var x = fieldIndex[0];
        var y = fieldIndex[1];
        console.log('komuter chce strzelic w ', x, y);
        var status = this.shootField(x, y);
        showComputerShot(x, y, status);
        updateEndGame(0);
    };
    Game.prototype.nextPlayer = function (status) {
        if (status !== FieldStatus.HIT && status !== FieldStatus.SINK) {
            this.actual = this.getOtherPlayerIndex();
        }
    };
    Game.prototype.isAllowed = function (x, y) {
        return this.getEnemy().getFieldStatus(x, y) === FieldStatus.UNSHOOT;
    };
    Game.prototype.getActualIndex = function () {
        return this.actual;
    };
    Game.prototype.getActualPlayer = function () {
        return this.players[this.actual];
    };
    Game.prototype.getEnemy = function () {
        var index = this.getOtherPlayerIndex();
        return this.players[index];
    };
    Game.prototype.getOtherPlayerIndex = function () {
        return this.actual === 0 ? 1 : 0;
    };
    Game.prototype.hasLost = function (playerIndex) {
        return this.players[playerIndex].hasLost();
    };
    Game.prototype.getPlayerByIndex = function (playerIndex) {
        return this.players[playerIndex];
    };
    Game.prototype.getOtherPlayerByIndex = function (playerIndex) {
        return this.players[playerIndex === 0 ? 1 : 0];
    };
    return Game;
}());
///////////////////////////// VIEW //////////////////////////////////
var game = new Game();
var human = game.getPlayer("human");
var playerBoard = document.getElementById("player-board");
var computerBoard = document.getElementById("computer-board");
function initView() {
    creatBoard("player", playerBoard);
    updatePlayerShipsCount();
    addPlayerFieldListeners();
}
function creatBoard(boardName, container) {
    for (var i = 0; i < 100; i++) {
        var x = i % 10;
        var y = Math.floor(i / 10);
        container.innerHTML +=
            '<div id="' +
                boardName +
                "-x" +
                x +
                "y" +
                y +
                '" class="unpushed"></div>';
    }
}
function updatePlayerShipsCount() {
    var shipsCount = human.getShipsCount();
    for (var i = 0; i < shipsCount.length; i++) {
        document.getElementById("sc" + i).innerText = " " + shipsCount[i];
    }
}
function addPlayerFieldListeners() {
    var fields = playerBoard.children;
    var _loop_1 = function (i) {
        var box = fields[i];
        var x = i % 10;
        var y = Math.floor(i / 10);
        box.addEventListener("click", function () {
            if (human.isSelectionEnded()) {
                return;
            }
            human.placeShip(x, y);
            if (!human.canPlaceShip()) {
                return;
            }
            human.decreaseShipsCount();
            updatePlayerShipsCount();
            showShip("player", x, y);
            human.setNextShip();
            checkEndSelection();
        });
    };
    for (var i = 0; i < fields.length; i++) {
        _loop_1(i);
    }
}
function showShip(boardName, x, y) {
    var mastsCount = human.getActualShip().masts;
    for (var i = 0; i < mastsCount; i++) {
        var box = getBoxByCoords(boardName, x + i, y);
        box.classList.add("pushed");
        box.classList.remove("unpushed");
    }
}
function getBoxByCoords(boardName, x, y) {
    return document.getElementById(boardName + "-x" + x + "y" + y);
}
var shooting = false;
function addComputerFieldListeners() {
    var fields = computerBoard.children;
    var _loop_2 = function (i) {
        var box = fields[i];
        var x = i % 10;
        var y = Math.floor(i / 10);
        box.addEventListener("click", function () {
            console.log('shooting', shooting);
            if (shooting === true) {
                return;
            }
            shooting = true;
            var status = game.shootField(x, y);
            showPlayerShot(box, status);
            updateEndGame(1);
            setTimeout(function () { return shooting = false; }, 10000);
        });
    };
    for (var i = 0; i < fields.length; i++) {
        _loop_2(i);
    }
}
function updateEndGame(enemyPlayerIndex) {
    if (game.hasLost(enemyPlayerIndex) !== true) {
        return;
    }
    // tu wiemy ze przeciwnik przegral
    var winner = game.getPlayerByIndex(enemyPlayerIndex);
    var winnerMessage = 'Gra zakończona, ' + winner.getName() + ' wygrał!';
    document.getElementById('results').innerText = winnerMessage;
    document.getElementById('game').innerHTML = "";
}
function showPlayerShot(box, status) {
    box.classList.remove("unpushed");
    setClassForHit(box, status);
}
function showComputerShot(x, y, status) {
    var box = getBoxByCoords("player", x, y);
    box.classList.remove("unpushed");
    box.classList.remove("pushed");
    setClassForHit(box, status);
}
function setClassForHit(box, status) {
    switch (status) {
        case FieldStatus.HIT:
            box.classList.add("hit");
            break;
        case FieldStatus.MISS:
            box.classList.add("miss");
            break;
        case FieldStatus.SINK:
            box.classList.add("hit");
            break;
        default:
            console.log("komputer wykonał nieprawidłowy ruch!!", status);
    }
}
function checkEndSelection() {
    if (human.isSelectionEnded()) {
        document.getElementById("ships-select").innerHTML = "";
        creatBoard("computer", computerBoard);
        addComputerFieldListeners();
    }
}
initView();
function randomInt(min, max) {
    return min + Math.floor((max - min) * Math.random());
}
