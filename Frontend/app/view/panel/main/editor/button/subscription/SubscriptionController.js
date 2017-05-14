/**
 * Контроллер кнопки subscription.
 *
 * @author dew1983@mail.ru <Suvorov Andrey M.>
 */

Ext.define(
	'FBEditor.view.panel.main.editor.button.subscription.SubscriptionController',
	{
		extend: 'FBEditor.view.panel.main.editor.button.ButtonController',
		alias: 'controller.main.editor.button.subscription',

		/**
		 * Синхронизирует кнопку, используя проверку по схему.
		 */
		onSync: function ()
		{
			var me = this,
				btn = me.getView(),
				manager = btn.getEditorManager(),
				factory = FBEditor.editor.Factory,
				nodes = {},
				els = {},
				name = btn.elementName,
				range,
				xml;

			if (!manager.availableSyncButtons())
			{
				btn.enable();
				return;
			}

			range = manager.getRange();

			if (!range)
			{
				btn.disable();

				return;
			}

			nodes.node = range.common;

			if (!nodes.node.getElement || nodes.node.getElement().isRoot)
			{
				btn.disable();

				return;
			}

			els.node = nodes.node.getElement();
			nodes.parent = nodes.node.parentNode;
			els.parent = nodes.parent.getElement();

			while (els.parent.isStyleHolder || els.parent.isStyleType)
			{
				nodes.node = nodes.parent;
				els.node = nodes.node.getElement();
				nodes.parent = nodes.node.parentNode;
				els.parent = nodes.parent.getElement();
			}

			// создаем временный элемент для проверки новой структуры
			els.newEl = factory.createElement(name);
			els.newEl.createScaffold();

			if (!range.collapsed)
			{
				// переносим выделенный параграф

				els.p = range.start.getElement();
				els.isRoot = els.p.isRoot;
				while (els.p && !els.p.isP)
				{
					els.p = els.isRoot ? els.p.first() : els.p.parent;
				}

				if (!els.p)
				{
					btn.disable();

					return;
				}

				els.parentP = els.p.parent;
				els.next = els.p.next();
				els.newEl.add(els.p);
			}

			els.parent.children.push(els.newEl);

			// получаем xml
			xml = manager.getContent().getXml(true);

			// удаляем временный элемент
			els.parent.children.pop();

			if (!range.collapsed)
			{
				// возвращаем параграф на старое место
				if (els.next)
				{
					els.parentP.insertBefore(els.p, els.next);
				}
				else
				{
					els.parentP.add(els.p);
				}
			}

			// проверяем по схеме
			me.verify(xml);
		}
	}
);