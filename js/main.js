var TILES = [
  {
    raw_symbol: ".",
    display_symbol: ".",
    walkable: true,
    seethrough: true
  },
  {
    raw_symbol: "X",
    display_symbol: "X",
    walkable: false,
    seethrough: false
  },
  {
    raw_symbol: "L",
    display_symbol: "!",
    walkable: true,
    seethrough: true
  }
];
var TILE_INDEX = {};
for (var i = 0; i < TILES.length; i++) {
  var tile = TILES[i];
  TILE_INDEX[tile.raw_symbol] = i;
}

var Map = function() {
  var raw_map = [
    "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
    "X                  L                                               L                                               L                  X",
    "X                                                                                                                                     X",
    "X                                                                                                                                     X",
    "X                                                                                                                                     X",
    "X                                                                                                                                     X",
    "X                                                                                                                                     X",
    "X          ...   ...                                                                                                                  X",
    "X          .X.   .X.......                            X   X                         XXXXXX                              XXX           X",
    "X          .X.   .X..XXXX..XXXXX  XXXXX  XX  XX      XX   X    X  XXXXX X    X      X     X   XX   X    X X        XX   XXX           X",
    "X          .X.....X.XX  XX.X   XX X   XX  XXXX      X X   X    X    X   X    X      X     X  X  X  X    X X       X  X  XXX           X",
    "XS         .XXXXXXX.X    X.X   XX X   XX   XX         X   X    X    X   XXXXXX      XXXXXX  X    X X    X X      X    X  X            X",
    "X          .X.....X.XXXXXX.XXXXX  XXXXX    XX         X   XXXXXXX   X   X    X      X       XXXXXX X    X X      XXXXXX               X",
    "X          .X.   .X.X....X.X      X        XX         X        X    X   X    X      X       X    X X    X X      X    X XXX           X",
    "X          .X.   .X.X.  .X.X      X        XX       XXXXX      X    X   X    X      X       X    X  XXXX  XXXXXX X    X XXX           X",
    "X          ...   .....  ...                                                                                                           X",
    "X                                                                                                                                     X",
    "X                                                                                                                                     X",
    "X                                                                                                                                     X",
    "X                                                                                                                                     X",
    "X                                                                                                                                     X",
    "X                  L                                               L                                               L                  X",
    "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  ];
  this.width = raw_map[0].length;
  this.height = raw_map.length;
  this.lights = {};
  this.tiles = [];
  for (var x = 0; x < this.width; x++) {
    this.tiles[x] = [];
    for (var y = 0; y < this.height; y++) {
      var symbol = raw_map[y][x];
      switch (symbol) {
        case 'S':
          this.character = {x: x, y: y};
          this.tiles[x][y] = TILE_INDEX['.'];
          break;
        case 'L':
          this.lights[[x, y]] = true;
          this.tiles[x][y] = TILE_INDEX[symbol];
          break;
        case ' ':
          this.tiles[x][y] = -1;
          break;
        default:
          this.tiles[x][y] = TILE_INDEX[symbol];
          break;
      }
    }
  }
  this.fillMaze();
};

Map.prototype.isUnfilled = function(x, y) {
  return this.isValid(x - 1, y - 1) && !this.at(x, y);
}

Map.prototype.getUnfilledDirections = function(x, y) {
  var dirs = [];
  if (this.isUnfilled(x - 1, y)) {
    dirs.push({x: -1, y: 0});
  }
  if (this.isUnfilled(x + 1, y)) {
    dirs.push({x: 1, y: 0});
  }
  if (this.isUnfilled(x, y - 1)) {
    dirs.push({x: 0, y: -1});
  }
  if (this.isUnfilled(x, y + 1)) {
    dirs.push({x: 0, y: 1});
  }
  return dirs;
}

function getSides(x, y) {
  if (x) return [{x: 0, y: -1}, {x: 0, y: 1}, {x: x, y: -1}, {x: x, y: 1}];
  if (y) return [{x: -1, y: 0}, {x: 1, y: 0}, {x: -1, y: y}, {x: 1, y: y}];
  throw "Invalid directions " + x + "," + y;
}

Map.prototype.fillMaze = function() {
  var stack = [];
  var pos = this.character;
  while (pos) {
    var dirs = this.getUnfilledDirections(pos.x, pos.y);
    if (dirs.length == 0) {
      pos = stack.pop();
      continue;
    }
    if (dirs.length > 1) {
      stack.push(pos);
    }
    var next_dir = dirs[Math.floor(Math.random() * dirs.length)];
    this.tiles[pos.x + next_dir.x][pos.y + next_dir.y] = TILE_INDEX['.'];
    var next = {x: pos.x + 2 * next_dir.x, y: pos.y + 2 * next_dir.y};
    if (this.isUnfilled(next.x, next.y)) this.tiles[next.x][next.y] = TILE_INDEX['.'];
    getSides(next_dir.x, next_dir.y).forEach(function(diagonal) {
      var x = pos.x + diagonal.x;
      var y = pos.y + diagonal.y;
      if (this.isUnfilled(x, y)) this.tiles[x][y] = TILE_INDEX['X'];
    }.bind(this));
    pos = next;
  }
  // Fill any remaining tiles.
  for (var x = 0; x < this.width; x++) {
    for (var y = 0; y < this.height; y++) {
      if (this.tiles[x][y] == -1) this.tiles[x][y] = TILE_INDEX['.'];
    }
  }
}

Map.prototype.isValid = function(x, y) {
  return x >= 0 && y >= 0 && x < this.width && y < this.height;
}

Map.prototype.at = function(x, y) {
  if (!this.isValid(x, y)) return null;
  return TILES[this.tiles[x][y]];
};

Map.prototype.seethrough = function(x, y) {
  var tile = this.at(x, y);
  if (!tile) return false;
  return tile.seethrough;
};

var Game = function() {
  this.map = new Map();
  this.display = new ROT.Display({width: this.map.width, height: this.map.height});
  var container = document.getElementById("container");
  container.appendChild(this.display.getContainer());
  this.fov_calculator = new ROT.FOV.PreciseShadowcasting(
      this.map.seethrough.bind(this.map));
  this.registerListeners();
  this.drawMap();
};

Game.prototype.registerListeners = function() {
  window.onkeydown = function(evt) {
    switch (evt.keyCode) {
      case ROT.VK_LEFT:
        this.handleMove(-1, 0);
        break;
      case ROT.VK_RIGHT:
        this.handleMove(1, 0);
        break;
      case ROT.VK_UP:
        this.handleMove(0, -1);
        break;
      case ROT.VK_DOWN:
        this.handleMove(0, 1);
        break;
    }
  }.bind(this);
};

Game.prototype.drawMap = function() {
  this.display.clear();

  var char_x = this.map.character.x;
  var char_y = this.map.character.y;
  var visible = {};
  this.fov_calculator.compute(char_x, char_y, 7, function(x, y, distance, visibility) {
    if (visibility >= 0.1) visible[[x, y]] = true;
  });

  for (var x = 0; x < this.map.width; x++) {
    for (var y = 0; y < this.map.height; y++) {
      if (!visible[[x, y]]) continue;
      var tile = this.map.at(x, y);
      this.display.draw(
          x, y, tile ? tile.display_symbol : '?');
    }
  }
  this.display.draw(char_x, char_y, '@');
}


Game.prototype.handleMove = function(dx, dy) {
  var new_x = this.map.character.x + dx;
  var new_y = this.map.character.y + dy;
  if (!this.map.at(new_x, new_y).walkable) return;
  this.map.character.x = new_x;
  this.map.character.y = new_y;
  this.drawMap(this);
};

function main() {
  var game = new Game();
}
