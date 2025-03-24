import { NextResponse } from "next/server";
import { Client } from "@notionhq/client";

export async function GET() {
  if (!process.env.NOTION_TOKEN) {
    return NextResponse.json(
      { error: "Server configuration error" },
      { status: 500 }
    );
  }

  try {
    const notion = new Client({
      auth: process.env.NOTION_TOKEN,
    });

    // First, get the main page content
    const mainPage = await notion.pages.retrieve({
      page_id: process.env.NOTION_PAGE_ID,
    });

    // Find the Macrocycles database
    const children = await notion.blocks.children.list({
      block_id: mainPage.id,
    });

    const macrocyclesDatabase = children.results.find(
      (block) =>
        block.type === "child_database" &&
        block.child_database.title === "Macrocycles"
    );

    if (!macrocyclesDatabase) {
      return NextResponse.json(
        { error: "Macrocycles database not found" },
        { status: 404 }
      );
    }

    // Query the database
    const response = await notion.databases.query({
      database_id: macrocyclesDatabase.id,
      sorts: [
        {
          property: "Name",
          direction: "ascending",
        },
      ],
    });

    const macrocycles = response.results.map((page) => ({
      id: page.id,
      name: page.properties.Name.title[0].plain_text,
    }));

    return NextResponse.json(macrocycles);
  } catch (error) {
    console.error("Error fetching macrocycles:", error);
    return NextResponse.json(
      { error: "Failed to fetch macrocycles: " + error.message },
      { status: 500 }
    );
  }
}
