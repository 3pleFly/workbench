class Piece {

    constructor(isWhite) {
        this.isWhite = isWhite;
    }

    isLegalMove(blacksTurn) {

    }

    isEmptySquare(location, board) {
        if (board[location.row][location.col].firstChild === null) {
            return true;
        }
        return false;
    }

    getLegalMoves(target, board, blacksTurn) {
        const row = target.parentNode.id[0];
        const col = target.parentNode.id[1];
        let location = new Location(row, col);
        let potential = location.clone();
        let secondPotential = location.clone();
        const legalMoves = [];

        if (blacksTurn) {
            potential.traverseUpRight();
            secondPotential.traverseUpLeft();
        } else {
            potential.traverseDownRight();
            secondPotential.traverseDownLeft();
        }
        while (!location.equals(potential)) {
            if (this.isEmptySquare(potential,board)) {
                legalMoves.push(potential)
                break;
            } else {
            }
        }

        if (!location.equals(secondPotential)) {
            if (this.isEmptySquare(secondPotential, board)) {
                legalMoves.push(secondPotential);
            } else {

            }
        }

        return legalMoves;
    }


    move(move, board) {
        let startingPiece = board[move.startingLocation.row][move.startingLocation.col].firstChild;
        board[move.startingLocation.row][move.startingLocation.col].removeChild(startingPiece);
        board[move.endingLocation.row][move.endingLocation.col].appendChild(startingPiece);
    }

}

class King extends Piece {

    constructor(isWhite) {
        super(isWhite);
    }
}

class Location {
    constructor(row, col) {
        this.row = parseInt(row);
        this.col = parseInt(col);
    }

    clone() {
        return new Location(this.row, this.col);
    }

    traverseUpRight() {
        if (this.col != 7 && this.row != 0) {
            this.row--;
            this.col++;
        }
        return this;
    }

    traverseDownRight() {
        if (this.col != 7 && this.row != 7) {
            this.row++;
            this.col++;
        }
        return this;

    }

    traverseUpLeft() {
        if (this.col != 0 && this.row != 0) {
            this.row--;
            this.col--;
        }
        return this;

    }

    traverseDownLeft() {
        if (this.col != 0 && this.row != 7) {
            this.row++;
            this.col--;
        }
        return this;

    }

    equals(location) {
        if (parseInt(location.row) === parseInt(this.row) && parseInt(location.col) === parseInt(this.col))
            return true;
        return false;
    }

    getLocationDifference(location) {
        let diff = new Location();
        diff.row = location.row - this.row;
        diff.col = location.col - this.col;
        return diff;
    }


}

class Move {

    constructor(startingLocation, endingLocation) {
        this.startingLocation = startingLocation;
        this.endingLocation = endingLocation;
    }


}

let board;
let blacksTurn = true;
let selectedPiece = null;
let potentialSquares = [];

const initializeBoard = function () {
    let tableDataArray = document.querySelectorAll("td");
    let pieces = document.querySelectorAll("span");
    board = create2DBoard(tableDataArray);
    createSquares(board);
    createPieces(pieces);
}

const removeSelection = function () {
    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            if (board[i][j].firstChild) {
                board[i][j].firstChild.classList.remove("scale");
            }
            board[i][j].classList.remove("selected");
        }
    }
    potentialSquares = [];
    selectedPiece = null;
}

const addSelection = function () {
    selectedPiece.classList.add("scale");
    selectedPiece.parentNode.classList.add("selected");
    let potentials = selectedPiece.value.getLegalMoves(selectedPiece, board, blacksTurn);
    selectPotentials(potentials);

}

const selectPiece = function (e) {
    if (selectedPiece != null) {
        removeSelection();
    }
    if (!isCorrectTurn(e.target)) {
        return;
    }
    selectedPiece = e.target;
    addSelection();
    e.stopPropagation();
}

const selectPotentials = function (locations) {
    for (const location of locations) {
        board[location.row][location.col].classList.add("selected");
        potentialSquares.push(location);
    }
}

const isCorrectTurn = function (target) {
    if (target.classList.contains("dark-piece") && blacksTurn) {
        return true;
    }
    if (target.classList.contains("white-piece") && !blacksTurn) {
        return true;
    }
    return false;
}

const createPieces = function (pieces) {
    for (let i = 0; i < 12; i++) {
        pieces[i].value = new Piece(true);
        pieces[i].classList.add("piece");
        pieces[i].classList.add("white-piece");
        pieces[i].addEventListener("click", selectPiece);
    }
    for (let i = 12; i < 24; i++) {
        pieces[i].value = new Piece(false);
        pieces[i].classList.add("piece");
        pieces[i].classList.add("dark-piece");
        pieces[i].addEventListener("click", selectPiece);
    }
}

const selectSquare = function (e) {
    if (selectedPiece) {
        let location = new Location(e.target.id[0], e.target.id[1]);
        if (potentialSquares != null) {
            for (const potent of potentialSquares) {
                if (location.equals(potent)) {
                    let startingLocation = new Location(selectedPiece.parentNode.id[0], selectedPiece.parentNode.id[1]);
                    let move = new Move(startingLocation, potent)
                    selectedPiece.value.move(move, board);
                    blacksTurn = !blacksTurn;
                    break;
                }
            }
        }

        removeSelection(selectedPiece);
    }
}

const createSquares = function () {
    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            if (j % 2 != i % 2) {
                board[i][j].classList.add("darkSquare");
            }
            board[i][j].addEventListener("click", selectSquare)
        }
    }
}

const create2DBoard = function (tableDataArr) {
    let twoDArray = new Array(8);
    let index = 0;
    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            twoDArray[i] = [];
        }
    }
    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            tableDataArr[index].id = i + '' + j;
            twoDArray[i][j] = tableDataArr[index];
            index++;
        }
    }
    return twoDArray;

}

