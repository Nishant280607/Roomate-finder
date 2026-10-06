import { Fragment, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, RotateCcw, SendHorizontal, Trash2 } from "lucide-react";
import { useStore } from "../context/StoreContext";
import { Avatar } from "../components/Bits";
import { ConnectActions } from "../components/People";
import { clockTime, dayLabel, firstName, relativeTime } from "../lib/format";

function starters(me, them, match) {
  const out = [];
  if (them.housing === "has_room") out.push("Hi! Is your room still available?");
  if (them.housing === "need_room" && me.housing === "has_room") out.push("Hi! I have a room that might suit you. Want to know more?");
  if (them.housing === "team_up" || (me.housing === "need_room" && them.housing === "need_room")) out.push("Want to look for a place together?");
  if (match?.sharedInterests?.[0]) out.push(`I saw you're into ${match.sharedInterests[0].toLowerCase()} too!`);
  out.push("When are you hoping to move?");
  return out.slice(0, 3);
}

function ThreadList({ activeId }) {
  const { threads, memberById, me, online, connections } = useStore();

  // Connected people you haven't talked to yet go below the conversations.
  const talkedTo = new Set(threads.map((t) => t.otherId));
  const quiet = connections
    .filter((c) => c.status === "accepted")
    .map((c) => (c.requester_id === me.id ? c.addressee_id : c.requester_id))
    .filter((id) => !talkedTo.has(id))
    .map((id) => memberById.get(id))
    .filter(Boolean);

  return (
    <aside className="threads" aria-label="Conversations">
      <h1 className="h-page threads-title">Messages</h1>
      {threads.length === 0 && quiet.length === 0 ? (
        <div className="empty">
          <h3>No conversations yet</h3>
          <p>You can message people once you're connected. Send a request from Discover to get started.</p>
          <Link to="/discover" className="btn btn-ghost btn-sm">
            Open Discover
          </Link>
        </div>
      ) : (
        <nav className="thread-list">
          {threads.map((t) => {
            const p = memberById.get(t.otherId);
            if (!p) return null;
            return (
              <Link
                key={t.otherId}
                to={`/messages/${t.otherId}`}
                className={`thread-row ${t.unread ? "is-unread" : ""} ${activeId === t.otherId ? "is-active" : ""}`}
                aria-current={activeId === t.otherId ? "page" : undefined}
              >
                <Avatar person={p} size={44} online={online.has(p.id) && p.show_online !== false} />
                <span className="thread-main">
                  <span className="thread-name">{p.full_name}</span>
                  <span className="thread-last">
                    {t.last.sender_id === me.id ? "You: " : ""}
                    {t.last.body}
                  </span>
                </span>
                <span className="thread-meta">
                  <span className="thread-time">{relativeTime(t.last.created_at)}</span>
                  {t.unread > 0 && <span className="badge">{t.unread}</span>}
                </span>
              </Link>
            );
          })}
          {quiet.length > 0 && (
            <>
              <p className="thread-group">Connected, not talked yet</p>
              {quiet.map((p) => (
                <Link
                  key={p.id}
                  to={`/messages/${p.id}`}
                  className={`thread-row ${activeId === p.id ? "is-active" : ""}`}
                  aria-current={activeId === p.id ? "page" : undefined}
                >
                  <Avatar person={p} size={44} online={online.has(p.id) && p.show_online !== false} />
                  <span className="thread-main">
                    <span className="thread-name">{p.full_name}</span>
                    <span className="thread-last">Say hello</span>
                  </span>
                </Link>
              ))}
            </>
          )}
        </nav>
      )}
    </aside>
  );
}

