import { Tool } from './types';
import { BashTool } from './bash';

const registeredTools: Tool[] = [];

export function registerTool(tool: Tool): void {
  registeredTools.push(tool);
}

export function getRegisteredTools(): Tool[] {
  return [...registeredTools];
}

registerTool(new BashTool());
