/**
 * Соединяет subtitle предыдущим.
 *
 * @author dew1983@mail.ru <Suvorov Andrey M.>
 */

Ext.define(
	'FBEditor.editor.command.subtitle.JoinPrevNodeCommand',
	{
		extend: 'FBEditor.editor.command.styleholder.AbstractJoinPrevNodeCommand',

		elementName: 'subtitle'
	}
);