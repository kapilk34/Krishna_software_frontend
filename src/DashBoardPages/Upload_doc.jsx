import { useRef, useState } from "react";
import { saveDocument } from "../utils/documentStore";

const DOC_TYPES = ["Genaral", "Archives Manuscripts", "Audio & Video", "Books & Journals", "Images & Photography", "Scanned Documents"];
const EMAIL_PATTERN = /^[\w.+-]+@[\w-]+\.[a-z]{2,}$/i;
const splitEmails = (value) => value.split(/[,;\s]+/).map((email) => email.trim()).filter(Boolean);

const UploadDoc = () => {
  const [form, setForm] = useState({
    docName: "",
    docType: "",
    description: "",
    permission: "view",
  });
  const [accessEmails, setAccessEmails] = useState([]);
  const [emailDraft, setEmailDraft] = useState("");
  const [file, setFile] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  const validate = () => {
    const e = {};
    if (!form.docName.trim()) e.docName = "Document name is required.";
    if (!form.docType) e.docType = "Please select a document type.";
    const pendingEmails = splitEmails(emailDraft);
    const allEmails = [...accessEmails, ...pendingEmails];
    if (!allEmails.length) e.accessEmail = "At least one email is required.";
    else if (allEmails.some((email) => !EMAIL_PATTERN.test(email)))
      e.accessEmail = "Enter valid email addresses, separated by commas or semicolons.";
    if (!file) e.file = "Please select a file to upload.";
    return e;
  };

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setErrors((prev) => ({ ...prev, [e.target.name]: undefined }));
  };

  const handleAddEmails = () => {
    const emails = splitEmails(emailDraft);
    if (!emails.length) return;

    const validEmails = emails.filter((email) => EMAIL_PATTERN.test(email));
    const invalidEmails = emails.filter((email) => !EMAIL_PATTERN.test(email));
    setAccessEmails((prev) => [
      ...prev,
      ...validEmails.filter((email) => !prev.some((existing) => existing.toLowerCase() === email.toLowerCase())),
    ]);
    setEmailDraft(invalidEmails.join(", "));
    setErrors((prev) => ({
      ...prev,
      accessEmail: invalidEmails.length
        ? `Enter a valid email address: ${invalidEmails.join(", ")}`
        : undefined,
    }));
  };

  const handleRemoveEmail = (emailToRemove) => {
    setAccessEmails((prev) => prev.filter((email) => email !== emailToRemove));
  };

  const handleFile = (e) => {
    setFile(e.target.files[0] || null);
    setErrors((prev) => ({ ...prev, file: undefined }));
  };

  const handleClearFile = () => {
    setFile(null);
    setErrors((prev) => ({ ...prev, file: undefined }));
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    const errs = validate();
    if (Object.keys(errs).length) return setErrors(errs);
    const allEmails = [...accessEmails, ...splitEmails(emailDraft)];
    setIsSubmitting(true);
    try {
      await saveDocument({
        title: form.docName.trim(),
        type: "Document",
        category: form.docType,
        collection: "Documents",
        description: form.description,
        details: form,
        permission: form.permission,
        accessEmails: [...new Map(allEmails.map((email) => [email.toLowerCase(), email])).values()],
      }, file);
    } catch (error) {
      setErrors((prev) => ({
        ...prev,
        persistence: error instanceof Error ? error.message : "Unable to save document details.",
      }));
      return;
    } finally {
      setIsSubmitting(false);
    }
    setAccessEmails([...new Map(allEmails.map((email) => [email.toLowerCase(), email])).values()]);
    setEmailDraft("");
    setSubmitted(true);
  };

  const handleReset = () => {
    setForm({ docName: "", docType: "", description: "", permission: "view" });
    setAccessEmails([]);
    setEmailDraft("");
    setFile(null);
    setErrors({});
    setSubmitted(false);
  };

  if (submitted) {
    return (
        <div className="mx-auto flex min-h-[60vh] max-w-4xl items-center justify-center">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm sm:p-10">
          <div className="flex items-center justify-center w-20 h-20 rounded-full bg-emerald-50 mx-auto mb-6 ring-8 ring-emerald-50/50">
            <svg className="w-10 h-10 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Document Uploaded Successfully</h2>
          <p className="text-slate-500 text-sm mb-8">Your file has been processed and access has been granted.</p>

          <div className="bg-slate-50 rounded-xl p-5 text-left space-y-3 mb-8 border border-slate-100">
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-500">Document</span>
              <span className="text-sm font-semibold text-slate-800">{form.docName}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-500">Type</span>
              <span className="text-sm font-medium text-slate-700">{form.docType}</span>
            </div>
            {form.description.trim() && (
              <div className="flex justify-between gap-6">
                <span className="shrink-0 text-sm text-slate-500">Description</span>
                <span className="text-right text-sm font-medium text-slate-700">{form.description}</span>
              </div>
            )}
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-500">Permission</span>
              <span className="text-sm font-medium text-slate-700 capitalize">
                {form.permission === "edit" ? "Edit" : "View Only"}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-500">Access granted to</span>
              <span className="text-right text-sm font-medium text-slate-700">{accessEmails.join(", ")}</span>
            </div>
          </div>

          <button
            onClick={handleReset}
            className="w-full rounded-xl bg-[#1A468B] py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#02154C] active:scale-[0.98]"
          >
            Upload Another Document
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
            <h1 className="text-3xl font-bold tracking-tight text-[#02154C]">Upload Document</h1>
            <p className="mt-1 text-sm text-slate-500">Add document details, choose access permissions, and select a file to upload.</p>
          </div>
          {errors.persistence && <p role="alert" className="text-sm font-medium text-red-600">{errors.persistence}</p>}
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <form onSubmit={handleSubmit} noValidate className="space-y-8 p-6 sm:p-8">
              <section className="space-y-5">
                <div className="border-b border-slate-100 pb-3">
                  <h2 className="text-base font-semibold text-[#02154C]">Document details</h2>
                  <p className="mt-1 text-sm text-slate-500">Provide identifying information for this document.</p>
                </div>
                {/* Document Name & Type - side by side on desktop */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label htmlFor="docName" className="mb-1.5 block text-sm font-medium text-slate-700">Document Name <span className="text-rose-500">*</span></label>
                    <input
                      type="text"
                      id="docName"
                      name="docName"
                      value={form.docName}
                      onChange={handleChange}
                      placeholder="e.g. Q3 Financial Report"
                      className={`w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition-all focus:border-[#1A468B] focus:ring-2 focus:ring-[#1A468B]/15 ${
                        errors.docName ? "border-red-400 bg-red-50/30" : "border-slate-300 hover:border-slate-400"
                      }`}
                    />
                    {errors.docName && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.docName}</p>}
                  </div>

                  <div>
                    <label htmlFor="docType" className="mb-1.5 block text-sm font-medium text-slate-700">Type of Document <span className="text-rose-500">*</span></label>
                    <select
                      id="docType"
                      name="docType"
                      value={form.docType}
                      onChange={handleChange}
                      className={`w-full appearance-none rounded-xl border bg-white px-4 py-2.5 text-sm outline-none transition-all focus:border-[#1A468B] focus:ring-2 focus:ring-[#1A468B]/15 ${
                        errors.docType ? "border-red-400 bg-red-50/30" : "border-slate-300 hover:border-slate-400"
                      }`}
                      style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'right 12px center',
                      }}
                    >
                      <option value="">Select document type</option>
                      {DOC_TYPES.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                    {errors.docType && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.docType}</p>}
                  </div>
                </div>

                <div>
                  <label htmlFor="description" className="mb-1.5 block text-sm font-medium text-slate-700">Description <span className="text-xs font-normal text-slate-400">(optional)</span></label>
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
                  <p className="mt-1 text-sm text-slate-500">Choose who can access this document and what they can do.</p>
                </div>
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  <div>
                    <label htmlFor="accessEmail" className="mb-1.5 block text-sm font-medium text-slate-700">Grant Access To (Email) <span className="text-rose-500">*</span></label>
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
                                onClick={() => handleRemoveEmail(email)}
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
                          type="text"
                          id="accessEmail"
                          value={emailDraft}
                          onChange={(e) => {
                            setEmailDraft(e.target.value);
                            setErrors((prev) => ({ ...prev, accessEmail: undefined }));
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
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
                    <p id="accessEmail-help" className="mt-1.5 text-xs text-slate-500">Add multiple emails using commas or semicolons.</p>
                    {errors.accessEmail && <p id="accessEmail-error" className="text-red-500 text-xs mt-1.5 font-medium">{errors.accessEmail}</p>}
                  </div>
                {/* Permission Type */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Access Permission</label>
                  <div className="flex flex-col gap-2">
                    {[
                      { value: "view", label: "View Only", desc: "Can view and download" },
                      { value: "edit", label: "Can Edit", desc: "Can make changes" },
                    ].map(({ value, label, desc }) => (
                      <label
                        key={value}
                        className={`flex flex-1 cursor-pointer items-start gap-3 rounded-xl border px-4 py-3 text-sm transition-all ${
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
                        <div className="flex flex-col">
                          <span className="font-semibold text-slate-800">{label}</span>
                          <span className="text-xs text-slate-500 mt-0.5">{desc}</span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
                </div>
              </section>

              <div className="border-t border-slate-100 pt-6 space-y-2">
                <h2 className="text-base font-semibold text-[#02154C]">Document file</h2>
                <div className="flex items-center gap-3">
                  <label
                    aria-label="Select a document file"
                    className={`flex items-center gap-2 flex-1 min-w-0 cursor-pointer rounded-xl border px-3 py-2.5 text-sm transition-all ${
                      errors.file
                        ? "border-red-400 bg-red-50/30"
                        : file
                        ? "border-emerald-400 bg-emerald-50/30"
                        : "border-slate-300 hover:border-[#1A468B] hover:bg-[#1A468B]/5"
                    }`}
                  >
                    {/* <svg
                      className={`w-4 h-4 shrink-0 ${file ? "text-emerald-600" : "text-slate-400"}`}
                      fill="none" viewBox="0 0 24 24" stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                        d="M12 16v-8m0 0l-3 3m3-3l3 3M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1" />
                    </svg> */}
                    <span className={`truncate ${file ? "text-emerald-700 font-medium" : "text-slate-400"}`}>
                      {file ? file.name : "Select your document"}
                    </span>
                    <input
                      ref={fileInputRef}
                      type="file"
                      className="hidden"
                      onChange={handleFile}
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
                    className="shrink-0 inline-flex items-center justify-center rounded-xl bg-[#1A468B] px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#02154C] active:scale-[0.98]"
                  >
                    {isSubmitting ? "Uploading..." : "Upload Document"}
                  </button>
                </div>
                {errors.file && <p className="text-red-500 text-xs font-medium">{errors.file}</p>}
              </div>
            </form>
        </div>
    </div>
  );
};

export default UploadDoc;