/**
 * Панель редактирования элемента epigraph.
 *
 * @author dew1983@mail.ru <Suvorov Andrey M.>
 */

Ext.define(
	'FBEditor.view.panel.main.props.body.editor.epigraph.Editor',
	{
		extend: 'FBEditor.view.panel.main.props.body.editor.AbstractEditor',

		initComponent: function ()
		{
			var me = this;

			me.items = [
				{
					name: 'id',
					fieldLabel: 'ID',
					anchor: '100%'
				}
			];

			me.callParent(arguments);
		}
	}
);