'use client';

import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Info, Camera, Upload, AlertTriangle } from 'lucide-react';
import { BackButton } from '@/components/ui/back-button';

interface Prediction {
  disease: string;
  confidence: number;
  severity: string;
  details: {
    name: string;
    symptoms: string;
    causes: string;
    treatment: string;
    prevention: string;
    severity: string;
  };
}

export default function SkinAnalysisPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('camera');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (activeTab === 'camera') {
      startCamera();
    } else {
      stopCamera();
    }
  }, [activeTab]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      setError("Failed to access camera");
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0);
        const imageData = canvasRef.current.toDataURL('image/jpeg');
        setCapturedImage(imageData);
        return imageData;
      }
    }
    return null;
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageData = e.target?.result as string;
        setCapturedImage(imageData);
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzeImage = async () => {
    if (!capturedImage) {
      setError("Please capture or upload an image first");
      return;
    }

    setIsLoading(true);
    setError(null);
    setPredictions([]);

    try {
      const response = await fetch('/api/skin-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ image: capturedImage }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to analyze image');
      }

      if (!data.predictions || data.predictions.length === 0) {
        throw new Error('No predictions available');
      }

      setPredictions(data.predictions);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Analysis error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <BackButton />
      </div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Skin Disease Analysis</h1>
        <Alert className="w-fit">
          <Info className="h-4 w-4" />
          <AlertTitle>Note</AlertTitle>
          <AlertDescription>
            This is an AI-powered tool for preliminary analysis. Always consult a healthcare professional for proper diagnosis.
          </AlertDescription>
        </Alert>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Image Input</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="camera">
                  <Camera className="w-4 h-4 mr-2" />
                  Camera
                </TabsTrigger>
                <TabsTrigger value="upload">
                  <Upload className="w-4 h-4 mr-2" />
                  Upload
                </TabsTrigger>
              </TabsList>

              <TabsContent value="camera">
                <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="w-full h-full object-cover"
                  />
                  <canvas ref={canvasRef} className="hidden" />
                </div>
                <div className="mt-4 space-x-4">
                  <Button onClick={captureImage}>Capture Image</Button>
                  <Button 
                    onClick={analyzeImage} 
                    disabled={isLoading || !capturedImage}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {isLoading ? 'Analyzing...' : 'Analyze Image'}
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="upload">
                <div className="space-y-4">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept="image/*"
                    className="hidden"
                  />
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Choose Image
                  </Button>
                  {capturedImage && (
                    <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden">
                      <img
                        src={capturedImage}
                        alt="Uploaded"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <Button
                    onClick={analyzeImage}
                    disabled={isLoading || !capturedImage}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    {isLoading ? 'Analyzing...' : 'Analyze Image'}
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Analysis Results</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                <div className="animate-pulse space-y-4">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                </div>
              </div>
            ) : error ? (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : predictions.length > 0 ? (
              <div className="space-y-6">
                {predictions.map((prediction, index) => (
                  <div key={index} className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold">{prediction.disease}</h3>
                      <Badge variant={prediction.severity === 'Severe' ? 'destructive' : 'default'}>
                        {prediction.severity}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">Confidence</span>
                        <span className="text-sm font-medium">
                          {(prediction.confidence * 100).toFixed(1)}%
                        </span>
                      </div>
                      <Progress value={prediction.confidence * 100} className="h-2" />
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-medium">Symptoms</h4>
                      <p className="text-sm text-gray-600">{prediction.details.symptoms}</p>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-medium">Treatment</h4>
                      <p className="text-sm text-gray-600">{prediction.details.treatment}</p>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-medium">Prevention</h4>
                      <p className="text-sm text-gray-600">{prediction.details.prevention}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-500">
                Capture or upload an image to begin analysis
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 