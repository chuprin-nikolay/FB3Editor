/**
 * Кнотроллер элемента div.
 *
 * @author dew1983@mail.ru <Suvorov Andrey M.>
 */

Ext.define(
	'FBEditor.editor.element.div.DivElementController',
	{
		extend: 'FBEditor.editor.element.AbstractElementController',

		onCreateRangeElement: function (sel)
		{
			var me = this,
				node,
				name,
				cmd;

			// проверяем элемент по схеме
			if (me.checkRangeVerify(sel))
			{
				// если элемент прошел проверку, то создаем его
				name = me.getNameElement();
				cmd = Ext.create('FBEditor.editor.command.' + name + '.CreateRangeCommand', {sel: sel});
				if (cmd.execute())
				{
					FBEditor.editor.HistoryManager.add(cmd);
				}
			}
		},

		/**
		 * Проверяет по схеме создание нового элемента из выделения.
		 * @param {Selection} sel Выделение.
		 * @return {Boolean} Успешность проверки.
		 */
		checkRangeVerify: function (sel)
		{
			var me = this,
				els = {},
				nodes = {},
				pos = {},
				reg = {},
				names = {},
				res,
				sch,
				name,
				range;

			name = me.getNameElement();

			// получаем данные из выделения
			sel = sel || window.getSelection();
			range = sel.getRangeAt(0);
			nodes.common = range.commonAncestorContainer;
			els.common = nodes.common.getElement();
			nodes.startContainer = range.startContainer;
			els.startContainer = nodes.startContainer.getElement();
			nodes.endContainer = range.endContainer;
			els.endContainer = nodes.endContainer.getElement();

			// ищем самый верхниий элемент, который может делиться на несколько
			while (!els.common.permit.splittable)
			{
				nodes.common = nodes.common.parentNode;
				els.common = nodes.common.getElement();
				if (els.common.xmlTag === 'fb3-body')
				{
					return false;
				}
			}

			// получаем позицию первого элемента из выделения
			nodes.start = range.startContainer;
			els.start = nodes.start.getElement();
			nodes.parentStart = nodes.start.parentNode;
			els.parentStart = nodes.parentStart.getElement();
			while (els.parentStart.elementId !== els.common.elementId)
			{
				nodes.start = nodes.parentStart;
				els.start = nodes.start.getElement();
				nodes.parentStart = nodes.start.parentNode;
				els.parentStart = nodes.parentStart.getElement();
			}
			pos.start = els.common.getChildPosition(els.start);

			// получаем позицию последнего элемента из выделения
			nodes.end = range.endContainer;
			els.end = nodes.end.getElement();
			nodes.parentEnd = nodes.end.parentNode;
			els.parentEnd = nodes.parentEnd.getElement();
			while (els.parentEnd.elementId !== els.common.elementId)
			{
				nodes.end = nodes.parentEnd;
				els.end = nodes.end.getElement();
				nodes.parentEnd = nodes.end.parentNode;
				els.parentEnd = nodes.parentEnd.getElement();
			}
			pos.end = els.common.getChildPosition(els.end);

			// получаем дочерние имена элементов родитильского элемента для проверки по схеме
			names.common = FBEditor.editor.Manager.getNamesElements(els.common);

			// количество имен элементов, заменяемых в списке
			pos.count = pos.end - pos.start;

			reg.start = new RegExp('^' + range.toString());
			reg.start2 = new RegExp('^' + nodes.start.innerText);
			reg.end = new RegExp(range.toString() + '$');
			reg.end2 = new RegExp(nodes.end.innerText + '$');

			// позиция выделения относительно затронутых элементов
			pos.isStart = reg.start.test(nodes.start.innerText) || reg.start2.test(range.toString());
			pos.isEnd = reg.end.test(nodes.end.innerText) || reg.end2.test(range.toString());

			// получаем имена элементов, которые станут дочерними для элемента, для проверки по схеме
			names.el = names.common.slice(pos.start, pos.end + 1);

			//console.log('names.el', names.el);

			// проверяем элемент по схеме
			sch = FBEditor.editor.Manager.getSchema();
			res = sch.verify(name, names.el);

			if (res)
			{
				// проверяем родительсктий элемент по схеме

				pos.start = !pos.isStart ? pos.start + 1 : pos.start;
				pos.count = pos.isStart && pos.isEnd ? pos.count + 1 : pos.count;
				pos.count = !pos.isStart && !pos.isEnd ? pos.count - 1 : pos.count;

				// убираем из проверки имена элементов, которые попали в выделение, и заменяем их на имя нового элемента
				names.common.splice(pos.start, pos.count, name);
				if (els.start.elementId === els.end.elementId && !pos.isStart && !pos.isEnd)
				{
					// добалвяем имя элемента, который делится выделением пополам
					names.common.splice(pos.start + 1, 0, names.common[pos.start - 1]);
				}

				//console.log('names.common', names.common);

				name = els.common.xmlTag;
				res = sch.verify(name, names.common);
			}

			/*console.log('range', range, range.toString());
			console.log('nodes', nodes);
			console.log('els', els);
			console.log('pos', pos);*/

			return res;
		},

		getNameElementsVerify: function (nodes)
		{
			var me = this,
				els = {},
				nameElements,
				name;

			name = me.getNameElement();
			nodes.node = nodes.parent.getElement().xmlTag === name ? nodes.parent : nodes.node;
			nodes.parent = nodes.node.parentNode;
			els.node = nodes.node.getElement();
			els.parent = nodes.parent.getElement();
			nameElements = FBEditor.editor.Manager.getNamesElements(els.parent);
			nameElements.splice(els.parent.getChildPosition(els.node) + 1, 0, name);

			return nameElements;
		}
	}
);