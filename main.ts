class Ship {
  x: number;
  y: number;
  masts: number;
  private hits: boolean[];
  constructor(masts: number) {
    this.masts = masts;
    this.hits = [];
    for (let i = 0; i < this.masts; i++) {
      this.hits[i] = false;
    }
  }

  hasCollisionWith(otherShip: Ship): boolean {
    for (let i = 1; i <= this.masts; i++) {
      if (this.hasMastCollision(otherShip, i)) {
        return true;
      }
    }
    return false;
  }

  private hasMastCollision(otherShip: Ship, mast: number) {
    mast--; //convert to index
    if (
      this.x + mast >= otherShip.x - 1 &&
      this.x + mast <= otherShip.getLastMastsX() + 1 &&
      this.y >= otherShip.y - 1 &&
      this.y <= otherShip.y + 1
    ) {
      return true;
    }

    return false;
  }

  hasMastAt(x: number, y: number) {
    return this.y === y && x >= this.x && x <= this.getLastMastsX();
  }

  getLastMastsX() {
    return this.x + this.masts - 1;
  }

  reactToHit(x: number, y: number): void {
    if (!this.hasMastAt(x, y)) {
      return;
    }
    const mastIndex = x - this.x;
    this.hits[mastIndex] = true;
  }

  hasSunk(): boolean {
    for (let hit of this.hits) {
      if (!hit) {
        return false;
      }
    }
    return true;
  }
}

enum FieldStatus {
  UNSHOOT,
  MISS,
  HIT,
  SINK,
}

///////////////////////////// PLAYER //////////////////////////////////

class Player {
  protected ships: Ship[] = [];
  protected fields: FieldStatus[][] = []; //UNSHOT / HIT / MISS // wizualizacja trafien w plansze przeciwnika
  protected shipsCount = [1, 2, 3, 4];
  protected actualShipIndex = 0;
  protected allShipsCount = 10;
  private name: string;

  constructor(name: string) {
    this.name = name;
    this.creatShips();
    this.createFields();
  }

  creatShips(): void {
    let mastsCount = [4, 3, 2, 1];
    for (let i = 0; i < mastsCount.length; i++) {
      for (let j = 0; j < this.shipsCount[i]; j++) {
        let ship = new Ship(mastsCount[i]);
        this.ships.push(ship);
      }
    }
  }

  createFields(): void {
    for (let y = 0; y < 10; y++) {
      this.fields[y] = [];
      for (let x = 0; x < 10; x++) {
        this.fields[y][x] = FieldStatus.UNSHOOT;
      }
    }
  }

  getShipsCount(): number[] {
    return this.shipsCount;
  }

  isSelectionEnded() {
    return this.actualShipIndex >= this.allShipsCount;
  }

  getActualShip(): Ship {
    return this.ships[this.actualShipIndex];
  }

  decreaseShipsCount(): void {
    for (let i = 0; i < this.shipsCount.length; i++) {
      if (this.shipsCount[i] > 0) {
        this.shipsCount[i]--;
        break;
      }
    }
  }

  placeShip(x: number, y: number) {
    let ship = this.ships[this.actualShipIndex];
    ship.x = x;
    ship.y = y;
  }

  setNextShip(): void {
    this.actualShipIndex++;
  }

  canPlaceShip(): boolean {
    let newShip = this.getActualShip();
    for (let i = 0; i < this.actualShipIndex; i++) {
      let otherShip = this.ships[i];
      if (newShip.hasCollisionWith(otherShip) && i !== this.actualShipIndex) {
        return false;
      }
    }
    return this.isOnBoard(newShip.x, newShip.y);
  }

  isOnBoard(x: number, y: number): boolean {
    if (x >= 0 && x + this.getActualShip().masts - 1 <= 9 && y >= 0 && y <= 9) {
      return true;
    }
    return false;
  }

  getFieldStatus(x: number, y: number): FieldStatus {
    return this.fields[y][x];
  }

  reactToHit(x: number, y: number): FieldStatus {
    // reakcja na trafienie
    let ship = this.findShip(x, y);
    if (ship === null) {
      this.fields[y][x] = FieldStatus.MISS;
      return FieldStatus.MISS;
    }
    ship.reactToHit(x, y);
    this.fields[y][x] = FieldStatus.HIT;
    if (ship.hasSunk()) {
      return FieldStatus.SINK;
    } else {
      return FieldStatus.HIT;
    }
  }

