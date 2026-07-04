import { WorkspaceRepository } from './workspace';
import { ProjectRepository } from './project';
import { ConversationRepository } from './conversation';
import { MessageRepository } from './message';
import { FileRepository } from './file';

export const WorkspaceRepo = new WorkspaceRepository();
export const ProjectRepo = new ProjectRepository();
export const ConversationRepo = new ConversationRepository();
export const MessageRepo = new MessageRepository();
export const FileRepo = new FileRepository();
