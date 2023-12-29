import type { IncomingMessage, ServerResponse } from 'http';

export interface HttpRequest extends IncomingMessage {}
export interface HttpReponse extends ServerResponse {}
