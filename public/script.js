// Connect to the Socket.IO server
const socket = io();

// Get the board container elements from the DOM
const ownBoard = document.getElementById("own_board");
const enemyBoard = document.getElementById("enemy_board");

/**
 * createBoard(container, prefix, isClickable)
 * - container: DOM element to contain the board.
 * - prefix: used for creating unique cell IDs ("own" or "enemy").
 * - isClickable: when true, attaches click events to each cell.
 */
function createBoard(container, prefix, isClickable = false) {
  const table = document.createElement("table");
  for (let i = 0; i < 10; i++) {
    const tr = document.createElement("tr");
    for (let j = 0; j < 10; j++) {
      const td = document.createElement("td");
      // Assign a unique ID to each cell based on its coordinates.
      td.id = `${prefix}-cell-${i}-${j}`;

      // If the board should respond to clicks, add a click listener.
      if (isClickable) {
        td.addEventListener("click", function () {
          // Create an object with the cell's coordinates.
          const cellCoords = { row: i, col: j };

          // Emit the 'clicked' event with the cell's coordinates.
          socket.emit("clicked", cellCoords);

          // Optionally, update your UI immediately.
          toggleCellAppearance(this);
        });
      }
      tr.appendChild(td);
    }
    table.appendChild(tr);
  }
  container.appendChild(table);
}

// Create your own board (non-clickable) and the enemy board (click-enabled).
createBoard(ownBoard, "own", false);
createBoard(enemyBoard, "enemy", true);

/**
 * toggleCellAppearance(element)
 * Toggles the background color of the provided cell.
 */
function toggleCellAppearance(element) {
  if (element.style.backgroundColor === "green") {
    element.style.backgroundColor = "";
  } else {
    element.style.backgroundColor = "green";
  }
}

// Listen for the 'change' event from the server.
// When received, update the corresponding cell on the enemy board.
socket.on("change", (cellCoords) => {
  const { row, col } = cellCoords;
  const cellId = `enemy-cell-${row}-${col}`;
  const targetCell = document.getElementById(cellId);
  if (targetCell) {
    toggleCellAppearance(targetCell);
  }
});
