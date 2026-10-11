import { TemplateChannel } from '../types';

export const versionLabel = (major: number, minor: number): string => {
  return `v${major}.${minor}`;
};

export const channelLabel = (channel: TemplateChannel): string => {
  switch (channel) {
    case TemplateChannel.EMAIL:
      return 'Email';
    case TemplateChannel.SMS:
      return 'SMS';
    case TemplateChannel.WHATSAPP:
      return 'WhatsApp';
    case TemplateChannel.PUSH:
      return 'Push';
    default:
      return channel;
  }
};

export const channelsSummary = (channels: TemplateChannel[]): string => {
  if (!channels || channels.length === 0) return 'None';
  return channels.map(channelLabel).join(' · ');
};
