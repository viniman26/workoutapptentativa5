import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { Client } from "@notionhq/client";

const notion = new Client({
  auth: process.env.NOTION_TOKEN,
});

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account.provider === "google") {
        try {
          // First, get the main page content
          const mainPage = await notion.pages.retrieve({
            page_id: process.env.NOTION_PAGE_ID,
          });

          // Find the Users database
          const children = await notion.blocks.children.list({
            block_id: mainPage.id,
          });

          const usersDatabase = children.results.find(
            (block) =>
              block.type === "child_database" &&
              block.child_database.title === "Users"
          );

          if (!usersDatabase) {
            console.error("Users database not found");
            return false;
          }

          // Check if user already exists
          const existingUsers = await notion.databases.query({
            database_id: usersDatabase.id,
            filter: {
              property: "Email",
              email: {
                equals: user.email,
              },
            },
          });

          if (existingUsers.results.length === 0) {
            // Create new user
            await notion.pages.create({
              parent: {
                database_id: usersDatabase.id,
              },
              properties: {
                Name: {
                  title: [
                    {
                      text: {
                        content: user.name,
                      },
                    },
                  ],
                },
                Email: {
                  email: user.email,
                },
                "Training Experience": {
                  select: {
                    name: "Beginner",
                  },
                },
                "Available Time(Minutes per day)": {
                  number: 60,
                },
                "Fitness Goal": {
                  select: {
                    name: "Hypertrophy",
                  },
                },
              },
            });
          }

          return true;
        } catch (error) {
          console.error("Error in signIn callback:", error);
          return false;
        }
      }
      return true;
    },
    async session({ session, token }) {
      return session;
    },
  },
});

export { handler as GET, handler as POST };
