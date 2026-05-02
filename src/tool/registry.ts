import { Tool } from './types';
import { BashTool } from './bash';
import { ReadTool, WriteTool, EditTool } from './file';
import { WebFetchTool, WebSearchTool } from './web';
import { SubagentTool } from './subagent';
import { SkillTool } from './skill';

const registeredTools: Tool[] = [];

export function registerTool(tool: Tool): void {
  registeredTools.push(tool);
}

export function getRegisteredTools(): Tool[] {
  return [...registeredTools];
}

registerTool(new BashTool());
registerTool(new ReadTool());
registerTool(new WriteTool());
registerTool(new EditTool());
registerTool(new WebFetchTool());
registerTool(new WebSearchTool());
registerTool(new SkillTool());
