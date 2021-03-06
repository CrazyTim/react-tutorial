export default function checkWin(squares, numRows, numCols, cell, numCellsInALineToWin) {
  // look in all directions around this cell to see if the player has won

  if (squares[cell] === null) return [];

  // define x/y steps for each direction we need to search
  const directions = [
    {name:'n',  xStep:0,  yStep:-1},
    {name:'ne', xStep:1,  yStep:-1},
    {name:'e',  xStep:1,  yStep:0},
    {name:'se', xStep:1,  yStep:1},
    {name:'s',  xStep:0,  yStep:1},
    {name:'sw', xStep:-1, yStep:1},
    {name:'w',  xStep:-1, yStep:0},
    {name:'nw', xStep:-1, yStep:-1},
  ];

  // check in each direction for a match
  for (let i=0; i<directions.length; i++) {

    const winningSquares = check(
      squares,
      numRows,
      numCols,
      cell,
      directions[i].xStep,
      directions[i].yStep,
      numCellsInALineToWin);

    if (winningSquares.length === numCellsInALineToWin) return winningSquares; // match found

  }

  return []; // no matches found

}

function check(squares, numRows, numCols, cell, xStep, yStep, numCellsInALineToWin) {
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
  for (let i=0; i<(numCellsInALineToWin-1); i++) {

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
