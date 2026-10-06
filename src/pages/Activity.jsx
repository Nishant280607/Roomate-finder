import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { DoorOpen } from "lucide-react";
import { useStore } from "../context/StoreContext";
import { Avatar } from "../components/Bits";
import { ConnectActions } from "../components/People";
import { firstName, relativeTime } from "../lib/format";

export default function Activity() {
  const { activity, memberById, markActivityRead, relationTo, me } = useStore();
  // Remember what was unread when the page opened so it stays highlighted.
  const [fresh] = useState(() => new Set(activity.filter((a) => !a.read_at).map((a) => a.id)));

  useEffect(() => {
    const t = setTimeout(markActivityRead, 800);
    return () => clearTimeout(t);
  }, [markActivityRead]);

  return (
    <div className="page page-narrow">
      <header className="page-head">
        <h1 className="h-page">Activity</h1>
        <p className="lede">Requests and replies from the people you've been talking to.</p>
      </header>

      {activity.length === 0 ? (
        <div className="empty">
          <h3>Nothing yet</h3>
          <p>When someone sends you a request or accepts yours, it'll show up here.</p>
        </div>
      ) : (
        <ol className="panel list feed">
          {activity.map((a) => {
            const actor = a.actor_id ? memberById.get(a.actor_id) : null;
            const isNew = fresh.has(a.id);
            if (a.kind === "welcome") {
              return (
                <li key={a.id} className={`feed-item ${isNew ? "is-new" : ""}`}>
                  <span className="feed-icon" aria-hidden>
                    <DoorOpen size={20} />
                  </span>
                  <div className="feed-main">
                    <p>
                      Welcome to RoomieFinder, {firstName(me.full_name)}. Fill in your profile to get better matches.
                    </p>
                    <span className="feed-time">{relativeTime(a.created_at)}</span>
                  </div>
                  <Link to="/profile" className="btn btn-ghost btn-sm">
                    Edit profile
                  </Link>
                </li>
              );
            }
            if (!actor) return null;
            const rel = relationTo(actor.id);
            return (
              <li key={a.id} className={`feed-item ${isNew ? "is-new" : ""}`}>
                <Avatar person={actor} size={40} />
                <div className="feed-main">
                  <p>
                    <Link to={`/people/${actor.id}`}>{actor.full_name}</Link>
                    {a.kind === "request" ? " wants to connect with you." : " accepted your request. You can message each other now."}
                  </p>
                  <span className="feed-time">{relativeTime(a.created_at)}</span>
                </div>
                {(rel.state === "incoming" || rel.state === "connected") && <ConnectActions person={actor} size="sm" />}
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
