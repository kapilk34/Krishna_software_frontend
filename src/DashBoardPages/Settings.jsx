import { useEffect, useMemo, useState } from "react";
import {
  ArrowDownWideNarrow,
  FileText,
  FolderOpen,
  LoaderCircle,
  Search,
  Trash2,
} from "lucide-react";
import { deleteDocument, getDocuments, openDocumentFile } from "../utils/documentStore";

const formatFileSize = (size) => {
  if (!Number.isFinite(size) || size < 0) return "";
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
};

const formatDate = (date) => {
  const parsedDate = new Date(date);
  return Number.isNaN(parsedDate.getTime()) ? "" : parsedDate.toLocaleDateString();
};

const Settings = () => {
  const [documents, setDocuments] = useState([]);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [collectionFilter, setCollectionFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("newest");
  const [isLoading, setIsLoading] = useState(true);
  const [openingId, setOpeningId] = useState("");
  const [deletingId, setDeletingId] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const refreshDocuments = async () => {
      try {
        const savedDocuments = await getDocuments();
        if (active) {
          setDocuments(savedDocuments);
          setError("");
        }
      } catch (requestError) {
        if (active) {
          setError(requestError instanceof Error ? requestError.message : "Could not load your document store.");
        }
      } finally {
        if (active) setIsLoading(false);
      }
    };

    void refreshDocuments();
    window.addEventListener("kdms:documents-changed", refreshDocuments);
    window.addEventListener("storage", refreshDocuments);
    return () => {
      active = false;
      window.removeEventListener("kdms:documents-changed", refreshDocuments);
      window.removeEventListener("storage", refreshDocuments);
    };
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);

    return () => window.clearTimeout(timeoutId);
  }, [search]);

  const collections = useMemo(
    () => [...new Set(documents.map((document) => document.collection).filter(Boolean))].sort(),
    [documents],
  );

  const filteredDocuments = useMemo(() => {
    const query = debouncedSearch.trim().toLowerCase();
    return documents
      .filter((document) => {
        const detailText = document.details && typeof document.details === "object"
          ? Object.values(document.details).join(" ")
          : "";
        const matchesSearch = !query || [
          document.title,
          document.fileName,
          document.type,
          document.category,
          document.collection,
          document.description,
          detailText,
        ].some((value) => String(value || "").toLowerCase().includes(query));
        return matchesSearch && (collectionFilter === "all" || document.collection === collectionFilter);
      })
      .sort((first, second) => {
        if (sortOrder === "name") return first.title.localeCompare(second.title);
        const timeDifference = new Date(second.savedAt).getTime() - new Date(first.savedAt).getTime();
        return sortOrder === "oldest" ? -timeDifference : timeDifference;
      });
  }, [documents, debouncedSearch, collectionFilter, sortOrder]);

  const handleOpenFile = async (document) => {
    if (openingId || deletingId) return;
    setOpeningId(document.id);
    setError("");
    try {
      await openDocumentFile(document.id);
    } catch (openError) {
      setError(openError instanceof Error ? openError.message : "Could not open this file.");
    } finally {
      setOpeningId("");
    }
  };

  const handleDeleteFile = async (document) => {
    if (openingId || deletingId) return;
    const fileName = document.fileName || document.title;
    if (!window.confirm(`Permanently delete "${fileName}" from your document store?`)) return;

    setDeletingId(document.id);
    setError("");
    try {
      await deleteDocument(document.id);
      setDocuments((currentDocuments) => currentDocuments.filter((item) => item.id !== document.id));
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Could not delete this file.");
    } finally {
      setDeletingId("");
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <header className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="mb-1 text-sm font-medium text-[#1A468B]">Your library</p>
            <h1 className="text-2xl font-bold tracking-tight text-[#02154C] sm:text-3xl">Document Store</h1>
            <p className="mt-2 text-sm text-slate-500">
              Browse your uploaded files. Select any file to open it in a new tab.
            </p>
          </div>
          <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-[#1A468B]/10 text-[#1A468B]">
            <FolderOpen size={27} strokeWidth={1.7} />
          </div>
        </div>
      </header>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-[#02154C]">All files</h2>
            <p className="mt-1 text-sm text-slate-500">
              {documents.length} {documents.length === 1 ? "file" : "files"} in your store
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:w-[min(100%,650px)] lg:grid-cols-[minmax(220px,1fr)_200px_160px]">
            <label className="relative block sm:col-span-2 lg:col-span-1">
              <span className="sr-only">Search files</span>
              <Search size={17} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                aria-label="Search files"
                placeholder="Search files and details"
                className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#1A468B] focus:ring-2 focus:ring-[#1A468B]/15"
              />
            </label>
            <label className="relative">
              <span className="sr-only">Filter by collection</span>
              <FolderOpen size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <select
                value={collectionFilter}
                onChange={(event) => setCollectionFilter(event.target.value)}
                className="h-10 w-full appearance-none rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-700 outline-none focus:border-[#1A468B] focus:ring-2 focus:ring-[#1A468B]/15"
              >
                <option value="all">All collections</option>
                {collections.map((collection) => <option key={collection} value={collection}>{collection}</option>)}
              </select>
            </label>
            <label className="relative">
              <span className="sr-only">Sort files</span>
              <ArrowDownWideNarrow size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
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

        {error && (
          <div role="alert" className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}
        {search !== debouncedSearch && (
          <p role="status" className="mb-3 text-xs text-slate-400">Updating search results...</p>
        )}

        {isLoading ? (
          <div className="flex min-h-48 items-center justify-center gap-2 text-sm text-slate-500">
            <LoaderCircle size={18} className="animate-spin" />
            Loading your files...
          </div>
        ) : filteredDocuments.length ? (
          <div className="max-h-[60vh] overflow-auto rounded-xl border border-slate-200">
            <table className="w-full min-w-[640px] table-fixed border-collapse text-left">
              <thead className="sticky top-0 z-10 bg-slate-50 shadow-[0_1px_0_0_rgb(226_232_240)]">
                <tr>
                  <th scope="col" className="w-auto px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    File
                  </th>
                  <th scope="col" className="w-28 px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Size
                  </th>
                  <th scope="col" className="w-32 px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Date added
                  </th>
                  <th scope="col" className="w-20 px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {filteredDocuments.map((document) => (
                  <tr key={document.id} className="hover:bg-slate-50">
                    <td className="px-3 py-2">
                      <button
                        type="button"
                        onClick={() => handleOpenFile(document)}
                        disabled={Boolean(openingId || deletingId)}
                        className="group flex w-full min-w-0 items-center gap-3 rounded-xl px-1 py-2 text-left transition disabled:cursor-wait disabled:opacity-70"
                        aria-label={`Open ${document.fileName || document.title} in a new tab`}
                      >
                        <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#1A468B]">
                          {openingId === document.id
                            ? <LoaderCircle size={20} className="animate-spin" />
                            : <FileText size={20} strokeWidth={1.7} />}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-semibold text-slate-700 group-hover:text-[#1A468B]">
                            {document.title}
                          </span>
                          <span className="mt-1 block truncate text-xs text-slate-400">
                            {[document.collection, document.type, document.category, document.fileName]
                              .filter(Boolean)
                              .join(" · ")}
                          </span>
                        </span>
                        <span className="sr-only">Opens in a new tab</span>
                      </button>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right text-sm text-slate-500">
                      {formatFileSize(document.fileSize)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right text-sm text-slate-500">
                      <time dateTime={document.savedAt}>{formatDate(document.savedAt)}</time>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        type="button"
                        onClick={() => handleDeleteFile(document)}
                        disabled={Boolean(openingId || deletingId)}
                        className="inline-flex size-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-red-50 hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 disabled:cursor-wait disabled:opacity-50"
                        aria-label={`Delete ${document.fileName || document.title}`}
                        title="Delete file"
                      >
                        {deletingId === document.id
                          ? <LoaderCircle size={18} className="animate-spin" />
                          : <Trash2 size={18} strokeWidth={1.8} />}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex min-h-48 flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/60 px-5 py-8 text-center">
            <span className="mb-3 flex size-11 items-center justify-center rounded-xl bg-white text-slate-400 shadow-sm">
              <FileText size={21} strokeWidth={1.6} />
            </span>
            <p className="text-sm font-semibold text-slate-600">
              {documents.length ? "No files match your search" : "Your document store is empty"}
            </p>
            <p className="mt-1 max-w-sm text-xs leading-5 text-slate-400">
              {documents.length
                ? "Try a different search term or collection."
                : "Files you upload will appear here."}
            </p>
          </div>
        )}
      </section>
    </div>
  );
};

export default Settings;
