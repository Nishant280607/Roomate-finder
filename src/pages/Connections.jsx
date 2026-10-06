import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useStore } from "../context/StoreContext";
import { MatchPlate } from "../components/Bits";
import { ConnectActions, PersonRow } from "../components/People";
import { whenLabel } from "../lib/format";

const TABS = [
  { key: "connected", label: "Connected" },
  { key: "requests", label: "Requests" },
  { key: "sent", label: "Sent" },
];

const EMPTY = {
  connected: ["No connections yet", "When someone accepts your request, or you accept theirs, they'll show up here and you can message them."],
  requests: ["No requests right now", "When someone asks to connect, you'll see their note here and can accept or decline."],
  sent: ["You haven't sent any requests", "Find someone who fits in Discover and press Connect."],
};

export default function Connections() {
  const { me, connections, people, memberById } = useStore();
  const [params, setParams] = useSearchParams();
  const [tab, setTab] = useState(() => (TABS.some((t) => t.key === params.get("tab")) ? params.get("tab") : null));

  const lists = {
    connected: connections.filter((c) => c.status === "accepted"),
    requests: connections.filter((c) => c.status === "pending" && c.addressee_id === me.id),
    sent: connections.filter((c) => c.status === "pending" && c.requester_id === me.id),
  };
  const active = tab || (lists.requests.length ? "requests" : "connected");
  const scored = new Map(people.map((p) => [p.id, p]));

  function pick(key) {
    setTab(key);
    setParams(key === "connected" ? {} : { tab: key }, { replace: true });
  }

  const rows = lists[active];

  return (
    <div className="page page-narrow">
      <header className="page-head">
        <h1 className="h-page">Connections</h1>
        <p className="lede">Messaging opens once both of you have said yes.</p>
      </header>

      <div className="tabs" role="tablist" aria-label="Connections">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            role="tab"
            className="tab"
            aria-selected={active === t.key}
            onClick={() => pick(t.key)}
          >
            {t.label}
            <span className={t.key === "requests" && lists.requests.length ? "badge" : "tab-count num"}>{lists[t.key].length}</span>
          </button>
        ))}
      </div>

      <div role="tabpanel" className="tabpanel">
        {rows.length === 0 ? (
          <div className="empty">
            <h3>{EMPTY[active][0]}</h3>
            <p>{EMPTY[active][1]}</p>
            {active !== "requests" && (
              <Link to="/discover" className="btn btn-ghost btn-sm">
                Open Discover
              </Link>
            )}
          </div>
        ) : (
          <div className="panel list">
            {rows.map((c) => {
              const otherId = c.requester_id === me.id ? c.addressee_id : c.requester_id;
              const p = scored.get(otherId) || memberById.get(otherId);
              if (!p) return null;
              const when = active === "connected" ? `Connected ${whenLabel(c.updated_at)}` : `Sent ${whenLabel(c.created_at)}`;
              return (
                <div key={c.id} className="conn">
                  <PersonRow person={p} meta={when}>
                    {p.match && <MatchPlate score={p.match.score} size="xs" />}
                    <ConnectActions person={p} size="sm" />
                  </PersonRow>
                  {c.note && active !== "connected" && <p className="conn-note">“{c.note}”</p>}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
