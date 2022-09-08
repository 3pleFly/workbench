class Piece {

    eatingLocation = null;
    id = null;

    constructor(isWhite, id) {
        this.isWhite = isWhite;
        this.id = id;
    }
    isEmptySquare(location, board) {
        if (board[location.row][location.col].firstChild === null) {
            return true;
        }
        return false;
    }

    getLegalMoves(target, board, blacksTurn) {

    }

    traverse(potential, traverseCallback, blacksTurn, board) {
        let i = 0;
        while (i < 2) {
            potential = traverseCallback(potential);
            if (this.isEmptySquare(potential, board)) {
                return potential;
            } else if (this.isEnemyPiece(potential, board, blacksTurn)) {
                this.eatingLocation = potential;
                i++;
            } else {
                return null;
            }
        }
        return null;
    }

    isEnemyPiece(location, board, blacksTurn) {
        if (board[location.row][location.col].firstChild.value.isWhite === blacksTurn)
            return true;
        return false;
    }

    move(move, board, blacksTurn) {
        let startingPiece = board[move.startingLocation.row][move.startingLocation.col].firstChild;
        board[move.startingLocation.row][move.startingLocation.col].removeChild(startingPiece);
        board[move.endingLocation.row][move.endingLocation.col].appendChild(startingPiece);
        if (this.isJumpMove(move)) {
            this.eatInJump(move);
        }

    }

    isJumpMove(move) {
        let locationDiff = move.getMoveDifference();
        if (Math.abs(locationDiff.row) === 2)
            return true;
        return false;
    }

    eatInJump(move) {
        let locationDiff = move.getMoveDifference();
        let eatLocation = move.endingLocation.clone();
        if (locationDiff.row === 2) {
            eatLocation.row--;
        }
        if (locationDiff.row === -2) {
            eatLocation.row++;
        }
        if (locationDiff.col > 0) {
            eatLocation.col--;
        }
        if (locationDiff.col < 0) {
            eatLocation.col++;
        }
        let eatPiece = board[eatLocation.row][eatLocation.col].firstChild;
        board[eatLocation.row][eatLocation.col].removeChild(eatPiece);
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


    static getMoveDifference(location1, location2) {
        return new Location(location2.row - location1.row, location2.col - location1.col);
    }


    traverseUpRight(location) {
        if (location.col != 7 && location.row != 0) {
            location.row--;
            location.col++;
        }
    }

    traverseDownRight(location) {
        if (location.col != 7 && location.row != 7) {
            location.row++;
            location.col++;
        }
    }

    traverseUpLeft(location) {
        if (location.col != 0 && location.row != 0) {
            location.row--;
            location.col--;
        }
    }

    traverseDownLeft(location) {
        if (location.col != 0 && location.row != 7) {
            location.row++;
            location.col--;
        }
    }

    equals(location) {
        if (parseInt(location.row) === parseInt(this.row) && parseInt(location.col) === parseInt(this.col))
            return true;
        return false;
    }
}


class Checkers {

    constructor() {
        this.whitesTurn = false;
        this.board = new Board();
        this.selectedPiece = null;
        this.board.putPieces(this.selectPiece, this);
        this.board.initSquares(this.selectSquare, this);
    }

    selectPiece(game, event) {
        game.board.selectPiece(event, game.whitesTurn);
        game.selectedPiece = event.target;
        event.stopPropagation();
    }

    selectSquare(game, event) {
        if (game.board.select) {
            if (game.board.getPotentialMovesFromHighlights().includes(event.target)) {
                if (game.isJumpMove(event.target)) {
                    console.log('jump move not coded');
                }
                game.move(event.target);
                game.whitesTurn = !game.whitesTurn;
            }
        }
        game.deselect();
    }

    deselect() {
        this.board.removeHighlights();
        this.selectedPiece = null;
    }

    isJumpMove(target) {
        let targetLocation = this.createLocationFromSquare(target)
        let startingLocation = this.createLocationFromSquare(this.selectedPiece.parentNode);
        let diff = Location.getMoveDifference(startingLocation, targetLocation);
        if (Math.abs(diff.row) === 2) {
            return true;
        }
        return false;
    }

    isSquareEmpty(target) {
        let location = this.board.findSquare(target);
        return this.board.isEmptySquare(location);
    }

    move(target) {
        this.board.movePiece(this.selectedPiece, target);

    }

    eat(event) {

    }


    createLocationFromSquare(square) {
        for (let i = 0; i < this.board.squares.length; i++) {
            for (let j = 0; j < this.board.squares[i].length; j++) {
                if (this.board.squares[i][j] === square) {
                    return new Location(i, j);
                }
            }
        }
    }

}

class Board {

    squares;
    select = false;
    highlights = [];
    constructor() {
        this.initializeSquares();
    }

    initializeSquares() {
        this.createTableRows();
        this.createTableCells();
        this.updateSquares();
    }

    removeHighlights() {
        for (let index = 0; index < this.highlights.length; index++) {
            this.highlights[index].classList.remove("selected");
        }
        this.highlights = [];
        this.select = false;
    }

    getPotentialMovesFromHighlights() {
        let potentialMoves = [];
        for (let index = 1; index < this.highlights.length; index++) {
            potentialMoves.push(this.highlights[index]);
        }
        return potentialMoves;
    }



    movePiece(piece, target) {
        let starting = this.findSquare(piece.parentNode);
        let ending = this.findSquare(target);
        this.squares[starting.row][starting.col].removeChild(piece);
        this.squares[ending.row][ending.col].appendChild(piece);
        
    }

    getLegalMoves(location, whitesTurn) {
        let locations = [];
        let potential;
        if (whitesTurn) {
            potential = this.traverse(location.clone(), location.traverseDownRight, whitesTurn, this.squares);
            locations.push(potential);
            potential = this.traverse(location.clone(), location.traverseDownLeft, whitesTurn, this.squares);
            locations.push(potential);
        } else {
            potential = this.traverse(location.clone(), location.traverseUpRight, whitesTurn, this.squares);
            locations.push(potential);
            potential = this.traverse(location.clone(), location.traverseUpLeft, whitesTurn, this.squares);
            locations.push(potential);
        }

        return locations.filter(location => location !== null);
    }

    highlightOptions(location, whitesTurn) {
        this.squares[location.row][location.col].classList.add("selected");
        this.highlights.push(this.squares[location.row][location.col]);
        let legalMoves = this.getLegalMoves(location, whitesTurn);
        legalMoves.forEach(location => {
            this.squares[location.row][location.col].classList.add("selected");
            this.highlights.push(this.squares[location.row][location.col]);
        });
    }

    selectPiece(e, whitesTurn) {
        if (this.select) {
            this.removeHighlights();
        }

        if (e.target.classList.contains('white-piece') && !whitesTurn ||
            e.target.classList.contains('black-piece') && whitesTurn) {
            return;
        }

        this.highlightOptions(this.findSquare(e.target.parentNode), whitesTurn);
        this.select = true;
    }

    selectSquare(e) {
        if (this.select) {

        }

        this.removeHighlights();
    }

    findSquare(square) {
        for (let i = 0; i < this.squares.length; i++) {
            for (let j = 0; j < this.squares[i].length; j++) {
                if (this.squares[i][j] === square) {
                    return new Location(i, j);
                }
            }
        }
    }

    putPieces(selectPieceCb, game) {
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < this.squares[i].length; j++) {
                if (i % 2 !== j % 2) {
                    const span = document.createElement('span')
                    span.classList.add("piece")
                    span.classList.add("white-piece")
                    span.addEventListener("click", (e) => { selectPieceCb(game, e) });
                    this.squares[i][j].appendChild(span);
                }
            }
        }

        for (let i = 5; i < 8; i++) {
            for (let j = 0; j < this.squares[i].length; j++) {
                if (i % 2 !== j % 2) {
                    const span = document.createElement('span')
                    span.classList.add("piece")
                    span.classList.add("black-piece")
                    span.addEventListener("click", (e) => { selectPieceCb(game, e) });
                    this.squares[i][j].appendChild(span);
                }
            }
        }
    }

    initSquares(selectSquareCb, game) {
        for (let i = 0; i < this.squares.length; i++) {
            for (let j = 0; j < this.squares[i].length; j++) {
                if (i % 2 !== j % 2) {
                    this.squares[i][j].classList.add("darkSquare");
                }
                this.squares[i][j].addEventListener("click", (e) => { selectSquareCb(game, e) });
            }
        }
    }


    isEmptySquare(location) {
        if (this.squares[location.row][location.col].children.length === 0) {
            return true;
        }
        return false;
    }

    isEnemyPiece(location, whitesTurn) {
        if (this.squares[location.row][location.col].children[0].classList.contains('white-piece') && !whitesTurn ||
            this.squares[location.row][location.col].children[0].classList.contains('black-piece') && whitesTurn) {
            return true;
        }
        return false;
    }

    traverse(location, traverseCallback, whitesTurn) {
        let copy = location.clone();
        let i = 0;
        while (i < 2) {
            traverseCallback(location);
            if (copy.equals(location)) {
                return null;
            }
            if (this.isEmptySquare(location)) {
                return location;
            } else if (this.isEnemyPiece(location, whitesTurn)) {
                i++;
            } else {
                return null;
            }
        }
        return null;
    }


    updateSquares() {
        this.squares = [];
        for (let i = 0; i < 8; i++) {
            this.squares[i] = [];
            for (let j = 0; j < 8; j++) {
                this.squares[i][j] = document.getElementsByTagName("table")[0].children[0].children[i].children[j];
            }
        }
    }

    createTableCells() {
        let rows = document.getElementsByTagName("tr");
        for (let i = 0; i < rows.length; i++) {
            for (let j = 0; j < 8; j++) {
                rows[i].insertCell();
            }
        }
    }

    createTableRows() {
        let table = document.getElementsByTagName("table")[0];
        for (let index = 0; index < 8; index++) {
            table.insertRow();
        }
    }

}


const play = function () {
    new Checkers();

}




