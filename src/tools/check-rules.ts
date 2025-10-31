// src/tools/check-rules.ts
import { z } from 'zod';
/* eslint-disable n/no-missing-import */
import type { McpServer, RegisteredTool } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { CallToolResult, TextContent, ToolAnnotations } from '@modelcontextprotocol/sdk/types.js';
/* eslint-enable n/no-missing-import */
import { makeRestGetRequest } from '../common/utils.js';
import type { MwRestApiPageObject } from '../types/mwRestApi.js';

export function checkRulesTool( server: McpServer ): RegisteredTool {
	return server.tool(
		'check-rules',
		'Get wiki-specific MCP rules for content creation and editing',
		{},
		{
			title: 'Check rules',
			readOnlyHint: true,
			destructiveHint: false
		} as ToolAnnotations,
		async () => handleCheckRulesTool()
	);
}

async function handleCheckRulesTool(): Promise<CallToolResult> {
	const possiblePages = [
		'MCP_Rules',
		'Project:MCP_Rules',
		'Wiki:MCP_Rules',
		'Splitterwiki:MCP_Rules'
	];

	for ( const pageName of possiblePages ) {
		try {
			const data = await makeRestGetRequest<MwRestApiPageObject>(
				`/v1/page/${ encodeURIComponent( pageName ) }`
			);

			if ( data && data.source ) {
				return {
					content: [
						{
							type: 'text',
							text: `Found rules at [[${pageName}]]:\n\n${data.source}`
						} as TextContent
					]
				};
			}
		} catch ( error ) {
			// Page doesn't exist, try next one
			continue;
		}
	}

	return {
		content: [
			{
				type: 'text',
				text: 'No MCP_Rules page found. Tried: ' + possiblePages.join( ', ' )
			} as TextContent
		]
	};
}
