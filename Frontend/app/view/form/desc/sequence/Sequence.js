/**
 * Серия, в которой выпущено произведение.
 * Например "Детство, Отрочество, Юность" для книги Толстого "Детство".
 * Не путать серию с названием периодического издания.
 * Вложенность серий обозначает "многоуровневые" серии.
 *
 * @author dew1983@mail.ru <Suvorov Andrey M.>
 */

Ext.define(
	'FBEditor.view.form.desc.sequence.Sequence',
	{
		extend: 'FBEditor.view.form.desc.AbstractFieldContainer',
		requires: [
			'FBEditor.view.form.desc.sequence.CustomContainer',
			'FBEditor.view.form.desc.sequence.SearchContainer',
			'FBEditor.view.form.desc.sequence.SequenceController'
		],
		id: 'form-desc-sequence',
		xtype: 'form-desc-sequence',
		controller: 'form.desc.sequence',
		name: 'form-desc-plugin-fieldcontainerreplicator',
		layout: 'anchor',
		listeners: {
			accessHub: 'onAccessHub',
			resetFields: 'onResetFields',
			loadData: 'onLoadData',
			putData: 'onPutData',
			putFields: 'onPutFields',
			removeFields: 'onRemoveFields'
		},

		prefixName: 'sequence',

		translateText: {
			id: 'ID',
			idError: 'По шаблону [0-9a-fA-F]{8}-([0-9a-fA-F]{4}-){3}[0-9a-fA-F]{12}. ' +
			         'Например: 0dad1004-1430-102c-96f3-af3a14b75ca4',
			number: 'Номер'
		},

		initComponent: function ()
		{
			var me = this,
				prefixName = me.prefixName;

			me.items = [
				{
					xtype: 'desc-fieldcontainer',
					cls: 'desc-fieldcontainer',
					layout: 'anchor',
					anchor: '100%',
					plugins: {
						ptype: 'fieldcontainerreplicator',
						groupName: prefixName,
						btnPos: 'end',
						btnCls: 'plugin-fieldcontainerreplicator-big-btn',
						enableBtnPut: true,
						btnStyle: {
							margin: '0 0 0 5px',
							width: '40px',
							height: '65px'
						}
					},
					listeners: {
						putData: function (data)
						{
							me.fireEvent('putData', data, this);
						},
						putFields: function (btn)
						{
							me.fireEvent('putFields', this, btn);
						},
						removeFields: function ()
						{
							me.fireEvent('removeFields', this);
						},
						resetContainer: function ()
						{
							var btn;

							// скрываем поля поиска, показываем поля данных
							btn = this.down('form-desc-sequence-customBtn');
							btn.switchContainers();
						}
					},
					getValues: function ()
					{
						var me = this,
							itemInner = me.items.getAt(1),
							values;

						values = {
							_id: me.down('[name=' + prefixName + '-id]').getValue(),
							_number: me.down('[name=' + prefixName + '-number]').getValue(),
							title: me.down('[name=' + prefixName + '-title]').getValues()
						};
						if (itemInner)
						{
							values[prefixName] = itemInner.getValues();
						}
						values = me.removeEmptyValues(values);

						return values;
					},
					items: [
						{
							xtype: 'desc-fieldcontainer',
							layout: 'hbox',
							anchor: '100%',
							defaults: {
								anchor: '100%'
							},
							items: [
								{
									xtype: 'form-desc-sequence-container-custom',
									prefixName: me.prefixName
								},
								{
									xtype: 'form-desc-sequence-container-search',
									prefixName: me.prefixName
								}
							]
						}
					]
				}
			];
			me.callParent(arguments);
		},

		getValues: function (d)
		{
			var me = this,
				prefixName = me.prefixName,
				data = d || null,
				items = me.items,
				values = null;

			items.each(
				function (item)
				{
					var val;

					val = item.getValues();
					if (val)
					{
						values = values || [];
						values.push(val);
					}
				}
			);
			if (values)
			{
				data = data || {};
				data[prefixName] = values;
			}

			return data;
		}
	}
);