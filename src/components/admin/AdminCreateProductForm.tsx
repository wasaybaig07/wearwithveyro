"use client";

import { useState, useRef } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";

interface AdminCreateProductFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

function toSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

interface SizeChartRow {
  size: string;
  measurements: Record<string, string>;
}

interface ColorVariant {
  name: string;
  hex: string;
  file1: File | null;
  file2: File | null;
}

export default function AdminCreateProductForm({
  onSuccess,
  onCancel,
}: AdminCreateProductFormProps) {
  const createProduct = useMutation(api.products.createProduct);
  const generateUploadUrl = useMutation(api.storage.generateUploadUrl);

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [priceValue, setPriceValue] = useState("");
  const [discountPercent, setDiscountPercent] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [stock, setStock] = useState("");
  const [sizes, setSizes] = useState("S, M, L, XL");
  const [status, setStatus] = useState<"active" | "draft" | "soldout">("active");
  const [badge, setBadge] = useState<"new" | "hot" | null>(null);

  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [secondaryFile, setSecondaryFile] = useState<File | null>(null);
  const secondaryFileInputRef = useRef<HTMLInputElement>(null);
  const [galleryFiles, setGalleryFiles] = useState<(File | null)[]>([null, null]);
  const galleryInputRef1 = useRef<HTMLInputElement>(null);
  const galleryInputRef2 = useRef<HTMLInputElement>(null);

  const [sizeChartHeaders, setSizeChartHeaders] = useState("Chest, Length, Shoulder");
  const [sizeChartRows, setSizeChartRows] = useState<SizeChartRow[]>([]);

  const [colorVariants, setColorVariants] = useState<ColorVariant[]>([]);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const slug = toSlug(name);
  const headers = sizeChartHeaders.split(",").map((h) => h.trim()).filter(Boolean);

  function addSizeChartRow() {
    const measurements: Record<string, string> = {};
    headers.forEach((h) => (measurements[h] = ""));
    setSizeChartRows([...sizeChartRows, { size: "", measurements }]);
  }

  function updateSizeChartRow(idx: number, field: string, value: string) {
    const next = [...sizeChartRows];
    if (field === "size") {
      next[idx].size = value;
    } else {
      next[idx].measurements[field] = value;
    }
    setSizeChartRows(next);
  }

  function removeSizeChartRow(idx: number) {
    setSizeChartRows(sizeChartRows.filter((_, i) => i !== idx));
  }

  function addColorVariant() {
    setColorVariants([...colorVariants, { name: "", hex: "#000000", file1: null, file2: null }]);
  }

  function updateColorVariant(idx: number, field: string, value: string) {
    const next = [...colorVariants];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (next[idx] as any)[field] = value;
    setColorVariants(next);
  }

  function updateColorVariantFile(idx: number, fileNum: 1 | 2, file: File | null) {
    const next = [...colorVariants];
    if (fileNum === 1) next[idx].file1 = file;
    else next[idx].file2 = file;
    setColorVariants(next);
  }

  function removeColorVariant(idx: number) {
    setColorVariants(colorVariants.filter((_, i) => i !== idx));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!name || !price || !priceValue || !description || !category || !stock) {
      setError("All required fields must be filled.");
      return;
    }

    if (!file) {
      setError("Please select an image to upload.");
      return;
    }

    setSubmitting(true);
    try {
      const uploadUrl = await generateUploadUrl();
      const uploadResult = await fetch(uploadUrl, { method: "POST", body: file });
      const { storageId } = await uploadResult.json();

      let secondaryStorageId: Id<"_storage"> | undefined;
      if (secondaryFile) {
        const sUploadUrl = await generateUploadUrl();
        const sResult = await fetch(sUploadUrl, { method: "POST", body: secondaryFile });
        const { storageId: sId } = await sResult.json();
        secondaryStorageId = sId;
      }

      const galleryIds: string[] = [];
      for (const gFile of galleryFiles) {
        if (!gFile) continue;
        const gUploadUrl = await generateUploadUrl();
        const gResult = await fetch(gUploadUrl, { method: "POST", body: gFile });
        const { storageId: gId } = await gResult.json();
        galleryIds.push(gId);
      }

      const processedVariants = [];
      for (const variant of colorVariants) {
        if (!variant.file1) continue;
        const vUrl1 = await generateUploadUrl();
        const vRes1 = await fetch(vUrl1, { method: "POST", body: variant.file1 });
        const { storageId: vId1 } = await vRes1.json();

        let vId2: Id<"_storage"> | undefined;
        if (variant.file2) {
          const vUrl2 = await generateUploadUrl();
          const vRes2 = await fetch(vUrl2, { method: "POST", body: variant.file2 });
          const r2 = await vRes2.json();
          vId2 = r2.storageId;
        }

        processedVariants.push({
          name: variant.name,
          hex: variant.hex || undefined,
          imageId: vId1,
          imageSecondaryId: vId2,
        });
      }

      const sizeChartData =
        sizeChartRows.length > 0 && headers.length > 0
          ? { headers, rows: sizeChartRows }
          : undefined;

      await createProduct({
        name,
        slug,
        price,
        priceValue: Number(priceValue),
        discountPercent: discountPercent ? Number(discountPercent) : undefined,
        description,
        category,
        imageId: storageId,
        imageSecondaryId: secondaryStorageId,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        galleryImageIds: galleryIds.length > 0 ? (galleryIds as any) : undefined,
        stock: Number(stock),
        sizes: sizes.split(",").map((s) => s.trim()).filter(Boolean),
        status,
        badge: badge ?? undefined,
        sizeChart: sizeChartData,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        colorVariants: processedVariants.length > 0 ? (processedVariants as any) : undefined,
      });
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create product.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="border border-black/15 bg-surface-container-low">
      <div className="px-6 py-4 border-b border-black/15 flex justify-between items-center">
        <h2 className="font-label-bold text-label-bold uppercase tracking-widest text-primary">
          Create Product
        </h2>
        <button
          type="button"
          onClick={onCancel}
          className="px-3 py-1.5 border border-black/15 font-label-bold text-[10px] uppercase tracking-widest text-secondary hover:border-error hover:text-error transition-colors cursor-pointer"
        >
          Close
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex flex-col gap-2">
          <label className="font-label-bold text-[10px] uppercase tracking-[0.2em] text-secondary">Name *</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="VORTEX GRAIL TEE"
            className="w-full h-12 px-4 bg-background border border-black/15 text-primary font-label-bold text-sm uppercase tracking-wide placeholder:text-secondary/40 focus:outline-none focus:border-primary-fixed transition-colors" />
        </div>

        <div className="flex flex-col gap-2">
          <label className="font-label-bold text-[10px] uppercase tracking-[0.2em] text-secondary">Slug</label>
          <input type="text" value={slug} readOnly
            className="w-full h-12 px-4 bg-surface-container border border-black/15 text-secondary font-label-bold text-sm tracking-wide cursor-not-allowed" />
        </div>

        <div className="flex flex-col gap-2">
          <label className="font-label-bold text-[10px] uppercase tracking-[0.2em] text-secondary">Price (display) *</label>
          <input type="text" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="Rs. 4,800"
            className="w-full h-12 px-4 bg-background border border-black/15 text-primary font-label-bold text-sm tracking-wide placeholder:text-secondary/40 focus:outline-none focus:border-primary-fixed transition-colors" />
        </div>

        <div className="flex flex-col gap-2">
          <label className="font-label-bold text-[10px] uppercase tracking-[0.2em] text-secondary">Price (numeric) *</label>
          <input type="number" value={priceValue} onChange={(e) => setPriceValue(e.target.value)} placeholder="4800"
            className="w-full h-12 px-4 bg-background border border-black/15 text-primary font-label-bold text-sm tracking-wide placeholder:text-secondary/40 focus:outline-none focus:border-primary-fixed transition-colors" />
        </div>

        <div className="flex flex-col gap-2">
          <label className="font-label-bold text-[10px] uppercase tracking-[0.2em] text-secondary">Discount % (optional)</label>
          <input type="number" min={0} max={90} value={discountPercent} onChange={(e) => setDiscountPercent(e.target.value)} placeholder="20 = 20% off"
            className="w-full h-12 px-4 bg-background border border-black/15 text-primary font-label-bold text-sm tracking-wide placeholder:text-secondary/40 focus:outline-none focus:border-primary-fixed transition-colors" />
          <p className="font-label-bold text-[9px] text-secondary/60 tracking-wider uppercase">
            Sale price is auto-calculated on the product page
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <label className="font-label-bold text-[10px] uppercase tracking-[0.2em] text-secondary">Category *</label>
          <input type="text" value={category} onChange={(e) => setCategory(e.target.value)} placeholder="TOPS"
            className="w-full h-12 px-4 bg-background border border-black/15 text-primary font-label-bold text-sm uppercase tracking-wide placeholder:text-secondary/40 focus:outline-none focus:border-primary-fixed transition-colors" />
        </div>

        <div className="flex flex-col gap-2">
          <label className="font-label-bold text-[10px] uppercase tracking-[0.2em] text-secondary">Stock *</label>
          <input type="number" value={stock} onChange={(e) => setStock(e.target.value)} placeholder="12"
            className="w-full h-12 px-4 bg-background border border-black/15 text-primary font-label-bold text-sm tracking-wide placeholder:text-secondary/40 focus:outline-none focus:border-primary-fixed transition-colors" />
        </div>

        <div className="flex flex-col gap-2">
          <label className="font-label-bold text-[10px] uppercase tracking-[0.2em] text-secondary">Status</label>
          <div className="grid grid-cols-3 gap-2">
            {(["active", "draft", "soldout"] as const).map((s) => (
              <button key={s} type="button" onClick={() => setStatus(s)}
                className={`h-12 border font-label-bold text-[10px] uppercase tracking-widest transition-all cursor-pointer ${
                  status === s
                    ? s === "active" ? "border-primary-fixed bg-primary-fixed text-on-primary-fixed"
                      : s === "draft" ? "border-secondary bg-secondary text-background"
                      : "border-error bg-error text-black"
                    : "border-black/15 text-secondary hover:border-primary"
                }`}>{s}</button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="font-label-bold text-[10px] uppercase tracking-[0.2em] text-secondary">Sizes (comma-separated)</label>
          <input type="text" value={sizes} onChange={(e) => setSizes(e.target.value)} placeholder="S, M, L, XL"
            className="w-full h-12 px-4 bg-background border border-black/15 text-primary font-label-bold text-sm uppercase tracking-wide placeholder:text-secondary/40 focus:outline-none focus:border-primary-fixed transition-colors" />
        </div>

        <div className="flex flex-col gap-2">
          <label className="font-label-bold text-[10px] uppercase tracking-[0.2em] text-secondary">Badge (optional)</label>
          <div className="grid grid-cols-3 gap-2">
            {([
              { value: null, label: "None" },
              { value: "new", label: "NEW" },
              { value: "hot", label: "HOT" },
            ] as { value: "new" | "hot" | null; label: string }[]).map((opt) => (
              <button key={opt.label} type="button" onClick={() => setBadge(opt.value)}
                className={`h-12 border font-label-bold text-[10px] uppercase tracking-widest transition-all cursor-pointer ${
                  badge === opt.value
                    ? "border-primary-fixed bg-primary-fixed text-on-primary-fixed"
                    : "border-black/15 text-secondary hover:border-primary"
                }`}>{opt.label}</button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2 md:col-span-2">
          <label className="font-label-bold text-[10px] uppercase tracking-[0.2em] text-secondary">Product Image *</label>
          <button type="button" onClick={() => fileInputRef.current?.click()}
            className="w-full h-24 border border-dashed border-black/15 flex items-center justify-center gap-3 text-secondary hover:border-primary-fixed hover:text-primary-fixed transition-colors cursor-pointer">
            <span className="material-symbols-outlined">upload</span>
            <span className="font-label-bold text-sm">{file ? file.name : "Click to upload image"}</span>
          </button>
          <input ref={fileInputRef} type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] ?? null)} className="hidden" />
        </div>

        <div className="flex flex-col gap-2 md:col-span-2">
          <label className="font-label-bold text-[10px] uppercase tracking-[0.2em] text-secondary">Secondary Image (optional)</label>
          <button type="button" onClick={() => secondaryFileInputRef.current?.click()}
            className="w-full h-24 border border-dashed border-black/15 flex items-center justify-center gap-3 text-secondary hover:border-primary-fixed hover:text-primary-fixed transition-colors cursor-pointer">
            <span className="material-symbols-outlined">upload</span>
            <span className="font-label-bold text-sm">{secondaryFile ? secondaryFile.name : "Click to upload secondary image"}</span>
          </button>
          <input ref={secondaryFileInputRef} type="file" accept="image/*" onChange={(e) => setSecondaryFile(e.target.files?.[0] ?? null)} className="hidden" />
        </div>

        <div className="flex flex-col gap-2 md:col-span-2">
          <label className="font-label-bold text-[10px] uppercase tracking-[0.2em] text-secondary">Gallery Images (optional, up to 2)</label>
          <div className="grid grid-cols-2 gap-4">
            <button type="button" onClick={() => galleryInputRef1.current?.click()}
              className="h-24 border border-dashed border-black/15 flex items-center justify-center gap-3 text-secondary hover:border-primary-fixed hover:text-primary-fixed transition-colors cursor-pointer">
              <span className="material-symbols-outlined">upload</span>
              <span className="font-label-bold text-[11px]">{galleryFiles[0] ? galleryFiles[0].name : "Gallery 1"}</span>
            </button>
            <button type="button" onClick={() => galleryInputRef2.current?.click()}
              className="h-24 border border-dashed border-black/15 flex items-center justify-center gap-3 text-secondary hover:border-primary-fixed hover:text-primary-fixed transition-colors cursor-pointer">
              <span className="material-symbols-outlined">upload</span>
              <span className="font-label-bold text-[11px]">{galleryFiles[1] ? galleryFiles[1].name : "Gallery 2"}</span>
            </button>
          </div>
          <input ref={galleryInputRef1} type="file" accept="image/*" onChange={(e) => { const next = [...galleryFiles]; next[0] = e.target.files?.[0] ?? null; setGalleryFiles(next); }} className="hidden" />
          <input ref={galleryInputRef2} type="file" accept="image/*" onChange={(e) => { const next = [...galleryFiles]; next[1] = e.target.files?.[0] ?? null; setGalleryFiles(next); }} className="hidden" />
        </div>

        {/* Size Chart Editor */}
        <div className="flex flex-col gap-3 md:col-span-2 border-t border-black/15 pt-6">
          <div className="flex justify-between items-center">
            <label className="font-label-bold text-[10px] uppercase tracking-[0.2em] text-secondary">Size Chart (optional)</label>
            <button type="button" onClick={addSizeChartRow}
              className="px-3 py-1.5 border border-black/15 font-label-bold text-[10px] uppercase tracking-widest text-secondary hover:border-primary-fixed hover:text-primary-fixed transition-colors cursor-pointer">
              + Add Row
            </button>
          </div>
          <div className="flex flex-col gap-2">
            <label className="font-label-bold text-[10px] uppercase tracking-[0.15em] text-secondary">Column Headers (comma-separated)</label>
            <input type="text" value={sizeChartHeaders} onChange={(e) => setSizeChartHeaders(e.target.value)} placeholder="Chest, Length, Shoulder"
              className="w-full h-10 px-4 bg-background border border-black/15 text-primary font-label-bold text-sm tracking-wide placeholder:text-secondary/40 focus:outline-none focus:border-primary-fixed transition-colors" />
          </div>
          {sizeChartRows.length > 0 && (
            <div className="border border-black/15 overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-black/15 bg-surface-container">
                    <th className="px-3 py-2 font-label-bold text-[10px] uppercase tracking-widest text-secondary">Size</th>
                    {headers.map((h) => (
                      <th key={h} className="px-3 py-2 font-label-bold text-[10px] uppercase tracking-widest text-secondary">{h}</th>
                    ))}
                    <th className="px-3 py-2 w-10"></th>
                  </tr>
                </thead>
                <tbody>
                  {sizeChartRows.map((row, idx) => (
                    <tr key={idx} className="border-b border-black/10">
                      <td className="px-3 py-1">
                        <input type="text" value={row.size} onChange={(e) => updateSizeChartRow(idx, "size", e.target.value)} placeholder="S"
                          className="w-full h-9 px-2 bg-background border border-black/15 text-primary font-label-bold text-sm focus:outline-none focus:border-primary-fixed transition-colors" />
                      </td>
                      {headers.map((h) => (
                        <td key={h} className="px-3 py-1">
                          <input type="text" value={row.measurements[h] || ""} onChange={(e) => updateSizeChartRow(idx, h, e.target.value)} placeholder={h}
                            className="w-full h-9 px-2 bg-background border border-black/15 text-primary font-label-bold text-sm focus:outline-none focus:border-primary-fixed transition-colors" />
                        </td>
                      ))}
                      <td className="px-3 py-1">
                        <button type="button" onClick={() => removeSizeChartRow(idx)}
                          className="h-9 px-2 border border-black/15 text-secondary hover:border-error hover:text-error transition-colors cursor-pointer font-label-bold text-xs">✕</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Color Variants */}
        <div className="flex flex-col gap-3 md:col-span-2 border-t border-black/15 pt-6">
          <div className="flex justify-between items-center">
            <label className="font-label-bold text-[10px] uppercase tracking-[0.2em] text-secondary">Color Variants (optional)</label>
            <button type="button" onClick={addColorVariant}
              className="px-3 py-1.5 border border-black/15 font-label-bold text-[10px] uppercase tracking-widest text-secondary hover:border-primary-fixed hover:text-primary-fixed transition-colors cursor-pointer">
              + Add Color
            </button>
          </div>
          {colorVariants.map((variant, idx) => (
            <div key={idx} className="border border-black/15 p-4 space-y-3">
              <div className="flex gap-3 items-center">
                <input type="text" value={variant.name} onChange={(e) => updateColorVariant(idx, "name", e.target.value)} placeholder="Color name (e.g. BLACK)"
                  className="flex-1 h-10 px-3 bg-background border border-black/15 text-primary font-label-bold text-sm uppercase tracking-wide placeholder:text-secondary/40 focus:outline-none focus:border-primary-fixed transition-colors" />
                <input type="color" value={variant.hex} onChange={(e) => updateColorVariant(idx, "hex", e.target.value)}
                  className="w-10 h-10 border border-black/15 cursor-pointer" />
                <button type="button" onClick={() => removeColorVariant(idx)}
                  className="h-10 px-3 border border-black/15 text-secondary hover:border-error hover:text-error transition-colors cursor-pointer font-label-bold text-[10px]">Remove</button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="font-label-bold text-[10px] uppercase tracking-widest text-secondary mb-1 block">Image 1 (front) *</span>
                  <ColorVariantImageInput
                    file={variant.file1}
                    onChange={(f) => updateColorVariantFile(idx, 1, f)}
                  />
                </div>
                <div>
                  <span className="font-label-bold text-[10px] uppercase tracking-widest text-secondary mb-1 block">Image 2 (back/styled)</span>
                  <ColorVariantImageInput
                    file={variant.file2}
                    onChange={(f) => updateColorVariantFile(idx, 2, f)}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-2 md:col-span-2">
          <label className="font-label-bold text-[10px] uppercase tracking-[0.2em] text-secondary">Description *</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={8}
            placeholder={"Engineered for the digital nomad.\n- 240gsm heavyweight cotton\n- Relaxed drop-shoulder fit"}
            className="w-full px-4 py-3 bg-background border border-black/15 text-primary font-label-bold text-sm tracking-wide placeholder:text-secondary/40 focus:outline-none focus:border-primary-fixed transition-colors resize-y leading-relaxed" />
          <p className="font-label-bold text-[10px] text-secondary/70 tracking-wider">
            Press Enter to start a new line. Start a line with &quot;•&quot;, &quot;-&quot; or &quot;*&quot; (followed by a space) to render it as a bullet point on the product page.
          </p>
        </div>

        {error && (
          <div className="md:col-span-2 p-4 border border-error/30 bg-error/10 text-error font-label-bold text-sm">{error}</div>
        )}

        <div className="md:col-span-2 flex gap-4">
          <button type="submit" disabled={submitting}
            className="h-14 px-8 bg-primary-fixed text-on-primary-fixed font-label-bold text-label-bold tracking-widest uppercase hover:bg-black hover:text-white hover:border hover:border-black transition-all active:scale-[0.98] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
            {submitting ? "Creating..." : "Create Product"}
          </button>
          <button type="button" onClick={onCancel}
            className="h-14 px-8 border border-black/15 text-secondary font-label-bold text-label-bold tracking-widest uppercase hover:border-primary-fixed hover:text-primary-fixed transition-colors cursor-pointer">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

function ColorVariantImageInput({
  file,
  onChange,
}: {
  file: File | null;
  onChange: (f: File | null) => void;
}) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <>
      <button type="button" onClick={() => ref.current?.click()}
        className="w-full h-20 border border-dashed border-black/15 flex items-center justify-center gap-2 text-secondary hover:border-primary-fixed hover:text-primary-fixed transition-colors cursor-pointer">
        <span className="material-symbols-outlined text-sm">upload</span>
        <span className="font-label-bold text-[11px]">{file ? file.name : "Upload image"}</span>
      </button>
      <input ref={ref} type="file" accept="image/*" onChange={(e) => onChange(e.target.files?.[0] ?? null)} className="hidden" />
    </>
  );
}
