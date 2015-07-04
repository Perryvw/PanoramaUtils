/*
 * Markers utility. Provides a nice interface to display markers pointing at an entity.
 * To be used with the dota 2 Panorama framework
 *
 * By: Perry
 * Date: July 2015
 */

//Constant parameters
var MARKER_DURATION = 5;
var MARKER_UPDATE_INTERVAL = 0.05;
var MARKER_OFFSET = new Vector( -100, -200 );
var MARKER_SCREEN_SIZE = new Vector( 1760, 550 );
var MARKER_SCREEN_OFFSET = new Vector( 10, 80 );
var MARKER_SCREEN_CENTER = new Vector( 900, 405 );
var MARKER_SCREEN_CENTER_SCALED = MARKER_SCREEN_CENTER;
var MARKER_BOUNDARY_ANGLE = Math.atan( MARKER_SCREEN_SIZE.x / MARKER_SCREEN_SIZE.y ) * ( 180 / Math.PI );
var MARKER_SCREEN_SCALE = 1;

/* Marker class - marker manager
====================================================================================*/
var Markers = function(){};

//Initialise
(function() {
	Markers.list = [];
	Markers.index = 0;
	//Delay until after the DOM loads
	$.Schedule( 1, function() {
		MARKER_SCREEN_SCALE = $('#markerContainer').actuallayoutwidth / 1920;
		MARKER_SCREEN_CENTER_SCALED = MARKER_SCREEN_CENTER.scale( MARKER_SCREEN_SCALE );
	});
}());

/* AddNew
 * Add a new marker to the screen for some entity index.
 * Params:
 * 		entIndex {Integer} - The entity index of the entity the marker should point at.
 */
Markers.AddNew = function( entIndex ) {
	var newMarker = new Marker( entIndex, 'marker' + Markers.index );
	Markers.list.push( newMarker );
}

/* Remove
 * Remove an existing marker.
 * Params:
 * 		marker {Object} - The marker to remove.
 */
Markers.Remove = function( marker ) {
	var i = 0;
	while ( i < Markers.list.length ) {
		if ( Markers.list[i] == marker ) {
			delete Markers.list[i];
			break;
		}
		i++;
	}
}

/* IsOffScreen
 * Do some math to figure out if our marker is still within the screen bounds.
 * Params:
 * 		screenpos {Vector} - The position to check.
 */
Markers.IsOffScreen = function( screenPos ) {
	return screenPos.x < MARKER_SCREEN_OFFSET.x || screenPos.y < MARKER_SCREEN_OFFSET.y
			|| screenPos.x > ( MARKER_SCREEN_OFFSET.x + MARKER_SCREEN_SIZE.x ) 
			|| screenPos.y > ( MARKER_SCREEN_OFFSET.y + MARKER_SCREEN_SIZE.y );
}

/* Marker class
====================================================================================*/

/* Constructor
 * Construct an instance of the Marker class.
 * Params:
 *		- entIndex {Integer} - The entity index to point at
 *		- name {String} - A (unique) name for the marker panel
 */
var Marker = function( entIndex, name ) {
	//Set fields
	this.entIndex = entIndex;
	this.exists = true;

	//Initialise marker
	this.panel = $.CreatePanel( 'Panel', $( '#markerContainer' ), name );
	this.panel.style.width = '150px';
	this.panel.style.height = '100px';
	this.panel.style.backgroundImage = 'url("file://{images}/custom_game/marker.tga")';

	//Initialise icon
	this.icon = $.CreatePanel( 'Panel', $( '#markerContainer' ), name+'_icon' );
	this.icon.style.width = '70px';
	this.icon.style.height = '70px';
	this.icon.style.backgroundImage = 'url("file://{images}/custom_game/marker_icon.tga")'
	this.icon.style.borderRadius = '50%';

	//Get the position of the entity
	this.entityPos = Vector.FromArray( Entities.GetAbsOrigin( entIndex ) );

	//Schedule this panel's deletion
	$.Schedule( MARKER_DURATION - 1, this.Remove.bind(this) );

	//Initial update
	this.Update();

	//Set smooth transition
	this.panel.style.transition = "transform " + MARKER_UPDATE_INTERVAL + "s linear 0.0ms";
	this.icon.style.transition = "transform " + MARKER_UPDATE_INTERVAL + "s linear 0.0ms";
	
	//this.panel.AddClass('MarkerFadeIn');
}

