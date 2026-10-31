import { useEffect, useMemo, useState } from "react";
import {
  ArrowUpDown,
  FileImage,
  FileText,
  FolderOpen,
  Search,
  Share2,
  ShieldCheck,
  SlidersHorizontal,
} from "lucide-react";
import { getDocuments } from "../utils/documentStore";

const stats = [
  { label: "Documents Uploaded", value: "0", icon: FileText, color: "blue" },
  { label: "Shared With Others", value: "0", icon: Share2, color: "emerald" },
  { label: "Pending Reviews", value: "0", icon: ShieldCheck, color: "amber" },
];

const statColors = {
  blue: "bg-blue-50 text-blue-700",
  emerald: "bg-emerald-50 text-emerald-700",
  amber: "bg-amber-50 text-amber-700",
};

const getUserName = () => {
  try {
    const storedUser = JSON.parse(localStorage.getItem("user") || "null");
    if (typeof storedUser?.name === "string" && storedUser.name.trim()) {
      return storedUser.name.trim();
    }

    const tokenPayload = localStorage.getItem("token")?.split(".")[1];
    if (!tokenPayload) return "there";

    const base64 = tokenPayload.replace(/-/g, "+").replace(/_/g, "/");
    const paddedBase64 = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
    const bytes = Uint8Array.from(atob(paddedBase64), (character) => character.charCodeAt(0));
    const payload = JSON.parse(new TextDecoder().decode(bytes));
    return typeof payload.name === "string" && payload.name.trim() ? payload.name.trim() : "there";
  } catch {
    return "there";
  }
};

