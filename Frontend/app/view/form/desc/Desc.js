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
			'FBEditor.view.form.desc.DescController',
			'Ext.ux.FieldReplicator',
			'FBEditor.ux.FieldContainerReplicator',
			'FBEditor.view.field.country.Country',
			'FBEditor.view.field.lang.Lang',
			'FBEditor.view.field.datetime.Datetime',
			'FBEditor.view.field.textfieldclear.TextFieldClear',
			'FBEditor.view.form.desc.AbstractFieldContainer',
			'FBEditor.view.form.desc.fieldset.AbstractFieldsetInner',
			'FBEditor.view.form.desc.fieldset.Title',
			'FBEditor.view.form.desc.fieldset.Sequence',
			'FBEditor.view.form.desc.fieldset.annotation.Annotation',
			'FBEditor.view.form.desc.fieldset.history.History',
			'FBEditor.view.form.desc.fieldset.periodical.Periodical',
			'FBEditor.view.form.desc.fieldset.preamble.Preamble',
			'FBEditor.view.form.desc.fieldset.Classification',
			'FBEditor.view.form.desc.fieldset.RelationsSubject',
			'FBEditor.view.form.desc.fieldset.RelationsObject',
			'FBEditor.view.form.desc.fieldset.CustomInfo',
			'FBEditor.view.form.desc.fieldset.PublishInfo',
			'FBEditor.view.form.desc.fieldset.DocumentInfo'
		],
		id: 'form-desc',
		xtype: 'form-desc',
		controller: 'form.desc',
		autoScroll: true,
		layout: {
			type: 'anchor'
		},
		//minWidth: 730,
		bodyPadding: 0,
		cls: 'form-desc',
		listeners: {
			accessHub: 'onAccessHub',
			loadDesc: 'onLoadData',
			reset: 'onReset',
			activate: 'onActivate',
			afterrender: 'onAfterRender',
			scroll: 'onScroll',
			resize: 'onResize'
		},

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
			var me = this;

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
				isValid = true;

			items.each(
				function (item)
				{
					if (item.isValid && !item.isValid())
					{
						isValid = false;
					}
				}
			);

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
				data = {};

			items.each(
				function (item)
				{
					if (item.getValues)
					{
						data = item.getValues(data);
					}
				}
			);

			return data;
		}
	}
);