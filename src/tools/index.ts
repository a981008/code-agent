export { Tool } from "./tool.js";
export { ToolManager } from "./tool-manager.js";
export { BashTool } from "./bash.js";

import { ToolManager } from "./tool-manager.js";
import { BashTool } from "./bash.js";

// Global tool manager instance
export const toolManager = new ToolManager();
toolManager.register(new BashTool());
