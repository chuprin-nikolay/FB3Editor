/**
 * Абстрактный контроллер списков, содержащих элемент li.
 *
 * @author dew1983@mail.ru <Suvorov Andrey M.>
 */

Ext.define(
	'FBEditor.editor.element.AbstractLiHolderElementController',
	{
		extend: 'FBEditor.editor.element.AbstractElementController',

		getNodeVerify: function (sel)
		{
			var manager = FBEditor.getEditorManager(),
				els = {},
				nodes = {},
				viewportId,
				range;
			
			// получаем данные из выделения
			range = manager.getRangeCursor();

			// удаляем все оверлеи в тексте
			manager.removeAllOverlays();
			
			nodes.node = range.start;
			viewportId = nodes.node.viewportId;
			els.node = nodes.node.getElement ? nodes.node.getElement() : null;
			els.p = els.node ? els.node.getParentName('p') : null;
			nodes.p = els.p ? els.p.nodes[viewportId] : null;

			if (!nodes.p)
			{
				// родительский список
				els.li = els.node ? els.node.getParentName('li')  : null;
				nodes.node = els.li ? els.li.nodes[viewportId] : null;
			}
			else
			{
				nodes.node = nodes.p;
			}

			// можно не делать дополнительную проверку, так как кнопки на панели уже проверяют схему при синхронизации
			return nodes.node;
		}
	}
);