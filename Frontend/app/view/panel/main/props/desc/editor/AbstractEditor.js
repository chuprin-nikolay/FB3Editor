/**
 * Абстрактный класс формы редактирования свойств элемента.
 *
 * @abstract
 * @author dew1983@mail.ru <Suvorov Andrey M.>
 */

Ext.define(
	'FBEditor.view.panel.main.props.desc.editor.AbstractEditor',
	{
		extend: 'Ext.form.Panel',
		requires: [
			'FBEditor.view.panel.main.props.desc.editor.AbstractEditorController'
		],

		controller: 'panel.props.desc.editor',

		listeners: {
			change: 'onChange'
		},

		layout: 'anchor',
		width: '100%',

		defaults: {
			xtype: 'textfield',
			labelAlign: 'top',
			checkChangeBuffer: 200,
			listeners: {
				change: function ()
				{
					this.up('form').fireEvent('change');
				}
			}
		},

		/**
		 * @property {String} Имя элемента.
		 */
		elementName: null,

		/**
		 * @property {FBEditor.editor.element.AbstractElement} Ссылка на элемент.
		 */
		element: null,

		/**
		 * @property {Boolean} isLoad Первичная ли загрузка данных, после рендеринга формы.
		 * Если заргузка первичная, то нет необходимости реагировать на событие change полей формы.
		 */
		isLoad: false,

		constructor: function (data)
		{
			var me = this;

			me.elementName = data.elementName;
			me.callParent(arguments);
		},

		/**
		 * Обновляет данные.
		 * @param {Object} data Данные.
		 * @param {Boolean} isLoad Первичная ли загрузка данных, после рендеринга формы.
		 * Если заргузка первичная, то нет необходимости реагировать на событие change полей формы.
		 */
		updateData: function (data, isLoad)
		{
			var me = this,
				form;

			form = me.getForm();
			me.isLoad = isLoad;
			me.element = data.el ? data.el : me.element;
			form.reset();
			form.setValues(data);
			me.isLoad = false;
		}
	}
);