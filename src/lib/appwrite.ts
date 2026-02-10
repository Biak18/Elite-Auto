const PROJECT_ID = process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID!;
const DATABASE_ID = process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!;
const ENDPOINT = process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT!;
const STORAGE_ID = process.env.EXPO_PUBLIC_APPWRITE_STORAGE_ID!;

import { Account, Client, ID } from "react-native-appwrite";

const client = new Client()
  .setEndpoint(ENDPOINT)
  .setProject(PROJECT_ID)
  .setPlatform("com.chan.autoelite");

const account = new Account(client);

export const createUser = () => {
  try {
    // Register User
    account.create(ID.unique(), "me@example.com", "password", "Jane Doe").then(
      function (response) {
        console.log(response);
      },
      function (error) {
        console.log(error);
      },
    );
  } catch (error) {
    console.error(error);
  }
};
