/**
 * Панель навигации.
 *
 * @author dew1983@mail.ru <Suvorov Andrey M.>
 */

Ext.define(
    'FBEditor.view.panel.main.navigation.Navigation',
    {
        extend: 'FBEditor.view.panel.main.AbstractDetach',
	    requires: [
		    'FBEditor.view.panel.main.navigation.NavigationController',
            'FBEditor.view.panel.main.navigation.section.Panel',
	        'FBEditor.view.panel.treenavigation.TreeNavigation'
	    ],

	    id: 'panel-main-navigation',
	    xtype: 'panel-main-navigation',
	    controller: 'panel.main.navigation',

	    scrollable: true,
	
	    title: 'Навигация',
	    panelName: 'navigation',

	    initComponent: function ()
	    {
		    var me = this;

		    me.items = [
			    {
				    xtype: 'panel-treenavigation'
			    }
		    ];

		    me.callParent(arguments);
	    }
    }
);