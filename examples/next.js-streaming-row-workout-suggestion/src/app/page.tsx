"use client";

import ReactMarkdown from "react-markdown";
import { ChangeEvent, useState } from "react";

export default function HomePage() {
    const [age, setAge] = useState<number | null>(null);
    const [weight, setWeight] = useState<number | null>(null);
    const [height, setHeight] = useState<number | null>(null);
    const [preferredBodyType, setPreferredBodyType] = useState<string>("");
    const [workoutPlan, setWorkoutPlan] = useState<string>("");
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const [sex, setSex] = useState("male");

    const handleSexChange = (e: ChangeEvent<HTMLSelectElement>) => {
        setSex(e.target.value);
    };

    const handleSubmit = async () => {
        setIsLoading(true);
        setWorkoutPlan("");
        if (age && weight && height && preferredBodyType && sex) {
            const response = await fetch(`/api/get-workout-suggestion`, {
                method: "POST",
                body: JSON.stringify({
                    age,
                    weight,
                    height,
                    sex,
                    preferredBodyType,
                }),
            });
            if (response.ok && response.body) {
                const reader = response.body.getReader();
                const decoder = new TextDecoder("utf-8");

                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;
                    const chunk = decoder.decode(value, { stream: true });
                    setWorkoutPlan((prev) => prev + chunk);
                }
                setIsLoading(false);
            } else {
                alert("Something went wrong!");
            }
        } else {
            alert("Please fill in all fields.");
            setIsLoading(false);
        }
    };

    return (
        <main className="p-12 ">
            <div className="grid grid-cols-3 mx-6 gap-x-6">
                <div className=" p-6 shadow-md rounded-md">
                    <h2 className="text-2xl font-bold mb-4">
                        Daily Workout Plannner
                    </h2>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700">
                            Age
                        </label>
                        <input
                            type="number"
                            required
                            className="mt-1 p-2 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                            value={age || ""}
                            onChange={(e) => setAge(Number(e.target.value))}
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700">
                            Weight (kg)
                        </label>
                        <input
                            type="number"
                            step="0.1"
                            required
                            className="mt-1 p-2 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                            value={weight || ""}
                            onChange={(e) => setWeight(Number(e.target.value))}
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700">
                            Height (cm)
                        </label>
                        <input
                            type="number"
                            step="0.1"
                            required
                            className="mt-1 p-2 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                            value={height || ""}
                            onChange={(e) => setHeight(Number(e.target.value))}
                        />
                    </div>
                    <div className="mb-6">
                        <label
                            htmlFor="movieGenre"
                            className="block text-sm font-medium text-gray-700 mb-2"
                        >
                            Sex
                        </label>
                        <select
                            value={sex}
                            onChange={handleSexChange}
                            required
                            className="block w-full py-3 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-black"
                        >
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                        </select>
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700">
                            Preferred Body Type
                            <span className="text-gray-500">
                                (eg: lean, athletic, bulky)
                            </span>
                        </label>
                        <input
                            type="text"
                            required
                            className="mt-1 p-2 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                            value={preferredBodyType}
                            onChange={(e) =>
                                setPreferredBodyType(e.target.value)
                            }
                        />
                    </div>
                    <button
                        disabled={isLoading}
                        onClick={handleSubmit}
                        className={`w-full  text-white py-2 px-4 rounded-md  ${
                            !isLoading
                                ? "bg-indigo-500 hover:bg-indigo-600"
                                : "bg-gray-500 hover:bg-gray-500 cursor-default"
                        }`}
                    >
                        Get Workout Plan
                    </button>
                </div>
                <div className="p-4 border col-span-2 border-gray-300 rounded-md">
                    <h2 className="text-2xl font-bold mb-6">
                        Suggested Daily Workout Plan :
                    </h2>
                    <ReactMarkdown>{workoutPlan}</ReactMarkdown>
                </div>
            </div>
        </main>
    );
}
