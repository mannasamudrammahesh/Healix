import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import mongoose from 'mongoose';

// Improved prediction function with more realistic results
async function predictSkinDisease(imageData: string) {
  // In a real application, this would use a trained ML model
  // For now, we'll use a more sophisticated mock prediction
  const commonDiseases = [
    { disease: "Acne", confidence: 0.85, severity: "Moderate" },
    { disease: "Eczema", confidence: 0.12, severity: "Mild" },
    { disease: "Psoriasis", confidence: 0.03, severity: "Mild" },
    { disease: "Rosacea", confidence: 0.02, severity: "Mild" },
    { disease: "Dermatitis", confidence: 0.01, severity: "Mild" }
  ];

  // Sort by confidence and return top 3
  return commonDiseases
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, 3);
}

export async function POST(req: Request) {
  try {
    const { image } = await req.json();

    if (!image) {
      return NextResponse.json(
        { error: "No image provided" },
        { status: 400 }
      );
    }

    // Connect to MongoDB
    await connectDB();

    // Get predictions
    const predictions = await predictSkinDisease(image);

    // Fetch additional details from MongoDB
    const diseaseDetails = await Promise.all(
      predictions.map(async (pred) => {
        try {
          const details = await mongoose.connection
            .collection("skin_diseases")
            .findOne({ name: pred.disease });

          if (!details) {
            console.warn(`No details found for disease: ${pred.disease}`);
          }

          return {
            ...pred,
            details: details || {
              name: pred.disease,
              symptoms: "Common symptoms include redness, itching, and inflammation.",
              causes: "Can be caused by various factors including genetics, environment, and lifestyle.",
              treatment: "Treatment options may include topical medications, lifestyle changes, and in some cases, prescription medications.",
              prevention: "Maintain good skin hygiene and avoid known triggers.",
              severity: pred.severity
            }
          };
        } catch (error) {
          console.error(`Error fetching details for ${pred.disease}:`, error);
          return {
            ...pred,
            details: {
              name: pred.disease,
              symptoms: "Information temporarily unavailable",
              causes: "Information temporarily unavailable",
              treatment: "Please consult a healthcare professional",
              prevention: "Information temporarily unavailable",
              severity: pred.severity
            }
          };
        }
      })
    );

    return NextResponse.json({ 
      predictions: diseaseDetails,
      timestamp: new Date().toISOString(),
      confidence_threshold: 0.01
    });
  } catch (error) {
    console.error("Error processing skin analysis:", error);
    return NextResponse.json(
      { 
        error: "Failed to process image",
        message: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
} 