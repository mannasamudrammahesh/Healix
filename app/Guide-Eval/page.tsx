"use client";

import Image from "next/image"
import styles from '@/styles/career.module.css'
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils"
import { useState, useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";

export default function Career() {
    const [selectedCondition, setSelectedCondition] = useState('Please select a condition')
    const [conditionDescription, setConditionDescription] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [consultationResult, setConsultationResult] = useState(null)

    const router = useRouter();

    // Reset error when selecting a new condition
    useEffect(() => {
        setError(null);
        setConsultationResult(null);
    }, [selectedCondition]);

    // Fallback descriptions in case data file loading fails
    const fallbackDescriptions = {
        "Anger": "Feelings of intense displeasure, hostility, or exasperation toward someone or something.",
        "Anxiety": "Feelings of worry, nervousness, or unease about something with an uncertain outcome.",
        "Bipolar": "A mental health condition that causes unusual shifts in mood, energy, activity levels, and concentration.",
        "Depression": "A mental health disorder characterized by persistently depressed mood or loss of interest in activities.",
        "WeightLoss": "Challenges related to managing body weight that may affect mental wellbeing.",
        "Loneliness": "Distressing experience that occurs when a person's social relationships are perceived as being less in quantity and quality than desired.",
        "Fear": "An unpleasant emotion caused by the threat of danger, pain, or harm.",
        "Insomnia": "A sleep disorder characterized by difficulty falling asleep or staying asleep.",
        "HearingVoices": "Auditory hallucinations that involve hearing voices when no one is speaking.",
        "PanicAttack": "A sudden episode of intense fear that triggers severe physical reactions when there is no real danger.",
        "Paranoia": "A thought process heavily influenced by anxiety or fear, often to the point of irrationality and delusion.",
        "Phobia": "An extreme or irrational fear of or aversion to something specific.",
        "Psychosis": "A condition that affects the mind, where there is some loss of contact with reality.",
        "Schizophrenia": "A chronic mental disorder that affects how a person thinks, feels, and behaves.",
        "SelfConfidence": "A feeling of trust in one's abilities, qualities, and judgment.",
        "SelfHarm": "Intentional injury to oneself, typically as a manifestation of a psychological or psychiatric disorder."
    };

    // Mock consultation responses
    const consultationResponses = {
        "Anger": {
            guidance: "Anger management techniques include identifying triggers, practicing deep breathing, counting to ten before responding, and considering therapy approaches like cognitive behavioral therapy (CBT).",
            resources: ["Mindfulness meditation", "Progressive muscle relaxation", "Anger management classes", "Individual counseling"]
        },
        "Anxiety": {
            guidance: "Anxiety can be managed through regular exercise, adequate sleep, limiting caffeine and alcohol, practicing relaxation techniques, and cognitive behavioral therapy.",
            resources: ["Guided meditation apps", "Support groups", "Workbooks on anxiety management", "Professional therapy"]
        },
        "Bipolar": {
            guidance: "Bipolar disorder typically requires a comprehensive treatment plan including medication, therapy, regular sleep patterns, stress management, and monitoring mood changes.",
            resources: ["Mood tracking apps", "Support groups", "Family therapy", "Medication management"]
        },
        "Depression": {
            guidance: "Depression treatment often involves psychotherapy, medication, lifestyle changes like regular exercise, healthy eating, adequate sleep, and building social connections.",
            resources: ["Talk therapy", "Support groups", "Self-care activities", "Crisis helplines"]
        },
        "WeightLoss": {
            guidance: "Healthy weight management involves balanced nutrition, regular physical activity, adequate sleep, stress management, and addressing emotional factors related to eating.",
            resources: ["Nutritional counseling", "Fitness programs", "Mindful eating practices", "Body image support groups"]
        },
        "Loneliness": {
            guidance: "Combating loneliness involves gradually increasing social interactions, joining groups based on interests, volunteering, and developing communication skills.",
            resources: ["Community centers", "Volunteer opportunities", "Social skills groups", "Online communities"]
        },
        "Fear": {
            guidance: "Overcoming fears often involves exposure therapy, cognitive restructuring to challenge irrational thoughts, and relaxation techniques to manage physical responses.",
            resources: ["Self-help books", "Exposure therapy", "Relaxation techniques", "Professional counseling"]
        },
        "Insomnia": {
            guidance: "Improving sleep may involve establishing a regular sleep schedule, creating a relaxing bedtime routine, limiting screen time before bed, and cognitive behavioral therapy for insomnia.",
            resources: ["Sleep hygiene education", "Sleep tracking apps", "Relaxation techniques", "CBT-I (Cognitive Behavioral Therapy for Insomnia)"]
        },
        "HearingVoices": {
            guidance: "Managing auditory hallucinations typically requires professional assessment, possible medication, coping strategies like reality testing, and supportive therapy.",
            resources: ["Mental health crisis services", "Hearing Voices Network", "Psychiatric evaluation", "Family support groups"]
        },
        "PanicAttack": {
            guidance: "Dealing with panic attacks involves learning to recognize triggers, practicing deep breathing, challenging catastrophic thinking, and gradual exposure to feared situations.",
            resources: ["Breathing exercises", "Progressive muscle relaxation", "CBT workbooks", "Panic disorder support groups"]
        },
        "Paranoia": {
            guidance: "Managing paranoid thoughts may involve reality testing techniques, reducing stress, maintaining social connections, and professional treatment for underlying conditions.",
            resources: ["Professional assessment", "Cognitive behavioral therapy", "Stress reduction techniques", "Medication evaluation"]
        },
        "Phobia": {
            guidance: "Phobia treatment typically involves gradual exposure therapy, cognitive restructuring to challenge irrational beliefs, and relaxation techniques.",
            resources: ["Self-help books on phobias", "Exposure therapy", "Virtual reality therapy", "Support groups"]
        },
        "Psychosis": {
            guidance: "Early intervention is crucial for psychosis. Treatment typically involves antipsychotic medication, individual therapy, family support, and social skills training.",
            resources: ["Early intervention programs", "Crisis services", "Family psychoeducation", "Rehabilitation programs"]
        },
        "Schizophrenia": {
            guidance: "Schizophrenia management typically involves antipsychotic medication, psychosocial treatments, family support, vocational rehabilitation, and self-management strategies.",
            resources: ["Medication management", "Cognitive behavioral therapy", "Family therapy", "Community support services"]
        },
        "SelfConfidence": {
            guidance: "Building self-confidence involves setting achievable goals, practicing positive self-talk, focusing on strengths, accepting imperfections, and stepping outside comfort zones.",
            resources: ["Self-esteem workbooks", "Assertiveness training", "Positive psychology exercises", "Confidence-building groups"]
        },
        "SelfHarm": {
            guidance: "Self-harm requires compassionate professional support. Treatment focuses on understanding triggers, developing alternative coping strategies, addressing underlying issues, and safety planning.",
            resources: ["Crisis text/phone lines", "Dialectical behavior therapy", "Safety planning tools", "Professional mental health support"]
        }
    };

    const handleClick = (e) => {
        const conditionValue = e.target.getAttribute('alt');
        
        if (!conditionValue) return;

        toast.success(`You selected ${conditionValue}`);
        setSelectedCondition(conditionValue);
        setConsultationResult(null);

        // Try to load description from data file
        try {
            const loadDescription = async () => {
                try {
                    const module = await import(`@/data/career.d.ts`);
                    if (module && module.data && module.data[conditionValue]) {
                        setConditionDescription(module.data[conditionValue]);
                    } else {
                        // Use fallback if data is missing
                        setConditionDescription(fallbackDescriptions[conditionValue] || 
                            "Information about this condition is currently unavailable.");
                    }
                } catch (err) {
                    console.error("Error loading condition data:", err);
                    // Use fallback if file loading fails
                    setConditionDescription(fallbackDescriptions[conditionValue] || 
                        "Information about this condition is currently unavailable.");
                }
            };

            loadDescription();
        } catch (err) {
            console.error("Error in condition selection:", err);
            setConditionDescription(fallbackDescriptions[conditionValue] || 
                "Information about this condition is currently unavailable.");
        }

        // Remove all selected classes
        const images = document.querySelectorAll('img');
        images.forEach((image) => {
            image.classList.remove(`${styles.imageSelected}`);
        });

        // Add selected class to clicked image
        e.target.classList.add(`${styles.imageSelected}`);
    };

    const handleGetGuidance = () => {
        if (!selectedCondition || selectedCondition === 'Please select a condition') {
            toast.error('Please select a condition first');
            return;
        }
        
        setLoading(true);
        setError(null);
        
        // Simulate API call
        setTimeout(() => {
            try {
                const response = consultationResponses[selectedCondition];
                
                if (response) {
                    setConsultationResult({
                        title: `Guidance for ${selectedCondition}`,
                        guidance: response.guidance,
                        resources: response.resources
                    });
                } else {
                    setError("Unable to retrieve guidance for this condition. Please try again later.");
                }
            } catch (err) {
                console.error("Error generating guidance:", err);
                setError("An error occurred while generating guidance. Please try again.");
            } finally {
                setLoading(false);
            }
        }, 1000);
    };

    const handleEvaluate = () => {
        if (!selectedCondition || selectedCondition === 'Please select a condition') {
            toast.error('Please select a condition first');
            return;
        }
        
        // Store the selected condition in sessionStorage for use after quiz completion
        try {
            sessionStorage.setItem('selectedCondition', selectedCondition);
            router.push(`/Courses/${selectedCondition}`);
        } catch (err) {
            console.error("Navigation error:", err);
            toast.error("There was an error navigating to the course. Please try again.");
        }
    };

    return (
        <main className={`p-10 flex flex-col md:flex-row mt-10 ${styles.career} w-full`}>
            <Toaster />
            <div className={`${styles.imageContainer} mb-8 md:mb-0`}>
                <Image src="/icons/anger.png" alt="Anger" width={80} height={80} onClick={handleClick}/>
                <Image src="/icons/anxiety.png" alt="Anxiety" width={80} height={80} onClick={handleClick} />
                <Image src="/icons/bipolar.png" alt="Bipolar" width={80} height={80} onClick={handleClick} />
                <Image src="/icons/depression.png" alt="Depression" width={80} height={80} onClick={handleClick} />
                <Image src="/icons/weight-loss.png" alt="WeightLoss" width={80} height={80} onClick={handleClick} />
                <Image src="/icons/loneliness.png" alt="Loneliness" width={80} height={80} onClick={handleClick} />
                <Image src="/icons/fear.png" alt="Fear" width={80} height={80} onClick={handleClick} />
                <Image src="/icons/insomnia.png" alt="Insomnia" width={80} height={80} onClick={handleClick} />
                <Image src="/icons/listen.png" alt="HearingVoices" width={80} height={80} onClick={handleClick} />
                <Image src="/icons/panic-attack.png" alt="PanicAttack" width={80} height={80} onClick={handleClick} />
                <Image src="/icons/paranoia.png" alt="Paranoia" width={80} height={80} onClick={handleClick} />
                <Image src="/icons/phobia.png" alt="Phobia" width={80} height={80} onClick={handleClick} />
                <Image src="/icons/psychosis.png" alt="Psychosis" width={80} height={80} onClick={handleClick} />
                <Image src="/icons/schizophrenia.png" alt="Schizophrenia" width={80} height={80} onClick={handleClick} />
                <Image src="/icons/self-confidence.png" alt="SelfConfidence" width={80} height={80} onClick={handleClick} />
                <Image src="/icons/self-harm.png" alt="SelfHarm" width={80} height={80} onClick={handleClick} />
            </div>
            
            <div className={`${styles.imageContent} flex-1`}>
                <h1 className={`${styles.h1} mb-4`}>{selectedCondition}</h1>
                
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
                        {error}
                    </div>
                )}
                
                {consultationResult ? (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-5 mb-4">
                        <h2 className="text-xl font-semibold mb-3">{consultationResult.title}</h2>
                        <div className="mb-4">
                            <h3 className="text-lg font-medium mb-2">Guidance:</h3>
                            <p>{consultationResult.guidance}</p>
                        </div>
                        <div>
                            <h3 className="text-lg font-medium mb-2">Helpful Resources:</h3>
                            <ul className="list-disc pl-5">
                                {consultationResult.resources.map((resource, index) => (
                                    <li key={index}>{resource}</li>
                                ))}
                            </ul>
                        </div>
                        <Button 
                            onClick={() => setConsultationResult(null)} 
                            className="mt-4"
                        >
                            Back to Information
                        </Button>
                    </div>
                ) : (
                    <>
                        <p className={`${styles.p} mb-5`}>{conditionDescription}</p>
                        <div className="flex flex-col gap-3">
                            <Button 
                                onClick={handleGetGuidance} 
                                className={cn("w-[200px]")}
                                disabled={loading}
                            >
                                {loading ? "Loading..." : "Get guidance"}
                            </Button>
                            <Button 
                                onClick={handleEvaluate} 
                                className={cn("w-[200px]")}
                            >
                                Evaluate
                            </Button>
                        </div>
                    </>
                )}
            </div>
        </main>
    );
}