function Conversation({ otherId }) {
  const { me, people, memberById, messages, relationTo, sendMessage, discardMessage, markThreadRead, typing, online, sendTyping } = useStore();
  const person = people.find((p) => p.id === otherId) || memberById.get(otherId);
  const rel = relationTo(otherId);
  const [text, setText] = useState("");
  const scroller = useRef(null);
  const input = useRef(null);
  const lastTyping = useRef(0);

  const thread = useMemo(
    () => messages.filter((m) => (m.sender_id === me.id && m.recipient_id === otherId) || (m.sender_id === otherId && m.recipient_id === me.id)),
    [messages, me.id, otherId],
  );

  const unreadCount = thread.filter((m) => m.sender_id === otherId && !m.read_at).length;
  useEffect(() => {
    if (unreadCount) markThreadRead(otherId);
  }, [unreadCount, otherId, markThreadRead]);

  const isTyping = Boolean(typing[otherId]);
  useLayoutEffect(() => {
    const el = scroller.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [thread.length, isTyping, otherId]);

  if (!person) {
    return (
      <section className="convo convo-empty">
        <div className="empty">
          <h3>This conversation isn't available</h3>
          <p>The other person may have deleted their account.</p>
        </div>
      </section>
    );
  }

  const name = firstName(person.full_name);
  const canSend = rel.state === "connected";
  const lastMine = [...thread].reverse().find((m) => m.sender_id === me.id && !m.pending && !m.failed);

  function submit(e) {
    e?.preventDefault();
    if (!text.trim() || !canSend) return;
    sendMessage(otherId, text);
    setText("");
    input.current?.focus();
  }

  return (
    <section className="convo" aria-label={`Conversation with ${person.full_name}`}>
      <header className="convo-head">
        <Link to="/messages" className="icon-btn convo-back" aria-label="All conversations">
          <ArrowLeft size={18} aria-hidden />
        </Link>
        <Avatar person={person} size={40} online={online.has(person.id) && person.show_online !== false} />
        <div className="convo-who">
          <Link to={`/people/${person.id}`} className="convo-name">
            {person.full_name}
          </Link>
          <span className="convo-status">
            {isTyping ? "Typing…" : online.has(person.id) && person.show_online !== false ? "Online now" : person.occupation || " "}
          </span>
        </div>
        {person.match && (
          <Link to={`/people/${person.id}`} className="convo-score num" title="See why you'd fit">
            {person.match.score}% match
          </Link>
        )}
      </header>

      <div className="convo-body" ref={scroller}>
        {thread.length === 0 && canSend && (
          <div className="convo-start">
            <Avatar person={person} size={64} />
            <p>
              You and {name} are connected. Break the ice:
            </p>
            <div className="chips">
              {starters(me, person, person.match).map((s) => (
                <button key={s} type="button" className="chip" onClick={() => { setText(s); input.current?.focus(); }}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {thread.map((m, i) => {
          const mine = m.sender_id === me.id;
          const prev = thread[i - 1];
          const newDay = !prev || new Date(prev.created_at).toDateString() !== new Date(m.created_at).toDateString();
          return (
            <Fragment key={m.id}>
              {newDay && (
                <p className="day">
                  <span>{dayLabel(m.created_at)}</span>
                </p>
              )}
              <div className={`bubble-row ${mine ? "mine" : "theirs"}`}>
                <div className={`bubble ${m.failed ? "is-failed" : ""} ${m.pending ? "is-pending" : ""}`}>
                  <p>{m.body}</p>
                  <time dateTime={m.created_at}>{clockTime(m.created_at)}</time>
                </div>
                {m.failed && (
                  <div className="bubble-fail">
                    Not sent.
                    <button type="button" className="text-link" onClick={() => { discardMessage(m.id); sendMessage(otherId, m.body); }}>
                      <RotateCcw size={13} aria-hidden /> Retry
                    </button>
                    <button type="button" className="text-link" onClick={() => discardMessage(m.id)}>
                      <Trash2 size={13} aria-hidden /> Delete
                    </button>
                  </div>
                )}
                {lastMine?.id === m.id && m.read_at && <span className="seen">Seen</span>}
              </div>
            </Fragment>
          );
        })}

        {isTyping && (
          <div className="bubble-row theirs">
            <div className="bubble typing" aria-label={`${name} is typing`}>
              <span />
              <span />
              <span />
            </div>
          </div>
        )}
      </div>

      {canSend ? (
        <form className="composer" onSubmit={submit}>
          <label className="sr-only" htmlFor="composer">
            Message {name}
          </label>
          <textarea
            id="composer"
            ref={input}
            className="textarea composer-input"
            rows={1}
            maxLength={2000}
            placeholder={`Message ${name}`}
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              const now = Date.now();
              if (now - lastTyping.current > 2500) {
                lastTyping.current = now;
                sendTyping(otherId);
              }
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
                e.preventDefault();
                submit();
              }
            }}
          />
          <button type="submit" className="btn btn-primary composer-send" disabled={!text.trim()} aria-label="Send">
            <SendHorizontal size={18} aria-hidden />
          </button>
        </form>
      ) : (
        <div className="composer composer-locked">
          <p>
            {rel.state === "incoming"
              ? `${name} wants to connect. Accept to start messaging.`
              : rel.state === "outgoing"
                ? `You can message ${name} once they accept your request.`
                : `You're not connected with ${name} anymore.`}
          </p>
          <ConnectActions person={person} size="sm" />
        </div>
      )}
    </section>
  );
}

export default function Messages() {
  const { id } = useParams();
  return (
    <div className={`messages ${id ? "has-thread" : ""}`}>
      <ThreadList activeId={id} />
      {id ? (
        <Conversation key={id} otherId={id} />
      ) : (
        <section className="convo convo-empty" aria-hidden>
          <p className="muted">Choose a conversation.</p>
        </section>
      )}
    </div>
  );
}