  private findShip(x: number, y: number): Ship {
    for (let ship of this.ships) {
      if (ship.hasMastAt(x, y)) {
        return ship;
      }
    }
    return null;
  }

  getFields(): FieldStatus[][] {
    return this.fields;
  }

  hasLost():boolean{
    for(let ship of this.ships){
      if(!ship.hasSunk()){
          return false;
      }
    }
    return true;
  }
  
getName():string{
  return this.name;
}
}


///////////////////////////// HUMAN //////////////////////////////

class Human extends Player {

constructor(){
  super('komputer');
}

}

///////////////////////////// COMPUTER //////////////////////////////

class Computer extends Player {
  private chasing = false;
  private chasingLeft = false;
  private lastHitCoord: number[] = [];
  private firstHitCoord: number[] = [];
  private lastHitStatus: FieldStatus;
  private enemyFields: FieldStatus[][] = [];

  constructor(enemyFields: FieldStatus[][]) {
    super('gracz');
    this.placeAllShips();
    this.enemyFields = enemyFields;
  }

  placeAllShips() {
    for (let ship of this.ships) {
      this.setRandomPosition(ship);
    }
    console.log(this.ships);
  }

  setRandomPosition(ship: Ship) {
    do{
      const x = randomInt(0, 10);
      const y = randomInt(0, 10);
      this.placeShip(x, y);
    }while(!this.canPlaceShip());
    this.decreaseShipsCount();
    this.setNextShip();
  }

  updateChasingState(x: number, y: number,status: FieldStatus ){
    console.log('status: ',status);
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
      if ( this.isSomethingInTheWay(x,y)) {
        console.log(' przeszkoda przy pierwszym trafieniu');
        this.changeChasingDirection();
      }
    } else if (status === FieldStatus.HIT) {
      // kolejne trafienie
      console.log('kolejne trafienie');
      this.lastHitCoord[0] = x;
      this.lastHitCoord[1] = y;
      this.lastHitStatus = status;
      console.log('is chasing left', this.chasingLeft);
      if ( this.chasingLeft !== true &&  this.isSomethingInTheWay(x,y) ) {
        console.log(' przeszkoda przy kolejnym trafieniu');
        this.changeChasingDirection();
      }
    } else if (this.chasing && status === FieldStatus.MISS) {
      console.log('miss! zmiana kierunku');
      this.changeChasingDirection();
    } else if (status === FieldStatus.SINK) {
      console.log('zatopiony, koniec gonienia');
      this.chasing = false;
    }
  }

  private isSomethingInTheWay(x: number, y: number){
  return  x === 9 || this.enemyFields[y][x+1] !== FieldStatus.UNSHOOT;
  }

  private changeChasingDirection() {
    this.chasingLeft = true;
    this.lastHitCoord[0] = this.firstHitCoord[0];
    this.lastHitCoord[1] = this.firstHitCoord[1];
  }

  getTargetFiled(): number[] {
    if (this.chasing) {
      return this.chasingHitGenerator();
    } else {
      return this.randomHitGenerator();
    }
  }

  randomHitGenerator(): number[] {
    let x: number;
    let y: number;
    do {
      x = randomInt(0, 10);
      y = randomInt(0, 10);
    } while (this.enemyFields[y][x] !== FieldStatus.UNSHOOT);
    return [x, y];
  }

  chasingHitGenerator(): number[] {
    const modifier = this.chasingLeft ? -1 : 1;
    return [this.lastHitCoord[0] + modifier, this.lastHitCoord[1]];
  }
}

///////////////////////////// GAME //////////////////////////////////

class Game {
  private players: Player[] = [];
  private computer: Computer;
  private actual = 0; // 0,1

  constructor() {
    const human = new Human();
    this.players.push(human);
    this.computer = new Computer(human.getFields());
    this.players.push(this.computer);
  }

  getPlayer(type: string): Player {
    if (type === "human") {
      return this.players[0];
    } else {
      return this.players[1];
    }
  }

  shootField(x: number, y: number): FieldStatus {
    const player = this.getEnemy();
    if (!this.isAllowed(x, y)) {
      console.log('niedozwolony ruch!');
      console.log("pola w graczu0: ", this.players[0].getFields());
      console.log("pola w graczu1: ", this.players[1].getFields());
      shooting = false;

      return null;
    }
    const status = player.reactToHit(x, y);
    console.log("player nr:" + this.actual + " shoot field:" + x + " " + y);
    console.log("effect: " + status);
    if(this.actual ===1){
      this.computer.updateChasingState(x,y,status);
    }
    this.nextPlayer(status);
    this.toggleComputerMove();
    return status;
  }

