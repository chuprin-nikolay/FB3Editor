/**
 * Кнопка сохранения книги.
 *
 * @author dew1983@mail.ru <Suvorov Andrey M.>
 */

Ext.define(
	'FBEditor.view.panel.toolstab.file.button.saveas.SaveAs',
	{
		extend: 'Ext.button.Button',
		requires: [
			'FBEditor.view.panel.toolstab.file.button.saveas.SaveAsController'
		],

		id:'panel-toolstab-file-button-saveas',
		xtype: 'panel-toolstab-file-button-saveas',
		controller: 'panel.toolstab.file.button.saveas',
		
		listeners: {
			click: 'onClick'
		},

		iconCls: 'fa fa-download',
		tooltipType: 'title',

		translateText: {
			save: 'Сохранить книгу (локально)'
		},

		initComponent: function ()
		{
			var me = this,
				bridge = FBEditor.getBridgeWindow(),
				routeManager = bridge.FBEditor.route.Manager;
			
			// скрываем
			me.hidden = routeManager.isSetParam('only_text');

			me.text = me.translateText.save;

			me.callParent(arguments);
		}
	}
);