/**
 * Кнопка создания элемента a.
 *
 * @author dew1983@mail.ru <Suvorov Andrey M.>
 */

Ext.define(
	'FBEditor.view.panel.toolstab.main.button.a.A',
	{
		extend: 'FBEditor.view.panel.toolstab.main.button.AbstractToggleButton',
		id: 'panel-toolstab-main-button-a',
		xtype: 'panel-toolstab-main-button-a',
		//controller: 'panel.toolstab.main.button.a',
		html: '<i class="fa fa-link"></i>',
		tooltip: 'Ссылка',
		elementName: 'a'
	}
);