import { NextResponse } from "next/server";
import { Client } from "@notionhq/client";

export async function POST(request) {
  try {
    const { user } = await request.json();

    if (!user || !user.email || !user.displayName) {
      return NextResponse.json(
        { error: "User data is required" },
        { status: 400 }
      );
    }

    const notion = new Client({
      auth: process.env.NOTION_TOKEN,
    });

    // Get the Users database directly using the database ID
    const usersDatabase = await notion.databases.retrieve({
      database_id: process.env.NOTION_DATABASE_ID,
    });

    if (!usersDatabase) {
      console.error("Users database not found");
      return NextResponse.json(
        { error: "Users database not found" },
        { status: 404 }
      );
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

      return NextResponse.json({ success: true, user: newUser });
    }

    return NextResponse.json({ success: true, user: existingUsers.results[0] });
  } catch (error) {
    console.error("Error creating user in Notion:", error);
    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 500 }
    );
  }
}
