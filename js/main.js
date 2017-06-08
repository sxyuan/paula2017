var TEXT_DISPLAY_LINES = 3;

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
  },
  {
    raw_symbol: "M",
    display_symbol: "X",
    walkable: false,
    seethrough: false
  },
];
var TILE_INDEX = {};
for (var i = 0; i < TILES.length; i++) {
  var tile = TILES[i];
  TILE_INDEX[tile.raw_symbol] = i;
}

var LIGHT_RADIUS = 9;

var Map = function() {
  var raw_map = [
    "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
    "X                                                                                                                                     X",
    "X                                                                                                                                     X",
    "X                                                                                                                                     X",
    "X                                                                                                                                     X",
    "X                                                                                                                                     X",
    "X                                                                                                                                     X",
    "X                                                                                                                                     X",
    "X                                                                                                                                     X",
    "X                                                                                                                                     X",
    "X                                                                                                                                     X",
    "X                                                                                                                                     X",
    "X           X     X.......              ........      X   X   .........     ...     XXXXXX  ..         ..               XXX.          X",
    "X           X     X..XXXXL.XXXXX  XXXXX .XX..XX.     XX   X   .X..XXXXX X   .XL     X     X.LXXXX  X   LX X       XXXX  XXXL          X",
    "X           X     X.XX  XX.X   XX X   XX..XXXX..    XLX   X  ..X....X.  X....X.     X     X.XX  XX X   .X X      XX  XX XXX.          X",
    "XS          XXXXXXX.X    X.X   XX X   XX ..XXL.     ..X   X  .LX.  .X.  XXXXXX.     XXXXXX .X    X X    X X      X    X  X            X",
    "X           X.....X.XXXXXX.XXXXX. XXXXX   .XX.        X   XXXXXXX  .X.  X    X.     X       XXXXXX X    X X      XXXXXX               X",
    "X           X.   LX.X....X.X..... XL.     .XX.        X        X   .X.  X    X.    .X       X    X X    X X      X.   X XXX           X",
    "X           X.   .X.X.  .X.X.    .X..     .XX.      XXXXX      X   .XL  X    X.    LX       X    X LXXXX  XXXXXX XL   X XXX           X",
    "X                .....  .....    ...      ....                     ...      ...    ..              ...           ..                   X",
    "X                                                                                                                                     X",
    "X                                                                                                                                     X",
    "X                                                                                                                                     X",
    "X                                                                                                                                     X",
    "X                                                                                                                                     X",
    "X                                                                                                                                     X",
    "X                                                                                                                                     X",
    "X                                                                                                                                     X",
    "X                                                                                                                                     X",
    "X                                                                                                                                     X",
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
          this.setTile(x, y, TILE_INDEX['.']);
          break;
        case 'L':
          this.lights[[x, y]] = [x, y];
          this.setTile(x, y, TILE_INDEX[symbol]);
          break;
        case ' ':
          this.setTile(x, y, -1);
          break;
        default:
          this.setTile(x, y, TILE_INDEX[symbol]);
          break;
      }
    }
  }
  this.fillMaze();
};

