"use client";

import { Button } from "@/app/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";

const commandsData = {
  categories: [
    {
      title: "Member Matching",
      description: "Commands for finding similar members",
      commands: [
        {
          name: "/match bio",
          description: "Find members who share specific interests or keywords.",
          usage: "/match [bio]",
        },
      ],
    },
    {
      title: "Community Insights",
      description: "Commands for community analysis and summaries",
      commands: [
        {
          name: "/summarize",
          description:
            "Get a summary of recent introductions and community activity.",
          usage: "/summarize",
        }
      ],
    },
    {
      title: "Ask Bagel",
      description: "Commands for asking Bagel questions",
      commands: [
        {
          name: "/ask",
          description: "Ask Bagel a question",
          usage: "/ask [question]"
        }
      ]
    }
  ],
  usageNotes: [
    "All commands require appropriate permissions to use.",
    "Some commands may be limited based on your server's subscription status.",
    "The bot processes messages in batches to avoid rate limits.",
    "For optimal performance, keep introductions under 2000 characters.",
  ],
};

export default function CommandsDocumentation() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          <div>
            <h1 className="text-4xl font-bold text-foreground">Bot Commands</h1>
            <p className="text-muted-foreground mt-2">
              Complete list of available slash commands and their usage
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {commandsData.categories.map((category) => (
              <Card key={category.title.toLowerCase().replace(/\s+/g, '-')}>
                <CardHeader>
                  <CardTitle>{category.title}</CardTitle>
                  <CardDescription>{category.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {category.commands.map((command) => (
                    <div key={command.name.toLowerCase().replace(/\s+/g, '-')}>
                      <h3 className="font-semibold text-foreground">
                        {command.name}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {command.description}
                      </p>
                      <div className="mt-2 text-sm">
                        <span className="font-medium">Usage:</span>
                        <pre className="mt-1 p-2 bg-muted rounded-md">
                          {command.usage}
                        </pre>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-8">
            <Card>
              <CardHeader>
                <CardTitle>Usage Notes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  <ul className="list-disc list-inside space-y-2">
                    {commandsData.usageNotes.map((note) => (
                      <li key={note.toLowerCase().replace(/\s+/g, '-')}>{note}</li>
                    ))}
                  </ul>
                </div>

                <div className="flex justify-between items-center mt-4 pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={() => (window.location.href = "/dashboard")}
                  >
                    Return to Dashboard
                  </Button>
                  <Button
                    className="bg-primary hover:bg-primary/90"
                    onClick={() =>
                      (window.location.href = "/docs/getting-started")
                    }
                  >
                    Getting Started Guide
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
