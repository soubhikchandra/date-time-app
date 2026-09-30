import mongoose from "mongoose";
import dns from 'node:dns';

dns.setServers(['1.1.1.1', '8.8.8.8']);

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  var _mongoose: MongooseCache | undefined;
}

const cached: MongooseCache =
  global._mongoose ?? (global._mongoose = { conn: null, promise: null });

function getUri(): string {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is not defined");
  return uri;
}

export async function connectDB() {
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    cached.promise = mongoose.connect(getUri(), { bufferCommands: false });
  }
  try {
    cached.conn = await cached.promise;
    console.log("mogno connect DONE");
  } catch (e) {
    cached.promise = null;
    throw e;
  }
  return cached.conn;
}