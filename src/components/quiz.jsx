import { useState, useEffect } from "react";
import "./quiz.css";

export default function QuizApp() {
    const [amount, setAmount] = useState(5);
    const [category, setCategory] = useState("any");
    const [difficulty, setDifficulty] = useState("any");
    const [type, setType] = useState("any");
    const [categories, setCategories] = useState([]);
    const [questions, setQuestions] = useState([]);
    const [started, setStarted] = useState(false);

    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState([]);
    const [selectedAnswer, setSelectedAnswer] = useState("");
    const [finished, setFinished] = useState(false);

    useEffect(() => {
        fetch("https://opentdb.com/api_category.php")
            .then((res) => res.json())
            .then((data) => setCategories(data.trivia_categories || []));
    }, []);

    const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);

    const startQuiz = async () => {
        const params = new URLSearchParams();
        params.append("amount", amount);
        if (category !== "any") params.append("category", category);
        if (difficulty !== "any") params.append("difficulty", difficulty);
        if (type !== "any") params.append("type", type);

        const res = await fetch(`https://opentdb.com/api.php?${params.toString()}`);
        const data = await res.json();

        const formatted = data.results.map((q) => ({
            ...q,
            allAnswers: shuffle([q.correct_answer, ...q.incorrect_answers]),
        }));

        setQuestions(formatted);
        setStarted(true);
        setFinished(false);
        setCurrentIndex(0);
        setAnswers([]);
        setSelectedAnswer("");
    };

    const submitAnswer = () => {
        if (!selectedAnswer) return;

        setAnswers([...answers, selectedAnswer]);

        if (currentIndex + 1 >= questions.length) {
            setFinished(true);
        } else {
            setCurrentIndex(currentIndex + 1);
            setSelectedAnswer("");
        }
    };

    const restart = () => {
        setStarted(false);
        setFinished(false);
        setQuestions([]);
        setCurrentIndex(0);
        setAnswers([]);
        setSelectedAnswer("");
    };

    return (
        <div className="quiz-wrapper">
            {!started && (
                <div className="card">
                    <h1>Quiz Einstellungen</h1>

                    <label>Anzahl Fragen:</label>
                    <input
                        type="number"
                        min={1}
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                    />

                    <label>Kategorie:</label>
                    <select value={category} onChange={(e) => setCategory(e.target.value)}>
                        <option value="any">Any</option>
                        {categories.map((cat) => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                    </select>

                    <label>Schwierigkeit:</label>
                    <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
                        <option value="any">Any</option>
                        <option value="easy">Easy</option>
                        <option value="medium">Medium</option>
                        <option value="hard">Hard</option>
                    </select>

                    <label>Fragetyp:</label>
                    <select value={type} onChange={(e) => setType(e.target.value)}>
                        <option value="any">Any</option>
                        <option value="multiple">Multiple Choice</option>
                        <option value="boolean">True / False</option>
                    </select>

                    <button className="btn-primary" onClick={startQuiz}>
                        Start
                    </button>
                </div>
            )}

            {started && !finished && (
                <div className="card">
                    <h2>Frage {currentIndex + 1} / {questions.length}</h2>

                    <p
                        className="question"
                        dangerouslySetInnerHTML={{ __html: questions[currentIndex].question }}
                    />

                    <div className="answers">
                        {questions[currentIndex].allAnswers.map((a, i) => (
                            <label
                                key={i}
                                className={`answer ${selectedAnswer === a ? "selected" : ""}`}
                            >
                                <input
                                    type="radio"
                                    checked={selectedAnswer === a}
                                    onChange={() => setSelectedAnswer(a)}
                                />
                                <span dangerouslySetInnerHTML={{ __html: a }} />
                            </label>
                        ))}
                    </div>

                    <button className="btn-primary" onClick={submitAnswer}>
                        Weiter
                    </button>
                </div>
            )}

            {finished && (
                <div className="card">
                    <h2>Auswertung</h2>

                    {questions.map((q, i) => {
                        const correct = q.correct_answer === answers[i];
                        return (
                            <div key={i} className={`result ${correct ? "correct" : "wrong"}`}>
                                <p dangerouslySetInnerHTML={{ __html: q.question }} />
                                <p><strong>Deine Antwort:</strong> {answers[i]}</p>
                                {!correct && (
                                    <p><strong>Richtig:</strong> {q.correct_answer}</p>
                                )}
                            </div>
                        );
                    })}

                    <button className="btn-primary" onClick={restart}>
                        Neues Quiz
                    </button>
                </div>
            )}
        </div>
    );
}
