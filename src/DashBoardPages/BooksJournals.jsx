import { useRef, useState } from "react";
import { saveDocument } from "../utils/documentStore";

const PUBLICATION_TYPES = ["Book", "Journal", "Magazine", "Newspaper", "Thesis", "Other"];
const PUBLICATION_CATEGORIES = [
  "General",
  "Academic",
  "Arts & Humanities",
  "Business",
  "Science & Technology",
  "History",
  "Literature",
  "Other",
];
const EMAIL_PATTERN = /^[\w.+-]+@[\w-]+\.[a-z]{2,}$/i;
const splitEmails = (value) => value.split(/[,;\s]+/).map((email) => email.trim()).filter(Boolean);

const BooksJournals = () => {
  const [form, setForm] = useState({
    title: "",
    authors: "",
    publisher: "",
    publicationType: "",
    category: "",
    isbnIssn: "",
    publicationYear: "",
    description: "",
    permission: "view",
  });
  const [accessEmails, setAccessEmails] = useState([]);
  const [emailDraft, setEmailDraft] = useState("");
  const [file, setFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  const validate = () => {
    const nextErrors = {};
    if (!form.title.trim()) nextErrors.title = "Book or journal title is required.";
    if (!form.publicationType) nextErrors.publicationType = "Select a publication type.";
    if (!form.category) nextErrors.category = "Select a publication category.";
    if (form.publicationYear && !/^\d{4}$/.test(form.publicationYear)) {
      nextErrors.publicationYear = "Enter a valid four-digit publication year.";
    }

    const emails = [...accessEmails, ...splitEmails(emailDraft)];
    if (!emails.length) nextErrors.accessEmail = "At least one email is required.";
    else if (emails.some((email) => !EMAIL_PATTERN.test(email))) {
      nextErrors.accessEmail = "Enter valid email addresses, separated by commas or semicolons.";
    }
    if (!file) nextErrors.file = "Please select a file to upload.";
    return nextErrors;
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
    setErrors((previous) => ({ ...previous, [name]: undefined }));
  };

  const handleAddEmails = () => {
    const emails = splitEmails(emailDraft);
    if (!emails.length) return;

    const validEmails = emails.filter((email) => EMAIL_PATTERN.test(email));
    const invalidEmails = emails.filter((email) => !EMAIL_PATTERN.test(email));
    setAccessEmails((previous) => [
      ...previous,
      ...validEmails.filter(
        (email) => !previous.some((existing) => existing.toLowerCase() === email.toLowerCase()),
      ),
    ]);
    setEmailDraft(invalidEmails.join(", "));
    setErrors((previous) => ({
      ...previous,
      accessEmail: invalidEmails.length
        ? `Enter a valid email address: ${invalidEmails.join(", ")}`
        : undefined,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (isSubmitting) return;
    const nextErrors = validate();
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }

    const emails = [...accessEmails, ...splitEmails(emailDraft)];
    setIsSubmitting(true);
    try {
      await saveDocument({
        title: form.title.trim(),
        type: form.publicationType,
        category: form.category,
        collection: "Books & Journals",
        description: form.description,
        details: form,
        permission: form.permission,
        accessEmails: [...new Map(emails.map((email) => [email.toLowerCase(), email])).values()],
      }, file);
    } catch (error) {
      setErrors((previous) => ({
        ...previous,
        persistence: error instanceof Error ? error.message : "Unable to save publication details.",
      }));
      return;
    } finally {
      setIsSubmitting(false);
    }
    setAccessEmails([...new Map(emails.map((email) => [email.toLowerCase(), email])).values()]);
    setEmailDraft("");
    setSubmitted(true);
  };

  const handleReset = () => {
    setForm({
      title: "",
      authors: "",
      publisher: "",
      publicationType: "",
      category: "",
      isbnIssn: "",
      publicationYear: "",
      description: "",
      permission: "view",
    });
    setAccessEmails([]);
    setEmailDraft("");
    setFile(null);
    setErrors({});
    setSubmitted(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleClearFile = () => {
    setFile(null);
    setErrors((previous) => ({ ...previous, file: undefined }));
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  if (submitted) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-4xl items-center justify-center">
        <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm sm:p-10">
          <div className="mx-auto mb-6 flex size-20 items-center justify-center rounded-full bg-emerald-50 ring-8 ring-emerald-50/50">
            <svg className="size-10 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="mb-2 text-2xl font-bold text-slate-800">Book / Journal Uploaded Successfully</h2>
          <p className="mb-8 text-sm text-slate-500">The publication details and access permissions have been saved.</p>

          <div className="mb-8 space-y-3 rounded-xl border border-slate-100 bg-slate-50 p-5 text-left">
            <div className="flex justify-between gap-6">
              <span className="text-sm text-slate-500">Title</span>
              <span className="text-right text-sm font-semibold text-slate-800">{form.title}</span>
            </div>
            <div className="flex justify-between gap-6">
              <span className="text-sm text-slate-500">Publication</span>
              <span className="text-right text-sm font-medium text-slate-700">
                {form.publicationType} · {form.category}
              </span>
            </div>
            {form.authors && (
              <div className="flex justify-between gap-6">
                <span className="shrink-0 text-sm text-slate-500">Author(s)</span>
                <span className="text-right text-sm font-medium text-slate-700">{form.authors}</span>
              </div>
            )}
            {form.publisher && (
              <div className="flex justify-between gap-6">
                <span className="text-sm text-slate-500">Publisher</span>
                <span className="text-right text-sm font-medium text-slate-700">{form.publisher}</span>
              </div>
            )}
            {form.isbnIssn && (
              <div className="flex justify-between gap-6">
                <span className="text-sm text-slate-500">ISBN / ISSN</span>
                <span className="text-right text-sm font-medium text-slate-700">{form.isbnIssn}</span>
              </div>
            )}
            {form.publicationYear && (
              <div className="flex justify-between gap-6">
                <span className="text-sm text-slate-500">Publication year</span>
                <span className="text-sm font-medium text-slate-700">{form.publicationYear}</span>
              </div>
            )}
            <div className="flex justify-between gap-6">
              <span className="text-sm text-slate-500">File</span>
              <span className="text-right text-sm font-medium text-slate-700">{file?.name}</span>
            </div>
            <div className="flex justify-between gap-6">
              <span className="text-sm text-slate-500">Permission</span>
              <span className="text-sm font-medium text-slate-700">
                {form.permission === "edit" ? "Can Edit" : "View Only"}
              </span>
            </div>
            <div className="flex justify-between gap-6">
              <span className="shrink-0 text-sm text-slate-500">Access granted to</span>
              <span className="text-right text-sm font-medium text-slate-700">{accessEmails.join(", ")}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleReset}
            className="w-full rounded-xl bg-[#1A468B] py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#02154C] active:scale-[0.98]"
          >
            Upload Another Book / Journal
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-1 text-sm font-medium text-[#1A468B]">Document library</p>
          <h1 className="text-3xl font-bold tracking-tight text-[#02154C]">Upload Book / Journal</h1>
          <p className="mt-1 text-sm text-slate-500">
            Add publication details, choose access permissions, and select a file to upload.
          </p>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <form onSubmit={handleSubmit} noValidate className="space-y-8 p-6 sm:p-8">
          {errors.persistence && (
            <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {errors.persistence}
            </p>
          )}
          <section className="space-y-5">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-base font-semibold text-[#02154C]">Publication details</h2>
              <p className="mt-1 text-sm text-slate-500">Provide identifying information for this book or journal.</p>
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div className="md:col-span-2">
                <label htmlFor="title" className="mb-1.5 block text-sm font-medium text-slate-700">
                  Book / Journal Title <span className="text-rose-500">*</span>
                </label>
                <input
                  id="title"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="e.g. Introduction to Computer Science"
                  className={`w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition-all focus:border-[#1A468B] focus:ring-2 focus:ring-[#1A468B]/15 ${
                    errors.title ? "border-red-400 bg-red-50/30" : "border-slate-300 hover:border-slate-400"
                  }`}
                />
                {errors.title && <p className="mt-1.5 text-xs font-medium text-red-500">{errors.title}</p>}
              </div>

              <div>
                <label htmlFor="authors" className="mb-1.5 block text-sm font-medium text-slate-700">
                  Author(s)
                </label>
                <input
                  id="authors"
                  name="authors"
                  value={form.authors}
                  onChange={handleChange}
                  placeholder="e.g. Jane Smith, John Doe"
                  className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none transition-all placeholder:text-slate-400 hover:border-slate-400 focus:border-[#1A468B] focus:ring-2 focus:ring-[#1A468B]/15"
                />
              </div>

              <div>
                <label htmlFor="publisher" className="mb-1.5 block text-sm font-medium text-slate-700">
                  Publisher
                </label>
                <input
                  id="publisher"
                  name="publisher"
                  value={form.publisher}
                  onChange={handleChange}
                  placeholder="e.g. Academic Press"
                  className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none transition-all placeholder:text-slate-400 hover:border-slate-400 focus:border-[#1A468B] focus:ring-2 focus:ring-[#1A468B]/15"
                />
              </div>

              <div>
                <label htmlFor="publicationType" className="mb-1.5 block text-sm font-medium text-slate-700">
                  Publication Type <span className="text-rose-500">*</span>
                </label>
                <select
                  id="publicationType"
                  name="publicationType"
                  value={form.publicationType}
                  onChange={handleChange}
                  className={`w-full rounded-xl border bg-white px-4 py-2.5 text-sm outline-none transition-all focus:border-[#1A468B] focus:ring-2 focus:ring-[#1A468B]/15 ${
                    errors.publicationType ? "border-red-400 bg-red-50/30" : "border-slate-300 hover:border-slate-400"
                  }`}
                >
                  <option value="">Select publication type</option>
                  {PUBLICATION_TYPES.map((type) => <option key={type} value={type}>{type}</option>)}
                </select>
                {errors.publicationType && (
                  <p className="mt-1.5 text-xs font-medium text-red-500">{errors.publicationType}</p>
                )}
              </div>

              <div>
                <label htmlFor="category" className="mb-1.5 block text-sm font-medium text-slate-700">
                  Category <span className="text-rose-500">*</span>
                </label>
                <select
                  id="category"
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  className={`w-full rounded-xl border bg-white px-4 py-2.5 text-sm outline-none transition-all focus:border-[#1A468B] focus:ring-2 focus:ring-[#1A468B]/15 ${
                    errors.category ? "border-red-400 bg-red-50/30" : "border-slate-300 hover:border-slate-400"
                  }`}
                >
                  <option value="">Select category</option>
                  {PUBLICATION_CATEGORIES.map((category) => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
                {errors.category && <p className="mt-1.5 text-xs font-medium text-red-500">{errors.category}</p>}
              </div>

              <div>
                <label htmlFor="isbnIssn" className="mb-1.5 block text-sm font-medium text-slate-700">
                  ISBN / ISSN
                </label>
                <input
                  id="isbnIssn"
                  name="isbnIssn"
                  value={form.isbnIssn}
                  onChange={handleChange}
                  placeholder="Enter ISBN or ISSN"
                  className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none transition-all placeholder:text-slate-400 hover:border-slate-400 focus:border-[#1A468B] focus:ring-2 focus:ring-[#1A468B]/15"
                />
              </div>

              <div>
                <label htmlFor="publicationYear" className="mb-1.5 block text-sm font-medium text-slate-700">
                  Publication Year
                </label>
                <input
                  id="publicationYear"
                  name="publicationYear"
                  type="number"
                  min="1000"
                  max="9999"
                  value={form.publicationYear}
                  onChange={handleChange}
                  placeholder="e.g. 2024"
                  className={`w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition-all focus:border-[#1A468B] focus:ring-2 focus:ring-[#1A468B]/15 ${
                    errors.publicationYear ? "border-red-400 bg-red-50/30" : "border-slate-300 hover:border-slate-400"
                  }`}
                />
                {errors.publicationYear && (
                  <p className="mt-1.5 text-xs font-medium text-red-500">{errors.publicationYear}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="description" className="mb-1.5 block text-sm font-medium text-slate-700">
                Description <span className="text-xs font-normal text-slate-400">(optional)</span>
              </label>
              <textarea
                id="description"
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={3}
                placeholder="Add a short summary or any helpful context..."
                className="w-full resize-y rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition-all placeholder:text-slate-400 hover:border-slate-400 focus:border-[#1A468B] focus:ring-2 focus:ring-[#1A468B]/15"
              />
            </div>
          </section>

          <section className="space-y-5">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-base font-semibold text-[#02154C]">Sharing & permissions</h2>
              <p className="mt-1 text-sm text-slate-500">Choose who can access this publication and what they can do.</p>
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div>
                <label htmlFor="accessEmail" className="mb-1.5 block text-sm font-medium text-slate-700">
                  Grant Access To (Email) <span className="text-rose-500">*</span>
                </label>
                <div className={`rounded-xl border p-2 transition-all focus-within:border-[#1A468B] focus-within:ring-2 focus-within:ring-[#1A468B]/15 ${
                  errors.accessEmail ? "border-red-400 bg-red-50/30" : "border-slate-300 hover:border-slate-400"
                }`}>
                  {accessEmails.length > 0 && (
                    <ul className="mb-2 flex flex-wrap gap-2" aria-label="Emails granted access">
                      {accessEmails.map((email) => (
                        <li key={email} className="flex items-center gap-1 rounded-full bg-[#1A468B]/10 py-1 pl-3 pr-1 text-xs font-medium text-[#1A468B]">
                          <span>{email}</span>
                          <button
                            type="button"
                            onClick={() => setAccessEmails((previous) => previous.filter((item) => item !== email))}
                            aria-label={`Remove ${email}`}
                            className="flex size-5 items-center justify-center rounded-full text-[#1A468B] hover:bg-[#1A468B]/15"
                          >
                            ×
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                  <div className="flex gap-2">
                    <input
                      id="accessEmail"
                      value={emailDraft}
                      onChange={(event) => {
                        setEmailDraft(event.target.value);
                        setErrors((previous) => ({ ...previous, accessEmail: undefined }));
                      }}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          event.preventDefault();
                          handleAddEmails();
                        }
                      }}
                      placeholder="person@example.com"
                      aria-describedby={errors.accessEmail ? "accessEmail-error" : "accessEmail-help"}
                      className="min-w-0 flex-1 bg-transparent px-2 py-1.5 text-sm outline-none placeholder:text-slate-400"
                    />
                    <button
                      type="button"
                      onClick={handleAddEmails}
                      className="shrink-0 rounded-lg bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-200"
                    >
                      Add
                    </button>
                  </div>
                </div>
                <p id="accessEmail-help" className="mt-1.5 text-xs text-slate-500">
                  Add multiple emails using commas or semicolons.
                </p>
                {errors.accessEmail && (
                  <p id="accessEmail-error" className="mt-1.5 text-xs font-medium text-red-500">{errors.accessEmail}</p>
                )}
              </div>

              <div>
                <span className="mb-2 block text-sm font-medium text-slate-700">Access Permission</span>
                <div className="flex flex-col gap-2">
                  {[
                    { value: "view", label: "View Only", description: "Can view and download" },
                    { value: "edit", label: "Can Edit", description: "Can make changes" },
                  ].map(({ value, label, description }) => (
                    <label
                      key={value}
                      className={`flex cursor-pointer items-start gap-3 rounded-xl border px-4 py-3 text-sm transition-all ${
                        form.permission === value
                          ? "border-[#1A468B] bg-[#1A468B]/5 ring-1 ring-[#1A468B]/20"
                          : "border-slate-200 text-slate-600 hover:border-[#1A468B]/40 hover:bg-slate-50"
                      }`}
                    >
                      <input
                        type="radio"
                        name="permission"
                        value={value}
                        checked={form.permission === value}
                        onChange={handleChange}
                        className="mt-0.5 size-4 accent-[#1A468B]"
                      />
                      <span className="flex flex-col">
                        <span className="font-semibold text-slate-800">{label}</span>
                        <span className="mt-0.5 text-xs text-slate-500">{description}</span>
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="space-y-2 border-t border-slate-100 pt-6">
            <h2 className="text-base font-semibold text-[#02154C]">Publication file</h2>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <label
                className={`flex min-w-0 flex-1 cursor-pointer items-center gap-2 rounded-xl border px-3 py-2.5 text-sm transition-all ${
                  errors.file
                    ? "border-red-400 bg-red-50/30"
                    : file
                      ? "border-emerald-400 bg-emerald-50/30"
                      : "border-slate-300 hover:border-[#1A468B] hover:bg-[#1A468B]/5"
                }`}
              >
                <span className={`truncate ${file ? "font-medium text-emerald-700" : "text-slate-400"}`}>
                  {file ? file.name : "Select your book or journal file"}
                </span>
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  onChange={(event) => {
                    setFile(event.target.files[0] || null);
                    setErrors((previous) => ({ ...previous, file: undefined }));
                  }}
                />
              </label>
              {file && (
                <button
                  type="button"
                  onClick={handleClearFile}
                  className="shrink-0 rounded-xl border border-emerald-400 px-5 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-50"
                >
                  Clear
                </button>
              )}
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex shrink-0 items-center justify-center rounded-xl bg-[#1A468B] px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#02154C] active:scale-[0.98]"
              >
                {isSubmitting ? "Uploading..." : "Upload Book / Journal"}
              </button>
            </div>
            {errors.file && <p className="text-xs font-medium text-red-500">{errors.file}</p>}
          </section>
        </form>
      </div>
    </div>
  );
};

export default BooksJournals;
