import serverless from 'serverless-http';
import { app } from './app';
import { connectDatabase } from './config/database';

let isConnected = false;

const handler = serverless(app);

export const lambdaHandler = async (event: any, context: any) => {
  // Prevent Lambda from hanging waiting for open MongoDB connection pool
  context.callbackWaitsForEmptyEventLoop = false;

  if (!isConnected) {
    await connectDatabase();
    isConnected = true;
  }

  return handler(event, context);
};
