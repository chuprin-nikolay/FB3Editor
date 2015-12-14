/**
 * Название произведения.
 *
 * @author dew1983@mail.ru <Suvorov Andrey M.>
 */

Ext.define(
	'FBEditor.view.form.desc.titleArt.TitleArt',
	{
		extend: 'FBEditor.view.form.desc.title.Title',
		requires: [
			'FBEditor.view.form.desc.titleArt.TitleArtController',
			'FBEditor.view.panel.main.props.desc.arts.Arts'
		],
		controller: 'form.desc.titleArt',
		xtype: 'form-desc-titleArt',

		id: 'form-desc-title',

		/**
		 * @property {Boolean} Необходимо ли показывать подзаголовок.
		 */
		enableSub: true,

		/**
		 * @property {Boolean} Необходимо ли показывать альтернативное название.
		 */
		enableAlt: true,

		listeners: {
			changeTitle: 'onChangeTitle',
			blurTitle: 'onBlurTitle',
			cleanResultContainer: 'onCleanResultContainer'
		},

		afterRender: function ()
		{
			var me = this;

			me.callParent(arguments);

			// сбрасываем названия, сохраненные в локальном хранилище
			me.fireEvent('cleanResultContainer');
		},

		/**
		 * Возвращает контейнер для отображения результатов поиска.
		 * @return {FBEditor.view.panel.main.props.desc.arts.Arts}
		 */
		getResultContainer: function ()
		{
			var bridge = FBEditor.getBridgeProps();

			return bridge.Ext.getCmp('props-desc-arts');
		}
	}
);