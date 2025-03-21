import { NextResponse } from "next/server";
import { Client } from "@notionhq/client";

export async function GET() {
  if (!process.env.NOTION_TOKEN) {
    console.error("Missing Notion token");
    return NextResponse.json(
      { error: "Server configuration error" },
      { status: 500 }
    );
  }

  const notion = new Client({
    auth: process.env.NOTION_TOKEN,
  });

  try {
    // Primeiro, vamos buscar o conteúdo da página principal
    const pageId = "1affbbda67908049b486ce02533dd7f0";
    const response = await notion.blocks.children.list({
      block_id: pageId,
    });

    console.log(
      "Blocks found:",
      response.results.map((block) => ({
        type: block.type,
        id: block.id,
        title:
          block.type === "child_database" ? block.child_database.title : null,
      }))
    );

    // Encontrar o banco de dados "Muscle Groups"
    const muscleGroupsBlock = response.results.find(
      (block) =>
        block.type === "child_database" &&
        block.child_database.title.toLowerCase().includes("muscle")
    );

    if (!muscleGroupsBlock) {
      console.error("Muscle Groups database not found in the page");
      return NextResponse.json(
        { error: "Database not found" },
        { status: 404 }
      );
    }

    // Consultar o banco de dados encontrado
    const dbResponse = await notion.databases.query({
      database_id: muscleGroupsBlock.id,
      sorts: [
        {
          property: "Name",
          direction: "ascending",
        },
      ],
    });

    console.log("Database response:", JSON.stringify(dbResponse, null, 2));

    const muscleGroups = dbResponse.results.map((page) => ({
      id: page.id,
      name: page.properties.Name?.title[0]?.plain_text || "Unnamed",
      description: page.properties.Description?.rich_text[0]?.plain_text || "",
    }));

    return NextResponse.json(muscleGroups);
  } catch (error) {
    console.error("Error fetching from Notion:", error);
    return NextResponse.json(
      { error: "Failed to fetch data from Notion: " + error.message },
      { status: 500 }
    );
  }
}
