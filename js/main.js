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
  }
];

function loadMap() {
  /*
  var raw_symbol_index = {};
  for (var i = 0; i < TILES.length; i++) {
    var tile = TILES[i];
    raw_symbol_index[tile.raw_symbol] = i;
  }
  var raw_map = [
    "XXXXX...........................................................................",
    "X...X...........................................................................",
    "X...X...........................................................................",
    "X...X...........................................................................",
    "XXXXX...........................................................................",
    "................................................................................",
    "................................................................................",
    "................................................................................",
    "................................................................................",
    "................................................................................",
    "...................................XXXXX........................................",
    "...................................X...X........................................",
    "...................................X...X........................................",
    "...................................X...X........................................",
    "...................................XXXXX........................................",
    "................................................................................",
    "................................................................................",
    "................................................................................",
    "................................................................................",
    "................................................................................",
    "................................................................................",
    "................................................................................",
    "................................................................................",
    "................................................................................",
  ];
  var map = [];
  for (var y = 0; y < raw_map.length; y++) {
    var raw_line = raw_map[y];
    var line = [];
    for (var x = 0; x < raw_line.length; x++) {
      var raw_cell = raw_line[x];
      line.push(raw_symbol_index[raw_cell]);
    }
    map.push(line);
  }
  return map;
  */
}

function placeCharacter(map) {
  // In case the map generator doesn't always leave 1,1 empty.
  for (var x = 1; x < map.width; x++) {
    for (var y = 1; y < map.height; y++) {
      if (map.at(x, y).walkable) return {x: x, y: y};
    }
  }
}

var Map = function() {
  this.width = 60;
  this.height = 60;
  this.tiles = [];
  for (var x = 0; x < this.width; x++) {
    this.tiles[x] = [];
  }
  var generator = new ROT.Map.EllerMaze(this.width, this.height);
  generator.create(function(x, y, val) {
    this.tiles[x][y] = val;
  }.bind(this));
};

Map.prototype.at = function(x, y) {
  if (x < 0 || y < 0 || x >= this.width || y >= this.height) return null;
  return TILES[this.tiles[x][y]];
};

Map.prototype.seethrough = function(x, y) {
  var tile = this.at(x, y);
  if (!tile) return false;
  return tile.seethrough;
};

var Game = function() {
  this.display = new ROT.Display({width:50, height:50});
  var container = document.getElementById("container");
  container.appendChild(this.display.getContainer());
  this.map = new Map();
  this.fov_calculator = new ROT.FOV.PreciseShadowcasting(
      this.map.seethrough.bind(this.map));
  this.character = placeCharacter(this.map);
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

  var char_x = this.character.x;
  var char_y = this.character.y;
  var visible = {};
  this.fov_calculator.compute(char_x, char_y, 7, function(x, y, distance, visibility) {
    if (visibility >= 0.1) visible[[x, y]] = true;
  });

  // Always draw the character at the center.
  var center_x = this.display.getOptions().width / 2;
  var center_y = this.display.getOptions().height / 2;
  var offset_x = center_x - char_x;
  var offset_y = center_y - char_y;
  for (var x = 0; x < this.map.width; x++) {
    for (var y = 0; y < this.map.height; y++) {
      if (!visible[[x, y]]) continue;
      this.display.draw(
          x + offset_x, y + offset_y, this.map.at(x, y).display_symbol);
    }
  }
  this.display.draw(char_x + offset_x, char_y + offset_y, '@');
}


Game.prototype.handleMove = function(dx, dy) {
  var new_x = this.character.x + dx;
  var new_y = this.character.y + dy;
  if (!this.map.at(new_x, new_y).walkable) return;
  this.character.x = new_x;
  this.character.y = new_y;
  this.drawMap(this);
};

function main() {
  var game = new Game();
}
