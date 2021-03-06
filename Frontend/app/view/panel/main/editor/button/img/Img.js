/**
 * Кнопка создания элемента img.
 *
 * @author dew1983@mail.ru <Suvorov Andrey M.>
 */

Ext.define(
	'FBEditor.view.panel.main.editor.button.img.Img',
	{
		extend: 'FBEditor.view.panel.main.editor.button.AbstractButton',
		requires: [
			'FBEditor.view.panel.main.editor.button.img.ImgController'
		],
		
		xtype: 'main-editor-button-img',
		controller: 'main.editor.button.img',
		
		html: '<i class="far fa-image fa-lg"></i>',

		tooltipText: 'Изображение',
		elementName: 'img',

		/**
		 * @property {FBEditor.view.window.img.Create} Окно выбора изображения.
		 */
		win: null
	}
);