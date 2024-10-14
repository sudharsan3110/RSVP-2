import { NextResponse } from 'next/server';

interface ResponseOptions {
  status?: number;
  headers?: Record<string, string>;
}
/**
 * ResponseHandler.ts
 *
 * This file defines the ResponseHandler class, which provides a set of static methods
 * to standardize the creation of HTTP responses in a Next.js application.
 * Each method corresponds to a common HTTP response status (e.g., success, bad request,
 * unauthorized, etc.) and formats the response data as JSON, ensuring that the
 * 'Content-Type' header is set appropriately.
 *
 * This utility class simplifies response handling in API routes, promoting
 * consistency and reducing boilerplate code when sending responses to clients.
 */
export class ResponseHandler {
  static createResponse(data: any, options: ResponseOptions = {}) {
    const { status = 200, headers = {} } = options;
    return new NextResponse(JSON.stringify(data), {
      status,
      headers: { 'Content-Type': 'application/json', ...headers },
    });
  }

  static success(data: any = { message: 'Request successful' }, options: ResponseOptions = {}) {
    return this.createResponse(data, { ...options, status: 200 });
  }

  static badRequest(message: string = 'Bad request', options: ResponseOptions = {}) {
    return this.createResponse({ message }, { ...options, status: 400 });
  }

  static unauthorized(message: string = 'Token Invalid or expired', options: ResponseOptions = {}) {
    return this.createResponse({ message }, { ...options, status: 401 });
  }

  static forbidden(message: string = 'Forbidden access', options: ResponseOptions = {}) {
    return this.createResponse({ message }, { ...options, status: 403 });
  }

  static notFound(message: string = 'Resource not found', options: ResponseOptions = {}) {
    return this.createResponse({ message }, { ...options, status: 404 });
  }

  static serverError(message: string = 'Internal server error', options: ResponseOptions = {}) {
    return this.createResponse({ message }, { ...options, status: 500 });
  }
}
