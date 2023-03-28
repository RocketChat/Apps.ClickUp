import { IModify, IPersistence, IRead, IHttp } from '@rocket.chat/apps-engine/definition/accessors';
import { ClickUpApp } from '../../../ClickUpApp';
import { SlashCommandContext } from '@rocket.chat/apps-engine/definition/slashcommands';
import { createTaskModal } from '../../modals/createTaskModal';
import { persistUIData } from '../../lib/persistence';

export async function createTask(app: ClickUpApp, read: IRead, modify: IModify, context: SlashCommandContext, persistence: IPersistence, http: IHttp): Promise<void> {
  const triggerId = context.getTriggerId();
  if (triggerId) {
    await persistUIData(persistence, context.getSender().id, context);
    const modal = await createTaskModal({ modify, read, persistence, http, slashcommandcontext: context });
    await modify.getUiController().openSurfaceView(modal, { triggerId }, context.getSender());
  } else {
    this.app.getLogger().error('Invalid Trigger ID');
  }
}
