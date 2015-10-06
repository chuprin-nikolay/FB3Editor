/**
 * Дата и место написания произведения.
 *
 * @author dew1983@mail.ru <Suvorov Andrey M.>
 */

Ext.define(
	'FBEditor.view.form.desc.written.Written',
	{
		extend: 'FBEditor.view.form.desc.AbstractFieldContainer',
		xtype: 'form-desc-written',
		id: 'form-desc-written',
		layout: 'hbox',
		prefixName: 'written',

		translateText: {
			lang: 'Язык',
			writtenLang: 'Язык оригинала',
			date: 'Дата',
			dateText: 'Дата текстом',
			country: 'Страна',
			dateTranslation: 'Дата перевода',
			datePublic: 'Дата публикации'
		},

		initComponent: function ()
		{
			var me = this,
				prefixName = me.prefixName;

			me.items = [
				{
					xtype: 'desc-fieldcontainer',
					flex: 1,
					layout: 'anchor',
					defaults: {
						anchor: '100%',
						labelAlign: 'right',
						labelWidth: 160
					},
					items: [
						{
							xtype: 'langfield',
							name: 'lang',
							fieldLabel: me.translateText.lang,
							allowBlank: false,
							forceSelection: true,
							value: 'ru',
							cls: 'field-required',
							listeners: {
								afterrender: function ()
								{
									var me = this,
										store = me.getStore();

									// убираем первые две записи из списка
									store.remove([0, 1]);
								}
							}
						},
						{
							xtype: 'langfield',
							name: prefixName + '-lang',
							fieldLabel: me.translateText.writtenLang,
							//allowBlank: false,
							forceSelection: true,
							cls: 'field-optional'
						},
						{
							xtype: 'countryfield',
							name: prefixName + '-country',
							fieldLabel: me.translateText.country,
							cls: 'field-optional'
						}
					]
				},
				{
					xtype: 'fieldcontainer',
					width: 50
				},
				{
					xtype: 'desc-fieldcontainer',
					flex: 1,
					layout: 'anchor',
					defaults: {
						anchor: '100%',
						labelAlign: 'right',
						labelWidth: 120,
						cls: 'field-optional'
					},
					items: [
						{
							xtype: 'datefield',
							name: prefixName + '-date-value',
							fieldLabel: me.translateText.date
						},
						{
							xtype: 'textfield',
							name: prefixName + '-date-text',
							fieldLabel: me.translateText.dateText
						},
						{
							xtype: 'datefield',
							name: prefixName + '-date-translation',
							fieldLabel: me.translateText.dateTranslation
						},
						{
							xtype: 'datefield',
							name: prefixName + '-date-public',
							fieldLabel: me.translateText.datePublic
						}
					]
				}
			];
			me.callParent(arguments);
		},

		isValid: function ()
		{
			var me = this,
				isValid;

			isValid = me.getValid(me.prefixName);
			me.down('langfield').isValid();

			return isValid;
		},

		getValues: function (d)
		{
			var me = this,
				prefixName = me.prefixName,
				data = d,
				values;

			values = {
				_value: Ext.Date.format(me.down(me.down('[name=' + prefixName + '-date-value]')).getValue(), 'Y-m-d'),
				__text: me.down(me.down('[name=' + prefixName + '-date-text]')).getValue()
			};
			values = me.removeEmptyValues(values);
			values = {
				lang: me.down(me.down('[name=' + prefixName + '-lang]')).getValue(),
				country: me.down(me.down('[name=' + prefixName + '-country]')).getValue(),
				date: values,
				'date-translation': Ext.Date.format(me.down(me.down('[name=' + prefixName + '-date-translation]')).getValue(), 'Y-m-d'),
				'date-public': Ext.Date.format(me.down(me.down('[name=' + prefixName + '-date-public]')).getValue(), 'Y-m-d')
			};
			values = me.removeEmptyValues(values);
			if (values)
			{
				data[prefixName] = values;
			}
			data.lang = me.down(me.down('[name=lang]')).getValue();

			return data;
		}
	}
);