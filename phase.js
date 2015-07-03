/**
 * Phase javascript library to be used in dota 2 Panorama. The aim of this library is aid
 * development of responsive dota 2 custom UIs.
 *
 * Developed and maintained by: Perry
 *
 * Usage:
 * Firstly include the phase.js into the xml file.
 *
 * Animate an object with id 'exampleObject' by calling:
 * Phase( $('#exampleObject') ).Translate( 300, 500, 200, 'ease' );
 *
 * A callback when done is also available:
 * Phase( $('#exampleObject') ).Translate( 300, 500, 200, 'ease' ).OnFinished( function( context )
 * {
 * 		$.Msg( "Animation 1 done!" );
 * 		context.Translate( 700, -100, 0 );
 * } );
 */

 /* Contructor */
function Phase( element ) {
	if (!Phase.context[element]) {
		Phase.context[element] = new Context( element );
	}

	return Phase.context[element];
};

/* Phase initialisation */
(function() {
	Phase.context = {};
}());

/* Phase animation functions
=========================================================================================*/

/* Context helper class
=========================================================================================*/
var Context = function( element ) {
	this.element = element;
	this.animations = {};
};

/* Update
 * Update the css properties for this context's element.
 */
Context.prototype.Update = function() {
	var transitionStr = "";

	var toDelete = [];

	for (var property in this.animations) {
		var anim = this.animations[property];
		if ( Game.GetGameTime() * 1000 + anim.options.duration - anim.options.startTime > 0 ) {
			transitionStr += property;
			transitionStr += " " + anim.options.duration + "ms ";
			transitionStr += anim.options.easing + " 0.0ms";
		} else {
			toDelete.push( this.animations[property] );
		}	
	}

	for ( var i = 0; i < toDelete.length; i++ ) {
		delete toDelete[i];
	}

	this.element.style['transition'] = transitionStr + ';';

	for (var property in this.animations) {
		this.element.style[property] = this.animations[property].options.goal+";";
	}
};

/* Translate
 * Translate this context's element to a position with some duration and easing.
 * Params:
 * 		- duration {integer}	- The animation duration in ms.
 *		- x {integer} 			- The x value to animate to. 
 *		- y {integer} 			- The y value to animate to.
 *		- easing {string}		- The easing function to use. (Optional)
 */
Context.prototype.Translate = function( duration, x, y, easing ) {
	this.animations['transform'] = new Animation( this, {
		duration : duration,
		startTime : Game.GetGameTime() * 1000,
		goal : 'translateX('+x+'px) translateY('+y+'px)',
		easing : easing ? easing : 'linear'
	});

	this.Update();

	return this.animations['transform'];
};


/* Animation helper class
=========================================================================================*/
function Animation( context, options ) {
	this.context = context;
	this.options = options;
};

/* OnFinished
 * Register a callback to be called once this animation finishes,
 * pass the context to the callback as argument.
 */
Animation.prototype.OnFinished = function( callback ) {
	var context = this.context;
	$.Schedule( this.options.duration / 1000, function() {
		callback(context);
	});
};

/* Phase utility functions
=========================================================================================*/

/* DeepPrint
 * Print all object properties iteratively.
 *
 * Parameters:
 * 		object {object} - The object to print
 */
Phase.DeepPrint = function( object, indent, name ) {

	indent = typeof indent === 'undefined' ? 0 : indent;

	switch(typeof object) {
		case 'undefined':
			$.Msg( Array(indent + 1).join('\t') + 'undefined' );
			break;
		case 'object':

			var openingString = typeof name === 'undefined' ? '{' : name + ' : {';
			$.Msg( Array( indent + 1 ).join( '\t' ) + openingString );

			for ( var key in object ) {
				if ( typeof object[key] === 'object' ) {
					Phase.DeepPrint( object[key], indent + 1, key );
				} else {
					$.Msg( Array(indent + 2).join('\t') + key + ' : ' + object[key] );
				}
			}

			$.Msg( Array(indent + 1).join('\t') + '}' );
			break;
		default:
			$.Msg( object );
			break;
	}
};