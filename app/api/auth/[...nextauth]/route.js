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
          console.log("NextAuth: Iniciando processo de signIn...");

          if (!process.env.NOTION_TOKEN) {
            console.error("NextAuth: NOTION_TOKEN não configurado");
            return false;
          }

          if (!process.env.NOTION_PAGE_ID) {
            console.error("NextAuth: NOTION_PAGE_ID não configurado");
            return false;
          }

          // First, get the main page content
          console.log("NextAuth: Buscando página principal...");
          const mainPage = await notion.pages.retrieve({
            page_id: process.env.NOTION_PAGE_ID,
          });
          console.log("NextAuth: Página principal encontrada:", mainPage.id);

          // Find the Users database
          console.log("NextAuth: Buscando tabela Users...");
          const children = await notion.blocks.children.list({
            block_id: mainPage.id,
          });

          const usersDatabase = children.results.find(
            (block) =>
              block.type === "child_database" &&
              block.child_database.title === "Users"
          );

          if (!usersDatabase) {
            console.error("NextAuth: Tabela Users não encontrada");
            return false;
          }
          console.log("NextAuth: Tabela Users encontrada:", usersDatabase.id);

          // Check if user already exists
          console.log("NextAuth: Verificando se usuário já existe...");
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
            console.log("NextAuth: Usuário não encontrado, criando novo...");
            // Create new user
            const newUser = await notion.pages.create({
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
            console.log(
              "NextAuth: Novo usuário criado com sucesso:",
              newUser.id
            );
          } else {
            console.log(
              "NextAuth: Usuário já existe:",
              existingUsers.results[0].id
            );
          }

          return true;
        } catch (error) {
          console.error("NextAuth: Erro detalhado no signIn:", {
            message: error.message,
            code: error.code,
            stack: error.stack,
          });
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
