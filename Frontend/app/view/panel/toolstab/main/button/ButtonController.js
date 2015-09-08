/**
 * Контроллер кнопки элемента.
 *
 * @author dew1983@mail.ru <Suvorov Andrey M.>
 */

Ext.define(
	'FBEditor.view.panel.toolstab.main.button.ButtonController',
	{
		extend: 'Ext.app.ViewController',
		alias: 'controller.panel.toolstab.main.button',

		onClick: function ()
		{
			var me = this,
				btn = me.getView(),
				manager = FBEditor.editor.Manager;

			manager.createElement(btn.elementName, btn.createOpts);
		},

		/**
		 * Синхронизирует состояние кнопки с текущим выделением.
		 */
		onSync: function ()
		{
			var me = this,
				btn = me.getView(),
				manager = FBEditor.editor.Manager;

			if (!btn.isActiveSelection())
			{
				btn.disable();
			}
			else
			{
				btn.enable();
			}

			//console.log('sync', btn.elementName);
		},

		/**
		 * Проверяет получаемую схему.
		 * @param {String} xml Строка xml, новой проверяемой структуры.
		 * @param {Boolean} [debug] Нужно ли выводить отладочные сообщения.
		 */
		verify: function (xml, debug)
		{
			var me = this,
				manager = FBEditor.editor.Manager,
				sch = manager.getSchema(),
				scopeData = {};

			scopeData.debug = debug;

			// вызываем проверку по схеме
			sch.validXml({xml: xml, callback: me.verifyResult, scope: me, scopeData: scopeData});
		},

		/**
		 * @private
		 * Получает результат проверки по схеме.
		 * @param {Boolean} enable Прошла ли проверка.
		 * @param {Object} [scopeData]
		 */
		verifyResult: function (enable, scopeData)
		{
			var me = this,
				btn = me.getView();

			//console.log('btn', enable, btn);

			if (enable)
			{
				btn.enable();
			}
			else
			{
				btn.disable();
			}
		}
	}
);