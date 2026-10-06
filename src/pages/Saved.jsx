import { Link } from "react-router-dom";
import { useStore } from "../context/StoreContext";
import { PersonCard } from "../components/People";

export default function Saved() {
  const { saved, people } = useStore();
  const byId = new Map(people.map((p) => [p.id, p]));
  const list = saved.map((id) => byId.get(id)).filter(Boolean);

  return (
    <div className="page">
      <header className="page-head">
        <h1 className="h-page">Saved</h1>
        <p className="lede">People you want to come back to. Only you can see this list.</p>
      </header>
      {list.length ? (
        <div className="cards">
          {list.map((p) => (
            <PersonCard key={p.id} person={p} />
          ))}
        </div>
      ) : (
        <div className="empty">
          <h3>Nothing saved yet</h3>
          <p>Press the bookmark on anyone in Discover to keep them here while you decide.</p>
          <Link to="/discover" className="btn btn-ghost btn-sm">
            Open Discover
          </Link>
        </div>
      )}
    </div>
  );
}
