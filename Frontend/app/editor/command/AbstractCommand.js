/**
 * Абстрактная команда редактора тела книги.
 *
 * @abstract
 * @author dew1983@mail.ru <Suvorov Andrey M.>
 */

Ext.define(
	'FBEditor.editor.command.AbstractCommand',
	{
		extend: 'FBEditor.command.InterfaceCommand',

		/**
		 * @property {Object} Данные для команды.
		 */
		data: null,

		/**
		 * @param {Object} opts Данные.
		 */
		constructor: function (opts)
		{
			var me = this;

			me.data = opts || {};
		},

		/**
		 * Возвращает данные для команды.
		 * @return {Object} Данные для команды.
		 */
		getData: function ()
		{
			return this.data;
		},

		/**
		 * Проверяет элемент по схеме и в случае неудачи отменяет действие команды.
		 * @param {FBEditor.editor.element.AbstractElement} el Элемент.
		 */
		verifyElement: function (el)
		{
			var me = this,
				manager = FBEditor.editor.Manager,
				xml;

			if (!manager.verifyElement(el))
			{
				xml = el.getXml();

				// отменяем действие команды
				me.unExecute();

				console.log('Полученная структура: ', xml);
				throw Error('Действие команды отменено. Полученная структура элемента не соответствует схеме: ' +
				            el.getName());
			}

		}
	}
);