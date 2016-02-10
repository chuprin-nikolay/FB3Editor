/**
 * Вкладка Форматирование.
 *
 * @author dew1983@mail.ru <Suvorov Andrey M.>
 */

Ext.define(
	'FBEditor.view.panel.toolstab.main.Main',
	{
		extend: 'Ext.panel.Panel',
		requires: [
			'FBEditor.view.panel.toolstab.main.button.a.A',
			'FBEditor.view.panel.toolstab.main.button.annotation.Annotation',
			'FBEditor.view.panel.toolstab.main.button.blockquote.Blockquote',
			'FBEditor.view.panel.toolstab.main.button.code.Code',
			'FBEditor.view.panel.toolstab.main.button.div.Div',
			'FBEditor.view.panel.toolstab.main.button.em.Em',
			'FBEditor.view.panel.toolstab.main.button.epigraph.Epigraph',
			'FBEditor.view.panel.toolstab.main.button.img.Img',
			'FBEditor.view.panel.toolstab.main.button.note.Note',
			'FBEditor.view.panel.toolstab.main.button.notebody.Notebody',
			'FBEditor.view.panel.toolstab.main.button.notes.Notes',
			'FBEditor.view.panel.toolstab.main.button.ol.Ol',
			'FBEditor.view.panel.toolstab.main.button.poem.Poem',
			'FBEditor.view.panel.toolstab.main.button.pre.Pre',
			'FBEditor.view.panel.toolstab.main.button.section.Section',
			'FBEditor.view.panel.toolstab.main.button.spacing.Spacing',
			'FBEditor.view.panel.toolstab.main.button.strikethrough.Strikethrough',
			'FBEditor.view.panel.toolstab.main.button.strong.Strong',
			'FBEditor.view.panel.toolstab.main.button.sub.Sub',
			'FBEditor.view.panel.toolstab.main.button.subscription.Subscription',
			'FBEditor.view.panel.toolstab.main.button.subtitle.Subtitle',
			'FBEditor.view.panel.toolstab.main.button.sup.Sup',
			'FBEditor.view.panel.toolstab.main.button.title.Title',
			'FBEditor.view.panel.toolstab.main.button.titlebody.TitleBody',
			'FBEditor.view.panel.toolstab.main.button.ul.Ul',
			'FBEditor.view.panel.toolstab.main.button.underline.Underline'
		],
		id:'panel-toolstab-main',
		xtype: 'panel-toolstab-main',
		title: 'Форматирование',

		translateText: {
			loading: 'Загрузка xmllint ...'
		},

		initComponent: function ()
		{
			var me = this,
				manager = FBEditor.editor.Manager,
				sch = manager.getSchema(),
				tbar;

			// вызываем тестовую проверку по схеме для определения загрузки xmllint
			sch.validXml({xml: 'test', callback: me.verifyResult, scope: me});

			tbar = [
				{
					xtype: 'panel-toolstab-main-button-notes'
				},
				{
					xtype: 'panel-toolstab-main-button-notebody'
				},
				{
					xtype: 'tbspacer',
					width: 20
				},
				{
					xtype: 'panel-toolstab-main-button-titlebody'
				},
				{
					xtype: 'panel-toolstab-main-button-section'
				},
				{
					xtype: 'tbspacer',
					width: 20
				},
				{
					xtype: 'panel-toolstab-main-button-title'
				},
				{
					xtype: 'panel-toolstab-main-button-epigraph'
				},
				{
					xtype: 'panel-toolstab-main-button-annotation'
				},
				{
					xtype: 'panel-toolstab-main-button-subscription'
				},
				{
					xtype: 'tbspacer',
					width: 20
				},
				{
					xtype: 'panel-toolstab-main-button-div'
				},
				{
					xtype: 'panel-toolstab-main-button-subtitle'
				},
				{
					xtype: 'panel-toolstab-main-button-blockquote'
				},
				{
					xtype: 'panel-toolstab-main-button-pre'
				},
				{
					xtype: 'panel-toolstab-main-button-poem'
				},
				{
					xtype: 'panel-toolstab-main-button-ul'
				},
				{
					xtype: 'panel-toolstab-main-button-ol'
				},
				{
					xtype: 'tbspacer',
					width: 20
				},
				{
					xtype: 'panel-toolstab-main-button-img'
				},
				{
					xtype: 'panel-toolstab-main-button-a'
				},
				{
					xtype: 'panel-toolstab-main-button-note'
				},
				{
					xtype: 'tbspacer',
					width: 20
				},
				{
					xtype: 'panel-toolstab-main-button-strong'
				},
				{
					xtype: 'panel-toolstab-main-button-em'
				},
				{
					xtype: 'panel-toolstab-main-button-underline'
				},
				{
					xtype: 'panel-toolstab-main-button-strikethrough'
				},
				{
					xtype: 'panel-toolstab-main-button-spacing'
				},
				{
					xtype: 'panel-toolstab-main-button-sub'
				},
				{
					xtype: 'panel-toolstab-main-button-sup'
				},
				{
					xtype: 'panel-toolstab-main-button-code'
				}
			];

			me.dockedItems = [
				{
					xtype: 'toolbar',
					dock: 'top',
					items: tbar,
					hidden: true
				}
			];

			me.items = [
				{
					xtype: 'component',
					padding: 10,
					style: {
						color: 'gray'
					},
					html: me.translateText.loading
				}
			];

			me.callParent(arguments);
		},

		/**
		 * Получает результат проверки xmllint.
		 * @param {Boolean} res
		 * @param data
		 * @param {Boolean} data.loaded Загружен ли xmllint.
		 */
		verifyResult: function (res, data)
		{
			var me = this;

			if (data.loaded)
			{
				Ext.log({msg: 'xmllint загружен', level: 'info'});

				me.getDockedItems()[0].setVisible(true);
			}
		}
	}
);