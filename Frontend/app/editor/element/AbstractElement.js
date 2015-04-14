/**
 * Класс абстрактого элемента.
 *
 * @author dew1983@mail.ru <Suvorov Andrey M.>
 */

Ext.define(
	'FBEditor.editor.element.AbstractElement',
	{
		extend: 'FBEditor.editor.element.InterfaceElement',

		/**
		 * @property {FBEditor.editor.element.AbstractElement[]} [children] Дочерние элементы.
		 */
		children: [],

		/**
		 * @property {Object} attributes Атрибуты элемента.
		 */
		attributes: {},

		/**
		 * @property {String} Имя тега для отображения в html.
		 */
		htmlTag: 'div',

		/**
		 * @property {String} Имя тега в xml.
		 */
		xmlTag: 'div',

		/**
		 * @property {String} Строка стилей.
		 */
		style: '',

		baseCls: '',

		cls: '',

		/**
		 * @private
		 * @config {Object} Узлы html, привязанные к своим окнам.
		 * Ключ каждого свойства представляет id окна, а значение - узел html.
		 */
		//nodes: {},

		/**
		 * @param {Object} attributes Атрибуты элемента.
		 * @param {FBEditor.editor.element.AbstractElement[]|null} [children] Дочерние элементы.
		 */
		constructor: function (attributes, children)
		{
			var me = this;

			me.initConfig();
			me.children = children || me.children;
			me.attributes = attributes || me.attributes;
		},

		add: function (el)
		{
			var me = this;

			me.children.push(el);
		},

		insertBefore: function (el, nextEl)
		{
			var me = this,
				children = me.children,
				pos = me.getChildPosition(nextEl);

			children.splice(pos, 0, el);
			me.children = children;
		},

		remove: function (el)
		{
			var me = this,
				children = me.children,
				pos = me.getChildPosition(el);

			el.clear();
			el.removeAll();
			children.splice(pos, 1);
			me.children = children;
		},

		removeAll: function ()
		{
			var me = this,
				children = me.children;

			 Ext.Array.each(
				 children,
			     function (el)
			     {
				     me.remove(el);
			     }
			 );
		},

		clear: function ()
		{
			var me = this;
		},

		setNode: function (node)
		{
			var me = this;

			node.getElement = function ()
			{
				return me;
			};
			me.nodes = me.nodes || {};
			me.nodes[node.viewportId] = node;
		},

		getNode: function (viewportId)
		{
			var me = this,
				children = me.children,
				tag = me.htmlTag,
				node;

			node = document.createElement(tag);
			me.setStyleHtml();
			node = me.setAttributesHtml(node);
			node.viewportId = viewportId;
			me.setNode(node);
			node = me.setEvents(node);
			if (children && children.length)
			{
				Ext.Array.each(
					children,
					function (item)
					{
						node.appendChild(item.getNode(viewportId));
					}
				);
			}

			return node;
		},

		removeNodes: function (viewportId)
		{
			var me = this,
				children = me.children;

			delete me.nodes[viewportId];
			if (children.length)
			{
				Ext.Array.each(
					children,
					function (item)
					{
						item.removeNodes(viewportId);
					}
				);
			}
		},

		getXml: function ()
		{
			var me = this,
				children = me.children,
				tag = me.xmlTag,
				xml,
				attr;

			attr = me.getAttributesXml();
			xml = '<' + tag;
			xml += attr ? ' ' + attr : '';
			if (children && children.length)
			{
				xml += '>';
				Ext.Array.each(
					children,
					function (item)
					{
						xml += item.getXml();
					}
				);
				xml += '</' + tag + '>';
			}
			else
			{
				xml += '/>';
			}

			return xml;
		},

		getData: function ()
		{
			var me = this,
				node,
				htmlPath,
				data;

			function getHtmlPath (node, path)
			{
				var name = node.nodeType !== Node.TEXT_NODE ? node.nodeName : '',
					parentNode = node.parentNode,
					newPath;

				newPath = name + (path ? ' > ' + path : '');
				if (name !== 'MAIN')
				{
					newPath = getHtmlPath(parentNode, newPath);
				}

				return newPath;
			}

			node = Ext.Object.getValues(me.nodes)[0];
			htmlPath = getHtmlPath(node);
			data = {
				xmlName: me.xmlTag,
				htmlPath: htmlPath
			};

			return data;
		},

		sync: function (viewportId)
		{
			var me = this,
				newNode;

			FBEditor.editor.Manager.suspendEvent = true;
			console.log('sync ' + viewportId, me.nodes);
			Ext.Object.each(
				me.nodes,
			    function (id, oldNode)
			    {
				    if (id !== viewportId)
				    {
					    newNode = me.getNode(id);
					    console.log('newNode, oldNode', newNode, oldNode, oldNode.parentNode);
					    oldNode.parentNode.replaceChild(newNode, oldNode);
				    }
			    }
			);
			FBEditor.editor.Manager.suspendEvent = false;
		},

		setEvents: function (element)
		{
			var me = this;

			element.addEventListener('keyup', function (e) {me.onKeyUp(e);}, false);
			element.addEventListener('mouseup', function (e) {me.onMouseUp(e);}, false);
			element.addEventListener('DOMNodeInserted', function (e) {me.onNodeInserted(e);}, false);
			element.addEventListener('DOMNodeRemoved', function (e) {me.onNodeRemoved(e);}, false);
			element.addEventListener('drop', function (e) {me.onDrop(e);}, false);

			return element;
		},

		/**
		 * @protected
		 * Отпускание кнопки клавиатуры определяет элемент, на котором находится курсор.
		 * @param {Event} e Объект события.
		 */
		onKeyUp: function (e)
		{
			var me = this,
				focusNode,
				focusElement;

			focusNode = me.getFocusNode(e.target);
			focusElement = focusNode.getElement();
			console.log('keyup: focusNode, focusElement', e, focusNode, focusElement);
			FBEditor.editor.Manager.setFocusElement(focusElement);
		},

		/**
		 * @protected
		 * Отпускание кнопки мыши определяет элемент, на котором находится фокус.
		 * @param {Event} e Объект события.
		 */
		onMouseUp: function (e)
		{
			var me = this,
				focusNode,
				focusElement;

			focusNode = me.getFocusNode(e.target);
			focusElement = focusNode.getElement();
			console.log('mouseup: focusNode, focusElement', e, focusNode, focusElement);
			FBEditor.editor.Manager.setFocusElement(focusElement);
			e.stopPropagation();

			return false;
		},

		/**
		 * @protected
		 * Вставка нового узла.
		 * @param {Event} e Объект события.
		 */
		onNodeInserted: function (e)
		{
			var me = this,
				relNode = e.relatedNode,
				node = e.target,
				viewportId = relNode.viewportId,
				newEl,
				nextSibling,
				previousSibling,
				parentEl,
				nextSiblingEl;

			// игнориуруется вставка корневого узла, так как он уже вставлен и
			// игнорируется вставка при включенной заморозке
			if (relNode.firstChild.nodeName !== 'MAIN' && !FBEditor.editor.Manager.suspendEvent)
			{
				console.log('DOMNodeInserted:', e);
				if (node.nodeType === Node.TEXT_NODE)
				{
					newEl = FBEditor.editor.Factory.createElementText(node.nodeValue);
				}
				else
				{
					newEl = FBEditor.editor.Factory.createElement(node.localName);
				}
				node.viewportId = viewportId;
				newEl.setNode(node);
				nextSibling = node.nextSibling;
				previousSibling = node.previousSibling;
				parentEl = relNode.getElement();
				//console.log('newEl', newEl, nextSibling);
				if (nextSibling)
				{
					nextSiblingEl = nextSibling.getElement();
					parentEl.insertBefore(newEl, nextSiblingEl);
					parentEl.sync(viewportId);
					FBEditor.editor.Manager.setFocusElement(newEl);
				}
				else if (!nextSibling && !previousSibling)
				{
					parentEl.removeAll();
					parentEl.add(newEl);
					parentEl.sync(viewportId);
					FBEditor.editor.Manager.setFocusElement(newEl);
				}
				else
				{
					parentEl.add(newEl);
					parentEl.sync(viewportId);
					FBEditor.editor.Manager.setFocusElement(newEl);
				}
			}
		},

		/**
		 * @protected
		 * Удаление узла.
		 * @param {Event} e Объект события.
		 */
		onNodeRemoved: function (e)
		{
			var me = this,
				relNode = e.relatedNode,
				target = e.target,
				viewportId = relNode.viewportId,
				parentEl,
				el;

			// игнориуруется удаление корневого узла, так как он всегда необходим
			if (relNode.firstChild.localName !== 'main' && !FBEditor.editor.Manager.suspendEvent)
			{
				console.log('DOMNodeRemoved:', e, me);
				parentEl = relNode.getElement();
				el = target.getElement();
				parentEl.remove(el);
				parentEl.sync(viewportId);
			}
		},

		/**
		 * @protected
		 * Дроп узла.
		 * @param {Event} e Объект события.
		 */
		onDrop: function (e)
		{
			//console.log('drop:', e, me);

			e.preventDefault();
		},

		/**
		 * @protected
		 * Возвращает строку атрибутов элементов для xml.
		 * @return {String} Строка атрибутов.
		 */
		getAttributesXml: function ()
		{
			var me = this,
				attr = '';

			Ext.Object.each(
				me.attributes,
				function (key, val)
				{
					attr += key + '="' + val + '" ';
				}
			);

			return attr;
		},

		/**
		 * @protected
		 * Устанавливает стили для узла html.
		 * @return {String} Строка стилей.
		 */
		setStyleHtml: function ()
		{
			return this.style;
		},

		/**
		 * @protected
		 * Устанавливает атрибуты html-элемента.
		 * @param {HTMLElement} element
		 * @return {HTMLElement} element
		 */
		setAttributesHtml: function (element)
		{
			var me = this,
				el = element,
				cls;

			Ext.Object.each(
				me.attributes,
				function (key, val)
				{
					el.setAttribute(key, val);
				}
			);
			if (me.style)
			{
				el.setAttribute('style', me.style);
			}
			if (me.baseCls || me.cls)
			{
				cls = me.baseCls ? me.baseCls : '';
				cls += cls ? ' ' + me.cls : me.cls;
				el.setAttribute('class', cls);
			}

			return el;
		},

		/**
		 * @protected
		 * Возвращает позицию дочернего элемента, относительно родителя.
		 * @param {FBEditor.editor.element.AbstractElement} el Дочерний элемент.
		 * @return {Number} Позиция дочернего элемента.
		 */
		getChildPosition: function (el)
		{
			var me = this,
				children = me.children,
				pos = 0;

			Ext.Array.each(
				children,
				function (item, index)
				{
					if (Ext.Object.equals(el, item))
					{
						pos = index;

						return false;
					}
				}
			);

			return pos;
		},

		/**
		 * @protected
		 * Возвращает выделенный узел html, на котором установлен фокус.
		 * @param {HTMLElement} target Узел html.
		 * @return {HTMLElement}
		 */
		getFocusNode: function (target)
		{
			var me = this,
				sel = window.getSelection(),
				node = target,
				range;

			range = sel && sel.type !== 'None' ? sel.getRangeAt(0) : null;
			if (range)
			{
				if (sel.type === 'Range')
				{
					node = range.commonAncestorContainer.nodeType === Node.TEXT_NODE ?
					       range.commonAncestorContainer.parentNode : range.commonAncestorContainer;
				}
				else if (sel.type === 'Caret' && node.nodeName !== 'IMG')
				{
					node = range.commonAncestorContainer.nodeType === Node.TEXT_NODE ?
					       range.commonAncestorContainer.parentNode : range.commonAncestorContainer;
				}
			}
			console.log('sel, range, node', sel, range, node);
			if (node.getElement === undefined)
			{
				node = me.getFocusNode(node.parentNode);
			}

			return node;
		}
	}
);