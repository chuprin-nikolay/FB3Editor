/**
 * Сдвигает секцию вправо (увеличивает вложенность).
 * Текущая секция и секция над ней помещаются в одну общую секцию.
 *
 * @author dew1983@mail.ru <Suvorov Andrey M.>
 */
 
Ext.define(
    'FBEditor.editor.command.section.RightCommand',
    {
        extend: 'FBEditor.editor.command.AbstractCreateCommand',

        execute: function ()
        {
            var me = this,
                data = me.getData(),
                res = false,
                els = {},
                node,
                factory,
                viewportId,
                manager,
                sel,
                range;

            try
            {
                // получаем данные из выделения
                sel = window.getSelection();
                range = sel.getRangeAt(0);

                node = range.commonAncestorContainer;
                data.viewportId = viewportId = node.viewportId;
                els.node = node.getElement();
                manager = els.node.getManager();
                els.focus = manager.getFocusElement();
                factory = manager.getFactory();

                manager.setSuspendEvent(true);

                // текущая секция
                els.section = els.focus.isSection ? els.focus : els.focus.getParentName('section');

                // предыдущая секция
                els.sectionPrev = els.section ? els.section.prev() : null;

                if (!els.sectionPrev || !els.sectionPrev.isSection)
                {
                    return false;
                }

                // родительский элемент секций
                els.parent = els.section.parent;

                // новая общая секция
                els.sectionCommon = factory.createElement('section');

                // вставляем новую общую секцию
                els.parent.insertBefore(els.sectionCommon, els.sectionPrev, viewportId);

                // переносим текущую и предыдущую секции в новую
                els.sectionCommon.add(els.sectionPrev, viewportId);
                els.sectionCommon.add(els.section, viewportId);

                // сохраняем ссылки на элементы
                data.els = els;

                // синхронизируем элемент
                els.parent.sync(viewportId);

                // восстанавливаем выделение
                manager.restoreSelection();

                // проверяем по схеме
                me.verifyElement(els.parent);

                res = true;
            }
            catch (e)
            {
                Ext.log({level: 'warn', msg: e, dump: e});
                me.getHistory(els.parent).removeNext();
            }

            manager.setSuspendEvent(false);

            return res;
        },

        unExecute: function ()
        {
            var me = this,
                data = me.getData(),
                res = false,
                els = {},
                viewportId,
                manager;

            try
            {
                viewportId = data.viewportId;
                els = data.els;
                manager = els.focus.getManager();

                manager.setSuspendEvent(true);

                // переносим секкции обратно и удаляем новую
                els.parent.insertBefore(els.sectionPrev, els.sectionCommon, viewportId);
                els.parent.insertBefore(els.section, els.sectionCommon, viewportId);
                els.parent.remove(els.sectionCommon, viewportId);

                // синхронизируем элемент
                els.parent.sync(viewportId);

                // восстанавливаем курсор
                manager.restoreSelection();

                // проверяем по схеме
                me.verifyElement(els.parent);

                res = true;
            }
            catch (e)
            {
                Ext.log({level: 'warn', msg: e, dump: e});
                me.getHistory(els.parent).removeNext();
            }

            manager.setSuspendEvent(false);

            return res;
        }
    }
);