/**
 * Прокси для внешнего редактора xml.
 * Используется http://codemirror.net
 *
 * @author dew1983@mail.ru <Suvorov Andrey M.>
 */
 
Ext.define(
    'FBEditor.view.panel.main.xml.proxy.Editor',
    {
        requires: [
	        'FBEditor.view.panel.main.xml.proxy.Hotkeys',
            'FBEditor.view.panel.main.xml.proxy.search.Search'
        ],

        /**
         * @private
         * @property {CodeMirror} Сторонний редактор xml.
         */
        lib: null,

        /**
         * @private
         * @property {FBEditor.view.panel.main.xml.Manager} Менеджер редактора xml.
         */
        manager: null,

        /**
         * @private
         * @property {FBEditor.view.panel.main.xml.proxy.search.Search} Прокси для поиска.
         */
        search: null,
	
	    /**
	     * @private
	     * @property {FBEditor.view.panel.main.xml.proxy.Hotkeys} Прокси горячих клавиш.
	     */
	    hotkeys: null,

        constructor: function ()
        {
            var me = this;

            me.lib = CodeMirror;

            // прокси для поиска
            me.search = Ext.create('FBEditor.view.panel.main.xml.proxy.search.Search', me);
            
            // прокси горячих клавиш
            me.hotkeys = Ext.create('FBEditor.view.panel.main.xml.proxy.Hotkeys', me);
        },

        /**
         * Инициализирует прокси.
         * @param {FBEditor.view.panel.main.xml.Manager} manager Менеджер редактора xml.
         */
        init: function (manager)
        {
            var me = this,
                lib = me.getLib(),
	            hotkeys = me.hotkeys,
                panel,
                node;

            me.manager = manager;
            panel = manager.getPanel();
            node = panel.getNode();

            me.lib = lib = lib(
                node,
                {
                    mode: 'xml'
                }
            );

            lib.setSize('100%', '100%');

            lib.getManager = function ()
            {
                return manager;
            };
            
            // инициализируем горячие клавиши
            hotkeys.init(manager);
        },
	
	    /**
	     * Создает и возвращает объект позиции курсора.
	     * @param {Integer} line Номер строки
	     * @param {Integer} [ch] Номер колонки.
	     * @return {Pos}
	     */
	    createPos: function (line, ch)
	    {
	    	return CodeMirror.Pos(line, ch);
	    },

        /**
         * Возвращает используемый редактор xml.
         * @return {CodeMirror}
         */
        getLib: function ()
        {
            return this.lib;
        },

        /**
         * Возвращает прокси поиска.
         * @return {FBEditor.view.panel.main.xml.proxy.search.Search}
         */
        getSearch: function ()
        {
            return this.search;
        },

        /**
         * Устанавливает содержимое редатора xml.
         * @param {String} data Данные.
         */
        setData: function (data)
        {
            var me = this,
                lib = me.getLib(),
                count;

            lib.setValue(data);

            /*
            // общее количество строк в редакторе xml
            count = me.getLineCount();

            // устанавливаем отображение всех строк в редакторе xml
            lib.setOption('viewportMargin', count);
            */
        },

        /**
         * Возвращает содержимое редактора xml.
         * @return {String} Данные.
         */
        getData: function ()
        {
            var me = this,
                lib = me.getLib(),
                data;

            data = lib.getValue();

            return data;
        },

        /**
         * Устанавливаем перенос длинных строк.
         * @param {Boolean} wrap true - включить перенос.
         */
        setLineWrap: function (wrap)
        {
            var me = this,
                lib = me.getLib();

            lib.setOption('lineWrapping', wrap);
        },

        /**
         * Возвращает общее количество строк в редакторе xml.
         * @return {Number} Количество строк.
         */
        getLineCount: function ()
        {
            var me = this,
                lib = me.getLib(),
                count;

            count = lib.lineCount();

            return count;
        },
	
	    /**
	     * Возвращает текст строки.
	     * @param {Number} num Номер строки.
	     * @return {String} Текст строки.
	     */
	    getLine: function (num)
	    {
		    var me = this,
			    lib = me.getLib(),
			    text;
		
		    text = lib.getLine(num);
		
		    return text;
	    },
	
	    /**
         * Возвращает текущую позицию курсора в тексте.
	     * @param {String} start - from|to|head|anchor
	     * @return {Object}
	     */
	    getCursor: function (start)
        {
	        var me = this,
		        lib = me.getLib(),
		        cur;
	
	        cur = lib.getCursor(start);
	
	        return cur;
        },
	
	    /**
         * Устанавливает выделение в тексте.
	     * @param {Object} from Начальная поизиция выделения.
	     * @param {Number} from.line Номер строки.
	     * @param {Number} from.ch Номер колонки.
	     * @param {Object} [to] Конечная позиция выделения.
	     * @param {Number} to.line Номер строки.
	     * @param {Number} to.ch Номер колонки.
	     */
	    setSelection: function (from, to)
        {
	        var me = this,
		        lib = me.getLib();
	
	        lib.setSelection(from, to);
        },
	
	    /**
	     * Возвращает выделенную часть текста.
	     * @return {String}
	     */
	    getSelection: function ()
	    {
		    var me = this,
			    lib = me.getLib(),
			    text;
		
		    text = lib.getSelection();
		
		    return text;
	    },
	
	    /**
         * Прокручивает скролл к нужной поизции в тексте.
	     * @param {Object} from Начальная поизиция.
	     * @param {Number} from.line Номер строки.
	     * @param {Number} from.ch Номер колонки.
	     * @param {Object} to Конечная позиция.
	     * @param {Number} to.line Номер строки.
	     * @param {Number} to.ch Номер колонки.
         * @param {Number} [margin] Вертикальное смещение скролла после прокрутки.
	     */
	    scrollIntoView: function (from, to, margin)
        {
	        var me = this,
		        lib = me.getLib();
	
	        lib.scrollIntoView(
                {
                    from: from,
                    to: to
                },
                margin
            );
        },
	
	    /**
	     * Устанавливает курсор в нужную позицию.
	     * @param {Object} pos Позиция курсора.
	     * @param {Number} pos.line Номер строки.
	     * @param {Number} pos.ch Номер столбца.
	     */
	    setCursor: function (pos)
	    {
		    var me = this,
			    lib = me.getLib();
		
		    me.focus();
		    lib.setCursor(pos);
	    },
	
	    /**
	     * Создает подсветку в тексте.
	     * @param {Object} overlay
	     * @param {Function} overlay.token
	     */
	    addOverlay: function (overlay)
	    {
		    var me = this,
			    lib = me.getLib();
		
		    lib.addOverlay(overlay);
	    },
	
	    /**
         * Удаляет подсветку в тексте.
	     * @param {Object} overlay
         * @param {Function} overlay.token
	     */
	    removeOverlay: function (overlay)
        {
	        var me = this,
		        lib = me.getLib();
	        
	        lib.removeOverlay(overlay);
        },
	
	    /**
	     * Выполняет несколько операций как одну.
	     * @param {Function} fn Функция, которая выполняет несколько операций.
	     */
	    operation: function (fn)
	    {
		    var me = this,
			    lib = me.getLib();
		
		    lib.operation(fn);
	    },
	
	    /**
	     * Устанавливает фокус в окне редактора.
	     */
	    focus: function ()
	    {
		    var me = this,
			    lib = me.getLib();
		
		    if (!lib.hasFocus())
		    {
			    lib.focus();
		    }
	    }
    }
);