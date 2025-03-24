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

    // Find the Workout Plans database
    const children = await notion.blocks.children.list({
      block_id: mainPage.id,
    });

    const workoutPlansDatabase = children.results.find(
      (block) =>
        block.type === "child_database" &&
        block.child_database.title === "Workout Plans"
    );

    if (!workoutPlansDatabase) {
      return NextResponse.json(
        { error: "Workout Plans database not found" },
        { status: 404 }
      );
    }

    // Query the database
    const response = await notion.databases.query({
      database_id: workoutPlansDatabase.id,
      sorts: [
        {
          property: "Name",
          direction: "ascending",
        },
      ],
    });

    const workoutPlans = response.results.map((page) => ({
      id: page.id,
      name: page.properties.Name.title[0].plain_text,
      macrocycle: page.properties.Macrocycle?.relation[0]?.id || null,
    }));

    return NextResponse.json(workoutPlans);
  } catch (error) {
    console.error("Error fetching workout plans:", error);
    return NextResponse.json(
      { error: "Failed to fetch workout plans: " + error.message },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  if (!process.env.NOTION_TOKEN) {
    return NextResponse.json(
      { error: "Server configuration error" },
      { status: 500 }
    );
  }

  try {
    const { name, macrocycleId } = await request.json();

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const notion = new Client({
      auth: process.env.NOTION_TOKEN,
    });

    // First, get the main page content
    const mainPage = await notion.pages.retrieve({
      page_id: process.env.NOTION_PAGE_ID,
    });

    // Find the Workout Plans database
    const children = await notion.blocks.children.list({
      block_id: mainPage.id,
    });

    const workoutPlansDatabase = children.results.find(
      (block) =>
        block.type === "child_database" &&
        block.child_database.title === "Workout Plans"
    );

    if (!workoutPlansDatabase) {
      return NextResponse.json(
        { error: "Workout Plans database not found" },
        { status: 404 }
      );
    }

    // Create the new page
    const newPage = await notion.pages.create({
      parent: {
        database_id: workoutPlansDatabase.id,
      },
      properties: {
        Name: {
          title: [
            {
              text: {
                content: name,
              },
            },
          ],
        },
        ...(macrocycleId && {
          Macrocycle: {
            relation: [
              {
                id: macrocycleId,
              },
            ],
          },
        }),
      },
    });

    return NextResponse.json({
      id: newPage.id,
      name: newPage.properties.Name.title[0].plain_text,
      macrocycle: newPage.properties.Macrocycle?.relation[0]?.id || null,
    });
  } catch (error) {
    console.error("Error creating workout plan:", error);
    return NextResponse.json(
      { error: "Failed to create workout plan: " + error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  if (!process.env.NOTION_TOKEN) {
    return NextResponse.json(
      { error: "Server configuration error" },
      { status: 500 }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const pageId = searchParams.get("id");

    if (!pageId) {
      return NextResponse.json(
        { error: "Page ID is required" },
        { status: 400 }
      );
    }

    const notion = new Client({
      auth: process.env.NOTION_TOKEN,
    });

    await notion.pages.update({
      page_id: pageId,
      archived: true,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting workout plan:", error);
    return NextResponse.json(
      { error: "Failed to delete workout plan: " + error.message },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  if (!process.env.NOTION_TOKEN) {
    return NextResponse.json(
      { error: "Server configuration error" },
      { status: 500 }
    );
  }

  try {
    const { id, name, macrocycleId } = await request.json();

    if (!id || !name) {
      return NextResponse.json(
        { error: "ID and name are required" },
        { status: 400 }
      );
    }

    const notion = new Client({
      auth: process.env.NOTION_TOKEN,
    });

    const updatedPage = await notion.pages.update({
      page_id: id,
      properties: {
        Name: {
          title: [
            {
              text: {
                content: name,
              },
            },
          ],
        },
        ...(macrocycleId && {
          Macrocycle: {
            relation: [
              {
                id: macrocycleId,
              },
            ],
          },
        }),
      },
    });

    return NextResponse.json({
      id: updatedPage.id,
      name: updatedPage.properties.Name.title[0].plain_text,
      macrocycle: updatedPage.properties.Macrocycle?.relation[0]?.id || null,
    });
  } catch (error) {
    console.error("Error updating workout plan:", error);
    return NextResponse.json(
      { error: "Failed to update workout plan: " + error.message },
      { status: 500 }
    );
  }
}
