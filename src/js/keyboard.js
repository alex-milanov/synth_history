var Keyboard = function(element) {
  element.addEventListener("keydown", this.keydown.bind(this), false);
  element.addEventListener("keyup", this.keyup.bind(this), false);
  this.octave = 4;

  var scope = this;

  if (navigator.requestMIDIAccess)
    navigator.requestMIDIAccess().then( onMIDIInit, onMIDIReject );
  else
    alert("No MIDI support present in your browser.  You're gonna have a bad time.")

  function numberToNote(number) {
    var notes = ["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"];
    var octave = parseInt(number/12);
    var step = number-octave*12;
    var pitch = notes[step];
    return {pitch: pitch+""+octave, midi: number};
  }

  function hookUpMIDIInput() {
    var haveAtLeastOneDevice=false;
      var inputs=midiAccess.inputs.values();
      for ( var input = inputs.next(); input && !input.done; input = inputs.next()) {
        input.value.onmidimessage = MIDIMessageEventHandler;
        haveAtLeastOneDevice = true;
      }
      var badtime = document.getElementById("badtime");
      if (badtime)
        badtime.style.visibility = haveAtLeastOneDevice ?
          "hidden" : "visible";
  }
  function onMIDIInit(midi) {
    midiAccess = midi;
    hookUpMIDIInput();
    midiAccess.onstatechange=hookUpMIDIInput;
  }
  function onMIDIReject(err) {
    alert("The MIDI system failed to start.  You're gonna have a bad time.");
  }
  function MIDIMessageEventHandler(event) {
    // Mask off the lower nibble (MIDI channel, which we don't care about)

    if(event.data[1]){
      var number = event.data[1];
      var note = numberToNote(number);
    
      switch (event.data[0] & 0xf0) {
        case 0x90:
          if (event.data[2]!=0) {  // if velocity != 0, this is a note-on message
            scope.onKeyDown(note);
            return;
          }
          // if velocity == 0, fall thru: it's a note-off.  MIDI's weird, ya'll.
        case 0x80:
          scope.onKeyUp(note);
          return;
      }
    }
  }

};

Keyboard.prototype.keydown = function(e) {
  if (e.repeat == false) {
    if (e.keyCode == 188) {
      this.octave -= 1;
    };

    if (e.keyCode == 190) {
      this.octave += 1;
    };

    var note = this.keycodeToNote(e.keyCode);
    if(note) { this.onKeyDown(note); };
  };
};

Keyboard.prototype.keyup = function(e) {
  if (e.repeat == false) {
    var note = this.keycodeToNote(e.keyCode);
    if (note && this.onKeyUp) { this.onKeyUp(note); };
  };
};

Keyboard.prototype.keycodeToNote = function(keycode) {
  var map = {
    49: {program: 1},
    50: {program: 2},
    51: {program: 3},
    65: {pitch: 'C', octave: 0, step: 0},
    87: {pitch: 'C#', octave: 0, step: 1},
    83: {pitch: 'D', octave: 0, step: 2},
    69: {pitch: 'D#', octave: 0, step: 3},
    68: {pitch: 'E', octave: 0, step: 4},
    70: {pitch: 'F', octave: 0, step: 5},
    84: {pitch: 'F#', octave: 0, step: 6},
    71: {pitch: 'G', octave: 0, step: 7},
    89: {pitch: 'G#', octave: 0, step: 8},
    72: {pitch: 'A', octave: 0, step: 9},
    85: {pitch: 'A#', octave: 0, step: 10},
    74: {pitch: 'B', octave: 0, step: 11},
    75: {pitch: 'C', octave: 1, step: 0},
    79: {pitch: 'C#', octave: 1, step: 1},
    76: {pitch: 'D', octave: 1, step: 2},
    80: {pitch: 'D#', octave: 1, step: 3},
    186: {pitch: 'E', octave: 1, step: 4},
    222: {pitch: 'F', octave: 1, step: 5},
    221: {pitch: 'F#', octave: 1, step: 6},
    220: {pitch: 'G', octave: 1, step: 7}
  };

  var note = map[keycode];
  if (note && note.pitch) {
    note.octave = note.octave + this.octave;
    note.midi = note.step + (note.octave * 12);
    return {pitch: note.pitch + note.octave, midi: note.midi};
  } else if (note && note.program) {
    return note;
  } else {
    return false;
  };
};
