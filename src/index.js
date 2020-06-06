import React from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from "react-router-dom";
import ReactDOM from 'react-dom';
import './index.css';

//Single game piece
function Piece(props) {
  return (
    <button className="piece" onClick={props.onClick}>
    </button>
  );
}

//Game board
class Board extends React.Component {
  renderPiece(i) {
    return (
      <Piece
        value={this.props.pieces[i]}
        onClick={() => this.props.onClick(i)}
      />
    );
  }

  renderRow(i) {
    var j;
    const items = [];
    for (j = 0; j < this.props.pieces[i]; j++) {
      let obj = this.renderPiece(i);
      items.push(obj);
    }
    if (this.props.selectedRow == i) {
      return (
        <div className="selected-row">
          {items}
        </div>
      )
    }
    return (
      <div className="board-row">
        {items}
      </div>
    );
  }

  render() {
    var i;
    const items = [];
    for (i = 1; i < this.props.rows; i++) {
      let obj = this.renderRow(i);
      items.push(obj);
    }
    return (
      <div>
        {items}
      </div>
    );
  }
}

//Game
class Game extends React.Component {
  constructor(props) {
    super(props);
    this.rows = props.rows;
    this.sum = 0;
    const initial = [];
    var i;
    for (i = 0; i < props.rows; i++) {
      initial.push(i);
      this.sum += i;
    }
    this.state = {
      pieces: initial,
      p1Turn: true,
      selectedRow: -1
    };
  }

  //Handle click on piece
  handleClick(i) {
    if (this.state.selectedRow == -1) {
      this.state.pieces.splice(i, 1, this.state.pieces[i] - 1);
      this.sum = this.sum - 1;
      this.setState({
        selectedRow: i
      });
    } else if (this.state.selectedRow == i) {
      this.state.pieces.splice(i, 1, this.state.pieces[i] - 1);
      this.sum = this.sum - 1;
      this.setState({
        p1Turn: this.state.p1Turn
      });
    }
  }

  endTurn() {
    if (this.state.selectedRow != -1 && this.sum > 0) {
      this.setState({
        p1Turn: !this.state.p1Turn,
        selectedRow: -1
      });
      this.AImove();
    }
  }

  AImove() {
    var nimsum = 0;
    this.state.pieces.forEach(count => nimsum += parseInt(count.toString(2)));
    var stringsum = nimsum.toString();
    var listsum = stringsum.split('').map(Number);
    var mismatch = [];
    var sum = 0;
    var i;
    var j;
    //get powers of two which are unpaired
    for (i = 0; i < listsum.length; i++) {
      if (listsum[i] % 2 != 0) {
        mismatch.push(Math.pow(2, listsum.length - 1 - i));
        sum += Math.pow(2, listsum.length - 1 - i);
      }
    }
    var index = this.state.pieces.findIndex(count => count == sum);

    if (mismatch.length == 0) {
      //if numsum is 0, just take one piece
      this.sum -= 1;
      index = this.state.pieces.findIndex(count => count > 0);
      this.state.pieces.splice(index, 1, this.state.pieces[index] - 1);
    } else if (index != -1) {
      //if a row has the same number of pieces as the nimsum, take it
      this.sum -= sum;
      this.state.pieces.splice(index, 1, this.state.pieces[index] - sum);
    } else {
      //remove paired powers of two
      var piecesCopy = [...this.state.pieces];
      for (i = 8; i > mismatch[0]; i = i / 2) {
        for (j = 0; j < piecesCopy.length; j++) {
          if (piecesCopy[j] >= i) {
            piecesCopy[j] -= i;
          }
        }
      }

      //get the highest value from piecesCopy, then take from that pile
      var max = Math.max.apply(null, piecesCopy);
      index = piecesCopy.findIndex(count => count == max);

      var selectionCount = parseInt(this.state.pieces[index].toString(2)).toString();
      var selectionList = selectionCount.split('').map(Number);
      var selection = [];
      var taking = 0;

      for (i = 0; i < selectionList.length; i++) {
        if (selectionList[i] != 0) {
          selection.push(Math.pow(2, selectionList.length - 1 - i));
        }
      }

      //reverse value for each power of two that is unpaired
      for (i = 0; i < mismatch.length; i++) {
        if (selection.includes(mismatch[i])) {
          taking += mismatch[i];
        } else {
          taking -= mismatch[i];
        }
      }

      this.sum -= taking;
      this.state.pieces.splice(index, 1, this.state.pieces[index] - taking);
    }

    this.setState({
      p1Turn: true,
      selectedRow: -1
    });
    if (this.sum == 0) {
      this.setState({
        p1Turn: false,
        selectedRow: -1
      });
    }
  }

  reset() {
    const initial = [];
    var i;
    this.sum = 0;
    for (i = 0; i < this.rows; i++) {
      initial.push(i);
      this.sum += i;
    }
    this.setState({
      pieces: initial,
      p1Turn: true,
      selectedRow: -1
    });
  }

  render() {
    var text = "O's Turn";
    if (this.state.p1Turn) {
      text = "X's Turn";
    }
    if (this.sum == 0) {
      if (this.state.p1Turn) {
        text = "X has won!";
      } else {
        text = "O has won!";
      }
    }
    return (
      <div className="game">
        {text}
        <br></br>
        <button onClick={() => this.endTurn()}>End Turn</button>
        <br></br>
        <br></br>
        <div className="game-board">
          <Board
            pieces = {this.state.pieces}
            rows = {this.rows}
            onClick = {i => this.handleClick(i)}
            selectedRow = {this.state.selectedRow}
          />
        </div>
        <button onClick={() => this.reset()}>Reset Game</button>
      </div>
    );
  }
}

export default function App() {
  return (
    <Router>
      <div>
        <nav>
          <Link to="/" className="links">Settings</Link>
          <Link to="/rules" className="links">Rules</Link>
          <Link to="/play" className="links">Play</Link>
        </nav>

        <Switch>
          <Route path="/rules">
            <Rules />
          </Route>
          <Route path="/play">
            <Play />
          </Route>
          <Route path="/">
            <Settings />
          </Route>
        </Switch>
      </div>
    </Router>
  );
}

function Settings() {
  var url = window.location.pathname;
  return (
    <div className="centerDiv">
      <h2>Welcome!</h2>
      <p>{url}</p>
    </div>
  );
}

function Rules() {
  return (
    <div className="centerDiv">
      <h2>About Nim</h2>
      <p>Nim is a very simple strategy game which has existed for centuries. The game is set up by placing pieces into different groups. Typically these pieces are arranged as a pyramid, with each row forming a distinct group. 
      Two players then take turns removing pieces. Each player must remove at least one piece, and can remove more if they would like, but all removed pieces must come from the same row.</p>
      <p>Nim is typically played as a misere game, where the player who takes the last piece loses. But for this game, <nobr className="inbold">the objective is to take the last piece</nobr>. 
      There is a clever mathematical solution that can guarantee victory (provided you have the turn advantage), see if you can figure it out!</p>
    </div>
  );
}

function Play() {
  var num = 8;
  return <Game
    rows = {num - 1}
  />;
}

ReactDOM.render(<App />, document.getElementById('root'));