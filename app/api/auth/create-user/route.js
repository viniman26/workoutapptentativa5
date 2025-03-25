import { NextResponse } from "next/server";
import { Client } from "@notionhq/client";

export async function POST(request) {
  try {
    console.log("API: Iniciando criação de usuário...");
    const { user } = await request.json();
    console.log("API: Dados do usuário recebidos:", {
      email: user.email,
      name: user.displayName,
    });

    if (!user || !user.email || !user.displayName) {
      console.log("API: Dados do usuário inválidos");
      return NextResponse.json(
        { error: "User data is required" },
        { status: 400 }
      );
    }

    console.log("API: Inicializando cliente Notion...");
    const notion = new Client({
      auth: process.env.NOTION_TOKEN,
    });

    console.log("API: Buscando página principal...");
    const mainPage = await notion.pages.retrieve({
      page_id: process.env.NOTION_PAGE_ID,
    });
    console.log("API: Página principal encontrada:", mainPage.id);

    console.log("API: Buscando tabela Users...");
    const children = await notion.blocks.children.list({
      block_id: mainPage.id,
    });

    const usersDatabase = children.results.find(
      (block) =>
        block.type === "child_database" &&
        block.child_database.title === "Users"
    );

    if (!usersDatabase) {
      console.error("API: Tabela Users não encontrada");
      return NextResponse.json(
        { error: "Users database not found" },
        { status: 404 }
      );
    }

    console.log("API: Verificando se usuário já existe...");
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
      console.log("API: Usuário não encontrado, criando novo...");
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
                  content: user.displayName,
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
      console.log("API: Novo usuário criado com sucesso:", newUser.id);
      return NextResponse.json({ success: true, user: newUser });
    }

    console.log("API: Usuário já existe:", existingUsers.results[0].id);
    return NextResponse.json({ success: true, user: existingUsers.results[0] });
  } catch (error) {
    console.error("API: Erro detalhado:", {
      message: error.message,
      code: error.code,
      stack: error.stack,
    });
    return NextResponse.json(
      { error: "Failed to create user", details: error.message },
      { status: 500 }
    );
  }
}
