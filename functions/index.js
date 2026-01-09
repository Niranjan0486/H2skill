"use strict";

const functions = require("firebase-functions");
const express = require("express");

// Minimal Express app to keep existing backend code untouched.
const app = express();

// Simple health check endpoint for verification.
app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "api",
    timestamp: new Date().toISOString(),
  });
});

// Export as a callable function mounted at /api/**
exports.api = functions.https.onRequest(app);
