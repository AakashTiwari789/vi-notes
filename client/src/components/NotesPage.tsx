import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";

const API = import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1";

type Note = {
    _id: string;
    title: string;
    content: string;
};

function NotesCard({ note }: { note: Note }) {
    return (
        <div className="notes-card">
            <div><strong>{note.title}</strong></div>
            <div>{note.content}</div>
        </div>
    );
};

export function NotesPage() {
    const { token } = useAuth();

    const [notes, setNotes] = useState<Note[]>([]);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!token) return;

        (async () => {
            setError("");

            const res = await fetch(`${API}/notes`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const json = await res.json().catch(() => ({}));

            if (!res.ok) {
                setNotes([]);
                setError(json?.error || json?.message || `Request failed (${res.status})`);
                return;
            }

            setNotes(Array.isArray(json?.notes) ? json.notes : []);
        })();
    }, [token]);

    return (
        <section className="notes-page">
            <h2>Notes Page</h2>

            {error ? <p style={{ color: "crimson" }}>{error}</p> : null}

            {notes.length > 0 ? (
                <ul>
                    {notes.map((note) => (
                        <NotesCard key={note._id} note={note} />
                    ))}
                </ul>
            ) : (
                <p>No notes found.</p>
            )}
        </section>
    );
}