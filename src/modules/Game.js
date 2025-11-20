// src/modules/Game.js
import { Mole } from './Mole.js';
// Centrera eventhantering via delegering på brädet (se vecko-materialet om
// addEventListener & bubbling).
// TODO-markeringar lämnar utrymme för egna lösningar.
export class Game {
    constructor({ boardEl, scoreEl, timeEl, missesEl }) {
    this.boardEl = boardEl;
    this.scoreEl = scoreEl;
    this.timeEl = timeEl;
    this.missesEl = missesEl;
    this.gridSize = 3;
    this.duration = 60; // sekunder
    this.state = { score: 0, misses: 0, timeLeft: this.duration, running:
    false };
    this._tickId = null;
    this._spawnId = null;
    this._activeMoles = new Set();
    this.handleBoardClick = this.handleBoardClick.bind(this);
    }
init() {
    this.createGrid(this.gridSize);
    this.updateHud();
    // Eventdelegering: en lyssnare hanterar alla barn-noder.
    this.boardEl.addEventListener('click', this.handleBoardClick);
    this.boardEl.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') this.handleBoardClick(e);
    });
    }
createGrid(size = 3) {
    this.boardEl.innerHTML = '';
    for (let i = 0; i < size * size; i++) {
    const cell = document.createElement('button');
    cell.type = 'button';
    cell.className = 'cell';
    cell.setAttribute('aria-label', `Hål ${i + 1}`);
    this.boardEl.appendChild(cell);
    }
    }
start() {
    if (this.state.running) return;
    this.state.running = true;

    // Reset stats
    this.state.score = 0;
    this.state.misses = 0;
    this.state.timeLeft = this.duration;
    this.updateHud();

    // TIMER - räknar ner 1 gång per sekund
    this._tickId = setInterval(() => {
    this.state.timeLeft--;
    this.updateHud();

    if (this.state.timeLeft <= 0) {
    this.stopGame();
    }
    }, 1000);

    // SPAWN-LOOP - skapa mullvad var 1s (kan justeras senare)
    this._spawnId = setInterval(() => {
        this.spawnMole();
    }, 1000);
    }
stopGame() {
    this.state.running = false;

    // Stoppa timers
    clearInterval(this._tickId);
    clearInterval(this._spawnId);

    // Ta bort alla mullvadar
    for (const mole of this._activeMoles) {
        mole.disappear();
    }
    this._activeMoles.clear();
    }
spawnMole() {
    // Hitta celler utan mullvad
    const emptyCells = [...this.boardEl.querySelectorAll('.cell:not(.has-mole)')];
    if (emptyCells.length === 0) return; // Alla är upptagna, gör inget

    // Välj slumpmässig cell
    const cell = emptyCells[Math.floor(Math.random() * emptyCells.length)];

    // Skapa en mullvad med TTL (t.ex. 900ms)
    const mole = new Mole(cell, 900);

    this._activeMoles.add(mole);

    // Starta mullvaden och ta bort den från Set när den försvinner
    mole.appear(() => {
        this._activeMoles.delete(mole);
        // Hit kan vi senare lägga miss-logik om spelaren inte klickade!
    });
    }
handleBoardClick(e) {
    const cell = e.target.closest('.cell');
    if (!cell || !this.state.running) return;

    // TRAFF
    if (cell.classList.contains('has-mole')) {
    // hitta aktiv mullvad-objektet för denna cell
    const mole = [...this._activeMoles].find(m => m.cellEl === cell);
    if (mole) {
      mole.disappear();
      this._activeMoles.delete(mole);
    }
    this.state.score++;
    } 
    // MISS
    else {
        this.state.misses++;
    }
    this.updateHud();
    }
updateHud() {
    this.scoreEl.textContent = `Poäng: ${this.state.score}`;
    this.timeEl.textContent = `Tid: ${this.state.timeLeft}`;
    this.missesEl.textContent = `Missar: ${this.state.misses}`;
    }
reset() {
    // Stoppa pågående spel
    this.stopGame();

    // Nollställ state
    this.state.score = 0;
    this.state.misses = 0;
    this.state.timeLeft = this.duration;
    this.state.running = false;

    // Uppdatera HUD
    this.updateHud();
    }
}
