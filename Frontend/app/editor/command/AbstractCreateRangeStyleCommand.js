/**
 * Абстрактная команда для создания элементов форматирования (стилевые элементы) из выделения.
 * Элементы форматирования могут быть созданы в элементах p, li, subtitle.
 *
 * @abstract
 * @author dew1983@mail.ru <Suvorov Andrey M.>
 */

Ext.define(
	'FBEditor.editor.command.AbstractCreateRangeStyleCommand',
	{
		extend: 'FBEditor.editor.command.AbstractCommand',

		execute: function ()
		{
			var me = this,
				data = me.getData(),
				factory = FBEditor.editor.Factory,
				res = false,
				els = {},
				nodes = {},
				offset = {},
				pos = {},
				helper,
				viewportId,
				attributes,
				manager,
				sel,
				range;

			try
			{
				console.log('create ' + me.elementName, data);

				if (data.saveRange)
				{
					// восстанвливаем выделение
					els.node = data.saveRange.startNode.getElement();
					manager = els.node.getManager();
					manager.setCursor(data.saveRange);
				}

				// получаем данные из выделения
				sel = data.sel || window.getSelection();
				range = sel.getRangeAt(0);

				if (range.collapsed)
				{
					throw Error('Отсутствует выделение');
				}

				// аттрибуты создаваемого элемента
				attributes = data.opts && data.opts.attributes ? data.opts.attributes : [];

				nodes.common = range.commonAncestorContainer;
				els.common = nodes.common.getElement();
				data.viewportId = nodes.common.viewportId;
				viewportId = data.viewportId;

				manager = manager || els.common.getManager();
				manager.setSuspendEvent(true);

				offset = {
					start: range.startOffset,
					end: range.endOffset
				};
				data.range = {
					common: range.commonAncestorContainer,
					start: range.startContainer,
					end: range.endContainer,
					parentStart: range.startContainer.parentNode,
					collapsed: range.collapsed,
					offset: offset
				};
				data.links = {};

				//console.log('range', range);

				if (els.common.isText)
				{
					// выделен только текстовый узел

					data.range.oldValue = els.common.getText();
					els.parent = els.common.parent;
					helper = els.parent.getNodeHelper();
					nodes.parent = helper.getNode();
					data.links.parent = nodes.parent;
					els.next = els.common.next();

					// получаем части текста
					els.startValue = els.common.getText(0, offset.start);
					els.selValue = els.common.getText(offset.start, offset.end);
					els.endValue = els.common.getText(offset.end);

					if (els.startValue)
					{
						// меняем текст исходного элемента
						els.common.setText(els.startValue, viewportId);
					}
					else
					{
						// удаляем пустой элемент
						els.parent.remove(els.common, viewportId);
					}

					// новый элемент c выделенной частью текста
					els.node = factory.createElement(me.elementName, attributes);
					els = Ext.apply(els, els.node.createScaffold());
					els.t.setText(els.selValue);
					nodes.node = els.node.getNode(viewportId);

					if (els.next)
					{
						els.parent.insertBefore(els.node, els.next, viewportId);
					}
					else
					{
						els.parent.add(els.node, viewportId);
					}

					data.links.newNode = nodes.node;

					// курсор
					nodes.cursor = nodes.node.firstChild;

					// новый текстовый элемент c последней частью текста
					if (els.endValue)
					{
						els.node = factory.createElementText(els.endValue);
						nodes.node = els.node.getNode(viewportId);

						if (els.next)
						{
							els.parent.insertBefore(els.node, els.next, viewportId);
						}
						else
						{
							els.parent.add(els.node, viewportId);
						}
					}
				}
				else
				{
					// получаем все параграфы p (или li/subtitle), которые затрагивает текущее выделение

					// параграфы между первым и последним
					nodes.pp = [];

					// первый параграф
					els.firstP = range.startContainer.getElement();
					els.firstP = els.firstP.getStyleHolder();
					helper = els.firstP.getNodeHelper();
					nodes.firstP = helper.getNode(viewportId);

					// последний параграф
					els.lastP = range.endContainer.getElement().getStyleHolder();
					helper = els.lastP.getNodeHelper();
					nodes.lastP = helper.getNode(viewportId);

					// находим список параграфов между первым и последним
					if (!els.firstP.equal(els.lastP))
					{
						nodes.cur = nodes.firstP;
						
						while (!nodes.cur.nextSibling)
						{
							nodes.cur = nodes.cur.parentNode;
						}
						
						nodes.pp = manager.getNodesPP(nodes.cur.nextSibling, nodes, els);
					}

					// определяем находятся ли граничные точки выделения в начале и конце абзаца
					pos.isStart = els.firstP.isStartRange(range);
					pos.isEnd = els.lastP.isEndRange(range);
					data.range.pos = pos;
					
					//console.log('pos', pos, range.toString());

					if (pos.isStart)
					{
						// начальная точка выделения находится в начале параграфа, разделение узла не требуется
						els.startContainer = els.firstP.first();
						helper = els.startContainer.getNodeHelper();
						nodes.startContainer = helper.getNode(viewportId);
					}
					else
					{
						// разбиваем первый узел на два в точке начального выделения
						nodes.common = nodes.firstP;
						els.common = els.firstP;
						nodes.container = range.startContainer;
						nodes.startContainer = manager.splitNode(els, nodes, offset.start);
						els.startContainer = nodes.startContainer.getElement();
						els.common.removeEmptyText();
					}

					nodes.parentStart = nodes.startContainer.parentNode;
					els.parentStart = nodes.parentStart.getElement();

					nodes.endContainer = range.endContainer;
					els.endContainer = nodes.endContainer.getElement();
					nodes.parentEnd = nodes.endContainer.parentNode;
					els.parentEnd = nodes.parentEnd.getElement();

					if (pos.isEnd)
					{
						// конечная точка выделения находится в конце параграфа, разделение узла не требуется
						nodes.endContainer = nodes.lastP.lastChild;
					}
					else if (els.endContainer.isText && els.parentEnd.elementId === els.lastP.elementId &&
					         data.range.offset.end === els.endContainer.text.length)
					{
						// конечная точка выделения находится в конце текстового узла,
						// который является прямым потомком параграфа

						// указатель на элемент в конечной точке выделения
						nodes.endContainer = nodes.endContainer.nextSibling ?
						                     nodes.endContainer.nextSibling : nodes.endContainer;
					}
					else
					{
						// разбиваем последний узел на два в точке конечного выделения
						nodes.common = nodes.lastP;
						els.common = els.lastP;
						nodes.container = nodes.endContainer;
						nodes.endContainer = manager.splitNode(els, nodes, offset.end);
						els.common.removeEmptyText();
					}

					els.endContainer = nodes.endContainer.getElement();

					nodes.parentEnd = nodes.endContainer.parentNode;
					els.parentEnd = nodes.parentEnd.getElement();

					if (!nodes.endContainer.firstChild && !els.endContainer.isText)
					{
						// если точка конечного выделения ссылается на пустой элемент
						// перемещаем ее на следующий или предыдущий элемент, а пустой элемент удаляем

						nodes.bufRemove = nodes.endContainer;
						nodes.endContainer = nodes.endContainer.nextSibling ?
						                     nodes.endContainer.nextSibling : nodes.endContainer.previousSibling;

						els.parentEnd.remove(nodes.bufRemove.getElement(), viewportId);

						els.endContainer = nodes.endContainer.getElement();
					}

					// новый элемент в первом параграфе
					els.node = factory.createElement(me.elementName, attributes);
					nodes.node = els.node.getNode(viewportId);
					els.parentStart.insertBefore(els.node, els.startContainer);
					nodes.parentStart.insertBefore(nodes.node, nodes.startContainer);

					// заполняем новый элемент в первом параграфе

					els.next = els.node.next();

					while (els.next && (!els.next.equal(els.endContainer) || pos.isEnd))
					{
						// выполняется до тех пор, пока не закончится параграф или не встретится конечный элемент
						els.node.add(els.next, viewportId);
						els.next = els.node.next();
					}

					//console.log('nodes', nodes); return false;

					// начальные и конечные точки выделения находятся в разных параграфах
					if (!els.parentStart.equal(els.parentEnd))
					{
						nodes.prev = nodes.endContainer.previousSibling;

						// новый элемент в последнем параграфе
						els.node = factory.createElement(me.elementName, attributes);
						nodes.node = els.node.getNode(data.viewportId);
						nodes.first = nodes.parentEnd.firstChild;
						els.first = nodes.first.getElement();
						els.parentEnd.insertBefore(els.node, els.first);
						nodes.parentEnd.insertBefore(nodes.node, nodes.first);

						// заполняем новый элемент в последнем параграфе

						els.next = els.node.next();

						while (els.next && (!els.next.equal(els.endContainer) || pos.isEnd))
						{
							// выполняется до тех пор, пока не закончится параграф или не встретится конечный элемент
							els.node.add(els.next, viewportId);
							els.next = els.node.next();
						}
					}

					// перебираем все параграфы, которые входят в выделение между первым и последним параграфами
					// и изменяем их содержимое
					Ext.Array.each(
						nodes.pp,
						function (p)
						{
							var elsP = {},
								nodesP = {};

							nodesP.p = p;
							elsP.p = nodesP.p.getElement();

							// новый элемент в параграфе
							elsP.node = factory.createElement(me.elementName, attributes);
							nodesP.node = elsP.node.getNode(viewportId);
							nodesP.first = nodesP.p.firstChild;
							elsP.first = nodesP.first.getElement();
							elsP.p.insertBefore(elsP.node, elsP.first);
							nodesP.p.insertBefore(nodesP.node, nodesP.first);

							// заполняем новый элемент
							while (elsP.next = elsP.node.next())
							{
								elsP.node.add(elsP.next, viewportId);
							}
						}
					);

					// родительский элемент параграфов
					nodes.parent = nodes.parentStart.parentNode;
					els.parent = nodes.parent.getElement();

					// курсор
					nodes.cursor = pos.isEnd ? nodes.endContainer : nodes.endContainer.previousSibling;
					els.cursor = nodes.cursor.getElement();
					while (els.cursor && !els.cursor.isText)
					{
						nodes.cursor = nodes.cursor.lastChild;
						els.cursor = nodes.cursor ? nodes.cursor.getElement() : null;
					}
				}

				//console.log('nodes, els', nodes, els, data.links);

				// оптимизируем пересекающиеся однотипные элементы
				me.optimizeEqualIntersectEls(els.parent);

				// синхронизируем
				els.parent.sync(viewportId);

				manager.setSuspendEvent(false);

				els.focus = nodes.cursor.parentNode.getElement();

				// сохраняем айди, чтобы избежать двойной синхронизации кнопок
				manager.cashSyncBtn = els.focus.elementId;

				// устанавливаем курсор
				manager.setCursor(
					{
						startNode: nodes.cursor,
						startOffset: nodes.cursor.nodeValue.length,
						focusElement: els.focus
					}
				);

				// сохраняем узлы
				data.saveNodes = nodes;

				// проверяем по схеме
				me.verifyElement(els.parent);

				res = true;
			}
			catch (e)
			{
				Ext.log({level: 'warn', msg: e, dump: e});
				me.getHistory(els.parent).removeNext();
			}

			manager.setSuspendEvent(false);
			return res;
		},

		unExecute: function ()
		{
			var me = this,
				data = me.getData(),
				res = false,
				els = {},
				nodes = {},
				factory = FBEditor.editor.Factory,
				manager,
				range,
				viewportId;

			try
			{
				range = data.range;
				nodes = data.saveNodes;
				viewportId = nodes.node.viewportId;

				nodes.common = range.common;
				els.common = nodes.common.getElement();

				manager = els.common.getManager();
				manager.setSuspendEvent(true);

				console.log('undo create ' + me.elementName, data, nodes);

				if (data.optimizeQueue)
				{
					// восстанавливаем оптимизированные элементы
					me.unOptimizeEqualIntersectEls(nodes.parent.getElement());
				}

				if (els.common.elementId === range.start.getElement().elementId)
				{
					// был выделен только текстовый узел

					nodes.parent = nodes.common.parentNode || data.links.parent;
					els.parent = nodes.parent.getElement();

					if (nodes.common.parentNode)
					{
						// меняем текст исходного элемента
						els.common.setText(range.oldValue, viewportId);
					}
					else
					{
						// создаем текстовый узел
						els.common = factory.createElementText(range.oldValue);
						nodes.common = els.common.getNode(data.viewportId);

						nodes.newNode = data.links.newNode;
						els.newNode = nodes.newNode.getElement();
						els.parent.insertBefore(els.common, els.newNode);
						nodes.parent.insertBefore(nodes.common, nodes.newNode);

						range.start = nodes.common;
						range.end = nodes.common;
					}

					// удаляем новые узлы

					nodes.next = nodes.common.nextSibling;
					els.next = nodes.next.getElement();
					els.parent.remove(els.next);
					nodes.parent.removeChild(nodes.next);

					if (range.offset.end < range.oldValue.length)
					{
						nodes.next = nodes.common.nextSibling;
						els.next = nodes.next.getElement();
						els.parent.remove(els.next);
						nodes.parent.removeChild(nodes.next);
					}
				}
				else
				{
					// переносим элементы в первом параграфе

					els.firstP = nodes.firstP.getElement();
					nodes.parent = nodes.startContainer.parentNode;
					els.parent = nodes.parent.getElement();
					nodes.first = nodes.parent.firstChild;

					while (nodes.first)
					{
						// выполняется до тех пор, пока не закончатся элементы
						els.first = nodes.first.getElement();
						els.firstP.insertBefore(els.first, els.parent);
						nodes.firstP.insertBefore(nodes.first, nodes.parent);
						els.parent.remove(els.first);
						nodes.first = nodes.parent.firstChild;
					}

					// удаляем новый элемент из первого параграфа
					els.firstP.remove(els.parent);
					nodes.firstP.removeChild(nodes.parent);

					if (range.offset.start)
					{
						// соединяем узлы первого параграфа
						manager.joinNode(nodes.startContainer);
					}

					els.lastP = nodes.lastP.getElement();

					if (els.firstP.elementId !== els.lastP.elementId)
					{
						// начальные и конечные точки выделения находятся в разных параграфах

						// переносим элементы в последнем параграфе
						els.lastP = nodes.lastP.getElement();
						nodes.parent = nodes.lastP.firstChild;
						els.parent = nodes.parent.getElement();
						nodes.first = nodes.parent.firstChild;

						while (nodes.first)
						{
							// выполняется до тех пор, пока не закончатся элементы
							els.first = nodes.first.getElement();
							els.lastP.insertBefore(els.first, els.parent);
							nodes.lastP.insertBefore(nodes.first, nodes.parent);
							els.parent.remove(els.first);
							nodes.first = nodes.parent.firstChild;
						}

						// удаляем новый элемент из последнего параграфа
						els.lastP.remove(els.parent);
						nodes.lastP.removeChild(nodes.parent);
					}

					if (range.offset.end < range.end.length)
					{
						// соединяем узлы последнего параграфа
						manager.joinNode(nodes.endContainer);
					}

					// перебираем все параграфы, которые входят в выделение между первым и последним параграфами
					// и изменяем их содержимое
					Ext.Array.each(
						nodes.pp,
						function (p)
						{
							var elsP = {},
								nodesP = {};

							nodesP.p = p;
							elsP.p = nodesP.p.getElement();

							// переносим все дочерние элементы из нового элемента
							nodesP.parent = nodesP.p.firstChild;
							elsP.parent = nodesP.parent.getElement();
							nodesP.first = nodesP.parent.firstChild;
							while (nodesP.first)
							{
								// выполняется до тех пор, пока не закончатся элементы
								elsP.first = nodesP.first.getElement();
								elsP.p.add(elsP.first);
								nodesP.p.appendChild(nodesP.first);
								elsP.parent.remove(elsP.first);
								nodesP.first = nodesP.parent.firstChild;
							}

							// удаляем новый элемент
							elsP.p.remove(elsP.parent);
							nodesP.p.removeChild(nodesP.parent);
						}
					);

					// для синхронизации и курсора
					els.parent = els.common;
				}

				// синхронизируем
				els.parent.sync(viewportId);

				manager.setSuspendEvent(false);

				data.saveRange = {
					startNode: range.start,
					endNode: range.end,
					startOffset: range.offset.start,
					endOffset: range.offset.end,
					focusElement: els.parent
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
		},

		/**
		 * @private
		 * Опитмизирует однотипные пересекающиеся элементы.
		 * @param {FBEditor.editor.element.AbstractElement} el Родительский элемент, относительно которого
		 * начинается оптимизация.
		 */
		optimizeEqualIntersectEls: function (el)
		{
			var me = this,
				data = me.getData(),
				continueOptimize = true,
				queue = [],
				map;

			while (continueOptimize)
			{
				continueOptimize = false;

				// соединяет соседние однотипные стилевые элементы
				if (map = me.joinEqualSibling(el))
				{
					queue.push(
						{
							type: 'join',
							map: map
						}
					);
				}

				// удаляет однотипные вложенные друг в друга стилевые элементы
				if (map = me.removeEqualInner(el))
				{
					queue.push(
						{
							type: 'remove',
							map: map
						}
					);

					continueOptimize = true;
				}
			}

			data.optimizeQueue = queue.length ? queue : null;
		},

		/**
		 * @private
		 * Восстанавливает исходное состояние оптимизированных пересекавшихся элементов.
		 * @param {FBEditor.editor.element.AbstractElement} el Родительский элемент, относительно которого
		 * начинается восстановление.
		 */
		unOptimizeEqualIntersectEls: function (el)
		{
			var me = this,
				data = me.getData(),
				queue = data.optimizeQueue.reverse();

			//console.log('queue', queue);

			Ext.each(
				queue,
			    function (item)
			    {
				    switch (item.type)
				    {
					    case 'remove':
						    me.unRemoveEqualInner(item.map);
						    break;
					    case 'join':
						    me.unJoinEqualSibling(item.map, el);
						    break;
				    }
			    }
			);

			delete data.optimizeQueue;
		},

		/**
		 * @private
		 * Соединяет соседние однотипные стилевые элементы.
		 * @param {FBEditor.editor.element.AbstractElement} el Родительский элемент, относительно которого
		 * начинается проверка.
		 * @param {Object} mapJoinEqual Сохраненные ссылки на оптимизированные элементы (для ctrl+z).
		 * @return {Object} Сохраненные ссылки на оптимизированные элементы (для ctrl+z).
		 */
		joinEqualSibling: function (el, mapJoinEqual)
		{
			var me = this,
				data = me.getData(),
				viewportId = data.viewportId,
				els = {},
				map;

			if (el.isStyleFormat && el.next() && el.getName() === el.next().getName())
			{
				// соединяем соседние элементы

				map = {
					el: el,
					next: el.next(),
					child: []
				};

				els.next = el.next();
				els.first = els.next.first();

				while (els.first)
				{
					map.child.push(els.first);
					el.add(els.first, viewportId);
					els.first = els.next.first();
				}

				el.parent.remove(els.next, viewportId);

				// сохраняем ссылки для ctrl+z
				mapJoinEqual = mapJoinEqual || {};
				mapJoinEqual[el.elementId] = mapJoinEqual[el.elementId] || [];
				mapJoinEqual[el.elementId].push(map);

				// проверяем еще раз
				mapJoinEqual = me.joinEqualSibling(el, mapJoinEqual);
			}

			// проверяем потомков
			el.each(
				function (child)
				{
					mapJoinEqual = me.joinEqualSibling(child, mapJoinEqual);
				}
			);

			return mapJoinEqual;
		},

		/**
		 * @private
		 * Разъединяет соединенные соседние однотипные стилевые элементы.
		 * @param {FBEditor.editor.element.AbstractElement} el Родительский элемент, относительно которого
		 * начинается проверка.
		 * @param {Object} mapData Данные для восстановления.
		 */
		unJoinEqualSibling: function (mapData, el)
		{
			var me = this,
				data = me.getData(),
				viewportId = data.viewportId,
				els = {},
				nodes = {},
				map,
				helper;

			if (el.isStyleFormat && mapData[el.elementId])
			{
				// разъединяем соединенные соседние элементы

				// получаем сохраненные данные
				map = mapData[el.elementId][mapData[el.elementId].length - 1];

				// элемент, который должен быть следующим
				els.old = map.next;
				helper = els.old.getNodeHelper();
				nodes.old = helper.getNode(viewportId);

				if (!nodes.old.parentNode)
				{
					// создаем следующий элемент

					if (els.next = el.next())
					{
						el.parent.insertBefore(els.old, els.next, viewportId);
					}
					else
					{
						el.parent.add(els.old, viewportId);
					}
				}

				// переносим потомка во вновь созданный следующий элемент
				els.child = map.child.shift();
				els.old.add(els.child, viewportId);

				if (!map.child.length)
				{
					// подчищаем данные, как только все потомки перенесены
					mapData[el.elementId].pop();
				}

				if (!mapData[el.elementId].length)
				{
					// подчищаем данные
					delete mapData[el.elementId];
				}

				// проверяем еще раз
				me.unJoinEqualSibling(mapData, el);
			}

			// проверяем потомков
			el.each(
				function (child)
				{
					me.unJoinEqualSibling(mapData, child);
				}
			);
		},

		/**
		 * @private
		 * Удаляет вложенные друг в друга однотипные стилевые элементы.
		 * @param {FBEditor.editor.element.AbstractElement} el Родительский элемент, относительно которого
		 * начинается проверка.
		 * @param {Object} mapRemoveEqual Сохраненные ссылки на оптимизированные элементы (для ctrl+z).
		 * @return {Object} Сохраненные ссылки на оптимизированные элементы (для ctrl+z).
		 */
		removeEqualInner: function (el, mapRemoveEqual)
		{
			var me = this,
				data = me.getData(),
				viewportId = data.viewportId,
				els = {},
				map;

			if (el.isStyleFormat && el.hasParentName(el.getName()))
			{
				// удаляем вложенный элемент, перенося всех его потомков на его же уровень

				// сохраняем ссылки для ctrl+z
				map = {
					el: el,
					child: []
				};

				while (els.first = el.first())
				{
					el.parent.insertBefore(els.first, el, viewportId);

					// для ctrl+z
					map.child.push(els.first);
				}

				el.parent.remove(el, viewportId);

				// для ctrl+z
				mapRemoveEqual = mapRemoveEqual || [];
				mapRemoveEqual.push(map);
			}

			// проверяем потомков
			el.each(
				function (child)
				{
					mapRemoveEqual = me.removeEqualInner(child, mapRemoveEqual);
				}
			);

			return mapRemoveEqual;
		},

		/**
		 * @private
		 * Восттанваливает удаленные вложенные друг в друга однотипные стилевые элементы.
		 * @param {Array} mapData Данные для восстановления.
		 */
		unRemoveEqualInner: function (mapData)
		{
			var me = this,
				data = me.getData(),
				viewportId = data.viewportId,
				els = {};

			Ext.each(
				mapData,
			    function (map)
			    {
				    // восстанавливаем вложенный элемент

				    els.el = map.el;
				    els.parent = els.el.parent;
				    els.first = map.child[0];
				    els.parent.insertBefore(els.el, els.first, viewportId);

				    // перемещаем во вновь созданный вложенный элемент всех его потомков
				    Ext.each(
					    map.child,
				        function (child)
				        {
					        els.el.add(child, viewportId);
				        }
				    )
			    }
			)
		}
	}
);