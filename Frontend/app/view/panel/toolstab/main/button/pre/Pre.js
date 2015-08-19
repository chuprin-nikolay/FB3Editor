/**
 * Кнопка создания элемента pre.
 *
 * @author dew1983@mail.ru <Suvorov Andrey M.>
 */

Ext.define(
	'FBEditor.view.panel.toolstab.main.button.pre.Pre',
	{
		extend: 'FBEditor.view.panel.toolstab.main.button.AbstractStyleButton',
		id: 'panel-toolstab-main-button-pre',
		xtype: 'panel-toolstab-main-button-pre',
		//controller: 'panel.toolstab.main.button.pre',
		html: '<span style="position: relative; font-family: monospace; font-size: 1.4em; top: 2px;">M</span>',
		tooltip: 'Моноширинный (Ctrl+M)',
		elementName: 'pre'
	}
);