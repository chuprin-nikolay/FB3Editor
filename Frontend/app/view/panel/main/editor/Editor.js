/**
 * Панель редактора текста книги.
 *
 * @author dew1983@mail.ru <Suvorov Andrey M.>
 */

Ext.define(
	'FBEditor.view.panel.main.editor.Editor',
	{
		extend: 'FBEditor.editor.view.Editor',
		requires: [
			'FBEditor.view.panel.main.editor.EditorController',
			'FBEditor.view.panel.main.editor.Manager',
			'FBEditor.view.panel.main.editor.search.Search',
			'FBEditor.view.panel.main.editor.toolbar.Toolbar',
			'FBEditor.view.panel.main.editor.viewport.Viewport'
		],

		id: 'main-editor',
		xtype: 'main-editor',
		controller: 'view.main.editor',

		layout: 'border',

		listeners: {
			loadData: 'onLoadData',
			afterLoadData: 'onAfterLoadData',
			split: 'onSplit',
			unsplit: 'onUnsplit',
			syncContent: 'onSyncContent',
			focusleave: 'onFocusLeave'
		},

		rootElementName: 'fb3-body',

		/**
		 * @property {Object} Ссылки на активные окна редактирования.
		 * @property {FBEditor.editor.view.viewport.Viewport} Object.north Верхнее окно.
		 * @property {FBEditor.editor.view.viewport.Viewport} Object.south Нижнее окно.
		 */
		viewports: {
			north: null,
			south: null
		},

		/**
		 * @private
		 * @property {Object} Конфиг дополнительного окна редактирования.
		 */
		southViewportConfig: {
			xtype: 'main-editor-viewport',
			height: '50%',
			split: {
				size: 8
			},
			region: 'south'
		},

		/**
		 * @private
		 * @property {FBEditor.view.panel.main.content.Content} Панель контента.
		 */
		panelContent: null,
		
		/**
		 * @private
		 * @property {FBEditor.view.panel.main.editor.search.Search} Панель поиска.
		 */
		searchPanel: null,
		
		/**
		 * @private
		 * @property {FBEditor.view.panel.search.replace.Replace} Панель замены.
		 */
		replacePanel: null,
		
		/**
		 * @private
		 * @property {FBEditor.editor.Range} Выделение в тексте.
		 */
		editorRange: null,

		createManager: function ()
		{
			var me = this;

			if (!me.manager)
			{
                // менеджер для редактора тела книги
                me.manager = Ext.create('FBEditor.view.panel.main.editor.Manager', me);
                me.manager.init();
			}
		},

		initEditor: function ()
		{
			var me = this,
				searchPanel,
				north;
			
			// панель поиска
			searchPanel = Ext.widget(
				{
					xtype: 'main-editor-search',
					region: 'north',
					hidden: true
				}
			);
			
			me.searchPanel = searchPanel;
			me.add(searchPanel);

			// основное окно редактирования
			north = Ext.widget(
				{
					xtype: 'main-editor-viewport',
					region: 'center',
					createRootElement: true
				}
			);

			me.viewports.north = north;
			me.add(north);
		},

		createToolbar: function ()
		{
			return Ext.create('FBEditor.view.panel.main.editor.toolbar.Toolbar');
		},

		/**
		 * Добавляет нижнее окно редактирования.
		 */
		addSouthViewport: function ()
		{
			var me = this,
				north,
				south;

			south = Ext.widget(me.southViewportConfig);
			me.viewports.south = south;
			me.add(south);

			north = me.viewports.north;
			me.fireEvent('syncContent', north);
			south.fireEvent('syncScroll', north);
		},

		/**
		 * Удаляет нижнее окно редактирования.
		 */
		removeSouthViewport: function ()
		{
			var me = this,
				manager = me.getManager(),
				south;

			south = me.viewports.south;

			// удаляем ссылки на узлы
			manager.removeNodes(south.id);

			me.remove(south);
			me.viewports.south = null;
		},

		/**
		 * Возвращает панель контента.
		 * @return {FBEditor.view.panel.main.content.Content}
		 */
		getPanelContent: function ()
		{
			var me = this,
				panel;

			panel = me.panelContent || Ext.getCmp('panel-main-content');
            me.panelContent = panel;

			return panel;
		},

		/**
		 * Возвращает окна редактирования текста.
		 * @return {FBEditor.view.panel.editor.viewport.Viewport[]} Окна редактирования текста.
		 */
		getViewports: function ()
		{
			var me = this,
				viewports = [];

			viewports.push(me.viewports.north);

			if (me.viewports.south)
			{
				viewports.push(me.viewports.south);
			}

			return viewports;
		},
		
		/**
		 * Врзвращает панель поиска.
		 * @return {FBEditor.view.panel.main.editor.search.Search}
		 */
		getSearchPanel: function ()
		{
			return this.searchPanel;
		},
		
		/**
		 * Возвращает панель замены.
		 * @return {FBEditor.view.panel.search.replace.Replace}
		 */
		getReplacePanel: function ()
		{
			var me = this,
				panel;
			
			panel = me.replacePanel || me.down('panel-search-replace');
			me.replacePanel = panel;
			
			return panel;
		},
		
		/**
		 * Сохраняет выделение текста.
		 */
		saveEditorRange: function ()
		{
			var me = this,
				manager = me.getManager();
			
			me.editorRange = manager.getRange();
		},
		
		/**
		 * Возвращает сохраненное выделение в тексте.
		 * @return {FBEditor.editor.Range}
		 */
		getEditorRange: function ()
		{
			return this.editorRange;
		}
	}
);