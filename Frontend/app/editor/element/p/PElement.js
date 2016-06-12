/**
 * Элемент p.
 *
 * @author dew1983@mail.ru <Suvorov Andrey M.>
 */

Ext.define(
	'FBEditor.editor.element.p.PElement',
	{
		extend: 'FBEditor.editor.element.AbstractStyleHolderElement',
		requires: [
			'FBEditor.editor.element.p.PElementController',
			'FBEditor.editor.element.p.PElementControllerWebKit',
			'FBEditor.editor.command.p.SplitNodeCommand',
			'FBEditor.editor.command.p.RemoveRangeNodesCommand',
			'FBEditor.editor.command.p.JoinNextNodeCommand',
			'FBEditor.editor.command.p.JoinPrevNodeCommand'
		],

		controllerClass: 'FBEditor.editor.element.p.PElementController',
		controllerClassWebkit: 'FBEditor.editor.element.p.PElementControllerWebKit',

		htmlTag: 'p',
		xmlTag: 'p',
		cls: 'el-p',

		isP: true,

		getXml: function ()
		{
			var me = this,
				xml;

			xml = me.callParent(arguments);

			// заменяем все пустые параграфы на br
			xml = xml.replace(/<p><br\/><\/p>/gi, '<br/>');

			return xml;
		}
	}
);