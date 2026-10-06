import { Link } from "react-router-dom";
import { useStore } from "../context/StoreContext";
import { Avatar } from "../components/Bits";
import { ConnectActions, PersonCard, PersonRow } from "../components/People";
import { firstName, greeting, messagePreview, relativeTime } from "../lib/format";
import { profileGaps } from "../lib/match";

function summary({ requests, unreadMessages }) {
  const bits = [];
  if (requests) bits.push(`${requests} ${requests === 1 ? "person wants" : "people want"} to connect`);
  if (unreadMessages) bits.push(`${unreadMessages} unread ${unreadMessages === 1 ? "message" : "messages"}`);
  if (!bits.length) return "Nothing waiting on you. Here's who fits best right now.";
  return `You have ${bits.join(" and ")}.`;
}

export default function Home() {
  const { me, people, connections, counts, threads, memberById, relationTo, online } = useStore();
  const gaps = profileGaps(me);
  const incoming = connections.filter((c) => c.status === "pending" && c.addressee_id === me.id);

  const fresh = people
    .filter((p) => p.allowed && p.visible !== false && relationTo(p.id).state === "none")
    .sort((a, b) => b.match.score - a.match.score);
  const inCity = me.city ? fresh.filter((p) => (p.city || "").toLowerCase() === me.city.toLowerCase()) : [];
  const best = (inCity.length ? inCity : fresh).slice(0, 4);
  const bestTitle = inCity.length ? `Best fits for you in ${me.city}` : "More people who fit";

  return (
    <div className="page">
      <header className="page-head">
        <h1 className="h-page">
          {greeting()}, {firstName(me.full_name)}
        </h1>
        <p className="lede">{summary(counts)}</p>
      </header>

      {gaps.percent < 85 && (
        <section className="panel panel-pad finish">
          <div className="finish-meter" aria-hidden>
            <span style={{ width: `${gaps.percent}%` }} />
          </div>
          <div className="finish-copy">
            <h2 className="h-section">Your profile is {gaps.percent}% complete</h2>
            <p className="muted">Fuller profiles get better matches and more replies. Still missing:</p>
            <div className="chips">
              {gaps.missing.slice(0, 4).map((m) => (
                <span key={m} className="chip">
                  {m}
                </span>
              ))}
            </div>
          </div>
          <Link to="/profile" className="btn btn-primary">
            Finish profile
          </Link>
        </section>
      )}

      {incoming.length > 0 && (
        <section className="section" aria-labelledby="req-title">
          <div className="section-head">
            <h2 id="req-title" className="h-section">
              Waiting for your answer
            </h2>
            <Link to="/connections" className="text-link">
              All requests
            </Link>
          </div>
          <div className="panel list">
            {incoming.slice(0, 3).map((c) => {
              const p = people.find((x) => x.id === c.requester_id) || memberById.get(c.requester_id);
              if (!p) return null;
              return (
                <PersonRow key={c.id} person={p} meta={c.note ? `“${c.note}”` : undefined}>
                  <ConnectActions person={p} size="sm" />
                </PersonRow>
              );
            })}
          </div>
        </section>
      )}

      <section className="section" aria-labelledby="best-title">
        <div className="section-head">
          <h2 id="best-title" className="h-section">
            {bestTitle}
          </h2>
          <Link to="/discover" className="text-link">
            See everyone
          </Link>
        </div>
        {best.length ? (
          <div className="cards">
            {best.map((p) => (
              <PersonCard key={p.id} person={p} />
            ))}
          </div>
        ) : (
          <div className="empty">
            <h3>No new people to suggest yet</h3>
            <p>As more people join, the best fits for your budget and habits will show up here. You can also browse everyone in Discover.</p>
            <Link to="/discover" className="btn btn-ghost btn-sm">
              Open Discover
            </Link>
          </div>
        )}
      </section>

      {threads.length > 0 && (
        <section className="section" aria-labelledby="msg-title">
          <div className="section-head">
            <h2 id="msg-title" className="h-section">
              Recent conversations
            </h2>
            <Link to="/messages" className="text-link">
              All messages
            </Link>
          </div>
          <div className="panel list">
            {threads.slice(0, 3).map((t) => {
              const p = memberById.get(t.otherId);
              if (!p) return null;
              return (
                <Link key={t.otherId} to={`/messages/${t.otherId}`} className={`thread-row ${t.unread ? "is-unread" : ""}`}>
                  <Avatar person={p} size={40} online={online.has(p.id) && p.show_online !== false} />
                  <span className="thread-main">
                    <span className="thread-name">{p.full_name}</span>
                    <span className="thread-last">{messagePreview(t.last, me.id)}</span>
                  </span>
                  <span className="thread-meta">
                    <span className="thread-time">{relativeTime(t.last.created_at)}</span>
                    {t.unread > 0 && <span className="badge">{t.unread}</span>}
                  </span>
                </Link>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