Map.prototype.setTile = function(x, y, type) {
  this.tiles[x][y] = type;
}

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
    this.setTile(pos.x + next_dir.x, pos.y + next_dir.y, TILE_INDEX['.']);
    var next = {x: pos.x + 2 * next_dir.x, y: pos.y + 2 * next_dir.y};
    if (this.isUnfilled(next.x, next.y)) this.setTile(next.x, next.y, TILE_INDEX['.']);
    getSides(next_dir.x, next_dir.y).forEach(function(diagonal) {
      var x = pos.x + diagonal.x;
      var y = pos.y + diagonal.y;
      if (this.isUnfilled(x, y)) this.setTile(x, y, TILE_INDEX['M']);
    }.bind(this));
    pos = next;
  }
  // Fill any remaining tiles.
  for (var x = 0; x < this.width; x++) {
    for (var y = 0; y < this.height; y++) {
      if (this.tiles[x][y] == -1) this.setTile(x, y, TILE_INDEX['.']);
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

Map.prototype.isOnLight = function(x, y) {
  return this.at(this.character.x, this.character.y) == TILES[TILE_INDEX["L"]];
};

Map.prototype.numLights = function() {
  return Object.keys(this.lights).length;
};

var TextLine = function(text) {
  this.text = text;
  this.color = [255, 255, 255];
  this.opacity = 1.0;
};

TextLine.prototype.getColor = function() {
  return ROT.Color.interpolate([0, 0, 0], this.color, this.opacity);
};

TextLine.prototype.getText = function() {
  return "%c{rgb(" + this.getColor() + ")}" + this.text;
};

var LinearInterpolator = function(duration_ms, interpolation_fn, done_fn) {
  this.duration_ms = duration_ms;
  this.interpolation_fn = interpolation_fn;
  this.done_fn = done_fn;
  this.elapsed_ms = 0;
};

LinearInterpolator.prototype.step = function(elapsed_ms) {
  this.elapsed_ms += elapsed_ms;
  this.interpolation_fn(this.elapsed_ms / this.duration_ms);
  if (this.done() && this.done_fn) {
    this.done_fn();
  }
};

LinearInterpolator.prototype.done = function() {
  return this.elapsed_ms >= this.duration_ms;
};

var Game = function() {
  this.map = new Map();
  this.fov_calculator = new ROT.FOV.PreciseShadowcasting(
      this.map.seethrough.bind(this.map));

  this.needs_render = true;
  this.visibility = 0;
  this.map_opacity = 0.0;
  this.lights = {};

  this.display = new ROT.Display({width: this.map.width, height: this.map.height + TEXT_DISPLAY_LINES + 1});
  var container = document.getElementById("container");
  container.appendChild(this.display.getContainer());

  this.text_lines = [];
  this.animations = [];

  this.nextState();
};

Game.prototype.start = function() {
  setInterval(function() {
    var new_animations = [];
    for (var i = 0; i < this.animations.length; i++) {
      var animation = this.animations[i];
      animation.step(20);
      if (!animation.done()) new_animations.push(animation);
      this.redraw();
    }
    this.animations = new_animations;
    this.render();
  }.bind(this), 20);
};

Game.prototype.addText = function(text, animation_done_fn) {
  if (this.text_lines.length >= TEXT_DISPLAY_LINES) {
    this.text_lines.shift();  // text_lines should be small
  }
  var new_line = new TextLine(text);
  this.text_lines.push(new_line);
  this.animations.push(new LinearInterpolator(1500, function(value) {
    new_line.opacity = value;
  }, animation_done_fn));
};

/*
 * Track and control the progression of the game. Simple enough, since the game is strictly linear.
 **/

var GameState = function(enter_fn, key_listener, is_text_state, next_state) {
  this.enter_fn = enter_fn;
  this.key_listener = key_listener;
  this.is_text_state = is_text_state;
  this.next_state = next_state;
};

GameState.prototype.enter = function(game) {
  game.setKeyListener(this.key_listener);
  this.enter_fn(game);
};

var ENTER_LISTENER = function(game, evt) {
  if (evt.keyCode == ROT.VK_RETURN) {
    game.nextState();
  }
};
var MOVE_LISTENER = function(game, evt) {
  switch (evt.keyCode) {
    case ROT.VK_LEFT:
      game.handleMove(-1, 0);
      break;
    case ROT.VK_RIGHT:
      game.handleMove(1, 0);
      break;
    case ROT.VK_UP:
      game.handleMove(0, -1);
      break;
    case ROT.VK_DOWN:
      game.handleMove(0, 1);
      break;
    case ROT.VK_RETURN:
      game.handleAction();
      break;
  }
};

var GAME_STATES = {
  'text0': new GameState(function(game) {
    game.addText("Back in my day (actually, maybe a bit before my day), computers were a lot less powerful than they are now.");
  }, ENTER_LISTENER, true, 'text1'),
  'text1': new GameState(function(game) {
    game.addText("Games didn't have fancy graphics - sometimes, they had no graphics at all.");
  }, ENTER_LISTENER, true, 'text2'),
  'text2': new GameState(function(game) {
    game.addText("Instead, characters might be represented by, erm... characters. 'ASCII' characters.");
  }, ENTER_LISTENER, true, 'text3'),
  'text3': new GameState(function(game) {
    game.addText("For example, your character might be the @ sign.", function() {
      game.animations.push(new LinearInterpolator(1000, function(value) {
        game.map_opacity = value;
      }));
      game.addText("Oh, there you are!");
    });
  }, ENTER_LISTENER, true, 'text4'),
  'text4': new GameState(function(game) {
    game.addText("(Clearly, it took a bit more imagination back then.)");
  }, ENTER_LISTENER, true, 'text5'),
  'text5': new GameState(function(game) {
    game.addText("Now, let's shed a bit of light on this situation, shall we?", function() {
      game.visibility = 25;
    });
  }, ENTER_LISTENER, true, 'text6'),
  'text6': new GameState(function(game) {
    game.addText("In case you weren't sure, you can use the arrow keys to move around.", function() {
      game.addText("I'm sure you can figure out the rest. Good luck!", function() {
        game.nextState();
      });
    });
  }, null, false, 'game'),
  'game': new GameState(function(game) {
  }, MOVE_LISTENER, false, 'end_animation'),
  'end_animation': new GameState(function(game) {
    game.addText("You hear a low rumble coming from all around you....", function() {
      game.animateWallDrop();
    });
  }, null, false, 'end'),
  'end': new GameState(function(game) {
  }, MOVE_LISTENER, false, null),
};
var START_STATE = GAME_STATES['text0'];

Game.prototype.nextState = function() {
  if (!this.state) this.state = START_STATE;
  else this.state = GAME_STATES[this.state.next_state];
  this.state.enter(this);
};

Game.prototype.setKeyListener = function(listener) {
  window.onkeydown = listener ? listener.bind(null, this) : null;
};

function square(x) { return x * x; }
Game.prototype.getVisibility = function() {
  var visible = {};
  this.fov_calculator.compute(this.map.character.x, this.map.character.y, this.visibility, function(x, y, distance, visibility) {
    if (visibility >= 0.05) visible[[x, y]] = [x, y];
  });
  for (var key in this.lights) {
    var light = this.lights[key];
    for (var x = light.x - LIGHT_RADIUS; x < light.x + LIGHT_RADIUS; x++) {
      for (var y = light.y - LIGHT_RADIUS; y < light.y + LIGHT_RADIUS; y++) {
        if (!this.map.isValid(x, y)) continue;
        if (square(x - light.x) + square(y - light.y) > square(LIGHT_RADIUS)) continue;
        visible[[x, y]] = [x, y];
      }
    }
  }
  return visible;
};

Game.prototype.drawMap = function() {
  var visible = this.getVisibility();
  for (var x = 0; x < this.map.width; x++) {
    for (var y = 0; y < this.map.height; y++) {
      // TODO debugging
      //var fg_color = visible[[x, y]] ? "yellow" : "white";
      var fg_color = "rgb(150, 150, 150)";
      if (!visible[[x, y]]) continue;
      var tile = this.map.at(x, y);
      this.display.draw(
          x, y + TEXT_DISPLAY_LINES, tile ? tile.display_symbol : '?', fg_color);
    }
  }
  var char_color = ROT.Color.interpolate([0, 0, 0], [255, 255, 255], this.map_opacity);
  this.display.draw(this.map.character.x, this.map.character.y + TEXT_DISPLAY_LINES, '@', 'rgb(' + char_color + ')');
};

Game.prototype.redraw = function() {
  this.needs_render = true;
};

Game.prototype.render = function() {
  if (!this.needs_render) return;
  this.display.clear();
  for (var i = 0; i < this.text_lines.length; i++) {
    var line = this.text_lines[i];
    this.display.drawText(0, i, line.getText());
  }
  if (this.state.is_text_state) {
    this.display.drawText(0, TEXT_DISPLAY_LINES + this.map.height, "<press ENTER to continue>");
  }
  this.drawMap();
  this.needs_render = false;
};

Game.prototype.handleMove = function(dx, dy) {
  var new_x = this.map.character.x + dx;
  var new_y = this.map.character.y + dy;
  if (!this.map.at(new_x, new_y).walkable) return;
  this.map.character.x = new_x;
  this.map.character.y = new_y;
  this.redraw();
};

Game.prototype.handleAction = function() {
  if (!this.map.isOnLight()) return;
  var x = this.map.character.x;
  var y = this.map.character.y;
  if (this.lights[[x, y]]) return;
  this.lights[[x, y]] = {x: x, y: y};
  if (Object.keys(this.lights).length == this.map.numLights()) {
    this.nextState();
  }
  this.redraw();
};

Game.prototype.animateWallDrop = function() {
  var visible = this.getVisibility();
  var first_visible_column = this.map.width;
  var last_visible_column = 0;
  for (var key in visible) {
    var coord = visible[key];
    first_visible_column = Math.min(first_visible_column, coord[0]);
    last_visible_column = Math.max(last_visible_column, coord[0]);
  }

  // First drop all the maze walls outside the visible range.
  for (var x = 0; x < this.map.width; x++) {
    if (x >= first_visible_column && x <= last_visible_column) continue;
    for (var y = 0; y < this.map.height; y++) {
      if (this.map.at(x, y).raw_symbol == 'M') this.map.setTile(x, y, TILE_INDEX['.']);
    }
  }

  // Now animate dropping the walls that are visible, column by column.
  var initial_delay_ms = 1000;
  var decay_rate = 0.9;
  function dropColumn(x, delay) {
    for (var y = 0; y < this.map.height; y++) {
      if (this.map.at(x, y).raw_symbol == 'M') this.map.setTile(x, y, TILE_INDEX['.']);
    }
    this.redraw();
    if (x > first_visible_column) {
      setTimeout(dropColumn.bind(this, x - 1, delay * decay_rate), delay);
    } else {
      this.nextState();
    }
  }
  dropColumn.bind(this)(last_visible_column, initial_delay_ms);
};

function main() {
  var game = new Game();
  game.start();
}
