/**
 * Корректировки для Ext.form.field.Base.
 *
 * @author dew1983@mail.ru <Suvorov Andrey M.>
 */

Ext.define(
	'FBEditor.override.form.field.Base',
	{
		override: 'Ext.form.field.Base',

		// нельзя использовать значение qtip, так как вызывает баг "попрыгун"
		msgTarget: 'title'
	}
);