const Home = () => {
  const userName = getUserName();
  const [documents, setDocuments] = useState([]);
  const [documentsError, setDocumentsError] = useState("");
  const [search, setSearch] = useState("");
  const [collectionFilter, setCollectionFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("newest");

  useEffect(() => {
    let active = true;
    const refreshDocuments = async () => {
      try {
        const savedDocuments = await getDocuments();
        if (active) {
          setDocuments(savedDocuments);
          setDocumentsError("");
        }
      } catch (error) {
        if (active) {
          setDocumentsError(error instanceof Error ? error.message : "Could not load saved documents.");
        }
      }
    };

    void refreshDocuments();
    window.addEventListener("storage", refreshDocuments);
    window.addEventListener("kdms:documents-changed", refreshDocuments);
    return () => {
      active = false;
      window.removeEventListener("storage", refreshDocuments);
      window.removeEventListener("kdms:documents-changed", refreshDocuments);
    };
  }, []);

  const filteredDocuments = useMemo(() => {
    const query = search.trim().toLowerCase();
    return documents
      .filter((document) => {
        const matchesSearch = !query || [
          document.title,
          document.fileName,
          document.type,
          document.category,
          document.collection,
        ].some((value) => String(value || "").toLowerCase().includes(query));
        const matchesCollection = collectionFilter === "all" || document.collection === collectionFilter;
        return matchesSearch && matchesCollection;
      })
      .sort((first, second) => {
        if (sortOrder === "name") return first.title.localeCompare(second.title);
        const timeDifference = new Date(second.savedAt).getTime() - new Date(first.savedAt).getTime();
        return sortOrder === "oldest" ? -timeDifference : timeDifference;
      });
  }, [documents, search, collectionFilter, sortOrder]);

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <header className="relative overflow-hidden rounded-2xl border border-[#1A468B]/10 bg-gradient-to-r from-white via-white to-blue-50 p-6 shadow-sm sm:p-8">
        <div className="absolute -right-10 -top-16 size-64 rounded-full bg-[#1A468B]/5" />
        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="max-w-2xl">
            <p className="mb-2 text-sm font-semibold text-[#1A468B]">DOCUMENT LIBRARY</p>
            <h1 className="text-2xl font-bold tracking-tight text-[#02154C] sm:text-3xl">
              <span className="text-xl sm:text-2xl text-[#5c5c5d]">
                Welcome {userName},
              </span>
              <br />
              to Krishna Digimatrix Solutions!
            </h1>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Your central workspace for organizing, sharing, and managing documents.
            </p>
          </div>
          <div className="hidden size-32 shrink-0 items-center justify-center rounded-full bg-white/80 text-[#1A468B] sm:flex">
            <FolderOpen size={58} strokeWidth={1.2} />
          </div>
        </div>
      </header>

      <section aria-label="Document statistics" className="grid gap-4 sm:grid-cols-3">
        {stats.map(({ label, value, icon: Icon, color }) => {
          const currentValue = label === "Documents Uploaded"
            ? documents.length
            : label === "Shared With Others"
              ? documents.filter((document) => document.accessEmails?.length > 0).length
              : value;

          return (
            <article
              key={label}
              className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-5 py-5 shadow-sm"
            >
              <div>
                <p className="text-sm font-medium text-slate-500">{label}</p>
                <p className="mt-2 text-3xl font-bold tracking-tight text-[#02154C]">{currentValue}</p>
              </div>
              <div className={`flex size-12 items-center justify-center rounded-xl ${statColors[color]}`}>
                <Icon size={22} strokeWidth={1.8} />
              </div>
            </article>
          );
        })}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-[#02154C]">Recent files</h2>
            <p className="mt-1 text-sm text-slate-500">Search and filter your uploaded documents.</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:w-[min(100%,720px)] lg:grid-cols-[minmax(220px,1fr)_190px_160px]">
            <label className="relative block sm:col-span-2 lg:col-span-1">
              <span className="sr-only">Search documents</span>
              <Search size={17} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by name, type, or category"
                className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#1A468B] focus:ring-2 focus:ring-[#1A468B]/15"
              />
            </label>
            <label className="relative">
              <span className="sr-only">Filter by collection</span>
              <SlidersHorizontal size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <select
                value={collectionFilter}
                onChange={(event) => setCollectionFilter(event.target.value)}
                className="h-10 w-full appearance-none rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-700 outline-none focus:border-[#1A468B] focus:ring-2 focus:ring-[#1A468B]/15"
              >
                <option value="all">All collections</option>
                <option value="Documents">Documents</option>
                <option value="Books & Journals">Books & Journals</option>
                <option value="PDF & Office Files">PDF & Office Files</option>
                <option value="Images & Photographs">Images & Photographs</option>
                <option value="Audio & Video">Audio & Video</option>
                <option value="Archives & Manuscripts">Archives & Manuscripts</option>
                <option value="Scanned Documents">Scanned Documents</option>
              </select>
            </label>
            <label className="relative">
              <span className="sr-only">Sort documents</span>
              <ArrowUpDown size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <select
                value={sortOrder}
                onChange={(event) => setSortOrder(event.target.value)}
                className="h-10 w-full appearance-none rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-700 outline-none focus:border-[#1A468B] focus:ring-2 focus:ring-[#1A468B]/15"
              >
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
                <option value="name">Name A–Z</option>
              </select>
            </label>
          </div>
        </div>

        {documentsError ? (
          <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {documentsError}
          </p>
        ) : filteredDocuments.length ? (
          <ul className="divide-y divide-slate-100">
            {filteredDocuments.slice(0, 8).map((document) => (
              <li key={document.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#1A468B]">
                  <FileText size={19} strokeWidth={1.7} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-slate-700">{document.title}</span>
                  <span className="mt-1 block truncate text-xs text-slate-400">
                    {[document.collection, document.type, document.category, document.fileName].filter(Boolean).join(" · ")}
                  </span>
                </span>
                <time className="hidden shrink-0 text-xs text-slate-400 sm:block" dateTime={document.savedAt}>
                  {new Date(document.savedAt).toLocaleDateString()}
                </time>
              </li>
            ))}
          </ul>
        ) : (
          <div className="flex min-h-44 flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/60 px-5 py-8 text-center">
            <span className="mb-3 flex size-11 items-center justify-center rounded-xl bg-white text-slate-400 shadow-sm">
              <FileImage size={21} strokeWidth={1.6} />
            </span>
            <p className="text-sm font-semibold text-slate-600">
              {documents.length ? "No files match your search" : "No files uploaded yet"}
            </p>
            <p className="mt-1 max-w-sm text-xs leading-5 text-slate-400">
              {documents.length
                ? "Try another search term or collection filter."
                : "Upload a document to start building your library."}
            </p>
          </div>
        )}
      </section>
    </div>
  );
};

export default Home;
