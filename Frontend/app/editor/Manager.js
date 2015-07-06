/**
 * Менеджер редактора тела книги.
 *
 * @author dew1983@mail.ru <Suvorov Andrey M.>
 */

Ext.define(
	'FBEditor.editor.Manager',
	{
		singleton: 'true',
		requires: [
			'FBEditor.editor.schema.Schema',
			'FBEditor.editor.Factory',
			'FBEditor.editor.HistoryManager'
		],

		/**
		 * @property {FBEditor.editor.schema.Schema} Правила проверки элементов.
		 */
		schema: null,

		/**
		 * @property {FBEditor.editor.element.AbstractElement} Корневой элемент тела книги.
		 */
		content: null,

		/**
		 * @property {Selection} Текущее выделение в теле книги.
		 */
		selection: null,

		/**
		 * @property {Object} Данные текущего выделения в теле книги.
		 */
		range: null,

		/**
		 * @property {Boolean} Заморозить ли события вставки узлов.
		 */
		suspendEvent: false,

		/**
		 * @property {String} Имя пустого элемента.
		 */
		emptyElement: 'br',

		/**
		 * @private
		 * @property {FBEditor.editor.element.AbstractElement} Текущий выделенный элемент в редакторе.
		 */
		focusElement: null,

		/**
		 * @property {Object} Хранит id развернутых узлов дерева навигации по тексту.
		 */
		stateExpandedNodesTree: {},

		/**
		 * @property {Array} Список имен элементов, которые могу содержать стилевые элементы форматирования.
		 */
		styleContainers: ['p', 'li', 'subtitle'],

		/**
		 * Инициализирует менеджер.
		 */
		init: function ()
		{
			var me = this;

			me.schema = Ext.create('FBEditor.editor.schema.Schema');
		},

		/**
		 * Возвращает контент.
		 * @return {FBEditor.editor.element.AbstractElement} Корневой элемент тела книги.
		 */
		getContent: function ()
		{
			return this.content;
		},

		/**
		 * Создает контент из загруженной книги.
		 * @param {String} content Исходный объект тела книги в виде строки, которую необходимо преобразовать
		 * в настоящий объект.
		 */
		createContent: function (content)
		{
			var me = this,
				ce,
				ct;

			// сокращенные формы методов создания элементов
			ce = function (el, attr, ch)
			{
				return FBEditor.editor.Factory.createElement(el, attr, ch);
			};
			ct = function (text)
			{
				return FBEditor.editor.Factory.createElementText(text);
			};

			content = content.replace(/\s+/g, ' ');
			content = content.replace(/\), ?]/g, ')]');
			//console.log(content);

			// преобразование строки в объект
			eval('me.content = ' + content);

			// сбрасываем историю
			FBEditor.editor.HistoryManager.clear();

			// загружаем контент
			Ext.getCmp('main-editor').fireEvent('loadData');

			// обновляем дерево навигации по тексту
			me.updateTree();
		},

		/**
		 * Возвращает html тела книги.
		 * @return {HTMLElement}
		 */
		getNode: function (viewportId)
		{
			var me = this,
				content = me.content,
				node;

			FBEditor.editor.Manager.suspendEvent = true;
			node = content.getNode(viewportId);
			FBEditor.editor.Manager.suspendEvent = false;

			return node;
		},

		/**
		 * Возвращает xml тела книги.
		 * @return {String} Строка xml.
		 */
		getXml: function ()
		{
			var me = this,
				content = me.content,
				xml;

			xml = content.getXml();
			xml = '<?xml version="1.0" encoding="UTF-8"?>' + xml;
			console.log(xml);

			return xml;
		},

		/**
		 * Создает корневой элемент.
		 * @return {FBEditor.editor.element.AbstractElement} Корневой элемент.
		 */
		createRootElement: function ()
		{
			var me = this,
				root;

			root = FBEditor.editor.Factory.createElement('fb3-body');
			me.content = root;

			return root;
		},

		/**
		 * Устанавливает текущий выделенный элемент в редакторе.
		 * @param {FBEditor.editor.element.AbstractElement|Node} elOrNode Элемент или узел.
		 * @param {Selection} [sel]
		 */
		setFocusElement: function (elOrNode, sel)
		{
			var me = this,
				bridgeProps = FBEditor.getBridgeProps(),
				el,
				data,
				range;

			el = elOrNode.getElement ? elOrNode.getElement() : elOrNode;
			me.focusElement = el;
			me.selection = sel || window.getSelection();
			range = me.selection.rangeCount ? me.selection.getRangeAt(0) : null;
			if (range)
			{
				me.range = {
					common: range.commonAncestorContainer,
					start: range.startContainer,
					end: range.endContainer,
					offset: {
						start: range.startOffset,
						end: range.endOffset
					}
				};
			}
			else
			{
				me.range = {
					common: elOrNode,
					start: elOrNode,
					end: elOrNode,
					offset: {
						start: 0,
						end: 0
					}
				};
			}

			// показываем информацию о выделенном элементе
			data = el.getData();
			bridgeProps.Ext.getCmp('panel-props-body').fireEvent('loadData', data);
		},

		/**
		 * Устанавливает выделение.
		 * @param data Данные выделения.
		 * @param {Node} data.startNode Начальный узел.
		 * @param {Number} [data.startOffset] Начальное смещение.
		 * @param {Node} [data.endNode] Конечный узел.
		 * @param {Number} [data.endOffset] Конечное смещение.
		 * @param {FBEditor.editor.element.AbstractElement} [data.focusElement] Фокусный элемент.
		 */
		setCursor: function (data)
		{
			var me = this,
				sel = window.getSelection(),
				viewportId;

			data.focusElement = data.focusElement || data.startNode.getElement();
			data.startOffset = data.startOffset || 0;

			// устанавливаем фокус браузера в окно текста
			viewportId = data.startNode.viewportId;
			me.content.nodes[viewportId].focus();

			// перематываем скролл
			if (data.focusElement.nodes[viewportId].scrollIntoView)
			{
				//TODO сделать прокрутку только, если элемент не виден
				//data.focusElement.nodes[viewportId].scrollIntoView();
			}

			// выделение
			if (data.startNode.getElement().isText)
			{
				sel.collapse(data.startNode, data.startOffset);
			}
			else
			{
				sel.collapse(data.startNode);
			}
			if (data.endNode)
			{
				data.endOffset = data.endOffset || 0;
				sel.extend(data.endNode, data.endOffset);
			}

			// сохраняем фокусный элемент
			me.setFocusElement(data.focusElement, sel);
		},

		/**
		 * Возвращает текущий выделенный элемент в редакторе.
		 * @return {FBEditor.editor.element.AbstractElement}
		 */
		getFocusElement: function ()
		{
			return this.focusElement;
		},

		/**
		 * Удаляет все ссылки на узлы для конкретного окна.
		 * @param {String} viewportId Id окна.
		 */
		removeNodes: function (viewportId)
		{
			var me = this,
				rootEl = me.content;

			rootEl.removeNodes(viewportId);
		},

		/**
		 * Создает новый элемент в теле книги.
		 * @param {String} name Имя элемента.
		 * @param {Object} [opts] Дополнительные данные.
		 */
		createElement: function (name, opts)
		{
			var me = this,
				el,
				sel;

			sel = me.getSelection();
			if (sel)
			{
				el = FBEditor.editor.Factory.createElement(name);
				el.fireEvent('createElement', sel, opts);
			}
		},

		/**
		 * Возвращает текущее выделение в теле книги.
		 * @return {Selection} Текущее выделение в теле книги.
		 */
		getSelection: function ()
		{
			return this.selection;
		},

		/**
		 * Возвращает данные текущего выделения в теле книги.
		 * @return {Object}
		 */
		getRange: function ()
		{
			return this.range;
		},

		/**
		 * Возвращает правила проверки элементов.
		 * @return {FBEditor.editor.schema.Schema}
		 */
		getSchema: function ()
		{
			return this.schema;
		},

		/**
		 * Возвращает список имен элементов, которые могу содержать стилевые элементы форматирования.
		 * @return {Array}
		 */
		getStyleContainers: function ()
		{
			return this.styleContainers;
		},

		/**
		 * Обновляет дерево навигации по тексту.
		 */
		updateTree: function ()
		{
			var me = this,
				bridge = FBEditor.getBridgeNavigation();

			if (bridge.Ext && bridge.Ext.getCmp && bridge.Ext.getCmp('panel-body-navigation'))
			{
				bridge.Ext.getCmp('panel-body-navigation').loadData(me.content);
			}
			else
			{
				Ext.defer(
					function ()
					{
						me.updateTree();
					},
				    200
				);
			}
		},

		/**
		 * Возвращает элемент по его id.
		 * @param {Number} id Id элемента.
		 * @param {FBEditor.editor.element.AbstractElement} [el] Элемент относительно которого происходит поиск,
		 * по умолчанию - это корневой элемент.
		 * @return {FBEditor.editor.element.AbstractElement} Элемент.
		 */
		getElementById: function (id, el)
		{
			var me = this,
				res = null;

			el = el || me.getContent();
			if (el.elementId === id)
			{
				return el;
			}
			Ext.Array.each(
				el.children,
				function (item)
				{
					res = me.getElementById(id, item);
					if (res)
					{
						return false;
					}
				}
			);

			return res;
		},

		/**
		 * Возвращает список имен дочерних элементов.
		 * @param {FBEditor.editor.element.AbstractElement} el Элемент.
		 * @return {Array} Имена дочерних элементов.
		 */
		getNamesElements: function (el)
		{
			var els = [];

			Ext.Array.each(
				el.children,
			    function (item)
			    {
				    if (!item.isText)
				    {
					    els.push(item.xmlTag);
				    }
			    }
			);

			return els;
		},

		/**
		 * Возвращает пустой элемент, для заполнения элементов без содержимого.
		 * @return {FBEditor.editor.element.AbstractElement} Пустой элемент.
		 */
		createEmptyElement: function ()
		{
			var me= this,
				el;

			el = FBEditor.editor.Factory.createElement(me.emptyElement);

			return el;
		},

		/**
		 * Создает пустой параграф, для заполнения элементов без содержимого.
		 * @return {FBEditor.editor.element.AbstractElement} Пустой элемент.
		 */
		createEmptyP: function ()
		{
			var me= this,
				els = {};

			els.empty = FBEditor.editor.Factory.createElement(me.emptyElement);
			els.p = FBEditor.editor.Factory.createElement('p');
			els.p.add(els.empty);

			return els.p;
		},

		/**
		 * Разбивает узел на два.
		 * @param els Элементы.
		 * @param els.common Верхний родительский элемент,
		 * отсносительно которого происходит разбивка текущего узла.
		 * @param nodes Узлы.
		 * @param nodes.container Текущий узел, который необходимо разделить.
		 * @param {Number} offset Смещение курсора относительно текущего узла.
		 * @return {Node} Новый узел, получившийся в результате разбивки.
		 */
		splitNode: function (els, nodes, offset)
		{
			var me = this,
				containers = me.getStyleContainers(),
				viewportId;

			nodes.parentContainer = nodes.container.parentNode;
			viewportId = nodes.parentContainer.viewportId;
			els.parentContainer = nodes.parentContainer.getElement();
			els.container = nodes.container.getElement();

			if (els.parentContainer.elementId === els.common.elementId && els.container.isText)
			{
				// простая разбивка текстового узла на два

				nodes.next = nodes.container.nextSibling;

				// части текста
				els.endTextValue = nodes.container.nodeValue.substring(offset);
				els.startTextValue = nodes.container.nodeValue.substring(0, offset);

				if (els.startTextValue)
				{
					// изменяем текст текущего узла
					nodes.container.nodeValue = els.startTextValue;
					els.container.setText(els.startTextValue);
				}

				if (els.startTextValue && els.endTextValue.trim())
				{
					// добавляем текст после текущего узла
					els.container = FBEditor.editor.Factory.createElementText(els.endTextValue);
					nodes.container = els.container.getNode(viewportId);

					if (nodes.next)
					{
						els.next = nodes.next.getElement();
						els.parentContainer.insertBefore(els.container, els.next);
						nodes.parentContainer.insertBefore(nodes.container, nodes.next);
					}
					else
					{
						els.parentContainer.add(els.container);
						nodes.parentContainer.appendChild(nodes.container);
					}
				}
			}
			else
			{
				while (els.parentContainer.elementId !== els.common.elementId)
				{
					nodes.next = nodes.parentContainer.nextSibling;
					nodes.parent = nodes.parentContainer.parentNode;
					els.parent = nodes.parent.getElement();
					nodes.nextContainer = nodes.container.nextSibling;

					// клонируем узел
					els.cloneContainer = els.parentContainer.clone({ignoredDeep: true});

					if (els.container.isText)
					{
						// часть текста после курсора
						els.endTextValue = nodes.container.nodeValue.substring(offset);

						// часть текста перед курсором
						els.startTextValue = nodes.container.nodeValue.substring(0, offset);

						if (!els.startTextValue)
						{
							if (!nodes.parentContainer.previousSibling &&
							    Ext.Array.contains(containers, els.parentContainer.xmlTag))
							{
								// вставляем пустое содержимое вместо текущего узла
								els.empty = me.createEmptyElement();
								els.parentContainer.replace(els.empty, els.container);
								nodes.parentContainer.replaceChild(els.empty.getNode(viewportId), nodes.container);
							}
							else
							{
								// удаляем пустой текущий узел
								els.parentContainer.remove(els.container);
								nodes.parentContainer.removeChild(nodes.container);
							}
						}
						else
						{
							// изменяем текст текущего узла
							nodes.container.nodeValue = els.startTextValue;
							els.container.setText(els.startTextValue);
						}

						if (els.endTextValue.trim())
						{
							// добавляем текст
							els.t = FBEditor.editor.Factory.createElementText(els.endTextValue);
							els.cloneContainer.add(els.t);
						}

						nodes.cloneContainer = els.cloneContainer.getNode(viewportId);

						if (nodes.next)
						{
							els.next = nodes.next.getElement();
							els.parent.insertBefore(els.cloneContainer, els.next);
							nodes.parent.insertBefore(nodes.cloneContainer, nodes.next);
						}
						else
						{
							els.parent.add(els.cloneContainer);
							nodes.parent.appendChild(nodes.cloneContainer);
						}
					}
					else
					{
						nodes.cloneContainer = els.cloneContainer.getNode(viewportId);

						if (nodes.next)
						{
							els.next = nodes.next.getElement();
							els.parent.insertBefore(els.cloneContainer, els.next);
							nodes.parent.insertBefore(nodes.cloneContainer, nodes.next);
						}
						else
						{
							els.parent.add(els.cloneContainer);
							nodes.parent.appendChild(nodes.cloneContainer);
						}

						if (nodes.container.firstChild)
						{
							// если элемент не пустой, то переносим его в клонированный элемент
							els.cloneContainer.add(els.container);
							nodes.cloneContainer.appendChild(nodes.container);
						}
						else
						{
							// или просто удаляем
							nodes.parentContainer.removeChild(nodes.container);
						}
						els.parentContainer.remove(els.container);
					}

					// переносим все узлы после курсора
					nodes.parent = nodes.cloneContainer;
					els.parent = nodes.parent.getElement();
					while (nodes.nextContainer)
					{
						els.nextContainer = nodes.nextContainer.getElement();
						nodes.buf = nodes.nextContainer.nextSibling;

						els.parent.add(els.nextContainer);
						nodes.parent.appendChild(nodes.nextContainer);
						els.parentContainer.remove(els.nextContainer);

						nodes.nextContainer = nodes.buf;
					}

					if (!nodes.parent.firstChild && Ext.Array.contains(containers, els.parent.xmlTag) &&
					    !nodes.parent.nextSibling)
					{
						// добавляем пустое содержимое в параграф
						els.empty = me.createEmptyElement();
						els.parent.add(els.empty);
						nodes.parent.appendChild(els.empty.getNode(viewportId));
					}

					// переносим указатель
					nodes.container = nodes.cloneContainer;
					els.container = nodes.container.getElement();

					if (!nodes.parentContainer.firstChild)
					{
						// удаляем пустой контейнер
						nodes.parentContainer.parentNode.getElement().remove(els.parentContainer);
						nodes.parentContainer.parentNode.removeChild(nodes.parentContainer);
					}

					nodes.parentContainer = nodes.container.parentNode;
					els.parentContainer = nodes.parentContainer.getElement();
				}
			}

			return nodes.container;
		},

		/**
		 * Соединяет переданный узел с предыдущим узлом.
		 * @param {Node} node Узел, который необходимо объединить с предыдущим.
		 */
		joinNode: function (node)
		{
			var me = this,
				nodes = {},
				els = {};

			nodes.node = node;
			els.node = node.getElement();
			nodes.prev = node.previousSibling;
			els.prev = nodes.prev.getElement();

			if (els.node.isText && els.prev.isText)
			{
				// соединяем текстовые узлы
				els.text = els.prev.text + els.node.text;
				els.prev.setText(els.text);
				nodes.prev.nodeValue = els.text;
			}
			else
			{
				// переносим все элементы в предыдущий узел

				nodes.first = nodes.node.firstChild;
				els.first = nodes.first ? nodes.first.getElement() : null;
				nodes.prevLast = nodes.prev;
				els.prevLast = els.prev;
				nodes.last = nodes.prevLast.lastChild;
				els.last = nodes.last ? nodes.last.getElement() : null;
				//console.log('join nodes, els', nodes, els);
				while (els.first && els.last)
				{
					nodes.firstChild = nodes.first.firstChild;
					nodes.next = nodes.first;
					//console.log('nodes.first, nodes.last, nodes.prevLast', nodes.first, nodes.last, nodes.prevLast);
					if (els.last.isText && !els.first.isText)
					{
						// перенос узлов без возможности объединения текста
						while (nodes.next)
						{
							//console.log('(1) nodes.next, nodes.last', nodes.next, nodes.last);
							nodes.buf = nodes.next.nextSibling;
							els.next = nodes.next.getElement();

							// переносим узел
							els.prevLast.add(els.next);
							nodes.next.parentNode.getElement().remove(els.next);
							nodes.prevLast.appendChild(nodes.next);

							nodes.next = nodes.buf;
						}
					}
					else
					{
						// перенос узлов с возможностью объединения текста
						while (nodes.next)
						{
							//console.log('(2) nodes.next, nodes.last', nodes.next, nodes.last);
							nodes.buf = nodes.next.nextSibling;
							els.next = nodes.next.getElement();
							if (els.last && els.last.isText && els.next.isText)
							{
								// объединяем текстовые узлы
								els.nodeValue = nodes.last.nodeValue + nodes.next.nodeValue;
								nodes.last.nodeValue = els.nodeValue;
								els.last.setText(els.nodeValue);
							}
							else
							{
								// переносим узел
								els.prevLast.add(els.next);
								nodes.next.parentNode.getElement().remove(els.next);
								nodes.prevLast.appendChild(nodes.next);

								if (els.last.isText)
								{
									nodes.last = nodes.prevLast.lastChild;
									els.last = nodes.last ? nodes.last.getElement() : null;
								}
							}
							nodes.next = nodes.buf;
						}

						if (els.last.isText)
						{
							// удаляем узел
							nodes.first.parentNode.getElement().remove(els.first);
							nodes.first.parentNode.removeChild(nodes.first);
						}
					}

					if (nodes.prevLast.firstChild.getElement().xmlTag === me.emptyElement)
					{
						// удаляем пустой узел
						els.prevLast.remove(nodes.prevLast.firstChild.getElement());
						nodes.prevLast.removeChild(nodes.prevLast.firstChild);
					}

					nodes.first = nodes.firstChild;
					els.first = nodes.first ? nodes.first.getElement() : null;
					nodes.prevLast = nodes.last;
					els.prevLast = els.last;
					nodes.last = nodes.prevLast.lastChild;
					els.last = nodes.last ? nodes.last.getElement() : null;
				}
			}

			// удаляем узел
			nodes.node.parentNode.getElement().remove(els.node);
			nodes.node.parentNode.removeChild(nodes.node);
		},

		/**
		 * Является ли первым узел node, относителя предка common.
		 * @param {Node} common Предок относительно которого происходит определение.
		 * @param {Node} node Определяемый узел.
		 * @return {Boolean} Первый ли узел.
		 */
		isFirstNode: function (common, node)
		{
			var nodes = {},
				els = {};

			els.common = common.getElement();
			nodes.node = node;
			els.node = nodes.node.getElement();
			//console.log('common, nodes', common, nodes);
			do
			{
				nodes.parent = nodes.node.parentNode;
				els.parent = nodes.parent.getElement();
				nodes.parentParent = nodes.parent.parentNode;
				els.parentParent = nodes.parentParent.getElement();
				nodes.first = nodes.parent.firstChild;
				els.first = nodes.first.getElement();
				//console.log('first, parent, parentParent', nodes.first, nodes.parent, nodes.parentParent,
				// [els.first.elementId, els.node.elementId]);

				if (els.first.elementId !== els.node.elementId)
				{
					// узел не является первым потомком
					return false;
				}

				nodes.node = nodes.parent;
				els.node = nodes.node.getElement();
			}
			while (els.parentParent.elementId !== els.common.elementId && els.parent.elementId !== els.common.elementId && !els.parentParent.isRoot);

			return true;
		},

		/**
		 * Является ли последним узел node, относителя предка common.
		 * @param {Node} common Предок относительно которого происходит определение.
		 * @param {Node} node Определяемый узел.
		 * @return {Boolean} Последний ли узел.
		 */
		isLastNode: function (common, node)
		{
			var nodes = {},
				els = {};

			els.common = common.getElement();
			nodes.node = node;
			els.node = nodes.node.getElement();
			//console.log('common, nodes', common, nodes);
			do
			{
				nodes.parent = nodes.node.parentNode;
				els.parent = nodes.parent.getElement();
				nodes.parentParent = nodes.parent.parentNode;
				els.parentParent = nodes.parentParent.getElement();
				nodes.last = nodes.parent.lastChild;
				els.last = nodes.last.getElement();
				//console.log('last, parent, parentParent', nodes.last, nodes.parent, nodes.parentParent,
				// [els.last.elementId, els.node.elementId]);

				if (els.last.elementId !== els.node.elementId)
				{
					// узел не является последним
					return false;
				}

				nodes.node = nodes.parent;
				els.node = nodes.node.getElement();
			}
			while (els.parentParent.elementId !== els.common.elementId && els.parent.elementId !== els.common.elementId && !els.parentParent.isRoot);

			return true;
		},

		/**
		 * Рекурсивно возвращает список параграфов начиная с узла cur до элемента els.lastP.
		 * @param {Node} cur Узел, с которого начинается поиск параграфов в тексте.
		 * @param {Object} nodes
		 * @param els
		 * @param {FBEditor.editor.element.AbstractElement} els.lastP Последний параграф,
		 * перед которым поиск должен завершиться.
		 * @return {Array} Список параграфов (p/li/subtitle).
		 */
		getNodesPP: function (cur, nodes, els)
		{
			var me = this,
				pp = [],
				p = [],
				containers;

			//console.log('cur', cur);

			if (!cur)
			{
				return pp;
			}

			els.cur = cur.getElement();

			if (els.cur.elementId === els.lastP.elementId)
			{
				// сигнал остановить рекурсию
				nodes.ppStop = true;

				return pp;
			}

			containers = me.getStyleContainers();

			if (!Ext.Array.contains(containers, els.cur.xmlTag))
			{
				// если элемент не параграф, ищем в нем все вложенные параграфы

				nodes.first = cur.firstChild;
				els.first = nodes.first ? nodes.first.getElement() : null;
				if (els.first && !els.first.isText)
				{
					//console.log('first');
					p = me.getNodesPP(nodes.first, nodes, els);
					Ext.Array.push(pp, p);
				}
			}
			else
			{
				pp = [cur];
			}

			if (cur.nextSibling && !nodes.ppStop)
			{
				// ищем в следующем элементе
				cur = cur.nextSibling;
				//console.log('next');
				p = me.getNodesPP(cur, nodes, els);
				Ext.Array.push(pp, p);
			}

			if (!nodes.ppStop)
			{
				// ищем в следующем по отношению к родительскому

				nodes.parent = cur.parentNode;
				els.parent = nodes.parent.getElement();

				while (!nodes.parent.nextSibling && els.parent.elementId !== els.common.elementId)
				{
					nodes.parent = nodes.parent.parentNode;
					els.parent = nodes.parent.getElement();
				}

				nodes.parentNext = nodes.parent.nextSibling;

				if (nodes.parentNext && els.parent.elementId !== els.common.elementId)
				{
					//console.log('parent next');
					p = me.getNodesPP(nodes.parentNext, nodes, els);
					Ext.Array.push(pp, p);
				}
			}

			return pp;
		},

		/**
		 * Возвращает самый вложенный первый дочерний узел.
		 * @param {Node} node Узел.
		 * @return {Node}
		 */
		getDeepFirst: function (node)
		{
			if (node)
			{
				while (node.firstChild)
				{
					node = node.firstChild;
				}
			}

			return node;
		},

		/**
		 * Возвращает самый вложенный последний дочерний узел.
		 * @param {Node} node Узел.
		 * @return {Node}
		 */
		getDeepLast: function (node)
		{
			if (node)
			{
				while (node.lastChild)
				{
					node = node.lastChild;
				}
			}

			return node;
		}
	}
);