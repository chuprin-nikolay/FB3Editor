/**
 * Панель редактирования элемента td.
 *
 * @author dew1983@mail.ru <Suvorov Andrey M.>
 */

Ext.define(
	'FBEditor.view.panel.main.props.body.editor.td.Editor',
	{
		extend: 'FBEditor.view.panel.main.props.body.editor.AbstractEditor',

		updateData: function ()
		{
			var me = this;

			me.callParent(arguments);

			// скрываем кнопки
			me.setVisibleButtons(false);
		}
	}
);