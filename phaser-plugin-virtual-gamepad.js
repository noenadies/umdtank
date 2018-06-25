
(function (Phaser) {
    'use strict';
    
    // Valores Constantes
    var A_L_I = -14/2* (3.141592653589793 / 8);//A_L_I
    var A_U_L = -Math.cos(0) * (3.141592653589793 / 8);//A_U_L
    var B_L_I = 3.141592653589793 / 8;
    var B_S_L = 14/2 * (3.141592653589793 / 8);
    var D_L_I = -3 * (3.141592653589793 / 8);
    var D_L_S = 3 * (3.141592653589793 / 8);
    var I_I_L = 5 * (3.141592653589793 / 8);
    var I_S_L = -5 * (3.141592653589793 / 8);
   
    
 
    Phaser.Plugin.Contrlgrd = function (game, principal) {
        
        // LLama  al nodo principial
        Phaser.Plugin.call(this, game, principal);
        
        // Class members
        
        this.PMando = null;
        this.PMandoPad = null;
        this.entrada = this.game.input;
        this.PMandoPoint = null;
        this.PMandoRadius = null;
        this.PMandoPointer = null;
        this.boton1 = null;
        this.boton1Point = null;
        this.boton1Radius = null;
        
        // Polling for the PMando and boton1 pushes
        this.preUpdate = GPadPoll.bind(this);
    };
    
	Phaser.Plugin.Contrlgrd.prototype = 
        Object.create(Phaser.Plugin.prototype);
	Phaser.Plugin.Contrlgrd.prototype.constructor = 
        Phaser.Plugin.Contrlgrd;
        
    /**
     * Add a PMando to the screen (only one PMando allowed for now)
     *
     * @method Phaser.Plugin.Contrlgrd#addPMando
     * @param {number} x - Position (x-axis) of the PMando on the canvas
     * @param {number} y - Position (y-axis) of the PMando on the canvas
     * @param {number} scale - Size of the sprite. 1.0 is 100x100 pixels
     * @param {String} key - key for the gamepad's spritesheet
     * @param {Phaser.Sprite} The PMando object just created
     */
    Phaser.Plugin.Contrlgrd.prototype.addPMando = function(x, y,scale,key) {
    
        // If we already have a PMando, return null
        if (this.PMando !== null) {
            return null;
        }
        
        // Add the PMando to the game
        this.PMando = this.game.add.sprite(x, y, key);
        this.PMando.frame = 2;
        this.PMando.anchor.set(0.5);
        this.PMando.fixedToCamera = true;
        this.PMando.scale.setTo(scale, scale);
        this.PMandoPad = this.game.add.sprite(x, y, key);
        this.PMandoPad.frame = 3;
        this.PMandoPad.anchor.set(0.5);
        this.PMandoPad.fixedToCamera = true;
        this.PMandoPad.scale.setTo(scale, scale);
        
        // Remember the coordinates of the PMando
        this.PMandoPoint = new Phaser.Point(x, y);
        
        // Set up initial PMando properties
        this.PMando.properties = {
            inUse: false,
            up: false,
            down: false,
            left: false,
            right: false,
            x: 0,
            y: 0,
            distance: 0,
            angle: 0,
            rotacionRad: 0
        };
        
        // Set the touch area as defined by the boton1's radius
        this.PMandoRadius = scale * (this.PMando.width / 2);
        
        return this.PMando;    
    };
    
  
    Phaser.Plugin.Contrlgrd.prototype.addboton1 = function(x,y,scale,key) {
                                                                

        if (this.boton1 !== null) {
            return null;
        }
                                                                
      

        this.boton1 = this.game.add.button(x, y, key, null, this);
        this.boton1.anchor.set(0.5);
        this.boton1.fixedToCamera = true;
        this.boton1.scale.setTo(scale, scale);
        
       
        this.boton1Point = new Phaser.Point(x, y);
        

        this.boton1.isDown = false;
        

        this.boton1Radius = scale * (this.boton1.width / 2);
        
        return this.boton1;
    };
    
    var boton1Down = function() {
        this.boton1.isDown = true;
    };
    
    var boton1Up = function() {
        this.boton1.isDown = false;
    };
    
    var GPadPoll = function() {
        
        var resetPMando = true;
        

        this.boton1.isDown = false;
        this.boton1.frame = 0;
        this.game.input.pointers.forEach(function(p) {
            resetPMando = testDistance(p, this);
        }, this);
        
    
        resetPMando = testDistance(this.game.input.mousePointer, this);
        
      
        if (resetPMando) {
            if ((this.PMandoPointer === null) || 
                (this.PMandoPointer.isUp)) {
                movePMando(this.PMandoPoint, this);
                this.PMando.properties.inUse = false;
                this.PMandoPointer = null;
            }
        }
        
    };
    
    var testDistance = function(pointer, ese) {
    
        var reset = true;
    
    
        var d = ese.PMandoPoint.distance(pointer.position);
        if ((pointer.isDown) && ((pointer === ese.PMandoPointer) || 
            (d < ese.PMandoRadius))) {
            reset = false;
            ese.PMando.properties.inUse = true;
            ese.PMandoPointer = pointer;
            movePMando(pointer.position, ese);
        }
        
      
        d = ese.boton1Point.distance(pointer.position);
        if ((pointer.isDown) && (d < ese.boton1Radius)) {
            ese.boton1.isDown = true;
            ese.boton1.frame = 1;
        }
        
        return reset;
    };
    
    var movePMando = function(point, ese) {
        
        
        var cambioX = point.x - ese.PMandoPoint.x;
		var cambioY = point.y - ese.PMandoPoint.y;
        
       
        var rotacionRad = ese.PMandoPoint.angle(point);
        

        if (ese.PMandoPoint.distance(point) > ese.PMandoRadius) {
            cambioX = (cambioX === 0) ? 
                0 : Math.cos(rotacionRad) * ese.PMandoRadius;
            cambioY = (cambioY === 0) ?
                0 : Math.sin(rotacionRad) * ese.PMandoRadius;
        }
        

        ese.PMando.properties.x = parseInt((cambioX / 
            ese.PMandoRadius) * 100, 10);
		ese.PMando.properties.y = parseInt((cambioY  /
            ese.PMandoRadius) * 100, 10);

        ese.PMando.properties.rotacionRad = rotacionRad;
        ese.PMando.properties.angle = (180 / 3.141592653589793) * rotacionRad;
        ese.PMando.properties.distance = 
            parseInt((ese.PMandoPoint.distance(point) / 
            ese.PMandoRadius) * 100, 10);
            
    
        ese.PMando.properties.up = ((rotacionRad > A_L_I) && 
            (rotacionRad <= A_U_L));
        ese.PMando.properties.down = ((rotacionRad > B_L_I) && 
            (rotacionRad <= B_S_L));
        ese.PMando.properties.right = ((rotacionRad > D_L_I) && 
            (rotacionRad <= D_L_S));
        ese.PMando.properties.left = ((rotacionRad > I_I_L) || 
            (rotacionRad <= I_S_L));
            
      
        if ((ese.PMando.properties.x === 0) && 
            (ese.PMando.properties.y === 0)) {
            ese.PMando.properties.right = false;
            ese.PMando.properties.left = false;
        }
        

        ese.PMandoPad.cameraOffset.x = ese.PMandoPoint.x + cambioX;
        ese.PMandoPad.cameraOffset.y = ese.PMandoPoint.y + cambioY;
    };
    
} (Phaser));
