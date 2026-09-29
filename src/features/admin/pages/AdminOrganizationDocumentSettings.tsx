import { useEffect, useState } from "react";
import { ChevronDown, FilePlus2, Plus, Save, X } from "lucide-react";
import toast from "react-hot-toast";
import {
  adminApi,
  adminError,
  type TenantDocumentConfig,
} from "../api/admin.api";
import { useAdminSession } from "../AdminSession";
type DraftDoc = {
  code: string;
  name: string;
  required: boolean;
  enabled: boolean;
  fileType: "PDF" | "PNG" | "JPG";
};
const blank = (): TenantDocumentConfig => ({
  type: "",
  name: "",
  enabled: true,
  docs: [],
});
export default function AdminOrganizationDocumentSettings() {
  const { can } = useAdminSession();
  const [configs, setConfigs] = useState<TenantDocumentConfig[]>([]);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [editing, setEditing] = useState<{
    configIndex: number;
    docIndex: number | null;
    value: DraftDoc;
  } | null>(null);
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    if (can("tenant:read"))
      void adminApi
        .tenantDocumentConfig()
        .then(setConfigs)
        .catch((e) => toast.error(adminError(e)));
  }, [can]);
  const setConfig = (i: number, patch: Partial<TenantDocumentConfig>) =>
    setConfigs((items) =>
      items.map((item, index) => (index === i ? { ...item, ...patch } : item)),
    );
  const save = async () => {
    setSaving(true);
    try {
      setConfigs(await adminApi.saveTenantDocumentConfig(configs));
      toast.success("Settings saved.");
    } catch (e) {
      toast.error(adminError(e));
    } finally {
      setSaving(false);
    }
  };
  const saveDoc = () => {
    if (!editing) return;
    const { configIndex, docIndex, value } = editing;
    if (!value.code.trim() || !value.name.trim())
      return toast.error("Document code and name are required.");
    const docs = [...configs[configIndex].docs];
    const next = {
      ...value,
      code: value.code.toUpperCase().replace(/[^A-Z0-9_]/g, ""),
    };
    if (docIndex === null) docs.push(next);
    else docs[docIndex] = next;
    setConfig(configIndex, { docs });
    setEditing(null);
  };
  return (
    <main className="mx-auto max-w-5xl p-5 sm:p-8">
      <p className="text-sm font-semibold text-[#0C5A69]">Platform settings</p>
      <h1 className="mt-1 text-2xl font-bold">
        Organization document settings
      </h1>
      <p className="mt-1 text-slate-500">
        Create a type, then add documents through the compact document form.
      </p>
      <div className="mt-6 space-y-3">
        {configs.map((config, index) => (
          <section
            key={index}
            className="overflow-hidden rounded-xl border border-slate-200 bg-white"
          >
            <button
              type="button"
              className="flex w-full items-center justify-between p-5 text-left"
              onClick={() => setExpanded(expanded === index ? null : index)}
            >
              <span>
                <b>{config.name || "New organization type"}</b>
                <small className="mt-1 block text-slate-500">
                  {config.type || "Set type code"} � {config.docs.length}{" "}
                  documents � {config.enabled ? "Enabled" : "Disabled"}
                </small>
              </span>
              <ChevronDown className={expanded === index ? "rotate-180" : ""} />
            </button>
            {expanded === index && (
              <div className="border-t p-5">
                <div className="grid gap-3 sm:grid-cols-3">
                  <input
                    className="rounded border p-2 font-mono"
                    placeholder="HOSPITAL"
                    value={config.type}
                    onChange={(e) =>
                      setConfig(index, {
                        type: e.target.value
                          .toUpperCase()
                          .replace(/[^A-Z0-9_]/g, ""),
                      })
                    }
                  />
                  <input
                    className="rounded border p-2"
                    placeholder="Hospital"
                    value={config.name}
                    onChange={(e) => setConfig(index, { name: e.target.value })}
                  />
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={config.enabled}
                      onChange={(e) =>
                        setConfig(index, { enabled: e.target.checked })
                      }
                    />
                    Enable type
                  </label>
                </div>
                <div className="mt-5 flex items-center justify-between">
                  <b>Documents</b>
                  <button
                    type="button"
                    className="inline-flex items-center gap-1 rounded border border-[#0C5A69] px-3 py-1.5 text-sm font-semibold text-[#0C5A69]"
                    onClick={() =>
                      setEditing({
                        configIndex: index,
                        docIndex: null,
                        value: {
                          code: "",
                          name: "",
                          required: true,
                          enabled: true,
                          fileType: "PDF",
                        },
                      })
                    }
                  >
                    <FilePlus2 size={16} />
                    Add document
                  </button>
                </div>
                <div className="mt-3 space-y-3">
                  {config.docs.length === 0 ? (
                    <p className="rounded-lg border p-4 text-sm text-slate-500">No documents added.</p>
                  ) : (
                    (["PDF", "PNG", "JPG"] as const).map((fileType) => {
                      const documents = config.docs
                        .map((doc, di) => ({ doc, di }))
                        .filter(({ doc }) => doc.fileType === fileType);
                      if (!documents.length) return null;
                      return (
                        <div key={fileType} className="rounded-lg border">
                          <p className="border-b bg-slate-50 px-3 py-2 text-xs font-bold tracking-wide text-slate-600">{fileType} documents</p>
                          {documents.map(({ doc, di }) => (
                            <div key={di} className="flex flex-wrap items-center justify-between gap-3 border-b p-3 text-sm last:border-b-0">
                              <div><b>{doc.name}</b><span className="ml-2 font-mono text-xs text-slate-500">{doc.code}</span><p className="mt-1 text-slate-500">{doc.required ? "Required" : "Optional"} ? {doc.enabled ? "Enabled" : "Disabled"}</p></div>
                              <button type="button" className="font-semibold text-[#0C5A69]" onClick={() => setEditing({ configIndex: index, docIndex: di, value: { ...doc } })}>Edit</button>
                            </div>
                          ))}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </section>
        ))}
        <div className="flex gap-3">
          <button
            type="button"
            className="inline-flex items-center gap-1 rounded border px-4 py-2"
            onClick={() => {
              setConfigs([...configs, blank()]);
              setExpanded(configs.length);
            }}
          >
            <Plus size={17} />
            Add organization type
          </button>
          <button
            type="button"
            disabled={saving}
            className="inline-flex items-center gap-1 rounded bg-[#0C5A69] px-4 py-2 text-white disabled:opacity-60"
            onClick={() => void save()}
          >
            <Save size={17} />
            {saving ? "Saving..." : "Save settings"}
          </button>
        </div>
      </div>
      {editing && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/40 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-5 shadow-xl">
            <div className="flex justify-between">
              <h2 className="font-bold">
                {editing.docIndex === null ? "Add document" : "Edit document"}
              </h2>
              <button onClick={() => setEditing(null)}>
                <X size={20} />
              </button>
            </div>
            <div className="mt-4 space-y-3">
              <input
                className="w-full rounded border p-2 font-mono"
                placeholder="HOSPITAL_LICENSE"
                value={editing.value.code}
                onChange={(e) =>
                  setEditing({
                    ...editing,
                    value: { ...editing.value, code: e.target.value },
                  })
                }
              />
              <input
                className="w-full rounded border p-2"
                placeholder="Hospital license"
                value={editing.value.name}
                onChange={(e) =>
                  setEditing({
                    ...editing,
                    value: { ...editing.value, name: e.target.value },
                  })
                }
              />
              <label className="block text-sm font-semibold">File type
                <select className="mt-1 block w-full rounded border p-2 font-normal" value={editing.value.fileType} onChange={(e) => setEditing({ ...editing, value: { ...editing.value, fileType: e.target.value as DraftDoc["fileType"] } })}>
                  <option value="PDF">PDF</option><option value="PNG">PNG</option><option value="JPG">JPG</option>
                </select>
              </label>
              <label className="mr-4 text-sm">
                <input
                  type="checkbox"
                  checked={editing.value.required}
                  onChange={(e) =>
                    setEditing({
                      ...editing,
                      value: { ...editing.value, required: e.target.checked },
                    })
                  }
                />{" "}
                Required
              </label>
              <label className="text-sm">
                <input
                  type="checkbox"
                  checked={editing.value.enabled}
                  onChange={(e) =>
                    setEditing({
                      ...editing,
                      value: { ...editing.value, enabled: e.target.checked },
                    })
                  }
                />{" "}
                Enabled
              </label>
              <button
                type="button"
                className="w-full rounded bg-[#0C5A69] py-2 font-semibold text-white"
                onClick={saveDoc}
              >
                Save document
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
