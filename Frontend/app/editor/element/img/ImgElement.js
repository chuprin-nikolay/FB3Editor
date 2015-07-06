/**
 * Элемент изображения.
 *
 * @author dew1983@mail.ru <Suvorov Andrey M.>
 */

Ext.define(
	'FBEditor.editor.element.img.ImgElement',
	{
		extend: 'FBEditor.editor.element.AbstractElement',
		requires: [
			'FBEditor.editor.element.img.ImgElementController',
			'FBEditor.editor.command.img.CreateCommand'
		],
		controllerClass: 'FBEditor.editor.element.img.ImgElementController',
		htmlTag: 'img',
		xmlTag: 'img',
		cls: 'el-img',
		attributes: {
			tabindex: 0
		},

		createFromRange: true,

		/**
		 * @property {FBEditor.resource.Resource} Ссылка на ресурс.
		 */
		resource: null,

		isImg: true,

		constructor: function (attributes, children)
		{
			var me = this;

			me.mixins.observable.constructor.call(me, {});
			me.elementId = Ext.id({prefix: me.prefixId});
			me.children = children || me.children;
			me.attributes = Ext.apply(attributes, me.attributes);
			me.createController();
		},

		isEmpty: function ()
		{
			return false;
		},

		clear: function ()
		{
			var me = this,
				resource = me.resource;

			if (resource)
			{
				resource.removeElement(me);
			}
			me.callParent();
		},

		getNode: function (viewportId)
		{
			var me = this,
				node;

			me.linkResource();
			node = me.callParent(arguments);

			return node;
		},

		getAttributesXml: function ()
		{
			var me = this,
				attributes = Ext.clone(me.attributes),
				attr = '';

			attributes.src = me.resource.name;
			Ext.Object.each(
				attributes,
				function (key, val)
				{
					attr += key + '="' + val + '" ';
				}
			);

			return attr;
		},

		setStyleHtml: function ()
		{
			var me = this,
				attributes = me.attributes,
				style;

			style = me.callParent();
			style += style ? ' ' : '';
			style += attributes.width ? 'width: ' + attributes.width + '; ' : '';
			style += attributes['min-width'] ? 'min-width: ' + attributes['min-width'] + '; ' : '';
			style += attributes['max-width'] ? 'max-width: ' + attributes['max-width'] + '; ' : '';
			me.style = style;

			return style;
		},

		getData: function ()
		{
			var me = this,
				data,
				imgData;

			data= me.callParent(arguments);
			imgData = {
				url: me.attributes.src ? me.attributes.src : 'undefined',
				name: me.resource ? me.resource.name : null,
				id: me.attributes.id ? me.attributes.id : '',
				alt: me.attributes.id ? me.attributes.alt : '',
				width: me.attributes.width ? me.attributes.width : '',
				'min-width': me.attributes['min-width'] ? me.attributes['min-width'] : '',
				'max-width': me.attributes['max-width'] ? me.attributes['max-width'] : ''
			};
			data = Ext.apply(data, imgData);

			return data;
		},

		update: function (data)
		{
			var me = this;

			//  удаляем ссылку на старый ресурс
			if (me.resource)
			{
				me.resource.removeElement(me);
				me.resource = null;
			}

			// аттрибуты
			me.attributes = {
				tabindex: 0
			};
			Ext.Object.each(
				data,
			    function (key, val)
			    {
				    if (val)
				    {
					    me.attributes[key] = val;
				    }
			    }
			);

			// создаем ссылку на новый ресурс
			me.linkResource();

			// отображение
			me.callParent(arguments);
		},

		/**
		 * Удаляет связь изображения с ресурсом.
		 */
		deleteLinkResource: function ()
		{
			var me = this,
				nodes = me.nodes,
				resource = me.resource;

			if (resource)
			{
				resource.removeElement(me);
			}
			me.resource = null;

			FBEditor.editor.Manager.suspendEvent = true;
			Ext.Object.each(
				nodes,
			    function (id, node)
			    {
				    me.attributes.src = 'undefined';
				    node.setAttribute('src', 'undefined');
			    }
			);
			FBEditor.editor.Manager.suspendEvent = false;
		},

		/**
		 * @private
		 * Связывает изображение с ресурсом.
		 */
		linkResource: function ()
		{
			var me = this,
				attributes = me.attributes,
				resource;

			attributes.src = attributes.src || 'undefined';
			resource = FBEditor.resource.Manager.getResourceByName(attributes.src);
			if (resource)
			{
				attributes.src = resource.url;
				resource.addElement(me);
				me.resource = resource;
			}
		},

		getNameTree: function ()
		{
			var me = this,
				name;

			name = me.callParent(arguments);

			if (me.resource)
			{
				name += ' ' + me.resource.name;
			}

			return name;
		}
	}
);