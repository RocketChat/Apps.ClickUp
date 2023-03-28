import { IModify, IPersistence, IRead } from '@rocket.chat/apps-engine/definition/accessors';
import { IUser } from '@rocket.chat/apps-engine/definition/users';
import { ButtonStyle } from '@rocket.chat/apps-engine/definition/uikit';
import { ClickUpApp } from '../../../ClickUpApp';
import { getButton, getSectionBlock } from '../../helpers/blockBuilder';
import { sendDirectMessage } from '../../lib/message';
import { Block } from '@rocket.chat/ui-kit';

export async function authorize(app: ClickUpApp, read: IRead, modify: IModify, user: IUser, persistence: IPersistence): Promise<void> {
  const url = await app.getOauth2ClientInstance().getUserAuthorizationUrl(user);
  const block: Block[] = [];

  let authButton = await getButton('Authorize', '', '', '', ButtonStyle.PRIMARY, url.toString());
  let sectionBlock = await getSectionBlock('Please click the button below to authorize access to your ClickUp account 👇', authButton);
  block.push(sectionBlock);

  await sendDirectMessage(read, modify, user, '', persistence, block);
}
