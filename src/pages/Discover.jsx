import { useMemo, useState } from "react";
import { SlidersHorizontal, Search, X } from "lucide-react";
import { useStore } from "../context/StoreContext";
import { useToast } from "../context/ToastContext";
import { PersonCard } from "../components/People";
import { HOUSING } from "../lib/options";
import { daysBetween, daysFromNow, shortRupees } from "../lib/format";

const BUDGETS = [8000, 10000, 12000, 15000, 20000];

export default function Discover() {
  const { me, people, relationTo, mode } = useStore();
  const toast = useToast();
  const [query, setQuery] = useState("");
  const [city, setCity] = useState(me.city || "all");
  const [housing, setHousing] = useState("any");
  const [budget, setBudget] = useState("any");
  const [moveWithin, setMoveWithin] = useState("any");
  const [sort, setSort] = useState("match");
  const [hideConnected, setHideConnected] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const cities = useMemo(() => {
    const set = new Set(people.map((p) => p.city).filter(Boolean));
    if (me.city) set.add(me.city);
    return [...set].sort();
  }, [people, me.city]);

  const allowed = people.filter((p) => p.allowed && p.visible !== false);
  const hiddenByPreference = people.length - allowed.length;

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const today = daysFromNow(0);
    return allowed
      .filter((p) => city === "all" || (p.city || "").toLowerCase() === city.toLowerCase())
      .filter((p) => housing === "any" || p.housing === housing)
      .filter((p) => budget === "any" || (p.rent_min ?? 0) <= Number(budget))
      .filter((p) => {
        if (moveWithin === "any") return true;
        const d = daysBetween(today, p.move_in);
        return d != null && d <= Number(moveWithin);
      })
      .filter((p) => !hideConnected || relationTo(p.id).state === "none")
      .filter((p) => {
        if (!q) return true;
        const hay = [p.full_name, p.occupation, p.area, p.city, ...(p.interests || []), ...(p.languages || [])].join(" ").toLowerCase();
        return hay.includes(q);
      })
      .sort((a, b) => {
        if (sort === "rent") return (a.rent_min ?? 1e9) - (b.rent_min ?? 1e9);
        if (sort === "soon") return String(a.move_in || "9999").localeCompare(String(b.move_in || "9999"));
        if (sort === "new") return String(b.created_at).localeCompare(String(a.created_at));
        return b.match.score - a.match.score;
      });
  }, [allowed, city, housing, budget, moveWithin, sort, query, hideConnected, relationTo]);

  const filtered = query || city !== "all" || housing !== "any" || budget !== "any" || moveWithin !== "any" || hideConnected;

  function clear() {
    setQuery("");
    setCity("all");
    setHousing("any");
    setBudget("any");
    setMoveWithin("any");
    setHideConnected(false);
  }

  async function share() {
    const url = window.location.origin;
    try {
      if (navigator.share) await navigator.share({ title: "RoomieFinder", text: "Looking for a flatmate? Join me on RoomieFinder.", url });
      else {
        await navigator.clipboard.writeText(url);
        toast("Link copied");
      }
    } catch {
      // Share sheet dismissed.
    }
  }

  return (
    <div className="page">
      <header className="page-head">
        <h1 className="h-page">Discover</h1>
        <p className="lede">
          Everyone looking for a flatmate, scored against your profile. Open anyone to see why you'd fit.
        </p>
      </header>

      <section className="filters" aria-label="Filters">
        <div className="filter-top">
          <label className="filter-search">
            <Search size={18} aria-hidden />
            <span className="sr-only">Search</span>
            <input
              className="input"
              type="search"
              placeholder="Name, area, job or interest"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </label>
          <button
            type="button"
            className="btn btn-ghost filter-toggle"
            aria-expanded={showFilters}
            aria-controls="filter-row"
            onClick={() => setShowFilters((v) => !v)}
          >
            <SlidersHorizontal size={16} aria-hidden /> Filters
          </button>
        </div>
        <div id="filter-row" className={`filter-row ${showFilters ? "is-open" : ""}`}>
          <label className="filter">
            <span>City</span>
            <select className="select" value={city} onChange={(e) => setCity(e.target.value)}>
              <option value="all">All cities</option>
              {cities.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>
          <label className="filter">
            <span>Situation</span>
            <select className="select" value={housing} onChange={(e) => setHousing(e.target.value)}>
              <option value="any">Any</option>
              {HOUSING.map((h) => (
                <option key={h.value} value={h.value}>
                  {h.short}
                </option>
              ))}
            </select>
          </label>
          <label className="filter">
            <span>Rent up to</span>
            <select className="select" value={budget} onChange={(e) => setBudget(e.target.value)}>
              <option value="any">Any</option>
              {BUDGETS.map((b) => (
                <option key={b} value={b}>
                  ₹{shortRupees(b)}
                </option>
              ))}
            </select>
          </label>
          <label className="filter">
            <span>Moving</span>
            <select className="select" value={moveWithin} onChange={(e) => setMoveWithin(e.target.value)}>
              <option value="any">Any time</option>
              <option value="30">Within a month</option>
              <option value="60">Within two months</option>
            </select>
          </label>
          <label className="filter">
            <span>Sort by</span>
            <select className="select" value={sort} onChange={(e) => setSort(e.target.value)}>
              <option value="match">Best match</option>
              <option value="soon">Moving soonest</option>
              <option value="rent">Lowest rent</option>
              <option value="new">Newest</option>
            </select>
          </label>
        </div>
        <div className="filter-foot">
          <label className="check">
            <input type="checkbox" checked={hideConnected} onChange={(e) => setHideConnected(e.target.checked)} />
            Hide people I've already contacted
          </label>
          <p className="muted num" aria-live="polite">
            {results.length} {results.length === 1 ? "person" : "people"}
            {filtered && (
              <>
                {" "}
                <button type="button" className="text-link" onClick={clear}>
                  <X size={13} aria-hidden /> Clear filters
                </button>
              </>
            )}
          </p>
        </div>
      </section>

      {results.length > 0 ? (
        <div className="cards">
          {results.map((p) => (
            <PersonCard key={p.id} person={p} />
          ))}
        </div>
      ) : people.length === 0 ? (
        <div className="empty">
          <h3>Nobody else has joined yet</h3>
          <p>
            {mode === "demo"
              ? "Reset the demo from Settings to bring the sample profiles back."
              : "RoomieFinder shows real people who've signed up. Share the link with friends who are looking for a place, and they'll appear here as soon as they finish their profile."}
          </p>
          {mode !== "demo" && (
            <button type="button" className="btn btn-primary btn-sm" onClick={share}>
              Share RoomieFinder
            </button>
          )}
        </div>
      ) : (
        <div className="empty">
          <h3>No one matches these filters</h3>
          <p>Try another city, a higher rent limit or a wider move-in window.</p>
          <button type="button" className="btn btn-ghost btn-sm" onClick={clear}>
            Clear filters
          </button>
        </div>
      )}

      {hiddenByPreference > 0 && (
        <p className="footnote">
          {hiddenByPreference} {hiddenByPreference === 1 ? "profile isn't" : "profiles aren't"} shown because of roommate gender
          preferences, theirs or yours.{!me.gender && " Adding your gender in your profile helps the right people find you."}
        </p>
      )}
    </div>
  );
}
