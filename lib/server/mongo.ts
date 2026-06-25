import { MongoClient, type Db } from "mongodb";

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || "travel_app";

let clientPromise: Promise<MongoClient> | null = null;

export function isMongoConfigured() {
  return Boolean(uri);
}

export async function getMongoDb(): Promise<Db | null> {
  if (!uri) return null;

  clientPromise ??= new MongoClient(uri).connect();
  const client = await clientPromise;
  return client.db(dbName);
}
