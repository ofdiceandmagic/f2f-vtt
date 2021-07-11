$(function(){

    var container = $('#container'),
        pane = $('#pane'),
        player = $('#playerToken'),
        sidebar = $('#sidebar'),
        header = $('header'),
        footer = $('footer'),
        minLeft = sidebar.width(),
        maxLeft = pane.width() - player.width() + sidebar.width(),
        minTop = header.height(),
        maxTop = pane.height() - header.height(),
        keysPressed = {},
        distancePerIteration = 3,
        GMwindow = window.opener;
  
    /** 
     * Make playerToken element draggable and moveable with arrow keys
     *   - keep the player token within the pane
     *   - save playerToken position to local storage
     **/ 
    $('#playerToken').draggable();
  
    function calculateNewLeft(oldValue, keyCode1, keyCode2) {
        var newValue = parseInt(oldValue, 10)
                      - (keysPressed[keyCode1] ? distancePerIteration : 0)
                      + (keysPressed[keyCode2] ? distancePerIteration : 0);
        return newValue < minLeft ? minLeft : newValue > maxLeft ? maxLeft : newValue;
    }
    function calculateNewTop(oldValue, keyCode1, keyCode2) {
      var newValue = parseInt(oldValue, 10)
                    - (keysPressed[keyCode1] ? distancePerIteration : 0)
                    + (keysPressed[keyCode2] ? distancePerIteration : 0);
      return newValue < minTop ? minTop : newValue > maxTop ? maxTop : newValue;
    }
  
    // Allow move playerToken with arrow keys
    $(window).keydown(function(event) { keysPressed[event.which] = true; });
    $(window).keyup(function(event) { keysPressed[event.which] = false; });
  
    setInterval(function() {
        player.css({
            left: function(index ,oldValue) {
                return calculateNewLeft(oldValue, 37, 39);
            },
            top: function(index, oldValue) {
                return calculateNewTop(oldValue, 38, 40);
            }
        });
        //move the player token in the other window if it's open
        moveInOtherWindow();
    }, 20);
  
    //save player pos when player token is stopped being dragged
    $("#playerToken").on("dragstop", function(e, ui){
      savePlayerTokenPos();
    });
    //save player pos on arrow keys key up
    $(window).keyup(function(event){
      if (event.which == 37 || event.which == 38 || event.which == 39 || event.which == 40){
        savePlayerTokenPos();
      }
    });
    function savePlayerTokenPos(){
      localStorage.setItem("playerToken", JSON.stringify( getPlayerPos() ) );
    }
  
    //load player pos
    loadPlayerPos();
  
    function getPlayerPos(){
      return $('#playerToken').offset();
    }
  
    function loadPlayerPos(){
      let playerPos = JSON.parse(localStorage.getItem("playerToken"));
      if (!playerPos){
        console.log('playerToken not in local storage');
        return;
      }
      player.css({ left: playerPos.left, top: playerPos.top });
    }
  
  
    /**
     * Communication between GM window and Table window
     */
    //have table window (this window) listen for messages from the GM window
    window.addEventListener('message', (e) => {
        console.log(`Received message: `, e.data, 'from ', e.source);
        let left = e.data.left;
        let top = e.data.top;
        player.css({left: left, top: top});
    });
    
  
    //whenever the party token is moved on the Table window, move it on the GM window
    function moveInOtherWindow(){
        let playerPos = {
            left: player.left,
            top: player.top
        };
        GMwindow.postMessage(playerPos, '*');
    }
    
  
  
  });