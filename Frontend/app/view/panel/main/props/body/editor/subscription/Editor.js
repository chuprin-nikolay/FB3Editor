/**
 * Панель редактирования элемента subscription.
 *
 * @author dew1983@mail.ru <Suvorov Andrey M.>
 */

Ext.define(
	'FBEditor.view.panel.main.props.body.editor.subscription.Editor',
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