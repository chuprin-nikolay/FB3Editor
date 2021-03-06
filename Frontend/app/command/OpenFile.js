/**
 * Открывает файл, выбранный из окна проводника при помощи кнопки.
 *
 * @author dew1983@mail.ru <Suvorov Andrey M.>
 */

Ext.define(
	'FBEditor.command.OpenFile',
	{
		extend: 'FBEditor.command.AbstractCommand',

        execute: function ()
        {
            var me = this,
                data = me.getData(),
                fileManager = FBEditor.file.Manager,
                evt,
                fileEvent,
				file,
                result;

            evt = data.evt;

            // событие
            fileEvent = Ext.create('FBEditor.file.event.Button', evt);

            // файл
            file = fileEvent.getFile();

            // открываем книгу
            result = fileManager.openFB3(file);

            return result;
        },

		unExecute: function ()
		{
			// закрывает открытый файл
		}
	}
);