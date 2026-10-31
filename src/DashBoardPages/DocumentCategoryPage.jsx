import { useNavigate } from "react-router-dom";
import { ArrowRight, FilePlus2 } from "lucide-react";

const DocumentCategoryPage = ({ title, description, icon: Icon, metadata }) => {
  const navigate = useNavigate();

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex items-start gap-5">
          <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-[#1A468B]/10 text-[#1A468B]">
            <Icon size={26} strokeWidth={1.7} />
          </div>
          <div>
            <p className="mb-1 text-sm font-medium text-[#1A468B]">Document collection</p>
            <h1 className="text-2xl font-bold text-[#02154C]">{title}</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">{description}</p>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mb-5">
          <h2 className="text-base font-semibold text-[#02154C]">Recommended metadata</h2>
          <p className="mt-1 text-sm text-slate-500">
            Use these details to keep items in this collection easy to identify and find.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {metadata.map((field) => (
            <div key={field} className="flex items-center gap-3 rounded-xl bg-slate-50 px-4 py-3">
              <span className="size-2 shrink-0 rounded-full bg-[#1A468B]" />
              <span className="text-sm font-medium text-slate-700">{field}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="flex flex-col items-start justify-between gap-4 rounded-2xl border border-[#1A468B]/15 bg-[#1A468B]/5 p-6 sm:flex-row sm:items-center">
        <div>
          <h2 className="font-semibold text-[#02154C]">Ready to add a document?</h2>
          <p className="mt-1 text-sm text-slate-500">
            Open the existing upload form to add a document and set its access permissions.
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate("/dashboard/upload_doc")}
          className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-[#1A468B] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#02154C]"
        >
          <FilePlus2 size={17} />
          Upload document
          <ArrowRight size={15} />
        </button>
      </section>
    </div>
  );
};

export default DocumentCategoryPage;
