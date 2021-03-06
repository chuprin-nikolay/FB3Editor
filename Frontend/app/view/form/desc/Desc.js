/**
 * Форма описания книги.
 *
 * @author dew1983@mail.ru <Suvorov Andrey M.>
 */

Ext.define(
	'FBEditor.view.form.desc.Desc',
	{
		extend: 'Ext.form.Panel',
		requires: [
			'FBEditor.desc.Manager',
			'FBEditor.ux.FieldCleaner',
			'FBEditor.ux.FieldContainerReplicator',
			'FBEditor.ux.SearchField',
			'FBEditor.view.field.country.Country',
			'FBEditor.view.field.lang.Lang',
			'FBEditor.view.field.datetime.Datetime',
			'FBEditor.view.field.textfieldclear.TextFieldClear',
			'FBEditor.view.form.desc.AbstractFieldContainer',
			'FBEditor.view.form.desc.DescController',
			'FBEditor.view.form.desc.date.Date',
			'FBEditor.view.form.desc.field.combobox.required.Required',
			'FBEditor.view.form.desc.field.link.Link',
			'FBEditor.view.form.desc.field.link.uuid.Link',
			'FBEditor.view.form.desc.field.number.required.Required',
			'FBEditor.view.form.desc.field.text.required.Required',
			'FBEditor.view.form.desc.field.textarea.required.Required',
			'FBEditor.view.form.desc.field.time.required.Required',
			'FBEditor.view.form.desc.fieldset.annotation.Annotation',
			'FBEditor.view.form.desc.fieldset.history.History',
			'FBEditor.view.form.desc.fieldset.periodical.Periodical',
			'FBEditor.view.form.desc.fieldset.preamble.Preamble',
			'FBEditor.view.form.desc.fieldset.publishInfo.PublishInfo',
			'FBEditor.view.form.desc.fieldset.AbstractFieldsetInner',
			'FBEditor.view.form.desc.fieldset.Classification',
			'FBEditor.view.form.desc.fieldset.CustomInfo',
			'FBEditor.view.form.desc.fieldset.DocumentInfo',
			'FBEditor.view.form.desc.fieldset.RelationsObject',
			'FBEditor.view.form.desc.fieldset.RelationsSubject',
			'FBEditor.view.form.desc.fieldset.Sequence',
			'FBEditor.view.form.desc.fieldset.Title'
		],

		id: 'form-desc',
		xtype: 'form-desc',
		controller: 'form.desc',
		
		cls: 'form-desc',

		listeners: {
			accessHub: 'onAccessHub',
			loadDesc: 'onLoadData',
			reset: 'onReset',
			activate: 'onActivate',
			resize: 'onResize',
			startScroll: 'onStartScroll'
		},

		layout: {
			type: 'anchor'
		},

		autoScroll: true,
		minWidth: 730,
		bodyPadding: 0,
		
		/**
		 * @private
		 * @property {Object} Данные draft-status.
		 */
		draftStatus: null,

		/**
		 * @private
		 * @property {Boolean} Первая ли активация панели.
		 */
		_firstActivate: false,

		/**
		 * @private
		 * @property {Number} Позиция вертикального скрола до изменения размеров.
		 */
		_oldScrollY: 0,

		beforeLayout: function ()
		{
			var me = this;

			me._oldScrollY = me.getScrollY();
			me.callParent(arguments);
		},

		afterLayout: function ()
		{
			var me = this;

			me.callParent(arguments);

			// исправляем баг с перемоткой скрола
			me.setScrollY(me._oldScrollY);
		},

		initComponent: function ()
		{
			var me = this,
				manager = FBEditor.desc.Manager;

			// регистрируем управление скролом
			Ext.create('FBEditor.scroll.Scroll', me);

			me.items = [
				{
					xtype: 'desc-fieldset-title'
				},
				{
					xtype: 'desc-fieldset-sequence'
				},
				{
					xtype: 'desc-fieldset-relations-subject'
				},
				{
					xtype: 'desc-fieldset-classification'
				},
				{
					xtype: 'desc-fieldset-annotation'
				},
				{
					xtype: 'desc-fieldset-preamble'
				},
				{
					xtype: 'desc-fieldset-periodical'
				},
				{
					xtype: 'desc-fieldset-relations-object'
				},
				{
					xtype: 'desc-fieldset-publishInfo'
				},
				{
					xtype: 'desc-fieldset-history'
				},
				{
					xtype: 'desc-fieldset-customInfo'
				},
				{
					xtype: 'desc-fieldset-documentInfo'
				}
			];

			// инициализируем менеджер описания
			manager.init();

			me.callParent(arguments);
		},

		afterRender: function ()
		{
			var me = this,
				manager = FBEditor.desc.Manager,
                bridgeWindow = FBEditor.getBridgeWindow(),
				content,
				innerCt;

			if (Ext.browser.is.WebKit)
			{
				// делаем костыль для исправления бага с тормозным скролом webkit
				innerCt = me.body.down('.x-autocontainer-innerCt');
				innerCt.setStyle('opacity', '0.99');
			}

			if (manager.isLoadUrl())
			{
				// загружаем описание из url
				Ext.defer(
					function ()
					{
                        content = bridgeWindow.Ext.getCmp('panel-main-content');

                        manager.loadFromUrl().then(
                            function ()
                            {
                                content.fireEvent('contentDesc');
                            }
                        );
					},
				    100
				);
			}

			me.callParent(arguments);
		},

		/**
		 * Проверяет валидность формы.
		 * @return {Boolean} Валидна ли форма.
		 */
		isValid: function ()
		{
			var me = this,
				items = me.items,
				isValid = true,
				manager = FBEditor.desc.Manager,
				firstError;

			manager.fieldsError = [];

			items.each(
				function (item)
				{
					if (item.isValid && !item.isValid())
					{
						isValid = false;
					}
				}
			);

			if (manager.fieldsError.length)
			{
				firstError = manager.fieldsError[0];
				firstError = firstError.getEl().dom;

				//console.log(firstError);

				// прокручиваем скролл к первому ошибочному элементу
				firstError.scrollIntoView();
			}

			return isValid;
		},

		/**
		 * Возвращает данные формы  в виде объекта пригодного для преобразования в xml.
		 * @return {Object} Объект данных.
		 */
		getValues: function ()
		{
			var me = this,
				items = me.items,
				draftStatus = me.getDraftStatus(),
				data = {},
				orderData = {},
				orderNames = ['_id', '_version', '_xmlns', 'periodical', 'title', 'sequence', 'fb3-relations',
				                'fb3-classification', 'lang', 'written', 'translated', 'document-info',
								'draft-status', 'history', 'paper-publish-info', 'custom-info', 'annotation',
								'preamble'];

			// получаем данные
			items.each(
				function (item)
				{
					if (item.getValues)
					{
						data = item.getValues(data);
					}
				}
			);
			
			if (draftStatus)
			{
				data['draft-status'] = me.getDraftStatus();
			}

			// упорядочиваем данные
			Ext.Array.each(
				orderNames,
			    function (item)
			    {
				    if (data[item])
				    {
					    orderData[item] = data[item];
				    }
			    }
			);
			
			//console.log('order data', orderData);

			return orderData;
		},

        /**
		 * Усстанавливает заголовок окна приложения.
         */
        setTitleApp: function ()
		{
			var me = this,
                app = FBEditor.getApplication(),
            	bookName,
				title;

			// получаем название книги
            bookName = me.getBookName();

            title = bookName;

			app.setTitle(title);
		},

        /**
		 * Возвращает название книги.
         * @return {String}
         */
		getBookName: function ()
		{
            var me = this,
                titlePanel = me.down('form-desc-titleArt'),
                bookName;

            bookName = titlePanel.getMain().getValue();

			return bookName;
		},
		
		/**
		 * Устанавливает данные draft-status.
		 * @param {Object} data Данные.
		 */
		setDraftStatus: function (data)
		{
			this.draftStatus = data;
		},
		
		/**
		 * Возвращает данные draft-status.
		 * @return {Object}
		 */
		getDraftStatus: function ()
		{
			var me = this,
				data;
			
			Ext.Object.each(
				me.draftStatus,
				function (key, val)
				{
					data = data || {};
					data['_' + key] = val;
				}
			);
			
			return data;
		}
	}
);