"use client";

import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Camera, Upload, Sparkles, Check, Loader2, Image as ImageIcon, ExternalLink, RefreshCw } from "lucide-react";
import { toast } from "sonner";

interface GuestSnapsModalProps {
  isOpen: boolean;
  onClose: () => void;
  invitationId: string;
  slug?: string;
  defaultGuestName?: string | null;
  defaultTable?: string | number | null;
  onSuccess?: (snap: any) => void;
}

export function GuestSnapsModal({
  isOpen,
  onClose,
  invitationId,
  slug,
  defaultGuestName,
  defaultTable,
  onSuccess,
}: GuestSnapsModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [guestName, setGuestName] = useState(defaultGuestName || "");
  const [tableNumber, setTableNumber] = useState(defaultTable ? `Table ${defaultTable}` : "");
  const [caption, setCaption] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedSnap, setUploadedSnap] = useState<any | null>(null);

  const galleryInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const resetForm = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setCaption("");
    setUploadedSnap(null);
    setIsUploading(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please choose a valid image file (JPG, PNG, WebP).");
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      toast.error("Image must be smaller than 8MB.");
      return;
    }

    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      toast.error("Please capture or choose a photo first!");
      return;
    }

    const trimmedName = guestName.trim() || "Event Guest";

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("guestName", trimmedName);
      formData.append("caption", caption.trim());
      formData.append("tableNumber", tableNumber.trim());

      const targetId = slug || invitationId;
      const res = await fetch(`/api/invitations/${encodeURIComponent(targetId)}/snaps`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to upload photo");
      }

      toast.success("Photo projected to the live wall! 🎉");
      setUploadedSnap(data.snap || { photo_url: previewUrl, guest_name: trimmedName, table_number: tableNumber, caption });
      onSuccess?.(data.snap);
    } catch (err: any) {
      console.error("Upload snap error:", err);
      toast.error(err.message || "Something went wrong uploading your photo.");
    } finally {
      setIsUploading(false);
    }
  };

  const wallUrl = `/inv/${encodeURIComponent(slug || invitationId)}/wall`;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="sm:max-w-md bg-neutral-900/95 border-amber-500/20 text-white backdrop-blur-xl shadow-2xl p-6 rounded-3xl">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <Camera className="w-5 h-5" />
            </span>
            <div>
              <DialogTitle className="text-xl font-bold text-amber-100 flex items-center gap-2">
                Live Crowd Photo Wall
                <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse">
                  Live
                </span>
              </DialogTitle>
              <DialogDescription className="text-neutral-400 text-xs mt-0.5">
                Snap a photo from your seat to project it live on the banquet screens!
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {uploadedSnap ? (
          <div className="space-y-5 py-3 text-center">
            <div className="relative mx-auto w-48 h-48 rounded-2xl overflow-hidden border-2 border-amber-400/40 shadow-xl bg-black">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={uploadedSnap.photo_url || previewUrl || ""}
                alt="Uploaded memory"
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 right-2 bg-emerald-500 text-white p-1 rounded-full shadow-md">
                <Check className="w-4 h-4" />
              </div>
            </div>

            <div className="space-y-1">
              <h3 className="font-semibold text-lg text-emerald-400 flex items-center justify-center gap-1.5">
                <Sparkles className="w-4 h-4" /> Projected on Banquet Screens!
              </h3>
              <p className="text-xs text-neutral-300">
                Your snap is now cycling on the live banquet projector slideshow.
              </p>
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <Button
                asChild
                className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-neutral-950 font-semibold rounded-xl shadow-lg"
              >
                <a href={wallUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2">
                  <ExternalLink className="w-4 h-4" />
                  View Live Banquet Wall
                </a>
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={resetForm}
                className="w-full border-white/10 hover:bg-white/5 text-neutral-300 rounded-xl"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Snap Another Photo
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            {/* Hidden Inputs */}
            <input
              type="file"
              ref={galleryInputRef}
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
            <input
              type="file"
              ref={cameraInputRef}
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={handleFileChange}
            />

            {/* Photo Selection / Preview Area */}
            {previewUrl ? (
              <div className="relative w-full h-52 rounded-2xl overflow-hidden border border-amber-500/30 bg-black/60 group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    onClick={() => cameraInputRef.current?.click()}
                    className="rounded-lg text-xs"
                  >
                    Retake
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => galleryInputRef.current?.click()}
                    className="rounded-lg text-xs border-white/20 text-white"
                  >
                    Choose Different
                  </Button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => cameraInputRef.current?.click()}
                  className="flex flex-col items-center justify-center gap-2 p-5 rounded-2xl border-2 border-dashed border-amber-500/40 bg-amber-500/5 hover:bg-amber-500/10 transition-all text-amber-200 text-center cursor-pointer"
                >
                  <div className="w-11 h-11 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-300">
                    <Camera className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-semibold">Take Camera Snap</span>
                  <span className="text-[10px] text-neutral-400">Selfie or Table Photo</span>
                </button>

                <button
                  type="button"
                  onClick={() => galleryInputRef.current?.click()}
                  className="flex flex-col items-center justify-center gap-2 p-5 rounded-2xl border-2 border-dashed border-white/20 bg-white/5 hover:bg-white/10 transition-all text-neutral-200 text-center cursor-pointer"
                >
                  <div className="w-11 h-11 rounded-full bg-white/10 flex items-center justify-center text-neutral-300">
                    <ImageIcon className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-semibold">Upload from Gallery</span>
                  <span className="text-[10px] text-neutral-400">JPG, PNG, WebP</span>
                </button>
              </div>
            )}

            {/* Guest Name & Table Number */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-neutral-300">Your Name</label>
                <Input
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  placeholder="e.g. Sarah Khan"
                  maxLength={50}
                  className="bg-white/5 border-white/10 text-white placeholder:text-neutral-500 text-xs rounded-xl"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-neutral-300">Table / Group (Optional)</label>
                <Input
                  value={tableNumber}
                  onChange={(e) => setTableNumber(e.target.value)}
                  placeholder="e.g. Table 4 / Friends"
                  maxLength={40}
                  className="bg-white/5 border-white/10 text-white placeholder:text-neutral-500 text-xs rounded-xl"
                />
              </div>
            </div>

            {/* Caption */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-neutral-300 flex justify-between">
                <span>Caption or Blessing (Optional)</span>
                <span className="text-[10px] text-neutral-500">{caption.length}/200</span>
              </label>
              <Textarea
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Write a sweet wish for the hosts..."
                maxLength={200}
                rows={2}
                className="bg-white/5 border-white/10 text-white placeholder:text-neutral-500 text-xs rounded-xl resize-none"
              />
            </div>

            <Button
              type="submit"
              disabled={!selectedFile || isUploading}
              className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-neutral-950 font-semibold rounded-xl py-5 shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Projecting onto Banquet Wall...</span>
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  <span>Project Photo to Live Wall</span>
                </>
              )}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
