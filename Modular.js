/*
 *Library for organizing Panorama components into reusable modules.
 *
 * Place the module file in layout/custom_game/modules/, the file name (minus .xml)
 * acts as the module's name. Inside the module define its functionality with
 *     Modular.DefineThis( someObjWithFunctionality ).
 *
 * In files where you want to use this module use:
 *    Modular.Spawn( moduleName, parentPanel ) 
 *
 * By: Perry, July 2015
 */

 /* The path of the directory containing all modules */
var MODULE_BASE_PATH = "file://{resources}/layout/custom_game/modules/";

/* Create the object */
var Modular = {};

/* Static function MakeModule adds standard module functionality to a panel */
Modular.MakeModule = function( panel ) {

	//Extend function - shorthand for Modular.Extend
	panel.extend = function( extension ) {
		Modular.Extend( panel, extension );
	}

	return panel;
}

/* Extend a panel by copying all properties from the extension onto it */
Modular.Extend = function( panel, extension ) {
	for (var key in extension) {
		panel[key] = extension[key];
	}
}

/* Spawn a module by name as child of some parent */
Modular.Spawn = function( name, parent ) {
	var newPanel = $.CreatePanel( "Panel", parent, "player_root" );
	newPanel.BLoadLayout( MODULE_BASE_PATH + name + ".xml", false, false );

	return Modular.MakeModule( newPanel );
}

/* Define a new module by passing an object containing all the fields
   the module should have. */
Modular.DefineThis = function( functionality ) {
	var panel = $.GetContextPanel();
	Modular.Extend( panel, functionality );
}
