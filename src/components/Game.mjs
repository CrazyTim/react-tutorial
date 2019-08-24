import React from 'react';

import {clone} from './../util/util.mjs'
import Board from './Board.mjs';
import Button from './Button.mjs';
import Scoreboard from './Scoreboard.mjs';
import './Game.css';

export default class Game extends React.Component {

  constructor(props) {

    super(props);

    const numRows = 3;
    const numCols = 3;

    this.defaultState = {
      turns: [{
        squares: Array(numRows * numCols).fill(null),
      }],
      currentTurn: 0,
      xIsNext: true,
      winner: null,
      winningSquares: [],
      draw: false,
    };

    this.state = {
      settings: {
        numRows: numRows,
        numCols: numCols,
        numCellsInALineToWin: 3,
      },
      score: {
        'X':0, 
        'O':0,
      },
      ...this.defaultState,
    };

  }

  resetBoard() {
    this.setState( clone(this.defaultState) );
  }

  getTurns() {
    return this.state.turns.slice(0, this.state.currentTurn + 1);
  }

  undo(step) {

    const currentTurn = this.state.currentTurn - step;
    const score = clone(this.state.score);

    if (currentTurn < 0) return; // can't go back any further

    if (this.state.winner) {
      score[this.state.winner] -= 1;
    }

    this.setState({
      score: score,
      currentTurn: currentTurn,
      xIsNext: (currentTurn % 2) === 0,
      winner: null,
      winningSquares: [],
      draw: false,
    });

  }

  handleClick(i) {

    const prevTurns = this.getTurns()
    const squares = clone(prevTurns[this.state.currentTurn].squares);

    // ignore a click if there is a winner or if this square has already been filled
    if (this.state.winner || squares[i]) {
      return;
    }

    squares[i] = this.state.xIsNext ? 'X' : 'O';

    // check for a winner
    let score = clone(this.state.score);
    let winner = null;
    let winningSquares;
    for (let i = 0; i < squares.length - 1; i++) {

      winningSquares = this.checkWin(squares, this.state.settings.numRows, this.state.settings.numCols, i, this.state.settings.numCellsInALineToWin);
      
      if (winningSquares.length === this.state.settings.numCellsInALineToWin) {
        winner = squares[i];
        score[winner] +=1;
        break;
      }

    }

    // check for draw
    let draw = false;
    if (!winner) {
      draw = squares.every((i) => {return i != null});
    }

    const turns = prevTurns.concat([{
        squares: squares,
      }])

    const currentTurn = this.state.currentTurn + 1;

    this.setState({
      turns: turns,
      currentTurn: currentTurn,
      xIsNext: !this.state.xIsNext,
      winner: winner,
      winningSquares: winningSquares,
      draw: draw,
      score: score,
    });

  }

  render() {

    let status;
    if (this.state.draw) {
      status = 'This game is a draw!';
    } else if (this.state.winner){
      status = 'Player ' + this.state.winner + ' has won!';
    } else {
      status = 'Player ' + (this.state.xIsNext ? 'X' : 'O') + '\'s turn';
    }

    return (
      <div className='game-wrapper'>
        <div className='game'>

          <Scoreboard
            score={this.state.score}
          />

          <Board 
            squares={this.getTurns()[this.state.currentTurn].squares}
            onClick={(i) => this.handleClick(i)}
            winningSquares={this.state.winningSquares}
            numRows={this.state.settings.numRows}
            numCols={this.state.settings.numCols}
            score={this.state.score}
          />

          <div className='status'>{status}</div>

          <Button 
            value='Undo' 
            className='btn-undo'
            onClick={() => this.undo(1)}
            hidden={this.state.currentTurn === 0}
          />

          <Button 
            value='Play Again' 
            className='btn-play-again'
            onClick={() => this.resetBoard()}
            hidden={!(this.state.winner || this.state.draw)}
          />

        </div> 
      </div>
    );
    
  }

  checkWin(squares, numRows, numCols, cell, numCellsInALineToWin) {
    // look in all directions around this cell to see if the player has won

    if (squares[cell] === null) return [];

    // define x/y steps for each direction we need to search
    const directions = [
      ['n ', 0,-1],
      ['ne', 1,-1],
      ['e ', 1, 0],
      ['se', 1, 1],
      ['s ', 0, 1],
      ['sw',-1, 1],
      ['w ',-1, 0],
      ['nw',-1,-1],
    ];

    // check in each direction for a match
    for (let i = 0; i < directions.length; i++) {
      const xStep = directions[i][1];
      const yStep = directions[i][2];
      const winningSquares = this.check(squares, numRows, numCols, cell, xStep, yStep, numCellsInALineToWin);
      if (winningSquares.length === numCellsInALineToWin) return winningSquares; // match found
    }

    return []; // no matches found
    
  }

  check(squares, numRows, numCols, cell, xStep, yStep, numCellsInALineToWin) {
    // look in one direction, starting from cell, and staying within the bounds of the grid
    // checking if every value is equal to the value in cell
    // returns an array of the cells that match.
    // ASSUMPTION: cell is correct, and fits inside the number of rows and cols

    // check if only looking for one match lol
    if (numCellsInALineToWin === 1) return [cell];

    // check if we would extend beyond the grid on x-axis
    const thisCol = cell % numCols; // index
    const lookAheadCol = thisCol + (xStep * (numCellsInALineToWin - 1));
    if (lookAheadCol > (numCols-1) || lookAheadCol < 0) return [];
    
    // check if we would extend beyond the grid on y-axis
    const thisRow = Math.floor(cell / numRows); // index
    const lookAheadRow = thisRow + (yStep * (numCellsInALineToWin - 1));
    if (lookAheadRow > (numRows-1) || lookAheadRow < 0) return [];

    const found = [cell]; // array to store the matches
    let thisCell = cell;
    for (let i = 0; i < (numCellsInALineToWin - 1); i++) {

      // calc index of next cell we need to check
      thisCell += (xStep * 1) + (yStep * numCols);
      if (squares[thisCell] === squares[cell]) {
        found.push(thisCell);
      } else {
        return [];
      }
      
    }
    
    return found;

  }

}
