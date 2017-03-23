/**
 * Панель редактирования элемента p.
 *
 * @author dew1983@mail.ru <Suvorov Andrey M.>
 */

Ext.define(
	'FBEditor.view.panel.main.props.body.editor.p.Editor',
	{
		extend: 'FBEditor.view.panel.main.props.body.editor.AbstractEditor',

		initComponent: function ()
		{
			var me = this;

			me.items = [
				{
					xtype: 'panel-props-body-editor-fields-id'
				}
			];

			me.callParent(arguments);
		}
	}
);