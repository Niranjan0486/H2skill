import type { AnalysisResult } from "../../types";
import type { PipelineOutput } from "../../backend/types";

/**
 * Transforms pipeline output to frontend-compatible AnalysisResult format.
 * This is a direct relocation of the logic used on the frontend so that
 * the server returns the exact same shape without changing business logic.
 */
export function transformPipelineOutputToAnalysisResult(
  output: PipelineOutput,
): AnalysisResult {
  // Convert NDVI data to comprehensive vegetation trend format
  const vegetationTrend = output.ndviTrend.map((ndvi) => {
    const [yearStr, monthNum] = ndvi.month.split("-");
    const year = parseInt(yearStr, 10);
    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const monthName = monthNames[parseInt(monthNum, 10) - 1] || monthNum;

    return {
      month: monthName,
      year,
      ndvi: parseFloat(ndvi.meanNDVI.toFixed(2)),
      // Can be enhanced with seasonal normalization
      normalized: parseFloat(ndvi.meanNDVI.toFixed(2)),
    };
  });

  // Convert risk level to frontend format
  const riskLevel = output.riskLevel.toLowerCase() as "low" | "medium" | "high";
  const riskLevelVerdict =
    riskLevel === "high"
      ? "high-risk"
      : riskLevel === "medium"
        ? "moderate-risk"
        : "compliant";

  // Calculate scores
  const riskScore =
    riskLevel === "high"
      ? 85 + output.confidence * 15
      : riskLevel === "medium"
        ? 50 + output.confidence * 15
        : 20 + output.confidence * 10;
  // Invert for compliance score
  const complianceScore = 100 - Math.round(riskScore);

  // Calculate NDVI metrics
  const baselineNDVI = vegetationTrend[0]?.ndvi || 0.85;
  const currentNDVI = vegetationTrend[vegetationTrend.length - 1]?.ndvi || 0.72;
  const ndviChange = currentNDVI - baselineNDVI;
  const vegetationLossPercent = Math.abs((ndviChange / baselineNDVI) * 100);

  // Extract location details from parsed output - NO FALLBACKS
  // Location must come from the parsed due diligence report
  const locationParts = output.location.split(", ").map((s) => s.trim());
  const city = locationParts[0] || "";
  const state = locationParts[1] || "";
  const yearEstablished = parseInt(
    output.ndviTrend[0]?.month.split("-")[0] || "2017",
    10,
  );
  const currentYear = new Date().getFullYear();
  const assessmentId = `EA-${currentYear}-${Math.floor(Math.random() * 10000)}`;

  // Generate satellite images metadata
  const satelliteImages: AnalysisResult["analysis"]["satelliteImages"] = [];
  if (output.ndviTrend.length > 0) {
    const firstMonth = output.ndviTrend[0].month;
    const lastMonth = output.ndviTrend[output.ndviTrend.length - 1].month;

    satelliteImages.push({
      id: "sat_1",
      date: firstMonth,
      url: `https://picsum.photos/seed/baseline_${firstMonth}/400/300`,
      description:
        "Baseline satellite imagery showing initial vegetation coverage.",
      type: "true-color",
    });

    if (output.ndviTrend.length > 1) {
      const midIndex = Math.floor(output.ndviTrend.length / 2);
      satelliteImages.push({
        id: "sat_2",
        date: output.ndviTrend[midIndex].month,
        url: `https://picsum.photos/seed/mid_${output.ndviTrend[midIndex].month}/400/300`,
        description: "Mid-period imagery showing vegetation changes.",
        type: "false-color",
      });
    }

    satelliteImages.push({
      id: "sat_3",
      date: lastMonth,
      url: `https://picsum.photos/seed/current_${lastMonth}/400/300`,
      description: "Current satellite imagery for comparison.",
      type: "ndvi",
    });
  }

  // Determine carbon sink impact
  const carbonSinkImpact =
    vegetationLossPercent > 15
      ? "high"
      : vegetationLossPercent > 8
        ? "moderate-high"
        : vegetationLossPercent > 3
          ? "moderate"
          : "low";

  const result: AnalysisResult = {
    factory: {
      id: `fac_${Date.now()}`,
      name: output.factory,
      location: {
        city, // NO FALLBACK - must come from parsed report
        state, // NO FALLBACK - must come from parsed report
        country: locationParts[2] || "India", // Only default country if not provided
        lat: output.coordinates[0],
        lng: output.coordinates[1],
      },
      industryType: "Manufacturing",
      yearEstablished,
      landArea: "2 km radius",
      employeeCount: 0,
    },
    analysis: {
      riskLevel,
      score: complianceScore,
      confidence: Math.round(output.confidence * 100),
      summary: output.summary,
      vegetationTrend,
      vegetationLossPercent: Math.round(vegetationLossPercent),
      ndviBaseline: baselineNDVI,
      ndviCurrent: currentNDVI,
      ndviChange: parseFloat(ndviChange.toFixed(2)),
      analysisRadius: 5,
      carbonSinkImpact,
      complianceVerdict: {
        score: complianceScore,
        riskLevel: riskLevelVerdict,
        esgRelevance: ["Environmental Impact", "Carbon Footprint", "Biodiversity"],
        regulatoryRelevance: ["EIA Compliance", "Forest Conservation Act"],
        confidence: Math.round(output.confidence * 100),
      },
      recommendedActions: [
        {
          priority: riskLevel === "high" ? "high" : "medium",
          action: "Review Satellite Findings",
          description:
            "Verify satellite-detected changes with on-site inspection.",
          targetAudience: "auditor",
        },
      ],
      assessmentId,
      assessmentTimestamp: new Date().toISOString(),
      satelliteImages,
    },
  };

  return result;
}

