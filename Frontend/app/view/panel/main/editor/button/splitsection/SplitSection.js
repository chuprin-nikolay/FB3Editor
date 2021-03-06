/**
 * Кнопка разделения секции.
 *
 * @author dew1983@mail.ru <Suvorov Andrey M.>
 */

Ext.define(
    'FBEditor.view.panel.main.editor.button.splitsection.SplitSection',
    {
        extend: 'FBEditor.editor.view.toolbar.button.AbstractButton',
        requires: [
            'FBEditor.view.panel.main.editor.button.splitsection.SplitSectionController'
        ],

        controller: 'editor.toolbar.button.splitsection',

        xtype: 'main-editor-button-splitsection',

        html: '<i class="fa fa-cut"></i>',

        tooltipText: 'Разделить секцию',

        isActiveSelection: function ()
        {
            var me = this,
                active = false,
                sel = window.getSelection(),
                els = {},
	            splittable,
                range;

            range = sel.rangeCount ? sel.getRangeAt(0) : null;

            if (!range || !range.commonAncestorContainer.getElement)
            {
                return false;
            }

            els.common = range.commonAncestorContainer.getElement();

            // находится ли текущее выделение внутри секции
            els.isSection = els.common.hasParentName('section');
	
	        splittable = me.isSplittable(els.common);
	
	        active = els.isSection && splittable ? true : active;

            return active;
        },
	
	    /**
	     * Находится ли текущее выделение внтури элемента, из которого можно разделить секцию.
	     * @param {FBEditor.editor.element.AbstractElement} el Элемент.
	     * @return {Boolean}
	     */
	    isSplittable: function (el)
	    {
		    var names = ['epigraph', 'annotation', 'subscription'],
			    res = true;
		
		    Ext.each(
			    names,
			    function (name)
			    {
				    if (el.hasParentName(name))
				    {
					    res = false;
					
					    return false;
				    }
			    }
		    );
		
		    return res;
	    }
    }
);