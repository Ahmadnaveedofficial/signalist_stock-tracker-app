import { cron } from "inngest";
import { inngest } from "./client";
import {
  NEWS_SUMMARY_EMAIL_PROMPT,
  PERSONALIZED_WELCOME_EMAIL_PROMPT,
} from "@/lib/inngest/prompts";
import { getAllUsersForNewsEmail } from "../actions/user.actions";
import { sendNewsSummaryEmail, sendWelcomeEmail } from "@/lib/nodemailer";
import { getNews } from "@/lib/actions/finnhub.actions";
import { getFormattedTodayDate } from "@/lib/utils";
import { getWatchlistSymbolsByEmail } from "@/lib/actions/watchlist.actions";

type UserForNews = {
  email: string;
  name?: string;
  [key: string]: unknown;
};

type NewsArticle = {
  symbol?: string;
  headline?: string;
  summary?: string;
  url?: string;
  [key: string]: unknown;
};

/**
 * Sends a personalized welcome email when a user signs up.
 * Uses the user's profile details to generate a tailored intro.
 */
export const sendSignUpEmail = inngest.createFunction(
  {
    id: "sign-up-email",
    triggers: [{ event: "app/user.created" }],
  },
  async ({ event, step }) => {
    // Step 1: Build the user profile summary from the signup event.
    const userProfile = `
      - Country: ${event.data.country}
      - Investment goals: ${event.data.investmentGoals}
      - Risk tolerance: ${event.data.riskTolerance}
      - Preferred industry: ${event.data.preferredIndustry}
    `;

    // Step 2: Inject the profile into the welcome email prompt.
    const prompt = PERSONALIZED_WELCOME_EMAIL_PROMPT.replace(
      "{{userProfile}}",
      userProfile,
    );

    // Step 3: Generate a tailored intro message with the AI model.
    const response = await step.ai.infer("generate-welcome-intro", {
      model: step.ai.models.gemini({ model: "gemini-3.1-flash-lite" }),
      body: {
        contents: [
          {
            role: "user",
            parts: [{ text: prompt }],
          },
        ],
      },
    });

    // Step 4: Send the welcome email using the AI-generated intro.
    await step.run("send-welcome-email", async () => {
      const part = response.candidates?.[0]?.content?.parts?.[0];
      const introText =
        (part && "text" in part ? part.text : null) ||
        "Thanks for joining Signalist. You now have the tools to track markets and make smarter moves.";

      const {
        data: { email, name },
      } = event;

      return await sendWelcomeEmail({
        email,
        name,
        introText,
      } as Parameters<typeof sendWelcomeEmail>[0] & { introText: string });
    });

    return {
      success: true,
      message: "Welcome email sent successfully",
    };
  },
);

export const sendDailyNewsSummary = inngest.createFunction(
  {
    id: "daily-news-summary",
    triggers: [
      { event: "app/send.daily.new" },
      cron("TZ=Asia/Karachi 0 12 * * *"), // runs every day at 12:00 PM Pakistan time
    ],
  },
  async ({ step }) => {
    // Step 1: Fetch all eligible users for the daily news email.
    const users = (await step.run("get-users", async () => {
      return (await getAllUsersForNewsEmail()) as UserForNews[];
    })) as UserForNews[];

    if (!users || users.length === 0) {
      return { success: false, message: "No users found for news email" };
    }

    // Step 2: For each user, collect watchlist-based news and fallback to general news if needed.
    const results = await step.run("fetch-user-news", async () => {
      const perUser: Array<{ user: UserForNews; articles: NewsArticle[] }> = [];

      for (const user of users) {
        try {
          const symbols = await getWatchlistSymbolsByEmail(user.email);
          let articles = await getNews(symbols);
          articles = (articles || []).slice(0, 6);

          if (!articles || articles.length === 0) {
            const fallbackArticles = await getNews();
            articles = (fallbackArticles || []).slice(0, 6);
          }

          perUser.push({ user, articles: articles as NewsArticle[] });
        } catch (e) {
          console.error("daily-news: error preparing user news", user.email, e);
          perUser.push({ user, articles: [] });
        }
      }

      return perUser;
    });

    // Step 3: Summarize the collected news for each user using the AI model.
    const userNewsSummaries: Array<{
      user: UserForNews;
      newsContent: string | null;
    }> = [];

    for (const { user, articles } of results) {
      try {
        const prompt = NEWS_SUMMARY_EMAIL_PROMPT.replace(
          "{{newsData}}",
          JSON.stringify(articles, null, 2),
        );

        const response = await step.ai.infer(`summarize-news-${user.email}`, {
          model: step.ai.models.gemini({ model: "gemini-3.1-flash-lite" }),
          body: {
            contents: [{ role: "user", parts: [{ text: prompt }] }],
          },
        });

        const part = response.candidates?.[0]?.content?.parts?.[0];
        const newsContent =
          (part && "text" in part ? part.text : null) || "No market news.";

        userNewsSummaries.push({ user, newsContent });
      } catch (e) {
        console.error("Failed to summarize news for:", user.email, e);
        userNewsSummaries.push({ user, newsContent: null });
      }
    }

    // Step 4: Send the completed summary email to each user.
    await step.run("send-news-emails", async () => {
      await Promise.all(
        userNewsSummaries.map(async ({ user, newsContent }) => {
          if (!newsContent) return false;

          return await sendNewsSummaryEmail({
            email: user.email,
            date: getFormattedTodayDate(),
            newsContent,
          } satisfies Parameters<typeof sendNewsSummaryEmail>[0]);
        }),
      );
    });

    return {
      success: true,
      message: "Daily news summary emails sent successfully",
    };
  },
);
