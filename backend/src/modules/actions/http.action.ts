import { Action, ActionResult } from './action.interface';

export class HttpAction implements Action {
  type = 'HTTP_REQUEST';
  
  async execute(payload: any): Promise<ActionResult> {
    try {
      const { url, method = 'GET', headers = {}, body } = payload;
      
      if (!url) {
        return { success: false, error: 'URL is required for HTTP Request' };
      }
      
      console.log(`[HttpAction] Making ${method} request to ${url}`);
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...headers
        },
        body: ['POST', 'PUT', 'PATCH'].includes(method.toUpperCase()) && body ? JSON.stringify(body) : undefined
      });
      
      const responseText = await response.text();
      let responseData;
      try {
        responseData = JSON.parse(responseText);
      } catch (e) {
        responseData = responseText;
      }
      
      if (!response.ok) {
        return { success: false, error: `HTTP request failed with status ${response.status}`, data: { status: response.status, response: responseData } };
      }
      
      return {
        success: true,
        data: {
          http_response: responseData,
          status: response.status
        }
      };
    } catch (error: any) {
      console.error('[HttpAction] Error:', error);
      return { success: false, error: error.message };
    }
  }
}
