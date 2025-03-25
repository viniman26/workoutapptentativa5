import { NextResponse } from "next/server";
import { Client } from "@notionhq/client";

export async function POST(request) {
  if (!process.env.NOTION_TOKEN) {
    return NextResponse.json(
      { error: "Server configuration error" },
      { status: 500 }
    );
  }

  try {
    const { workoutPlanId, userId, notes } = await request.json();

    if (!workoutPlanId || !userId) {
      return NextResponse.json(
        { error: "Workout Plan ID and User ID are required" },
        { status: 400 }
      );
    }

    const notion = new Client({
      auth: process.env.NOTION_TOKEN,
    });

    // First, get the main page content
    const mainPage = await notion.pages.retrieve({
      page_id: process.env.NOTION_PAGE_ID,
    });

    // Find the Workout Plan Execution database
    const children = await notion.blocks.children.list({
      block_id: mainPage.id,
    });

    const workoutPlanExecutionDatabase = children.results.find(
      (block) =>
        block.type === "child_database" &&
        block.child_database.title === "Workout Plan Execution"
    );

    if (!workoutPlanExecutionDatabase) {
      return NextResponse.json(
        { error: "Workout Plan Execution database not found" },
        { status: 404 }
      );
    }

    // Create the execution record
    const newExecution = await notion.pages.create({
      parent: {
        database_id: workoutPlanExecutionDatabase.id,
      },
      properties: {
        Name: {
          title: [
            {
              text: {
                content: new Date().toISOString(),
              },
            },
          ],
        },
        "Workout Plan": {
          relation: [
            {
              id: workoutPlanId,
            },
          ],
        },
        User: {
          relation: [
            {
              id: userId,
            },
          ],
        },
        Date: {
          date: {
            start: new Date().toISOString(),
          },
        },
        ...(notes && {
          Notes: {
            rich_text: [
              {
                text: {
                  content: notes,
                },
              },
            ],
          },
        }),
      },
    });

    return NextResponse.json({
      id: newExecution.id,
      date: newExecution.properties.Date.date.start,
      notes: notes || "",
    });
  } catch (error) {
    console.error("Error creating workout execution:", error);
    return NextResponse.json(
      { error: "Failed to create workout execution: " + error.message },
      { status: 500 }
    );
  }
}
