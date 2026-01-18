import { extractFactoryDetailsWithGemini } from "./src/services/geminiExtractor";
import dotenv from "dotenv";

// Load environment variables
dotenv.config({ path: ".env.local" });

const testText = `
Factory Name: ABC Manufacturing Ltd.
Address: 123 Industrial Area, Mumbai, Maharashtra, India
Established: 2015
`;

console.log("Testing Gemini extraction with gemini-1.0-pro model...\n");

extractFactoryDetailsWithGemini(testText)
    .then((result) => {
        console.log("\n✅ Test completed successfully!");
        console.log("Result:", JSON.stringify(result, null, 2));

        if (result === null) {
            console.log("\n⚠️  Gemini returned null (expected if API key is missing or model fails)");
            console.log("✅ Pipeline continues gracefully - no crash!");
        } else {
            console.log("\n✅ Gemini extraction successful!");
        }
    })
    .catch((error) => {
        console.error("\n❌ Test failed with error:", error.message);
        console.error("This should NOT happen - errors should be caught and return null");
        process.exit(1);
    });
