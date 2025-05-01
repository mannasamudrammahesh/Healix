"use client";

import Image from "next/image"
import styles from '@/styles/career.module.css'
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils"
import { useState, useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";

export default function Career() {
    const [selectedCareer, setSelectedCareer] = useState('Please select a condition')
    const [careerDescription, setCareerDescription] = useState('')
    const [loading, setLoading] = useState(false)
    const [responseData, setResponseData] = useState(null)
    const [showResponse, setShowResponse] = useState(false)

    const router = useRouter();

    // Mock responses for different conditions
    const conditionResponses = {
        "Anger": "Anger is a normal emotion that can become problematic when it's frequent or intense. Managing anger involves learning triggers, practicing relaxation techniques, and developing healthier communication skills.",
        "Anxiety": "Anxiety involves persistent worry and fear that can interfere with daily activities. Effective treatment includes cognitive-behavioral therapy, mindfulness practices, and sometimes medication.",
        "Bipolar": "Bipolar disorder causes unusual shifts in mood, energy, and activity levels. Treatment typically involves a combination of medication, therapy, and lifestyle management.",
        "Depression": "Depression is characterized by persistent sadness and loss of interest. Treatment approaches include psychotherapy, medication, and lifestyle changes like regular exercise and social connection.",
        "WeightLoss": "Weight management challenges can affect mental health. Sustainable approaches focus on balanced nutrition, regular physical activity, and addressing psychological factors related to eating.",
        "Loneliness": "Chronic loneliness can significantly impact wellbeing. Building meaningful connections, joining community activities, and developing social skills can help reduce feelings of isolation.",
        "Fear": "Persistent fears can limit one's life. Exposure therapy and cognitive techniques can help people confront and overcome specific fears in a supported way.",
        "Insomnia": "Sleep difficulties can worsen mental health symptoms. Sleep hygiene practices, cognitive behavioral therapy for insomnia, and addressing underlying issues can improve sleep quality.",
        "HearingVoices": "Auditory hallucinations may occur in various conditions. Professional assessment is important, along with medication, therapy, and coping strategies to manage these experiences.",
        "PanicAttack": "Panic attacks involve sudden intense fear with physical symptoms. Treatment includes cognitive-behavioral techniques, breathing exercises, and sometimes medication.",
        "Paranoia": "Paranoid thoughts involve suspicion and mistrust. Treatment depends on the underlying cause and may include therapy to challenge distorted thinking and medication when appropriate.",
        "Phobia": "Specific phobias are intense fears of particular objects or situations. Exposure therapy is highly effective in gradually helping people overcome these fears.",
        "Psychosis": "Psychosis involves loss of contact with reality. Early intervention is crucial, typically involving antipsychotic medication, therapy, and social support.",
        "Schizophrenia": "Schizophrenia affects how a person thinks, feels, and behaves. Comprehensive treatment includes medication, psychosocial interventions, and community support.",
        "SelfConfidence": "Low self-confidence can limit potential. Building self-esteem involves challenging negative self-talk, setting achievable goals, and recognizing personal strengths.",
        "SelfHarm": "Self-harm behaviors require compassionate professional support. Treatment focuses on developing healthier coping strategies, addressing underlying issues, and safety planning."
    };

    const handleClick = (e) => {
        const customValue = e.target.getAttribute('alt');

        toast.success(`You selected ${customValue}`);

        // Reset response view when selecting a new condition
        setShowResponse(false);

        const readFile = async (name) => {
            try {
                const markdown = await import(`@/data/${name}.d.ts`);
                const data = markdown.data;
                setCareerDescription(data[customValue] || "Information about this condition is being loaded.");
                return markdown.data;
            } catch (error) {
                console.error("Error loading data:", error);
                setCareerDescription("Information about this condition is currently unavailable. Please try again later.");
                return {};
            }
        };

        readFile("career");
        setSelectedCareer(customValue);

        // Remove all selected classes
        const images = document.querySelectorAll('img');
        images.forEach((image) => {
            image.classList.remove(`${styles.imageSelected}`);
        });

        // Add selected class to clicked image
        e.target.classList.add(`${styles.imageSelected}`);
    };

    const handleGetGuidance = () => {
        if (!selectedCareer || selectedCareer === 'Please select a condition') {
            toast.error('Please select a condition first');
            return;
        }
        
        setLoading(true);
        
        // Simulate API call or data fetching
        setTimeout(() => {
            setResponseData({
                title: `Guidance for ${selectedCareer}`,
                content: conditionResponses[selectedCareer] || "Detailed guidance for this condition is being developed. Please check back later."
            });
            setShowResponse(true);
            setLoading(false);
        }, 1000);
    };

    const handleEvaluate = () => {
        if (!selectedCareer || selectedCareer === 'Please select a condition') {
            toast.error('Please select a condition first');
            return;
        }
        
        router.push(`/Courses/${selectedCareer}`);
    };

    return (
        <main className={`p-10 flex flex-col md:flex-row mt-10 ${styles.career} w-full`}>
            <Toaster />
            <div className={`${styles.imageContainer}`}>
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
            
            <div className={`${styles.imageContent}`}>
                <h1 className={`${styles.h1}`}>{selectedCareer}</h1>
                {!showResponse ? (
                    <>
                        <p className={`${styles.p}`}>{careerDescription}</p>
                        <div className="mt-5 flex flex-col gap-3">
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
                ) : (
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg shadow">
                        <h2 className="text-xl font-semibold mb-3">{responseData?.title}</h2>
                        <p className="mb-4">{responseData?.content}</p>
                        <Button 
                            onClick={() => setShowResponse(false)} 
                            className="mt-3"
                        >
                            Back to Selection
                        </Button>
                    </div>
                )}
            </div>
        </main>
    );
}
