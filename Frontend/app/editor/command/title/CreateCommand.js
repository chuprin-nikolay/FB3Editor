/**
 * Создает заголовок.
 *
 * @author dew1983@mail.ru <Suvorov Andrey M.>
 */

Ext.define(
	'FBEditor.editor.command.title.CreateCommand',
	{
		extend: 'FBEditor.editor.command.AbstractCreateCommand',

		elementName: 'title',

		createElement: function (els, nodes)
		{
			var me = this,
				data = me.getData(),
				opts = data.opts || {},
				range = data.range,
				factory = FBEditor.editor.Factory,
				manager;

			manager = els.node.getManager();

			els.node = factory.createElement(me.elementName);

			if (opts.body)
			{
				// заголовок для всей книги
				els.parent = manager.getContent();
				nodes.parent = els.parent.nodes[data.viewportId];
			}
			else
			{
				nodes.parent = nodes.node.parentNode;
				nodes.node = nodes.parent.getElement().hisName(els.node.getName()) ? nodes.parent : nodes.node;
				nodes.parent = nodes.node.parentNode;
			}

			nodes.first = nodes.parent.firstChild;
			els.parent = nodes.parent.getElement();

			if (range.collapsed)
			{
				// содержимое по умолчанию
				els.p = factory.createElement('p');
				els.t = factory.createElementText('Заголовок');
				els.p.add(els.t);
				els.node.add(els.p);
			}

			nodes.node = els.node.getNode(data.viewportId);

			if (nodes.first)
			{
				els.first = nodes.first.getElement();
				els.parent.insertBefore(els.node, els.first);
				nodes.parent.insertBefore(nodes.node, nodes.first);
			}
			else
			{
				els.parent.add(els.node);
				nodes.parent.appendChild(nodes.node);
			}

			if (!range.collapsed)
			{
				// переносим выделенный параграф в заголовок

				nodes.p = range.start;
				els.p = nodes.p.getElement();
				els.isRoot = els.p.isRoot;
				while (els.p && !els.p.isP)
				{
					nodes.p = els.isRoot ? nodes.p.firstChild : nodes.p.parentNode;
					els.p = nodes.p ? nodes.p.getElement() : null;
				}

				nodes.next = nodes.p.nextSibling;

				els.node.add(els.p);
				nodes.node.appendChild(nodes.p);
			}

			me.data.nodes = nodes;
		},

		unExecute: function ()
		{
			var me = this,
				data = me.getData(),
				res = false,
				els = {},
				nodes = {},
				manager,
				range;

			try
			{
				range = data.range;

				if (range.collapsed)
				{
					return me.callParent(arguments);
				}

				nodes = data.nodes;
				els.node = nodes.node.getElement();
				els.parent = nodes.parent.getElement();
				els.p = nodes.p.getElement();

				manager = els.node.getManager();
				manager.setSuspendEvent(true);

				// возвращаем параграф на старое место из элемента
				if (nodes.next)
				{
					els.next = nodes.next.getElement();
					els.parent.insertBefore(els.p, els.next);
					nodes.parent.insertBefore(nodes.p, nodes.next);
				}
				else
				{
					els.parent.add(els.p);
					nodes.parent.appendChild(nodes.p);
				}

				// удаляем элемент
				els.parent.remove(els.node);
				nodes.parent.removeChild(nodes.node);

				els.parent.sync(data.viewportId);

				// устанавливаем курсор
				nodes.cursor = manager.getDeepLast(nodes.p);
				data.saveRange = {
					startNode: nodes.cursor,
					startOffset: 0,
					endNode: nodes.cursor,
					endOffset: nodes.cursor.length
				};
				manager.setCursor(data.saveRange);

				res = true;
			}
			catch (e)
			{
				Ext.log({level: 'warn', msg: e, dump: e});
				me.getHistory(els.parent).remove();
			}

			manager.setSuspendEvent(false);
			return res;
		}
	}
);