/* Update
 * Udate this marker to point at the entity from the current screen position.
 */
Marker.prototype.Update = function() {
	//Do not update if this marker is removed
	if ( this.exists ) {
		//Get the entity coords in screen-space
		var entityScreenPos = new Vector( 
			Game.WorldToScreenX( this.entityPos.x, this.entityPos.y, this.entityPos.z ),
			Game.WorldToScreenY( this.entityPos.x, this.entityPos.y, this.entityPos.z )
		).scale( 1/MARKER_SCREEN_SCALE ).add( MARKER_OFFSET );

		//Check if the marker is on screen or not
		if ( Markers.IsOffScreen( entityScreenPos ) ) {
			//Point to the trap off-screen
			this.PointOffScreen( entityScreenPos );
		} else {
			//Point to the trap on-screen
			this.PointOnScreen( entityScreenPos );
		}

		//Schedule next update
		$.Schedule( MARKER_UPDATE_INTERVAL, this.Update.bind( this ) );
	}
}

/* PointOnScreen
 * Point the marker to a point within the screen bounds.
 * Params:
 *		- target {Vector} - The screen position to point at.
 */
Marker.prototype.PointOnScreen = function( target ) {
	//Set the panel style
	this.panel.style.transform = "rotateZ(90deg) translate3d(" +
		target.x + "px, " + target.y + "px, 0px)";

	//Set the icon style
	this.icon.style.transform = "translate3d(" + ( target.x + 40 ) + "px, " + ( target.y + 15 ) + "px, 0px)";
}

/* PointOffScreen
 * Point the marker to a point outside the screen bounds.
 * Params:
 *		- target {Vector} - The entity position in screen space to point at.
 */
Marker.prototype.PointOffScreen = function( target ) {
	//Get the center of the screen
	var camPos = Vector.FromArray( 
		Game.ScreenXYToWorld( MARKER_SCREEN_CENTER_SCALED.x, MARKER_SCREEN_CENTER_SCALED.y ) );

	//calculate the difference/direction vector
	var direction = this.entityPos.minus( camPos ).normalize();

	//calculate the angle from the direction vector
	var angle = -Math.atan2( direction.y, direction.x );
	//Convert the angle from radians to degrees before drawing
	angle = angle * ( 180/Math.PI );

	//Figure out where to draw
	var length = Math.min( MARKER_SCREEN_SIZE.x / 2.1, target.minus( MARKER_SCREEN_CENTER ).length() - 200 );
	var relativeMarkerPos = new Vector( direction.x * length, -direction.y * length );

	//Get absolute position
	var pos = MARKER_SCREEN_CENTER.add( relativeMarkerPos );

	//Clamp to viewport
	if ( pos.y < MARKER_SCREEN_OFFSET.y ) {
		var height = MARKER_SCREEN_SIZE.y / 2;
		relativeMarkerPos = new Vector( height * ( direction.x / direction.y ), -height - 40);
	} else if ( pos.y > MARKER_SCREEN_OFFSET.y + MARKER_SCREEN_SIZE.y ) {
		var height = MARKER_SCREEN_SIZE.y / 2;
		relativeMarkerPos = new Vector( -height * ( direction.x / direction.y ), height );
	}

	//Get absolute position
	var pos = MARKER_SCREEN_CENTER.add( relativeMarkerPos );

	//Set the panel style
	this.panel.style.transform = "rotateZ(" + angle + "deg) translate3d(" +
		pos.x + "px, " + pos.y + "px, 0px)";

	//Set the icon style
	this.icon.style.transform = "translate3d(" + ( pos.x + 40 ) + "px, " + ( pos.y + 15 ) + "px, 0px)";
}

/* Remove
 * Remove this marker.
 */
Marker.prototype.Remove = function() {
	//Start fading out
	this.panel.AddClass('MarkerFadeOut');
	this.icon.AddClass('MarkerFadeOut');

	//Prevent the panel from flashing at the end
	this.panel.style.opacity = '0';
	this.icon.style.opacity = '0';

	//Schedule the actual removal
	$.Schedule( 1, (function() {
		Markers.Remove( this );

		this.exists = false;
		this.panel.DeleteAsync( 0 );
		this.icon.DeleteAsync( 0 );
	}).bind( this ) ); 
}