  private toggleComputerMove() {
    if (this.actual !== 1) {
      shooting = false; // kompter pozwala graczowi znowu sie ruszac
      return;
    }
    setTimeout(()=> this.computerMove(),100); 
   
  }

  private computerMove(){
    let fieldIndex = this.computer.getTargetFiled();
    const x = fieldIndex[0];
    const y = fieldIndex[1];
    console.log('komuter chce strzelic w ',x,y);
    const status = this.shootField(x, y);
    showComputerShot(x, y, status);
    updateEndGame(0);
  
  }


  private nextPlayer(status: FieldStatus) {
    if (status !== FieldStatus.HIT && status !== FieldStatus.SINK) {
      this.actual = this.getOtherPlayerIndex();
    }
  }

  private isAllowed(x: number, y: number): boolean {
    return this.getEnemy().getFieldStatus(x, y) === FieldStatus.UNSHOOT;
  }

  public getActualIndex(): number {
    return this.actual;
  }

  private getActualPlayer(): Player {
    return this.players[this.actual];
  }

  private getEnemy(): Player {
    const index = this.getOtherPlayerIndex();
    return this.players[index];
  }

  private getOtherPlayerIndex(): number {
    return this.actual === 0 ? 1 : 0;
  }

  hasLost(playerIndex: number){
    return this.players[playerIndex].hasLost();
  }

  getPlayerByIndex(playerIndex: number): Player{
    return this.players[playerIndex];
  }

  getOtherPlayerByIndex(playerIndex: number): Player{
    return this.players[playerIndex === 0 ? 1 : 0];
  }
}

///////////////////////////// VIEW //////////////////////////////////

let game = new Game();
const human = game.getPlayer("human");
let playerBoard = document.getElementById("player-board");
let computerBoard = document.getElementById("computer-board");

function initView() {
  creatBoard("player", playerBoard);
  updatePlayerShipsCount();
  addPlayerFieldListeners();
}

function creatBoard(boardName: string, container: HTMLElement) {
  for (let i = 0; i < 100; i++) {
    let x = i % 10;
    let y = Math.floor(i / 10);

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
  let shipsCount = human.getShipsCount();

  for (let i = 0; i < shipsCount.length; i++) {
    document.getElementById("sc" + i).innerText = " " + shipsCount[i];
  }
}

function addPlayerFieldListeners() {
  let fields = playerBoard.children;
  for (let i = 0; i < fields.length; i++) {
    let box = fields[i];
    let x = i % 10;
    let y = Math.floor(i / 10);
  

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
  }
}

function showShip(boardName: string, x: number, y: number) {
  let mastsCount = human.getActualShip().masts;
  for (let i = 0; i < mastsCount; i++) {
    let box = getBoxByCoords(boardName, x + i, y);
    box.classList.add("pushed");
    box.classList.remove("unpushed");
  }
}

function getBoxByCoords(boardName: string, x: number, y: number) {
  return document.getElementById(boardName + "-x" + x + "y" + y);
}


let shooting = false;
function addComputerFieldListeners() {
 
  let fields = computerBoard.children;
  for (let i = 0; i < fields.length; i++) {
    let box = fields[i];
    let x = i % 10;
    let y = Math.floor(i / 10);

    box.addEventListener("click", function () {
      console.log('shooting',shooting);
      if(shooting===true){
        return;
      }
      shooting = true;
      const status = game.shootField(x, y);
      showPlayerShot(box, status);
      updateEndGame(1);
      setTimeout(()=> shooting = false, 10000);
    });
  }
}

function updateEndGame(enemyPlayerIndex: number){
  if(game.hasLost(enemyPlayerIndex )!== true){
     return;
  }
// tu wiemy ze przeciwnik przegral
  const winner = game.getPlayerByIndex(enemyPlayerIndex);
  const winnerMessage = 'Gra zakończona, ' +  winner.getName() + ' wygrał!';
  document.getElementById('results').innerText = winnerMessage;
  document.getElementById('game').innerHTML = "";
}

function showPlayerShot(box: Element, status: FieldStatus) {
  box.classList.remove("unpushed");
  setClassForHit(box, status);
}

function showComputerShot(x: number, y: number, status: FieldStatus) {
  const box = getBoxByCoords("player", x, y);
  box.classList.remove("unpushed");
  box.classList.remove("pushed");
  setClassForHit(box, status);
}

function setClassForHit(box: Element, status: FieldStatus) {
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


