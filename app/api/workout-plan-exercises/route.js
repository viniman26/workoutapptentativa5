import { NextResponse } from "next/server";
import { Client } from "@notionhq/client";

export async function GET(request) {
  if (!process.env.NOTION_TOKEN) {
    return NextResponse.json(
      { error: "Server configuration error" },
      { status: 500 }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const planId = searchParams.get("planId");

    if (!planId) {
      return NextResponse.json(
        { error: "Plan ID is required" },
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

    // Find the Workout Plan Exercises database
    const children = await notion.blocks.children.list({
      block_id: mainPage.id,
    });

    const workoutPlanExercisesDatabase = children.results.find(
      (block) =>
        block.type === "child_database" &&
        block.child_database.title === "Workout Plan Exercises"
    );

    if (!workoutPlanExercisesDatabase) {
      return NextResponse.json(
        { error: "Workout Plan Exercises database not found" },
        { status: 404 }
      );
    }

    // Query the database for exercises of this plan
    const response = await notion.databases.query({
      database_id: workoutPlanExercisesDatabase.id,
      filter: {
        property: "Plan",
        relation: {
          contains: planId,
        },
      },
      sorts: [
        {
          property: "Name",
          direction: "ascending",
        },
      ],
    });

    // Get the exercises database to fetch exercise details
    const exercisesDatabase = children.results.find(
      (block) =>
        block.type === "child_database" &&
        block.child_database.title === "Exercises"
    );

    if (!exercisesDatabase) {
      return NextResponse.json(
        { error: "Exercises database not found" },
        { status: 404 }
      );
    }

    // Map through workout plan exercises and fetch exercise details
    const exercises = await Promise.all(
      response.results.map(async (page) => {
        const exerciseId = page.properties.Exercise.relation[0]?.id;
        if (!exerciseId) return null;

        const exerciseDetails = await notion.pages.retrieve({
          page_id: exerciseId,
        });

        return {
          id: page.id,
          name:
            exerciseDetails.properties.Name.title[0]?.plain_text || "Unnamed",
          sets: page.properties.Sets?.number || 0,
          reps: page.properties.Reps?.number || 0,
          weight: page.properties.Weight?.number || 0,
          restBetweenSets: page.properties["Rest Between Sets"]?.number || 90,
          type: exerciseDetails.properties.Type?.select?.name || "",
          equipment: exerciseDetails.properties.Equipment?.select?.name || "",
          imagePath:
            exerciseDetails.properties["Image Path"]?.rich_text[0]
              ?.plain_text || "",
        };
      })
    );

    // Filter out any null values and return the exercises
    return NextResponse.json(exercises.filter(Boolean));
  } catch (error) {
    console.error("Error fetching workout plan exercises:", error);
    return NextResponse.json(
      { error: "Failed to fetch workout plan exercises: " + error.message },
      { status: 500 }
    );
  }
}
