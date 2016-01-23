/**
 * Редактор html, использующийся в форме описания.
 *
 * @author dew1983@mail.ru <Suvorov Andrey M.>
 */

Ext.define(
	'FBEditor.view.form.desc.htmleditor.HtmlEditor',
	{
		extend: 'Ext.form.field.HtmlEditor',
		requires: [
			'FBEditor.view.form.desc.htmleditor.HtmlEditorController'
		],
		controller: 'form.desc.htmleditor',
		xtype: 'form-desc-htmleditor',

		enableColors: false,
		enableAlignments: false,
		enableFont: false,
		enableFontSize: false,
		enableLists: false,
		height: 150,

		listeners: {
			paste: 'onPaste'
		},

		/**
		 * @property {Array} Список разрешенных тегов.
		 */
		allowTags: ['strong', 'em', 'a', 'br', 'p'],

		afterRender: function ()
		{
			var me = this,
				iframeEl;

			me.callParent(arguments);

			// добавляем возможность отслеживания события вставки paste
			iframeEl = me.iframeEl.dom;
			iframeEl.addEventListener(
				'load',
				function ()
				{
					var doc = this.contentWindow.document,
						body = doc.body;

					body.addEventListener(
						'paste',
						function (data)
						{
							Ext.defer(
								function ()
								{
									me.fireEvent('paste', data);
								},
							    1
							);
						}
					);
				}
			);
		},

		/**
		 * Вырезает лишние теги.
		 */
		stripTags: function ()
		{
			var me = this,
				val = me.getValue(),
				tmp,
				reg;

			function replacer (str, tag, attr)
			{
				//console.log(arguments);
				if (!Ext.Array.contains(me.allowTags, tag))
				{
					str = '';
				}
				else if (attr)
				{
					attr = attr.match(/href=".*?"/);
					attr = attr ? ' ' + attr[0] : '';
					str = '<' + tag + attr + '>';
				}

				return str;
			}

			reg = new RegExp('</?([a-z0-9]+)( .*?|/)?>', 'ig');
			val = val.replace(reg, replacer);
			val = /^<p>/.test(val) ? val : '<p>' + val + '</p>';
			val = val.replace(/<br>/gi, '</p><p>');
			val = val.replace(/> </gi, '>&nbsp;<');
			val = val.replace(/[ ]{2}/gi, ' &nbsp;');
			val = val.replace(/<p><\/p>/gi, '<p><br><\/p>');

			// оборачиваем текст в p
			val = val.replace(
				/<\/p>(.*?)<p>/gi,
			    function (str, text)
			    {
				    str = str ? '<p>' + text : str;

				    return str;
			    }
			);

			me.setValue(val);
		},

		getValues: function (d)
		{
			var me = this,
				val = me.getValue(),
				data = d;

			if (val)
			{
				val = val.replace(/<b>/gi, '<strong>');
				val = val.replace(/<\/b>/gi, '</strong>');
				val = val.replace(/<i>/gi, '<em>');
				val = val.replace(/<\/i>/gi, '</em>');
				val = val.replace(/<div>/gi, '<p>');
				val = val.replace(/<\/div>/gi, '</p>');
				//console.log('val1', val);
				val = val.split('<p>');
				//console.log('val2', val);
				val[0] = '<p>' + val[0] + '</p>';
				val = val.join('<p>');
				val = val.replace(/<p><\/p>/gi, '');
				//console.log('val3', val);
				val = val.replace(/<p><br><\/p>/gi, '<br/>');
				val = val.replace(/<br>/gi, '<br/>');
				val = val.replace(/^<br\/>/gi, '<p></p>');
				val = val.replace(/&nbsp;/gi, '&#160;');
				val = val.replace(/&lt;/gi, '&#60;');
				val = val.replace(/&gt;/gi, '&#62;');
				data[me.name] = val;
			}

			return data;
		},

		/**
		 * Перезаписан стандартный метод, чтобы извлечь из него кнопку underline.
		 */
		getToolbarCfg: function(){
			var me = this,
				items = [], i,
				tipsEnabled = Ext.quickTipsActive && Ext.tip.QuickTipManager.isEnabled(),
				baseCSSPrefix = Ext.baseCSSPrefix,
				fontSelectItem, undef;

			function btn(id, toggle, handler){
				return {
					itemId: id,
					cls: baseCSSPrefix + 'btn-icon',
					iconCls: baseCSSPrefix + 'edit-'+id,
					enableToggle:toggle !== false,
					scope: me,
					handler:handler||me.relayBtnCmd,
					clickEvent: 'mousedown',
					tooltip: tipsEnabled ? me.buttonTips[id] || undef : undef,
					overflowText: me.buttonTips[id].title || undef,
					tabIndex: -1
				};
			}


			if (me.enableFont && !Ext.isSafari2) {
				fontSelectItem = Ext.widget('component', {
					itemId: 'fontSelect',
					renderTpl: [
							'<select id="{id}-selectEl" data-ref="selectEl" class="' + baseCSSPrefix + 'font-select">',
							'</select>'
					],
					childEls: ['selectEl'],
					afterRender: function() {
						me.fontSelect = this.selectEl;
						Ext.Component.prototype.afterRender.apply(this, arguments);
					},
					onDisable: function() {
						var selectEl = this.selectEl;
						if (selectEl) {
							selectEl.dom.disabled = true;
						}
						Ext.Component.prototype.onDisable.apply(this, arguments);
					},
					onEnable: function() {
						var selectEl = this.selectEl;
						if (selectEl) {
							selectEl.dom.disabled = false;
						}
						Ext.Component.prototype.onEnable.apply(this, arguments);
					},
					listeners: {
						change: function() {
							me.win.focus();
							me.relayCmd('fontName', me.fontSelect.dom.value);
							me.deferFocus();
						},
						element: 'selectEl'
					}
				});

				items.push(
					fontSelectItem,
					'-'
				);
			}

			if (me.enableFormat) {
				items.push(
					btn('bold'),
					btn('italic')
				);
			}

			if (me.enableFontSize) {
				items.push(
					'-',
					btn('increasefontsize', false, me.adjustFont),
					btn('decreasefontsize', false, me.adjustFont)
				);
			}

			if (me.enableColors) {
				items.push(
					'-', {
						itemId: 'forecolor',
						cls: baseCSSPrefix + 'btn-icon',
						iconCls: baseCSSPrefix + 'edit-forecolor',
						overflowText: me.buttonTips.forecolor.title,
						tooltip: tipsEnabled ? me.buttonTips.forecolor || undef : undef,
						tabIndex:-1,
						menu: Ext.widget('menu', {
							plain: true,

							items: [{
								        xtype: 'colorpicker',
								        allowReselect: true,
								        focus: Ext.emptyFn,
								        value: '000000',
								        plain: true,
								        clickEvent: 'mousedown',
								        handler: function(cp, color) {
									        me.relayCmd('forecolor', Ext.isWebKit || Ext.isIE ? '#'+color : color);
									        this.up('menu').hide();
								        }
							        }]
						})
					}, {
						itemId: 'backcolor',
						cls: baseCSSPrefix + 'btn-icon',
						iconCls: baseCSSPrefix + 'edit-backcolor',
						overflowText: me.buttonTips.backcolor.title,
						tooltip: tipsEnabled ? me.buttonTips.backcolor || undef : undef,
						tabIndex:-1,
						menu: Ext.widget('menu', {
							plain: true,

							items: [{
								        xtype: 'colorpicker',
								        focus: Ext.emptyFn,
								        value: 'FFFFFF',
								        plain: true,
								        allowReselect: true,
								        clickEvent: 'mousedown',
								        handler: function(cp, color) {
									        if (Ext.isGecko) {
										        me.execCmd('useCSS', false);
										        me.execCmd('hilitecolor', '#'+color);
										        me.execCmd('useCSS', true);
										        me.deferFocus();
									        } else {
										        me.relayCmd(Ext.isOpera ? 'hilitecolor' : 'backcolor', Ext.isWebKit || Ext.isIE || Ext.isOpera ? '#'+color : color);
									        }
									        this.up('menu').hide();
								        }
							        }]
						})
					}
				);
			}

			if (me.enableAlignments) {
				items.push(
					'-',
					btn('justifyleft'),
					btn('justifycenter'),
					btn('justifyright')
				);
			}

			if (!Ext.isSafari2) {
				if (me.enableLinks) {
					items.push(
						'-',
						btn('createlink', false, me.createLink)
					);
				}

				if (me.enableLists) {
					items.push(
						'-',
						btn('insertorderedlist'),
						btn('insertunorderedlist')
					);
				}
				if (me.enableSourceEdit) {
					items.push(
						'-',
						btn('sourceedit', true, function(){
							me.toggleSourceEdit(!me.sourceEditMode);
						})
					);
				}
			}

			// Everything starts disabled.
			for (i = 0; i < items.length; i++) {
				if (items[i].itemId !== 'sourceedit') {
					items[i].disabled = true;
				}
			}

			// build the toolbar
			// Automatically rendered in Component.afterRender's renderChildren call
			return {
				xtype: 'toolbar',
				defaultButtonUI: me.defaultButtonUI,
				cls: Ext.baseCSSPrefix + 'html-editor-tb',
				enableOverflow: true,
				items: items,

				// stop form submits
				listeners: {
					click: function(e){
						e.preventDefault();
					},
					element: 'el'
				}
			};
		},

		/**
		 * Перезаписан стандартный метод, чтобы извлечь из него кнопку underline.
		 */
		updateToolbar: function() {
			var me = this,
				i, l, btns, doc, name, queriedName, fontSelect,
				toolbarSubmenus;

			if (me.readOnly) {
				return;
			}

			if (!me.activated) {
				me.onFirstFocus();
				return;
			}

			btns = me.getToolbar().items.map;
			doc = me.getDoc();

			function updateButtons() {
				var state;

				for (i = 0, l = arguments.length, name; i < l; i++) {
					name  = arguments[i];

					// Firefox 18+ sometimes throws NS_ERROR_INVALID_POINTER exception
					// See https://sencha.jira.com/browse/EXTJSIV-9766
					try {
						state = doc.queryCommandState(name);
					}
					catch (e) {
						state = false;
					}

					btns[name].toggle(state);
				}
			}
			if(me.enableFormat){
				updateButtons('bold', 'italic');
			}
			me.syncValue();
		},

		/**
		 * Перезаписан стандартный метод.
		 */
		getDocMarkup: function() {
			var me = this,
				h = me.iframeEl.getHeight() - me.iframePad * 2;

			// добавлены стили
			return Ext.String.format(
				'<!DOCTYPE html>'
				+ '<html><head>'
				+ '<link rel="stylesheet" type="text/css" href="resources/css/htmleditor.css?_v=' + FBEditor.version + '">'
				+ '<style type="text/css">'
				+ (Ext.isOpera ? 'p{margin:0;}' : '')
				+ 'body{border:0;margin:0;padding:{0}px;direction:' + (me.rtl ? 'rtl;' : 'ltr;')
				+ (Ext.isIE8 ? Ext.emptyString : 'min-')
				+ 'height:{1}px;box-sizing:border-box;-moz-box-sizing:border-box;-webkit-box-sizing:border-box;cursor:text;background-color:white;'
				+ (Ext.isIE ? '' : 'font-size:12px;font-family:{2}')
				+ '}</style></head><body></body></html>'
				, me.iframePad, h, me.defaultFont);
		}
	}
);