import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

type Note = {
    _id: string;
    title: string;
    content: string;
};

type Session = {
    _id: string;
    title: string;
    author: string,
    content: string;
    startedAt: string;
    status: string,
    totalTypedChars: number,
    totalPastedChars: number,
    pasteRatio: number;
};

const API = import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1";

type SessionHistoryResponse = {
    session: Session;
};

function VersionCard({ sessionId }: { sessionId: string }) {
    const { token } = useAuth();

    const [sessionData, setSessionData] = useState<Session | null>(null);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!token) return;

        (async () => {
            setError("");

            const res = await fetch(`${API}/sessions/${sessionId}/history`, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const json = (await res.json().catch(() => ({}))) as Partial<SessionHistoryResponse> & {
                error?: string;
                message?: string;
            };

            if (!res.ok) {
                setSessionData(null);
                setError(json?.error || json?.message || `Request failed (${res.status})`);
                return;
            }

            setSessionData(json.session ?? null);
        })();
    }, [sessionId, token]);

    return (
        <div className="version-card">
            {error ? <p style={{ color: "crimson" }}>{error}</p> : null}

            {sessionData ? (
                <>
                    <div className="title-div">
                        <h4>{sessionData.title}</h4>
                        <small>{new Date(sessionData.startedAt).toLocaleString()}</small>
                        {
                            sessionData.status === "active" ? <span style={{ color: "green", marginLeft: "0.5rem" }}>● Active</span> : <></>
                        }
                    </div>
                    <p>{sessionData.content}</p>
                    <small>
                        typed: {sessionData.totalTypedChars}, pasted: {sessionData.totalPastedChars}, ratio: {sessionData.pasteRatio}, timeSpent: {Math.round((new Date().getTime() - new Date(sessionData.startedAt).getTime()) / 1000)}s
                    </small>
                </>
            ) : null}
        </div>
    );
}

export function EditNotesPage() {
    const { token } = useAuth();
    const navigate = useNavigate();

    const notesId = useParams().id;
    // console.log("Editing note with id:", notesId);

    const [error, setError] = useState("");
    const [sessionId, setSessionId] = useState<string>("");
    const [versionHistory, setVersionHistory] = useState<string[]>([]);

    // create note UI
    const [title, setTitle] = useState("");

    const [content, setContent] = useState<string>("");

    // paste + typing metrics (no characters stored)
    const [totalTypedChars, setTotalTypedChars] = useState<number>(0);
    const [totalPastedChars, setTotalPastedChars] = useState<number>(0);

    useEffect(() => {
        if (!token) return;


        (async () => {
            setError("");

            const res = await fetch(`${API}/notes/${notesId}/edit`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });

            const json = await res.json().catch(() => ({}));

            if (!res.ok) {
                setError(json?.error || json?.message || `Request failed (${res.status})`);
                return;
            }
            setTitle(json?.note?.title || "");
            setContent(json?.note?.content || "");
            setSessionId(json?.session.id || "");
            // console.log("Session ID:", json?.session.id);

            const historyRes = await fetch(`${API}/notes/${notesId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const historyJson = await historyRes.json().catch(() => ({}));
            // console.log("Version history response:", historyJson);

            if (!historyRes.ok) {
                console.error("Failed to fetch version history:", historyJson?.error || historyJson?.message || `Request failed (${historyRes.status})`);
                return;
            }

            setVersionHistory(historyJson?.note?.sessions || []);
            // console.log("Version history sessions:", historyJson?.note?.sessions);
        })();

    }, []);


    const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError("");

        (async () => {
            const res = await fetch(`${API}/sessions/${sessionId}/end`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    title,
                    content,
                    totalTypedChars,
                    totalPastedChars,
                    pasteRatio: totalTypedChars > 0 ? totalPastedChars / totalTypedChars : 0,
                }),
            });
            navigate("/notes", { replace: true });
        })();

    };

    return (
        <>
            <div className="edit-notes-page">

                <section className="edit-notes-section">
                    <h2>Edit Notes Page</h2>

                    {error ? <p style={{ color: "crimson" }}>{error}</p> : null}

                    <form onSubmit={handleSubmit}>
                        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="New note title" />
                        <textarea
                            value={content}
                            onChange={(e) => {
                                setContent(e.target.value);
                                setTotalTypedChars((prev) => prev + 1);
                            }}
                            onPaste={(e)=>{
                                const pastedText = e.clipboardData.getData("text");
                                setTotalPastedChars((prev) => prev + pastedText.length);
                            }}
                            placeholder="Note content" rows={10} />
                        <button style={{ marginTop: "1rem" }} type="submit" >Save Note</button>
                    </form>
                </section>
                <section className="version-section">
                    <h3>Version History</h3>
                    {versionHistory.length > 0 ? (
                        versionHistory.map((sessionId) => (
                            <VersionCard key={sessionId} sessionId={sessionId} />
                        ))
                    ) : (
                        <p>No version history available.</p>
                    )}
                </section>
            </div>
        </>
    );
}