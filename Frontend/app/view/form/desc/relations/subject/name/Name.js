/**
 * Текстовое поле для фамилии/имени/отчества.
 *
 * @author dew1983@mail.ru <Suvorov Andrey M.>
 */

Ext.define(
	'FBEditor.view.form.desc.relations.subject.name.Name',
	{
		extend: 'Ext.form.field.Text',
		requires: [
			'FBEditor.view.form.desc.relations.subject.name.NameController'
		],
		controller: 'form.desc.relations.subject.name',
		xtype: 'form-desc-relations-subject-name',
		checkChangeBuffer: 200,

		/**
		 * @private
		 * @property {Ext.form.field.Text} Поле "Стандартное написание".
		 */
		titleMain: null,

		/**
		 * @private {FBEditor.view.panel.main.props.desc.persons.Persons} Контейнер для отображения результатов поиска.
		 */
		resultContainer: null,

		listeners: {
			change: 'onChange'
		},

		/**
		 * Возвращает поле "Стандартное написание".
		 * @return {FBEditor.view.form.desc.relations.subject.title.Title}
		 */
		getTitle: function ()
		{
			var me = this,
				titleMain;

			titleMain = me.titleMain ||
			            me.up('desc-fieldcontainer').
				            up('desc-fieldcontainer').
				            down('form-desc-relations-subject-title');

			return titleMain;
		},

		/**
		 * Возвращает контейнер для отображения результатов поиска.
		 * @return {FBEditor.view.panel.main.props.desc.persons.Persons}
		 */
		getResultContainer: function ()
		{
			var me = this,
				container;

			container = me.resultContainer || Ext.getCmp('props-desc-persons');

			return container;
		}
	}
);