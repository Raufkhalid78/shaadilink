"use client";

import { useState, useRef, useEffect } from "react";
import { m, AnimatePresence } from "framer-motion";
import Image from "next/image";
import {
  ArrowLeft, ArrowRight, Calendar, Heart, MapPin, Music, MessageSquare,
  Check, Plus, Trash2, User, Shirt, Car, Hotel, Gift, ImagePlus, X, Globe, Loader2, Video, Sparkles, Crown, Lock,
  Cake, GraduationCap, Briefcase, Upload, Play, Square, AlertCircle,
  Mic, MicOff, Volume2, Pause, RotateCcw, Camera
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import type { FlowData } from "@/lib/flow-types";
import { getDefaultEventsForCategory, getDefaultMusicForCategory } from "@/lib/flow-types";
import { getCategoryForTemplate } from "@/lib/category-utils";
import { PageBreadcrumb, BreadcrumbCrumb } from "@/components/ui/page-breadcrumb";
import { AICopywriterModal } from "@/components/flow/ai-copywriter-modal";
import { ScrollableMenu } from "@/components/ui/scrollable-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface DetailsPageProps {
  flowData: FlowData;
  onUpdateData: (updates: Partial<FlowData>) => void;
  onBack: () => void;
  onContinue: () => void;
  onRequireLogin?: () => void;
  crumbs: BreadcrumbCrumb[];
}

export function DetailsPage({ flowData, onUpdateData, onBack, onContinue, onRequireLogin, crumbs }: DetailsPageProps) {
  const isEdit = !!flowData.invitationId;
  const [errors, setErrors] = useState<Record<string, string>>({});
  const rawCategory = (flowData.category || getCategoryForTemplate(flowData.selectedTemplateId) || "wedding").toLowerCase();
  const category = (rawCategory === "corporate" ? "meeting" : rawCategory);
  const isWedding = category === "wedding";
  const isBirthday = category === "birthday";
  const isSchool = category === "school";
  const isMeeting = category === "meeting" || rawCategory === "corporate";

  // Auto-align defaults if category is non-wedding
  useEffect(() => {
    if (!isWedding) {
      const updates: Partial<FlowData> = {};
      if (!flowData.category || flowData.category.toLowerCase() !== category) {
        updates.category = category;
      }
      if (flowData.showBismillah === true || flowData.showBismillah === undefined) {
        updates.showBismillah = false;
      }
      if (flowData.showQuranVerse === true || flowData.showQuranVerse === undefined) {
        updates.showQuranVerse = false;
      }
      const weddingEventNames = ["qawali night", "dholki", "mayoon", "mehndi", "baraat", "baraat & nikkah", "walima"];
      const currentEvents = flowData.events || [];
      const isStillDefaultWeddingEvents = currentEvents.length > 0 && 
        currentEvents.every(e => weddingEventNames.includes((e.name || "").toLowerCase().trim()) && !e.date);
      
      if (isStillDefaultWeddingEvents || currentEvents.length === 0) {
        updates.events = getDefaultEventsForCategory(category);
      }
      if (!flowData.backgroundMusic || flowData.backgroundMusic === "soft-sitar") {
        updates.backgroundMusic = getDefaultMusicForCategory(category);
      }

      if (Object.keys(updates).length > 0) {
        onUpdateData(updates);
      }
    }
  }, [category, isWedding, flowData.category, flowData.showBismillah, flowData.showQuranVerse, flowData.events, flowData.backgroundMusic, onUpdateData]);
  const [isUploadingAudio, setIsUploadingAudio] = useState(false);
  const audioInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [isAICopywriterOpen, setIsAICopywriterOpen] = useState(false);
  const heroInputRef = useRef<HTMLInputElement>(null);
  const slideshowInputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(!!flowData.slug);
  const [currentStep, setCurrentStep] = useState<number>(() => {
    // For new invitations, always start from the very first step (Step 1)
    if (!isEdit) return 1;
    if (flowData.lastSavedStep && flowData.lastSavedStep >= 1 && flowData.lastSavedStep <= 4) {
      return flowData.lastSavedStep;
    }
    if (flowData.currentStep && flowData.currentStep >= 1 && flowData.currentStep <= 4) {
      return flowData.currentStep;
    }
    return 1;
  });
  const [isCheckingSlug, setIsCheckingSlug] = useState(false);
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null);
  const [isMobilePreviewOpen, setIsMobilePreviewOpen] = useState(false);

  // Background music preview & play/pause state
  const [playingTrackId, setPlayingTrackId] = useState<string | null>(null);
  const [isPlayingMusic, setIsPlayingMusic] = useState(false);

  // Host Voice Note (Audio Memo) State
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [voiceDuration, setVoiceDuration] = useState(0);
  const [voiceAudioBlob, setVoiceAudioBlob] = useState<Blob | null>(null);
  const [voiceAudioPreviewUrl, setVoiceAudioPreviewUrl] = useState<string | null>(null);
  const [isUploadingVoice, setIsUploadingVoice] = useState(false);
  const [showVoiceRoyalModal, setShowVoiceRoyalModal] = useState(false);
  const [isPlayingSampleBlessing, setIsPlayingSampleBlessing] = useState(false);
  const sampleAudioRef = useRef<HTMLAudioElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const voiceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const voiceFileInputRef = useRef<HTMLInputElement>(null);

  const playSampleBlessing = () => {
    if (isPlayingSampleBlessing && sampleAudioRef.current) {
      sampleAudioRef.current.pause();
      setIsPlayingSampleBlessing(false);
      return;
    }
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlayingMusic(false);
    }
    const sample = new Audio("/music/soft-sitar.mp3");
    sample.volume = 0.5;
    sampleAudioRef.current = sample;
    sample.onended = () => setIsPlayingSampleBlessing(false);
    sample.play().catch(() => {});
    setIsPlayingSampleBlessing(true);
  };

  const startVoiceRecording = async () => {
    if (typeof window === "undefined" || !navigator?.mediaDevices?.getUserMedia) {
      toast.error("Microphone recording is not available in this browser or over an unencrypted connection. Please use 'Upload Audio File' below.", { duration: 5000 });
      return;
    }

    try {
      if (audioRef.current) {
        audioRef.current.pause();
        setIsPlayingMusic(false);
      }
      if (sampleAudioRef.current) {
        sampleAudioRef.current.pause();
        setIsPlayingSampleBlessing(false);
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];

      let options: MediaRecorderOptions = {};
      if (typeof MediaRecorder !== "undefined") {
        if (MediaRecorder.isTypeSupported("audio/webm;codecs=opus")) {
          options = { mimeType: "audio/webm;codecs=opus" };
        } else if (MediaRecorder.isTypeSupported("audio/webm")) {
          options = { mimeType: "audio/webm" };
        } else if (MediaRecorder.isTypeSupported("audio/mp4")) {
          options = { mimeType: "audio/mp4" };
        } else if (MediaRecorder.isTypeSupported("audio/aac")) {
          options = { mimeType: "audio/aac" };
        }
      }

      const recorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        const mimeType = recorder.mimeType || options.mimeType || "audio/webm";
        const blob = new Blob(audioChunksRef.current, { type: mimeType });
        setVoiceAudioBlob(blob);
        const previewUrl = URL.createObjectURL(blob);
        setVoiceAudioPreviewUrl(previewUrl);
        stream.getTracks().forEach((track) => track.stop());
      };

      recorder.start(250);
      setIsRecordingVoice(true);
      setVoiceDuration(0);

      if (voiceTimerRef.current) clearInterval(voiceTimerRef.current);
      voiceTimerRef.current = setInterval(() => {
        setVoiceDuration((prev) => {
          if (prev >= 60) {
            stopVoiceRecording();
            return 60;
          }
          return prev + 1;
        });
      }, 1000);
    } catch (err: any) {
      if (err?.name === "NotAllowedError" || err?.name === "PermissionDeniedError") {
        toast.error("Microphone access was blocked. Please allow microphone access in your browser address bar (lock/mic icon), or click 'Upload Audio File' below to attach a voice greeting.", { duration: 6000 });
      } else if (err?.name === "NotFoundError" || err?.name === "DevicesNotFoundError") {
        toast.error("No microphone detected. Please connect a microphone or use 'Upload Audio File' below.", { duration: 5000 });
      } else {
        toast.error("Could not start recording. Please use 'Upload Audio File' below instead.");
      }
    }
  };

  const stopVoiceRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    setIsRecordingVoice(false);
    if (voiceTimerRef.current) {
      clearInterval(voiceTimerRef.current);
      voiceTimerRef.current = null;
    }
  };

  const discardVoiceRecording = () => {
    stopVoiceRecording();
    setVoiceAudioBlob(null);
    if (voiceAudioPreviewUrl) {
      URL.revokeObjectURL(voiceAudioPreviewUrl);
      setVoiceAudioPreviewUrl(null);
    }
    setVoiceDuration(0);
  };

  const uploadVoiceGreeting = async () => {
    if (!voiceAudioBlob) return;

    // If on Classic Plan, show Royal Upgrade experience
    if (flowData.selectedPlan !== "royal") {
      setShowVoiceRoyalModal(true);
      return;
    }

    try {
      setIsUploadingVoice(true);
      const mimeType = voiceAudioBlob.type || "audio/webm";
      const ext = mimeType.includes("mp4") ? "mp4" : mimeType.includes("aac") ? "aac" : mimeType.includes("mp3") ? "mp3" : "webm";
      const formData = new FormData();
      formData.append("file", voiceAudioBlob, `voice-greeting-${Date.now()}.${ext}`);

      const res = await fetch("/api/upload/audio", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.url) {
        throw new Error(data.error || "Failed to upload audio greeting");
      }

      onUpdateData({
        voiceNoteUrl: data.url,
        voiceNoteTitle: flowData.voiceNoteTitle || "Personal Audio Greeting",
        voiceNoteSender: flowData.voiceNoteSender || (isWedding ? "From Bride & Groom" : "From the Hosts"),
      });

      discardVoiceRecording();
      toast.success("🎙️ Personal Voice Greeting saved successfully to your Royal invitation!");
    } catch (err: any) {
      toast.error(err?.message || "Failed to upload audio greeting.");
    } finally {
      setIsUploadingVoice(false);
    }
  };

  const confirmRoyalVoiceUpgrade = async () => {
    onUpdateData({ selectedPlan: "royal" });
    setShowVoiceRoyalModal(false);

    if (voiceAudioBlob) {
      try {
        setIsUploadingVoice(true);
        const mimeType = voiceAudioBlob.type || "audio/webm";
        const ext = mimeType.includes("mp4") ? "mp4" : mimeType.includes("aac") ? "aac" : mimeType.includes("mp3") ? "mp3" : "webm";
        const formData = new FormData();
        formData.append("file", voiceAudioBlob, `voice-greeting-${Date.now()}.${ext}`);

        const res = await fetch("/api/upload/audio", {
          method: "POST",
          body: formData,
        });

        const data = await res.json();
        if (!res.ok || !data.url) {
          throw new Error(data.error || "Failed to upload audio greeting");
        }

        onUpdateData({
          selectedPlan: "royal",
          voiceNoteUrl: data.url,
          voiceNoteTitle: flowData.voiceNoteTitle || "Personal Audio Greeting",
          voiceNoteSender: flowData.voiceNoteSender || (isWedding ? "From Bride & Groom" : "From the Hosts"),
        });

        discardVoiceRecording();
        toast.success("👑 Upgraded to Royal Plan! Personal Voice Greeting attached to your invitation.");
      } catch (err: any) {
        toast.error(err?.message || "Failed to upload audio greeting.");
      } finally {
        setIsUploadingVoice(false);
      }
    } else {
      toast.success("👑 Switched to Royal Plan! Feature unlocked.");
    }
  };

  const handleVoiceFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Audio file must be under 5MB.");
      return;
    }

    // If on Classic Plan, create preview and trigger Royal modal
    if (flowData.selectedPlan !== "royal") {
      const localPreviewUrl = URL.createObjectURL(file);
      setVoiceAudioPreviewUrl(localPreviewUrl);
      setVoiceAudioBlob(file);
      setVoiceDuration(0);
      setShowVoiceRoyalModal(true);
      if (voiceFileInputRef.current) voiceFileInputRef.current.value = "";
      return;
    }

    try {
      setIsUploadingVoice(true);
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload/audio", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.url) {
        throw new Error(data.error || "Failed to upload audio file");
      }

      onUpdateData({
        voiceNoteUrl: data.url,
        voiceNoteTitle: file.name.replace(/\.[^/.]+$/, ""),
        voiceNoteSender: flowData.voiceNoteSender || (isWedding ? "From Bride & Groom" : "From the Hosts"),
      });

      toast.success("🎙️ Personal Voice Greeting uploaded successfully!");
    } catch (err: any) {
      toast.error(err?.message || "Failed to upload audio file.");
    } finally {
      setIsUploadingVoice(false);
      if (voiceFileInputRef.current) voiceFileInputRef.current.value = "";
    }
  };

  // Auto-save draft function to sync with Supabase and local store
  const autoSaveDraft = async (stepToSave?: number, showToast = true, overrideData?: Partial<FlowData>) => {
    const mergedData = { ...flowData, ...overrideData };
    const nextStep = stepToSave || currentStep;
    onUpdateData({ currentStep: nextStep, lastSavedStep: Math.max(mergedData.lastSavedStep || 1, nextStep), ...overrideData });

    try {
      setIsAutoSaving(true);
      const targetId = mergedData.invitationId;
      const url = targetId ? `/api/invitations/${targetId}` : "/api/invitations";
      const method = targetId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          templateId: mergedData.selectedTemplateId || "emerald-noir",
          plan: mergedData.selectedPlan || "classic",
          category: mergedData.category || category,
          partner1Name: mergedData.partner1Name,
          partner2Name: mergedData.partner2Name.trim() || (isBirthday ? "Birthday Celebration" : isSchool ? "Class Celebration" : isMeeting ? "Executive Event" : ""),
          venue: mergedData.venue,
          venueAddress: mergedData.venueAddress,
          welcomeMessage: mergedData.welcomeMessage,
          backgroundMusic: mergedData.backgroundMusic,
          dressCodeWomen: mergedData.dressCodeWomen,
          dressCodeMen: mergedData.dressCodeMen,
          transportation: mergedData.transportation,
          accommodation: mergedData.accommodation,
          gifts: mergedData.gifts,
          heroImageUrl: mergedData.heroImage,
          slideshowImageUrls: mergedData.slideshowImages,
          events: mergedData.events,
          isActive: mergedData.paymentDone ?? false,
          showBismillah: mergedData.showBismillah,
          showQuranVerse: mergedData.showQuranVerse,
          customVerseText: mergedData.customVerseText || undefined,
          customVerseSource: mergedData.customVerseSource || undefined,
          youtubeVideoId: mergedData.youtubeVideoId,
          slug: mergedData.slug || undefined,
          primaryHostFamily: mergedData.primaryHostFamily,
          secondaryHostFamily: mergedData.secondaryHostFamily,
          primaryHostCity: mergedData.primaryHostCity,
          secondaryHostCity: mergedData.secondaryHostCity,
          contactPhone: mergedData.contactPhone,
          isSegregated: mergedData.isSegregated ?? false,
          venueDetailsSegregated: mergedData.venueDetailsSegregated,
          showNikahRegistration: mergedData.showNikahRegistration ?? false,
          showCrowdPhotoWall: mergedData.showCrowdPhotoWall ?? true,
          hideDigitalShagun: mergedData.hideDigitalShagun ?? false,
          voiceNoteUrl: mergedData.voiceNoteUrl || null,
          voiceNoteTitle: mergedData.voiceNoteTitle || null,
          voiceNoteSender: mergedData.voiceNoteSender || null,
          agencyPhone: mergedData.agencyPhone || null,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        // POST returns { invitationId: ... }, PUT returns { invitation: { id: ... } }
        const newId = data.invitationId || data.invitation?.id;
        if (!targetId && newId) {
          onUpdateData({ invitationId: newId });
        }
        if (showToast) {
          toast.success("Progress saved as draft", { duration: 1500 });
        }
      }
    } catch {
      // Local state is already stored via zustand localStorage
    } finally {
      setIsAutoSaving(false);
    }
  };

  const goToStep = async (step: number) => {
    if (step > currentStep && !validateStep(currentStep)) return;
    setCurrentStep(step);
    onUpdateData({ currentStep: step, lastSavedStep: Math.max(flowData.lastSavedStep || 1, step) });
    window.scrollTo({ top: 0, behavior: "smooth" });
    await autoSaveDraft(step, false);
  };

  const handleAudioUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Audio file must be under 5MB for fast mobile loading.");
      return;
    }

    setIsUploadingAudio(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload/audio", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to upload audio");

      onUpdateData({
        backgroundMusic: data.url,
        customMusicUrl: data.url,
        customMusicName: data.filename || file.name,
      });
      toast.success("Custom audio uploaded successfully!");

      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      const previewAudio = new Audio(data.url);
      previewAudio.volume = 0.4;
      previewAudio.play().catch(() => {});
      audioRef.current = previewAudio;
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Audio upload failed");
    } finally {
      setIsUploadingAudio(false);
    }
  };

  // Auto-generate slug from partner names if it's not manually edited
  useEffect(() => {
    if (!isEdit && !slugManuallyEdited && (flowData.partner1Name || flowData.partner2Name)) {
      const p1 = flowData.partner1Name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const p2 = flowData.partner2Name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const autoSlug = [p1, p2].filter(Boolean).join('-');
      if (autoSlug !== flowData.slug) {
        onUpdateData({ slug: autoSlug });
      }
    }
  }, [flowData.partner1Name, flowData.partner2Name, flowData.slug, isEdit, slugManuallyEdited, onUpdateData]);

  // Debounced check for slug availability
  useEffect(() => {
    const currentSlug = flowData.slug;
    if (!currentSlug) {
      setSlugAvailable(null);
      return;
    }

    const checkSlug = async () => {
      setIsCheckingSlug(true);
      try {
        const excludeParam = isEdit && flowData.invitationId ? `&excludeId=${flowData.invitationId}` : '';
        const res = await fetch(`/api/invitations/check-slug?slug=${encodeURIComponent(currentSlug)}${excludeParam}`);
        if (res.ok) {
          const data = await res.json();
          setSlugAvailable(data.available);
          
          if (!data.available) {
            setErrors(prev => ({ ...prev, slug: "This link is already taken" }));
          } else {
            setErrors(prev => {
              const newErrors = { ...prev };
              delete newErrors.slug;
              return newErrors;
            });
          }
        }
      } catch (err) {
        console.error("Failed to check slug availability", err);
      } finally {
        setIsCheckingSlug(false);
      }
    };

    const timeoutId = setTimeout(checkSlug, 500);
    return () => clearTimeout(timeoutId);
  }, [flowData.slug, isEdit, flowData.invitationId]);

  // Play/pause toggle audio preview on selection
  const handleMusicSelection = (trackId: string) => {
    // If selecting "no-music"
    if (trackId === "no-music") {
      onUpdateData({ backgroundMusic: "no-music" });
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      setIsPlayingMusic(false);
      setPlayingTrackId(null);
      toast.info("🔇 Music turned off for invitation");
      return;
    }

    // Always update the selected background music in form data
    onUpdateData({ backgroundMusic: trackId });

    // If this track is ALREADY playing, clicking it again pauses it!
    if (isPlayingMusic && playingTrackId === trackId) {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      setIsPlayingMusic(false);
      return;
    }

    // If a different track or audio is currently playing, stop it first
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    // Stop sample blessing if it was playing
    if (sampleAudioRef.current) {
      sampleAudioRef.current.pause();
      setIsPlayingSampleBlessing(false);
    }

    try {
      const audio = new Audio(`/music/${trackId}.mp3`);
      audio.volume = 0.45;
      audioRef.current = audio;

      audio.onplay = () => {
        setIsPlayingMusic(true);
        setPlayingTrackId(trackId);
      };

      audio.onpause = () => {
        setIsPlayingMusic(false);
      };

      audio.onended = () => {
        setIsPlayingMusic(false);
        setPlayingTrackId(null);
      };

      audio.onerror = () => {
        setIsPlayingMusic(false);
        setPlayingTrackId(null);
        toast.info(
          `Selected "${trackId}"! Add "${trackId}.mp3" into public/music/ to hear audio preview.`,
          { duration: 4000 }
        );
      };

      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlayingMusic(true);
            setPlayingTrackId(trackId);
          })
          .catch((err) => {
            console.warn("Audio autoplay blocked or file missing:", err);
            setIsPlayingMusic(false);
            setPlayingTrackId(null);
          });
      }
    } catch (err) {
      console.error("Audio preview failed:", err);
      setIsPlayingMusic(false);
      setPlayingTrackId(null);
    }
  };

  // Stop audio when component unmounts
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Parse address and map URL from venueAddress
  const [addressPart, mapsUrlPart] = (flowData.venueAddress || "").split("|||");
  const [addressText, setAddressText] = useState(addressPart || "");
  const [mapsUrl, setMapsUrl] = useState(mapsUrlPart || "");

  const updateAddressAndMap = (newAddress: string, newMapsUrl: string) => {
    const combined = newMapsUrl.trim() ? `${newAddress.trim()}|||${newMapsUrl.trim()}` : newAddress.trim();
    onUpdateData({ venueAddress: combined });
  };

  const validateStep = (step: number) => {
    const newErrors: Record<string, string> = {};
    if (step === 1) {
      if (!flowData.partner1Name.trim()) {
        newErrors.partner1Name = isWedding
          ? "Partner 1 name is required"
          : isBirthday
          ? "Celebrant name is required"
          : "Host or Institution name is required";
      }
      if (isWedding && !flowData.partner2Name.trim()) {
        newErrors.partner2Name = "Partner 2 name is required";
      }
      if (flowData.slug && slugAvailable === false) newErrors.slug = "This link is already taken";
    } else if (step === 2) {
      if (!flowData.venue.trim()) newErrors.venue = "Venue name is required";
      const eventWithNameButNoDate = flowData.events.find(e => e.name.trim() && !e.date.trim());
      if (eventWithNameButNoDate) {
        newErrors.events = `Please add a date for "${eventWithNameButNoDate.name}"`;
      }
      if (flowData.venueAddress && flowData.venueAddress.includes('|||')) {
        const mapsUrl = flowData.venueAddress.split('|||')[1]?.trim();
        if (mapsUrl && !mapsUrl.startsWith('https://maps.') && !mapsUrl.startsWith('https://goo.gl/') && !mapsUrl.startsWith('https://maps.app.goo.gl/') && !mapsUrl.includes('google.com/maps/')) {
          newErrors.mapsUrl = 'Please enter a valid Google Maps URL (e.g. https://maps.app.goo.gl/...)';
        }
      }
    }
    setErrors(newErrors);
    
    const keys = Object.keys(newErrors);
    if (keys.length > 0) {
      setTimeout(() => {
        const firstErrorId = `field-${keys[0]}`;
        const el = document.getElementById(firstErrorId);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 50);
      return false;
    }
    return true;
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!flowData.partner1Name.trim()) newErrors.partner1Name = "Name is required";
    if (isWedding && !flowData.partner2Name.trim()) newErrors.partner2Name = "Name is required";
    if (flowData.slug && slugAvailable === false) newErrors.slug = "This link is already taken";
    if (!flowData.venue.trim()) newErrors.venue = "Venue is required";

    const eventWithNameButNoDate = flowData.events.find(e => e.name.trim() && !e.date.trim());
    if (eventWithNameButNoDate) {
      newErrors.events = `Please add a date for "${eventWithNameButNoDate.name}"`;
    }

    if (flowData.venueAddress && flowData.venueAddress.includes('|||')) {
      const mapsUrl = flowData.venueAddress.split('|||')[1]?.trim();
      if (mapsUrl && !mapsUrl.startsWith('https://maps.') && !mapsUrl.startsWith('https://goo.gl/') && !mapsUrl.startsWith('https://maps.app.goo.gl/') && !mapsUrl.includes('google.com/maps/')) {
        newErrors.mapsUrl = 'Please enter a valid Google Maps URL (e.g. https://maps.app.goo.gl/...)';
      }
    }

    setErrors(newErrors);
    
    const keys = Object.keys(newErrors);
    if (keys.length > 0) {
      const firstError = keys[0];
      
      // Determine which step the error belongs to so we can navigate there
      let errorStep = currentStep;
      if (['partner1Name', 'partner2Name', 'slug'].includes(firstError)) {
        errorStep = 1;
      } else if (['venue', 'events', 'mapsUrl'].includes(firstError)) {
        errorStep = 2;
      }

      if (errorStep !== currentStep) {
        setCurrentStep(errorStep);
      }

      setTimeout(() => {
        const firstErrorId = `field-${firstError}`;
        const el = document.getElementById(firstErrorId);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
      return false;
    }
    
    return true;
  };

  const handleSubmit = async () => {
    if (!validate()) {
      toast.error("Please fix the errors in the form before saving.");
      return;
    }
    setIsSaving(true);

    try {
      // Save invitation to Supabase (PUT for editing existing, POST for new)
      const url = isEdit ? `/api/invitations/${flowData.invitationId}` : "/api/invitations";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          templateId: flowData.selectedTemplateId,
          plan: flowData.selectedPlan,
          partner1Name: flowData.partner1Name,
          partner2Name: flowData.partner2Name.trim() || (isBirthday ? "Birthday Celebration" : isSchool ? "Class Celebration" : isMeeting ? "Executive Event" : ""),
          venue: flowData.venue,
          venueAddress: flowData.venueAddress,
          welcomeMessage: flowData.welcomeMessage,
          backgroundMusic: flowData.backgroundMusic,
          dressCodeWomen: flowData.dressCodeWomen,
          dressCodeMen: flowData.dressCodeMen,
          transportation: flowData.transportation,
          accommodation: flowData.accommodation,
          gifts: flowData.gifts,
          heroImageUrl: flowData.heroImage,
          slideshowImageUrls: flowData.slideshowImages,
          events: flowData.events,
          isActive: flowData.paymentDone,
          showBismillah: flowData.showBismillah,
          showQuranVerse: flowData.showQuranVerse,
          customVerseText: flowData.customVerseText || undefined,
          customVerseSource: flowData.customVerseSource || undefined,
          youtubeVideoId: flowData.youtubeVideoId,
          slug: flowData.slug || undefined,
          primaryHostFamily: flowData.primaryHostFamily,
          secondaryHostFamily: flowData.secondaryHostFamily,
          primaryHostCity: flowData.primaryHostCity,
          secondaryHostCity: flowData.secondaryHostCity,
          contactPhone: flowData.contactPhone,
          isSegregated: flowData.isSegregated ?? false,
          venueDetailsSegregated: flowData.venueDetailsSegregated,
          showNikahRegistration: flowData.showNikahRegistration ?? false,
          showCrowdPhotoWall: flowData.showCrowdPhotoWall ?? true,
          hideDigitalShagun: flowData.hideDigitalShagun ?? false,
          voiceNoteUrl: flowData.voiceNoteUrl || null,
          voiceNoteTitle: flowData.voiceNoteTitle || null,
          voiceNoteSender: flowData.voiceNoteSender || null,
          agencyPhone: flowData.agencyPhone || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        // If user is not authenticated (e.g. demo mode), continue anyway
        if (res.status === 401) {
          sessionStorage.setItem('smartinvites_draft', JSON.stringify(flowData))
          toast.error("Please sign in. Your progress has been saved.")
          if (onRequireLogin) {
            onRequireLogin();
          } else {
            onContinue();
          }
          return;
        }
        toast.error(data.error || "Failed to save invitation details.");
        return;
      }

      const data = await res.json();
      if (!isEdit && data.invitationId) {
        onUpdateData({ invitationId: data.invitationId });
      }
      onContinue();
    } catch (err) {
      console.error("Details save error:", err);
      setIsSaving(false);
      toast.error("Network error — please check your connection and try again.");
      return;
    }
  };

  const updateEvent = (index: number, field: string, value: string) => {
    const updated = [...flowData.events];
    updated[index] = { ...updated[index], [field]: value };
    onUpdateData({ events: updated });
  };

  const addEvent = () => {
    onUpdateData({ events: [...flowData.events, { id: crypto.randomUUID(), name: "", date: "", time: "" }] });
  };

  const removeEvent = (index: number) => {
    onUpdateData({ events: flowData.events.filter((_, i) => i !== index) });
  };

  /** Build/update the gifts string from structured fields */
  const updateGiftsField = (field: 'bankName' | 'accountTitle' | 'accountNumber' | 'iban' | 'raastId' | 'easyPaisa' | 'jazzCash', value: string) => {
    const raw = flowData.gifts || '';
    // Extract current blessing (first sentence/clause)
    const blessingMatch = raw.match(/^(.*?)(?:\.\s*For\s+Shagun|,\s*For\s+Shagun|$)/i);
    const blessing = blessingMatch?.[1]?.trim() || '';

    // Extract current structured values
    const get = (pattern: RegExp) => { const m = raw.match(pattern); return m?.[1]?.trim() || ''; };
    const fields = {
      bankName:      field === 'bankName'      ? value : get(/(?:Bank\s*(?:Name)?|Bank)\s*[:\-\s]+\s*([a-zA-Z\s.]+?)(?:,|\n|Account|Title|IBAN|$)/i),
      accountTitle:  field === 'accountTitle'  ? value : get(/(?:Account\s*Title|Acc\s*Title|Title)\s*[:\-\s]+\s*([a-zA-Z\s.()]+?)(?:,|Account|IBAN|Raast|$)/i),
      accountNumber: field === 'accountNumber' ? value : get(/(?:Account\s*(?:Number|No\.?)|Acc\s*(?:Number|No\.?))\s*[:\-\s]+\s*([0-9\-]+)/i),
      iban:          field === 'iban'          ? value : (() => { const m = raw.match(/IBAN\s*[:\-\s]+\s*([A-Z]{2}[0-9]{2}[A-Z0-9\s]{16,30})/i); return m?.[1]?.replace(/\s+/g,'').trim() || ''; })(),
      raastId:       field === 'raastId'       ? value : get(/(?:Raast\s*(?:ID)?|Raast)\s*[:\-\s]+\s*([0-9+]+)/i),
      easyPaisa:     field === 'easyPaisa'     ? value : get(/(?:EasyPaisa|Easy\s*Paisa)\s*[:\-\s]+\s*([0-9+]+)/i),
      jazzCash:      field === 'jazzCash'      ? value : get(/(?:JazzCash|Jazz\s*Cash)\s*[:\-\s]+\s*([0-9+]+)/i),
    };

    // Build banking details string in parseGiftDetails-compatible format
    const parts: string[] = [];
    if (fields.bankName)      parts.push(`Bank: ${fields.bankName}`);
    if (fields.accountTitle)  parts.push(`Title: ${fields.accountTitle}`);
    if (fields.accountNumber) parts.push(`Account Number: ${fields.accountNumber}`);
    if (fields.iban)          parts.push(`IBAN: ${fields.iban}`);
    if (fields.raastId)       parts.push(`Raast ID: ${fields.raastId}`);
    if (fields.easyPaisa)     parts.push(`EasyPaisa: ${fields.easyPaisa}`);
    if (fields.jazzCash)      parts.push(`JazzCash: ${fields.jazzCash}`);

    const bankDetails = parts.length > 0 ? `. For Shagun, you may transfer to ${parts.join(', ')}` : '';
    onUpdateData({ gifts: blessing + bankDetails });
  };

  /** Upload files to Supabase Storage via /api/upload */
  const uploadFiles = async (files: File[]): Promise<string[]> => {
    const validFiles = (files || []).filter(f => f && f.size > 0);
    if (validFiles.length === 0) {
      throw new Error("Please select a valid image file");
    }

    const formData = new FormData();
    validFiles.forEach((f) => formData.append("files", f, f.name));

    const res = await fetch("/api/upload", { method: "POST", body: formData });
    const data = await res.json().catch(() => ({ error: "Upload response error" }));
    if (!res.ok) {
      throw new Error(data.error || `Upload failed with status ${res.status}`);
    }
    return (data.urls || []) as string[];
  };

  const handleFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "hero" | "slideshow"
  ) => {
    // Snapshot the files array BEFORE resetting e.target.value
    const fileList = Array.from(e.target.files || []).filter(f => f && f.size > 0);
    e.target.value = ""; // Clear input value so selecting the same file again works
    if (fileList.length === 0) return;

    setIsUploading(true);
    try {
      if (type === "hero" && fileList[0]) {
        const heroFile = fileList[0];
        // Show local preview immediately for UX
        const localUrl = URL.createObjectURL(heroFile);
        onUpdateData({ heroImage: localUrl });

        // Upload to Supabase Storage
        const urls = await uploadFiles([heroFile]);
        URL.revokeObjectURL(localUrl); // Revoke temporary object URL
        if (urls && urls[0]) {
          onUpdateData({ heroImage: urls[0] });
          toast.success("Hero image uploaded successfully!");
        }
      } else if (type === "slideshow") {
        const available = Math.max(0, 4 - flowData.slideshowImages.length);
        const toUpload = fileList.slice(0, available);
        if (toUpload.length === 0) {
          toast.info("Maximum 4 slideshow photos reached.");
          return;
        }

        // Show local previews immediately
        const localUrls = toUpload.map((f) => URL.createObjectURL(f));
        onUpdateData({ slideshowImages: [...flowData.slideshowImages, ...localUrls] });

        // Upload to Supabase Storage
        const remoteUrls = await uploadFiles(toUpload);

        // Replace local preview URLs with remote ones and revoke local
        localUrls.forEach((u) => URL.revokeObjectURL(u));
        const existing = flowData.slideshowImages.filter((u) => !localUrls.includes(u));
        onUpdateData({ slideshowImages: [...existing, ...remoteUrls] });
        toast.success(`${remoteUrls.length} photo(s) uploaded successfully!`);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Upload failed";
      toast.error(msg);
    } finally {
      setIsUploading(false);
    }
  };

  const removeSlideshowImage = (index: number) => {
    const updated = flowData.slideshowImages.filter((_, i) => i !== index);
    onUpdateData({ slideshowImages: updated });
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header with progress */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Button
              variant="ghost"
              onClick={onBack}
              className="gap-2 text-foreground/70 hover:text-foreground"
              disabled={isSaving}
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Back</span>
            </Button>

            <div className="flex items-center gap-1.5">
              <StepDot done label="Template" stepNumber={1} />
              <StepLine active />
              <StepDot done label="Account" stepNumber={2} />
              <StepLine active />
              <StepDot current label="Details" stepNumber={3} />
              <StepLine />
              <StepDot label="Payment" stepNumber={4} />
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => autoSaveDraft(currentStep, true)}
                disabled={isSaving || isAutoSaving}
                className="h-8 px-3 text-xs border-gold/40 text-primary hover:bg-primary/10 font-semibold gap-1.5 shadow-sm"
              >
                {isAutoSaving ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Check className="w-3.5 h-3.5 text-foreground" />
                )}
                <span className="hidden sm:inline">Save Draft</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Breadcrumb path — adapts for new vs edit mode */}
      <PageBreadcrumb crumbs={crumbs} />

      <main id="main-content" className="flex-1 px-4 py-6 sm:py-10 pb-16 sm:pb-10">
        <m.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-7xl"
        >
          {/* Header Title & Subtitle */}
          <div className="text-center mb-8 max-w-2xl mx-auto space-y-2">
            <h1 className="font-display text-2xl sm:text-4xl font-extrabold text-foreground">
              Fill Your Details
            </h1>
            <p className="text-slate-200 text-xs sm:text-sm font-medium">
              Enter your event details — your progress is automatically saved at each step.
            </p>
            {errors.events && <p className="text-sm text-red-500 font-semibold">{errors.events}</p>}
          </div>

          {/* 4-Step Wizard Nav Pills with Corner Scroll Arrows */}
          <div className="max-w-4xl mx-auto mb-8 px-1">
            <ScrollableMenu
              variant="gold"
              scrollDistance={180}
              className="bg-card/80 border border-border/60 rounded-2xl p-1.5 backdrop-blur-md shadow-lg"
              contentClassName="justify-between gap-1 sm:gap-2 px-1"
            >
              {[
                { step: 1, fullLabel: "1. Couple & Host", shortLabel: "1. Couple", icon: Heart },
                { step: 2, fullLabel: "2. Events & Venue", shortLabel: "2. Events", icon: MapPin },
                { step: 3, fullLabel: "3. Media & Music", shortLabel: "3. Media", icon: Music },
                { step: 4, fullLabel: "4. Details & Shagun", shortLabel: "4. Details", icon: Gift },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = currentStep === tab.step;
                return (
                  <button
                    key={tab.step}
                    onClick={() => goToStep(tab.step)}
                    className={`flex-1 min-w-[110px] sm:min-w-0 flex items-center justify-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs whitespace-nowrap transition-all duration-200 cursor-pointer ${
                      isActive
                        ? "bg-primary text-slate-950 font-black shadow-md shadow-primary/30 ring-1 ring-gold/40"
                        : "text-slate-200 hover:text-white hover:bg-muted/60 font-semibold"
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? "text-slate-950 stroke-[2.5]" : "text-slate-300"}`} />
                    <span className="hidden sm:inline">{tab.fullLabel}</span>
                    <span className="sm:hidden">{tab.shortLabel}</span>
                  </button>
                );
              })}
            </ScrollableMenu>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Column: 4-Step Form Wizard */}
            <div className="lg:col-span-7 space-y-6 pb-24 lg:pb-0">

              {/* STEP 1: Couple & Host Information */}
              {currentStep === 1 && (
                <m.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  {/* Celebrant / Couple / Host Information */}
                  <section className="p-6 rounded-3xl bg-card/70 border border-border/60 shadow-xl backdrop-blur-xl space-y-4">
                    <div className="flex items-center gap-2.5 mb-1">
                      <div className="w-8 h-8 rounded-xl bg-primary/15 border border-gold/30 flex items-center justify-center text-primary">
                        {isBirthday ? (
                          <Cake className="w-4 h-4" />
                        ) : isSchool ? (
                          <GraduationCap className="w-4 h-4" />
                        ) : isMeeting ? (
                          <Briefcase className="w-4 h-4" />
                        ) : (
                          <Heart className="w-4 h-4" />
                        )}
                      </div>
                      <h2 className="font-display text-lg font-bold text-foreground">
                        {isBirthday
                          ? "Birthday Celebrant & Milestone"
                          : isSchool
                          ? "Institution & Event Title"
                          : isMeeting
                          ? "Organization & Summit Details"
                          : "Couple Names"}
                      </h2>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5" id="field-partner1Name">
                        <label className="text-xs font-bold tracking-wider text-slate-200 uppercase">
                          {isBirthday
                            ? "Birthday Celebrant"
                            : isSchool
                            ? "Institution / Class / Dept"
                            : isMeeting
                            ? "Company / Organization"
                            : "Partner 1 Name (Bride/Groom)"}
                        </label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                          <Input
                            value={flowData.partner1Name}
                            onChange={(e) => onUpdateData({ partner1Name: e.target.value })}
                            placeholder={
                              isBirthday
                                ? "e.g. Zara Khan"
                                : isSchool
                                ? "e.g. Stanford University / Class of '27"
                                : isMeeting
                                ? "e.g. TechCorp Innovations"
                                : "e.g. Ahmed"
                            }
                            className={`pl-10 h-11 bg-background/80 placeholder:text-slate-400 text-foreground ${errors.partner1Name ? "border-red-400" : ""}`}
                          />
                        </div>
                        {errors.partner1Name && <p className="text-xs text-red-500">{errors.partner1Name}</p>}
                      </div>
                      <div className="space-y-1.5" id="field-partner2Name">
                        <label className="text-xs font-bold tracking-wider text-slate-200 uppercase">
                          {isBirthday
                            ? "Occasion / Milestone"
                            : isSchool
                            ? "Event Title (e.g. Annual Gala)"
                            : isMeeting
                            ? "Event / Keynote Title"
                            : "Partner 2 Name (Bride/Groom)"}
                        </label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                          <Input
                            value={flowData.partner2Name}
                            onChange={(e) => onUpdateData({ partner2Name: e.target.value })}
                            placeholder={
                              isBirthday
                                ? "e.g. 21st Birthday Bash"
                                : isSchool
                                ? "e.g. Commencement & Alumni Dinner"
                                : isMeeting
                                ? "e.g. Global Tech Summit 2027"
                                : "e.g. Fatima"
                            }
                            className={`pl-10 h-11 bg-background/80 placeholder:text-slate-400 text-foreground ${errors.partner2Name ? "border-red-400" : ""}`}
                          />
                        </div>
                        {errors.partner2Name && <p className="text-xs text-red-500">{errors.partner2Name}</p>}
                      </div>
                    </div>
                  </section>

                  {/* Host Families */}
                  <section className="p-6 rounded-3xl bg-card/70 border border-border/60 shadow-xl backdrop-blur-xl space-y-4">
                    <div className="flex items-center gap-2.5 mb-1">
                      <div className="w-8 h-8 rounded-xl bg-primary/15 border border-gold/30 flex items-center justify-center text-primary">
                        <User className="w-4 h-4" />
                      </div>
                      <h2 className="font-display text-lg font-bold text-foreground">
  {isBirthday
    ? "Hosts & Organizers (Optional)"
    : isSchool
    ? "Organizing Committee / Faculty (Optional)"
    : isMeeting
    ? "Executive Hosts / Sponsors (Optional)"
    : "Host Families (Optional)"}
</h2>
                    </div>
                    <p className="text-xs text-slate-300 font-medium">
                      Please enter the names of the primary and secondary hosts for this event.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold tracking-wider text-slate-200 uppercase">
                          Partner 1 Family / Parents
                        </label>
                        <Input
                          value={flowData.primaryHostFamily || ""}
                          onChange={(e) => onUpdateData({ primaryHostFamily: e.target.value })}
                          placeholder="e.g. Mr. & Mrs. Tariq Hussain"
                          className="h-11 bg-background/80 placeholder:text-slate-400 text-foreground"
                        />
                        <Input
                          value={flowData.primaryHostCity || ""}
                          onChange={(e) => onUpdateData({ primaryHostCity: e.target.value })}
                          placeholder="City (e.g. from Lahore)"
                          className="h-11 mt-2 text-xs bg-background/80 placeholder:text-slate-400 text-foreground"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold tracking-wider text-slate-200 uppercase">
                          Partner 2 Family / Parents
                        </label>
                        <Input
                          value={flowData.secondaryHostFamily || ""}
                          onChange={(e) => onUpdateData({ secondaryHostFamily: e.target.value })}
                          placeholder="e.g. Mr. & Mrs. Imran Sheikh"
                          className="h-11 bg-background/80 placeholder:text-slate-400 text-foreground"
                        />
                        <Input
                          value={flowData.secondaryHostCity || ""}
                          onChange={(e) => onUpdateData({ secondaryHostCity: e.target.value })}
                          placeholder="City (e.g. from Karachi)"
                          className="h-11 mt-2 text-xs bg-background/80 placeholder:text-slate-400 text-foreground"
                        />
                      </div>
                    </div>
                  </section>

                  {/* Custom Invitation Link */}
                  <section className="p-6 rounded-3xl bg-card/70 border border-border/60 shadow-xl backdrop-blur-xl space-y-4">
                    <div className="flex items-center gap-2.5 mb-1">
                      <div className="w-8 h-8 rounded-xl bg-primary/15 border border-gold/30 flex items-center justify-center text-primary">
                        <Globe className="w-4 h-4" />
                      </div>
                      <h2 className="font-display text-lg font-bold text-foreground">Custom Invitation Link</h2>
                    </div>
                    <div className="space-y-1.5" id="field-slug">
                      <label className="text-xs font-bold tracking-wider text-slate-200 uppercase">
                        Personalized Web Link Slug
                      </label>
                      <div className="relative flex items-center">
                        <span className="inline-flex items-center px-3 rounded-l-xl border border-r-0 border-border bg-muted text-slate-200 font-medium text-xs h-11">
                          smartinvites.com.pk/inv/
                        </span>
                        <div className="relative flex-1">
                          <Input
                            value={flowData.slug || ""}
                            onChange={(e) => {
                              setSlugManuallyEdited(true);
                              const cleanVal = e.target.value
                                .toLowerCase()
                                .replace(/\s+/g, "-")
                                .replace(/[^a-z0-9\-_]/g, "");
                              onUpdateData({ slug: cleanVal });
                            }}
                            placeholder={isBirthday ? "e.g. zaras-21st" : isSchool ? "e.g. class-of-2027-gala" : isMeeting ? "e.g. tech-summit-2027" : "e.g. ahmed-fatima-2026"}
                            className={`rounded-l-none h-11 bg-background/80 pr-10 ${errors.slug ? "border-red-400" : (slugAvailable ? "border-emerald/50" : "")}`}
                          />
                          <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            {isCheckingSlug ? (
                              <Loader2 className="w-4 h-4 text-muted-foreground animate-spin" />
                            ) : flowData.slug && slugAvailable ? (
                              <Check className="w-4 h-4 text-foreground" />
                            ) : flowData.slug && slugAvailable === false ? (
                              <X className="w-4 h-4 text-red-500" />
                            ) : null}
                          </div>
                        </div>
                      </div>
                      {errors.slug && <p className="text-xs text-red-500">{errors.slug}</p>}
                      {slugAvailable && flowData.slug && !errors.slug && (
                        <p className="text-xs text-foreground font-medium flex items-center gap-1">
                          <Check className="w-3 h-3" /> Link is available!
                        </p>
                      )}
                    </div>
                  </section>

                  {/* Cultural & Religious Features Toggles (Tailored by Event Type) */}
                  {isWedding ? (
                    <section className="p-6 rounded-3xl bg-card/70 border border-border/60 shadow-xl backdrop-blur-xl space-y-4">
                      <button
                        type="button"
                        role="switch"
                        aria-checked={Boolean(flowData.showBismillah)}
                        className="w-full flex items-center justify-between rounded-2xl border border-border/60 p-4 cursor-pointer hover:bg-muted/30 transition-colors text-left"
                        onClick={() => {
                          const newShow = !flowData.showBismillah;
                          onUpdateData({ showBismillah: newShow });
                          autoSaveDraft(currentStep, false, { showBismillah: newShow });
                        }}
                      >
                        <div className="flex-1 pr-4">
                          <p className="text-sm font-semibold text-foreground">Show Bismillah Header</p>
                          <p className="text-xs text-slate-300 mt-0.5">Displays Bismillah in Arabic calligraphy at the top.</p>
                        </div>
                        <div className={`relative w-12 h-6 rounded-full transition-colors ${flowData.showBismillah ? "bg-primary" : "bg-muted"}`}>
                          <div className={`absolute top-1 w-4 h-4 rounded-full ${flowData.showBismillah ? "bg-slate-950" : "bg-slate-300"} transition-transform ${flowData.showBismillah ? "translate-x-7" : "translate-x-1"}`} />
                        </div>
                      </button>

                      <button
                        type="button"
                        role="switch"
                        aria-checked={Boolean(flowData.showQuranVerse)}
                        className="w-full flex items-center justify-between rounded-2xl border border-border/60 p-4 cursor-pointer hover:bg-muted/30 transition-colors text-left"
                        onClick={() => {
                          const newShow = !flowData.showQuranVerse;
                          onUpdateData({ showQuranVerse: newShow });
                          autoSaveDraft(currentStep, false, { showQuranVerse: newShow });
                        }}
                      >
                        <div className="flex-1 pr-4">
                          <p className="text-sm font-semibold text-foreground">Show Quranic Verse (Surah Ar-Rum 30:21)</p>
                          <p className="text-xs text-slate-300 mt-0.5">Displays marriage verse in Arabic, English &amp; Urdu.</p>
                        </div>
                        <div className={`relative w-12 h-6 rounded-full transition-colors ${flowData.showQuranVerse ? "bg-primary" : "bg-muted"}`}>
                          <div className={`absolute top-1 w-4 h-4 rounded-full ${flowData.showQuranVerse ? "bg-slate-950" : "bg-slate-300"} transition-transform ${flowData.showQuranVerse ? "translate-x-7" : "translate-x-1"}`} />
                        </div>
                      </button>

                      {/* Custom Verse — only shown when Quran Verse toggle is ON */}
                      <AnimatePresence>
                        {flowData.showQuranVerse && (
                          <m.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="overflow-hidden"
                          >
                            <div className="rounded-2xl border border-gold/30 bg-primary/5 p-4 space-y-4">
                              <div className="flex items-center gap-2">
                                <span className="text-lg">📖</span>
                                <div>
                                  <p className="text-sm font-semibold text-foreground">Custom Verse <span className="text-xs font-medium text-slate-300">(Optional)</span></p>
                                  <p className="text-xs text-slate-300">Replace the default Quran verse with your own — Quran, Bible, or any text.</p>
                                </div>
                              </div>

                              {/* Quick-pick chips */}
                              <div className="space-y-2">
                                <p className="text-xs font-bold text-slate-200 uppercase tracking-wider">Quick Pick</p>
                                <div className="flex flex-wrap gap-2">
                                  {[
                                    { label: "🕌 Al-Rum 30:21", text: "وَمِنْ آيَاتِهِ أَنْ خَلَقَ لَكُم مِّنْ أَنفُسِكُمْ أَزْوَاجًا لِّتَسْكُنُوا إِلَيْهَا وَجَعَلَ بَيْنَكُم مَّوَدَّةً وَرَحْمَةً", source: "Surah Al-Rum 30:21" },
                                    { label: "🕌 Al-Furqan 25:74", text: "رَبَّنَا هَبْ لَنَا مِنْ أَزْوَاجِنَا وَذُرِّيَّاتِنَا قُرَّةَ أَعْيُنٍ وَاجْعَلْنَا لِلْمُتَّقِينَ إِمَامًا", source: "Surah Al-Furqan 25:74" },
                                    { label: "✝️ 1 Corinthians 13:4", text: "Love is patient, love is kind. It does not envy, it does not boast, it is not proud.", source: "1 Corinthians 13:4" },
                                    { label: "✝️ Matthew 19:6", text: "So they are no longer two, but one flesh. Therefore what God has joined together, let no one separate.", source: "Matthew 19:6" },
                                    { label: "✝️ Genesis 2:24", text: "That is why a man leaves his father and mother and is united to his wife, and they become one flesh.", source: "Genesis 2:24" },
                                  ].map((chip) => (
                                    <button
                                      key={chip.source}
                                      type="button"
                                      onClick={() => {
                                        const isBible = chip.source.includes('Corinthians') || chip.source.includes('Matthew') || chip.source.includes('Genesis');
                                        onUpdateData({ 
                                          customVerseText: chip.text, 
                                          customVerseSource: chip.source,
                                          ...(isBible ? { showBismillah: false } : { showBismillah: true })
                                        });
                                      }}
                                      className={`text-[11px] px-3.5 py-1.5 rounded-full border transition-all ${
                                        flowData.customVerseSource === chip.source
                                          ? "bg-primary text-slate-950 border-gold shadow-sm font-black"
                                          : "border-border/80 text-slate-200 bg-background/60 hover:border-gold/50 hover:text-white font-medium"
                                      }`}
                                    >
                                      {chip.label}
                                    </button>
                                  ))}
                                  {(flowData.customVerseText || flowData.customVerseSource) && (
                                    <button
                                      type="button"
                                      onClick={() => onUpdateData({ customVerseText: "", customVerseSource: "" })}
                                      className="text-[11px] px-3 py-1.5 rounded-full border border-red-400/40 text-red-400 hover:bg-red-400/10 transition-all font-medium"
                                    >
                                      ✕ Use Default
                                    </button>
                                  )}
                                </div>
                              </div>

                              {/* Custom verse textarea */}
                              <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-200 uppercase tracking-wider">Your Verse Text</label>
                                <textarea
                                  value={flowData.customVerseText || ""}
                                  onChange={(e) => onUpdateData({ customVerseText: e.target.value })}
                                  placeholder="Enter your verse here... (Arabic, English, Urdu or any language)"
                                  dir="auto"
                                  rows={3}
                                  className="w-full rounded-xl border border-border/60 bg-background/80 px-3 py-2.5 text-sm text-foreground placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold/60 resize-none leading-relaxed"
                                />
                              </div>

                              {/* Source / Reference */}
                              <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-200 uppercase tracking-wider">Source / Reference</label>
                                <input
                                  type="text"
                                  value={flowData.customVerseSource || ""}
                                  onChange={(e) => onUpdateData({ customVerseSource: e.target.value })}
                                  placeholder="e.g. Surah Al-Rum 30:21  or  John 3:16"
                                  className="w-full rounded-xl border border-border/60 bg-background/80 px-3 py-2.5 text-sm text-foreground placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold/60 h-10"
                                />
                              </div>
                            </div>
                          </m.div>
                        )}
                      </AnimatePresence>

                      <button
                        type="button"
                        role="switch"
                        aria-checked={Boolean(flowData.showNikahRegistration)}
                        className="w-full flex items-center justify-between rounded-2xl border border-border/60 p-4 cursor-pointer hover:bg-muted/30 transition-colors text-left"
                        onClick={() => {
                          const newShow = !flowData.showNikahRegistration;
                          onUpdateData({ showNikahRegistration: newShow });
                          autoSaveDraft(currentStep, false, { showNikahRegistration: newShow });
                        }}
                      >
                        <div className="flex-1 pr-4">
                          <p className="text-sm font-semibold text-foreground">Show Nikah Registration Note</p>
                          <p className="text-xs text-slate-300 mt-0.5">Displays a formal note about Nikah registration.</p>
                        </div>
                        <div className={`relative w-12 h-6 rounded-full transition-colors ${flowData.showNikahRegistration ? "bg-primary" : "bg-muted"}`}>
                          <div className={`absolute top-1 w-4 h-4 rounded-full ${flowData.showNikahRegistration ? "bg-slate-950" : "bg-slate-300"} transition-transform ${flowData.showNikahRegistration ? "translate-x-7" : "translate-x-1"}`} />
                        </div>
                      </button>

                      <div className="rounded-2xl border border-border/60 overflow-hidden transition-colors">
                        <button
                          type="button"
                          role="switch"
                          aria-checked={Boolean(flowData.isSegregated)}
                          className="w-full flex items-center justify-between p-4 cursor-pointer hover:bg-muted/30 text-left"
                          onClick={() => {
                            const newSeg = !flowData.isSegregated;
                            onUpdateData({ isSegregated: newSeg });
                            autoSaveDraft(currentStep, false, { isSegregated: newSeg });
                          }}
                        >
                          <div className="flex-1 pr-4">
                            <p className="text-sm font-semibold text-foreground">Separate Ladies/Gents Setup</p>
                            <p className="text-xs text-slate-300 mt-0.5">Indicate segregated seating at the venue.</p>
                          </div>
                          <div className={`relative w-12 h-6 rounded-full transition-colors ${flowData.isSegregated ? "bg-primary" : "bg-muted"}`}>
                            <div className={`absolute top-1 w-4 h-4 rounded-full ${flowData.isSegregated ? "bg-slate-950" : "bg-slate-300"} transition-transform ${flowData.isSegregated ? "translate-x-7" : "translate-x-1"}`} />
                          </div>
                        </button>
                        
                        <AnimatePresence>
                          {flowData.isSegregated && (
                            <m.div 
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="px-4 pb-4 bg-muted/20"
                            >
                              <Input
                                value={flowData.venueDetailsSegregated || ""}
                                onChange={(e) => onUpdateData({ venueDetailsSegregated: e.target.value })}
                                placeholder="e.g. Hall A for Ladies, Hall B for Gents"
                                className="h-10 text-xs bg-background/80 placeholder:text-slate-400 text-foreground mt-2"
                              />
                            </m.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </section>
                  ) : (
                    <details className="rounded-3xl bg-card/40 border border-border/60 p-5 space-y-3 cursor-pointer">
                      <summary className="text-xs font-semibold text-slate-200 hover:text-white select-none">
                        Optional: Add Cultural / Religious Header &amp; Verse
                      </summary>
                      <div className="pt-3 space-y-4">
                        <button
                          type="button"
                          role="switch"
                          aria-checked={Boolean(flowData.showBismillah)}
                          className="w-full flex items-center justify-between rounded-2xl border border-border/60 p-4 cursor-pointer hover:bg-muted/30 transition-colors text-left"
                          onClick={() => {
                            const newShow = !flowData.showBismillah;
                            onUpdateData({ showBismillah: newShow });
                            autoSaveDraft(currentStep, false, { showBismillah: newShow });
                          }}
                        >
                          <div className="flex-1 pr-4">
                            <p className="text-sm font-semibold text-foreground">Show Calligraphy Header</p>
                            <p className="text-xs text-slate-300 mt-0.5">Displays Bismillah in Arabic calligraphy at the top.</p>
                          </div>
                          <div className={`relative w-12 h-6 rounded-full transition-colors ${flowData.showBismillah ? "bg-primary" : "bg-muted"}`}>
                            <div className={`absolute top-1 w-4 h-4 rounded-full ${flowData.showBismillah ? "bg-slate-950" : "bg-slate-300"} transition-transform ${flowData.showBismillah ? "translate-x-7" : "translate-x-1"}`} />
                          </div>
                        </button>

                        <button
                          type="button"
                          role="switch"
                          aria-checked={Boolean(flowData.showQuranVerse)}
                          className="w-full flex items-center justify-between rounded-2xl border border-border/60 p-4 cursor-pointer hover:bg-muted/30 transition-colors text-left"
                          onClick={() => {
                            const newShow = !flowData.showQuranVerse;
                            onUpdateData({ showQuranVerse: newShow });
                            autoSaveDraft(currentStep, false, { showQuranVerse: newShow });
                          }}
                        >
                          <div className="flex-1 pr-4">
                            <p className="text-sm font-semibold text-foreground">Include Inspirational / Sacred Verse</p>
                            <p className="text-xs text-slate-300 mt-0.5">Displays an inspirational or holy scripture verse.</p>
                          </div>
                          <div className={`relative w-12 h-6 rounded-full transition-colors ${flowData.showQuranVerse ? "bg-primary" : "bg-muted"}`}>
                            <div className={`absolute top-1 w-4 h-4 rounded-full ${flowData.showQuranVerse ? "bg-slate-950" : "bg-slate-300"} transition-transform ${flowData.showQuranVerse ? "translate-x-7" : "translate-x-1"}`} />
                          </div>
                        </button>
                      </div>
                    </details>
                  )}

                  <div className="flex justify-end pt-2 pb-4">
                    <Button
                      onClick={() => {
                        if (validateStep(1)) goToStep(2);
                      }}
                      className="bg-primary hover:bg-primary-light text-slate-950 font-black gap-2 shadow-lg px-6"
                    >
                      Next: Events &amp; Venue <ArrowRight className="w-4 h-4 text-slate-950 stroke-[2.5]" />
                    </Button>
                  </div>
                </m.div>
              )}

              {/* STEP 2: Events & Venue Location */}
              {currentStep === 2 && (
                <m.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  {/* Venue Details */}
                  <section className="p-6 rounded-3xl bg-card/70 border border-border/60 shadow-xl backdrop-blur-xl space-y-4">
                    <div className="flex items-center gap-2.5 mb-1">
                      <div className="w-8 h-8 rounded-xl bg-primary/15 border border-gold/30 flex items-center justify-center text-primary">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <h2 className="font-display text-lg font-bold text-foreground">Venue Location</h2>
                    </div>

                    <div className="space-y-3">
                      <div className="space-y-1.5" id="field-venue">
                        <label className="text-xs font-bold tracking-wider text-slate-200 uppercase">
                          Venue Name
                        </label>
                        <Input
                          value={flowData.venue}
                          onChange={(e) => onUpdateData({ venue: e.target.value })}
                          placeholder="e.g. The Grand Palace, Lahore"
                          className={`h-11 bg-background/80 placeholder:text-slate-400 text-foreground ${errors.venue ? "border-red-400" : ""}`}
                        />
                        {errors.venue && <p className="text-xs text-red-500">{errors.venue}</p>}
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold tracking-wider text-slate-200 uppercase">
                          Full Address
                        </label>
                        <Input
                          value={addressText}
                          onChange={(e) => {
                            setAddressText(e.target.value);
                            updateAddressAndMap(e.target.value, mapsUrl);
                          }}
                          placeholder="e.g. MM Alam Road, Gulberg III, Lahore"
                          className="h-11 bg-background/80 placeholder:text-slate-400 text-foreground"
                        />
                      </div>

                      <div className="space-y-1.5" id="field-mapsUrl">
                        <label className="text-xs font-bold tracking-wider text-slate-200 uppercase">
                          Google Maps Link (Optional)
                        </label>
                        <Input
                          value={mapsUrl}
                          onChange={(e) => {
                            setMapsUrl(e.target.value);
                            updateAddressAndMap(addressText, e.target.value);
                          }}
                          placeholder="e.g. https://maps.app.goo.gl/..."
                          className="h-11 bg-background/80 placeholder:text-slate-400 text-foreground"
                        />
                      </div>
                    </div>
                  </section>

                  {/* Dynamic Multi-Events */}
                  <section id="field-events" className="p-6 rounded-3xl bg-card/70 border border-border/60 shadow-xl backdrop-blur-xl space-y-4">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-primary/15 border border-gold/30 flex items-center justify-center text-primary">
                          <Calendar className="w-4 h-4" />
                        </div>
                        <h2 className="font-display text-lg font-bold text-foreground">Events Schedule</h2>
                      </div>
                      {!flowData.paymentDone && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={addEvent}
                          className="text-primary hover:text-primary-light gap-1"
                        >
                          <Plus className="w-3.5 h-3.5" /> Add Event
                        </Button>
                      )}
                    </div>

                    {flowData.paymentDone && (
                      <div className="flex items-start gap-2.5 p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs leading-relaxed">
                        <Lock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-semibold text-amber-200">Live Invitation Policy: </span>
                          Event dates are locked to ensure guest passes and calendar invites stay consistent. You can freely edit all event titles, timings, venues, dress codes, music, photos, and messages.
                        </div>
                      </div>
                    )}

                    <div className="space-y-3">
                      {flowData.events.map((event, index) => (
                        <div key={event.id || index} className="p-4 rounded-2xl border border-border/50 bg-muted/20 space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-primary uppercase tracking-wider">Event {index + 1}</span>
                            {!flowData.paymentDone && flowData.events.length > 1 && (
                              <button onClick={() => removeEvent(index)} className="text-muted-foreground hover:text-red-400">
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <Input
                              value={event.name}
                              onChange={(e) => updateEvent(index, "name", e.target.value)}
                              placeholder={isBirthday ? "Event name (e.g. Cake Cutting)" : isSchool ? "Event name (e.g. Convocation Ceremony)" : isMeeting ? "Event name (e.g. Keynote Address)" : "Event name (e.g. Baraat)"}
                              className="h-10 bg-background/80"
                            />
                            <div>
                              <Input
                                type="date"
                                value={event.date}
                                onChange={(e) => updateEvent(index, "date", e.target.value)}
                                disabled={flowData.paymentDone}
                                className={`h-10 bg-background/80 ${flowData.paymentDone ? "opacity-75 cursor-not-allowed border-amber-500/30" : ""}`}
                              />
                              {flowData.paymentDone && (
                                <p className="text-[10px] text-amber-400/90 font-medium flex items-center gap-1 mt-1">
                                  <Lock className="w-3 h-3" /> Date locked (live event)
                                </p>
                              )}
                            </div>
                            <Input
                              type="time"
                              value={event.time}
                              onChange={(e) => updateEvent(index, "time", e.target.value)}
                              className="h-10 bg-background/80"
                            />
                          </div>
                          <Input
                            value={event.venue || ""}
                            onChange={(e) => updateEvent(index, "venue", e.target.value)}
                            placeholder="Specific venue for this event (Optional)"
                            className="h-10 bg-background/80 w-full"
                          />
                        </div>
                      ))}
                    </div>
                  </section>

                  <div className="flex justify-between pt-2 pb-4">
                    <Button variant="outline" onClick={() => goToStep(1)}>
                      <ArrowLeft className="w-4 h-4 mr-1" /> Previous
                    </Button>
                    <Button
                      onClick={() => {
                        if (validateStep(2)) goToStep(3);
                      }}
                      className="bg-primary hover:bg-primary-light text-slate-950 font-black gap-2 shadow-lg px-6"
                    >
                      Next: Media &amp; Music <ArrowRight className="w-4 h-4 text-slate-950 stroke-[2.5]" />
                    </Button>
                  </div>
                </m.div>
              )}

              {/* STEP 3: Photos & Background Music */}
              {currentStep === 3 && (
                <m.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  {/* Photo Uploads */}
                  <section className="p-6 rounded-3xl bg-card/70 border border-border/60 shadow-xl backdrop-blur-xl space-y-4">
                    <div className="flex items-center gap-2.5 mb-1">
                      <div className="w-8 h-8 rounded-xl bg-primary/15 border border-gold/30 flex items-center justify-center text-primary">
                        <ImagePlus className="w-4 h-4" />
                      </div>
                      <h2 className="font-display text-lg font-bold text-foreground">
                        Photos &amp; Media
                        {isUploading && (
                          <span className="ml-2 text-xs text-muted-foreground font-normal inline-flex items-center gap-1">
                            <Loader2 className="w-3 h-3 animate-spin" /> Uploading...
                          </span>
                        )}
                      </h2>
                    </div>

                    {/* Hero Cover Image */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold tracking-wider text-slate-200 uppercase">Hero Cover Photo</label>
                      {flowData.heroImage ? (
                        <div className="relative rounded-2xl overflow-hidden border border-border/50 aspect-[16/9]">
                          <Image src={flowData.heroImage} alt="Hero" fill className="object-cover" />
                          <button
                            onClick={() => onUpdateData({ heroImage: "" })}
                            className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-red-500"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => heroInputRef.current?.click()}
                          disabled={isUploading}
                          className="w-full p-6 rounded-2xl border-2 border-dashed border-border/50 hover:border-gold/40 transition-colors flex flex-col items-center gap-2 text-slate-300 hover:text-white"
                        >
                          <ImagePlus className="w-8 h-8 text-primary" />
                          <span className="text-sm font-medium text-foreground">Upload Hero Cover Photo</span>
                        </button>
                      )}
                      <input ref={heroInputRef} type="file" accept="image/*" onChange={(e) => handleFileChange(e, "hero")} className="hidden" />
                    </div>

                    {/* Slideshow Photos */}
                    <div className="space-y-2 pt-2">
                      <label className="text-xs font-bold tracking-wider text-slate-200 uppercase">Slideshow Photos (up to 4)</label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {flowData.slideshowImages.map((img, idx) => (
                          <div key={idx} className="relative rounded-xl overflow-hidden border border-border/50 aspect-square">
                            <Image src={img} alt={`Slideshow ${idx + 1}`} fill className="object-cover" />
                            <button
                              onClick={() => removeSlideshowImage(idx)}
                              className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-red-500"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                        {flowData.slideshowImages.length < 4 && (
                          <button
                            onClick={() => slideshowInputRef.current?.click()}
                            disabled={isUploading}
                            className="rounded-xl border-2 border-dashed border-border/50 hover:border-gold/40 transition-colors flex flex-col items-center justify-center gap-1 text-slate-300 hover:text-white aspect-square"
                          >
                            <Plus className="w-5 h-5 text-primary" />
                            <span className="text-[10px] font-medium">Add Photo</span>
                          </button>
                        )}
                      </div>
                      <input ref={slideshowInputRef} type="file" accept="image/*" multiple onChange={(e) => handleFileChange(e, "slideshow")} className="hidden" />
                    </div>

                    {/* YouTube Video (Royal Plan) */}
                    {flowData.selectedPlan === "royal" && (
                      <div className="space-y-2 pt-2">
                        <label className="text-xs font-bold tracking-wider text-slate-200 uppercase flex items-center gap-2">
                          <Video className="w-3.5 h-3.5 text-primary" /> YouTube Video ID
                        </label>
                        <Input
                          value={flowData.youtubeVideoId || ""}
                          onChange={(e) => onUpdateData({ youtubeVideoId: e.target.value })}
                          placeholder="e.g. dQw4w9WgXcQ"
                          className="bg-background/80 placeholder:text-slate-400 text-foreground"
                        />
                      </div>
                    )}
                  </section>

                  {/* Background Music Track Selector */}
                  <section className="p-6 rounded-3xl bg-card/70 border border-border/60 shadow-xl backdrop-blur-xl space-y-4">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-primary/15 border border-gold/30 flex items-center justify-center text-primary">
                          <Music className="w-4 h-4" />
                        </div>
                        <div>
                          <h2 className="font-display text-lg font-bold text-foreground">Background Music</h2>
                          <p className="text-xs text-slate-300 mt-0.5">
                            Tap any track to play preview. Tap again to pause. Selected music plays automatically for guests.
                          </p>
                        </div>
                      </div>
                      {isPlayingMusic && (
                        <Badge className="bg-primary text-slate-950 font-black text-[10px] animate-pulse hidden sm:inline-flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-950 animate-ping" /> Preview Playing
                        </Badge>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                      {(isBirthday ? [
                        { id: "party-vibes", label: "🎉 Upbeat Party Vibes" },
                        { id: "happy-birthday", label: "🎂 Joyful Birthday Song" },
                        { id: "acoustic-bday", label: "🎸 Acoustic Celebration" },
                        { id: "electronic-dance", label: "⚡ EDM & Dance Party" },
                        { id: "chill-lounge", label: "🍸 Chill Birthday Lounge" },
                        { id: "kids-party", label: "🎈 Playful Kids Celebration" },
                        { id: "confetti-pop", label: "✨ Festive Confetti Pop" },
                        { id: "soft-sitar", label: "🎵 Soft Instrumental" },
                        { id: "no-music", label: "🔇 No Music" },
                      ] : isSchool ? [
                        { id: "anthem-celebration", label: "🎓 Grand Orchestral Anthem" },
                        { id: "inspirational-piano", label: "🎹 Inspirational Piano" },
                        { id: "upbeat-grad", label: "🎺 Graduation Brass & Beats" },
                        { id: "campus-acoustic", label: "🎸 Campus Acoustic Sunshine" },
                        { id: "success-strings", label: "🎻 Triumph & Success Strings" },
                        { id: "soft-sitar", label: "🎵 Soft Instrumental" },
                        { id: "no-music", label: "🔇 No Music" },
                      ] : isMeeting ? [
                        { id: "corporate-ambient", label: "💼 Corporate Ambient Elegance" },
                        { id: "deep-focus", label: "🎧 Deep Focus & Tech" },
                        { id: "innovative-pulse", label: "💡 Future Tech Pulse" },
                        { id: "minimal-lofi", label: "☕ Executive Minimal Lo-Fi" },
                        { id: "grand-keynote", label: "🌟 Grand Keynote Opener" },
                        { id: "soft-sitar", label: "🎵 Soft Instrumental" },
                        { id: "no-music", label: "🔇 No Music" },
                      ] : [
                        { id: "soft-sitar", label: "🪕 Soft Sitar Melody" },
                        { id: "tabla-beats", label: "🥁 Tabla Beats & Dholak" },
                        { id: "flute-raga", label: "🪈 Romantic Flute Raga" },
                        { id: "shehnai", label: "🎺 Shehnai Classic" },
                        { id: "sufi-qawwali", label: "✨ Sufi Qawwali Soul" },
                        { id: "dhol-celebration", label: "🥁 Festive Punjabi Dhol" },
                        { id: "royal-entry", label: "👑 Royal Cinematic Entry" },
                        { id: "romantic-violin", label: "🎻 Romantic Strings & Violin" },
                        { id: "qawwali-fusion", label: "💫 Modern Sufi Fusion" },
                        { id: "no-music", label: "🔇 No Music" },
                      ]).map((track) => {
                        const isSelected = flowData.backgroundMusic === track.id;
                        const isPlayingThis = isPlayingMusic && playingTrackId === track.id;

                        return (
                          <button
                            key={track.id}
                            type="button"
                            onClick={() => handleMusicSelection(track.id)}
                            className={`p-3 rounded-2xl border text-xs transition-all flex items-center justify-between gap-2 text-left group ${
                              isSelected
                                ? "bg-primary text-slate-950 border-gold shadow-md font-black ring-2 ring-gold/40"
                                : "bg-background/80 text-slate-200 border-border/80 hover:border-gold/40 hover:text-white font-medium"
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              {isPlayingThis ? (
                                <span className="w-6 h-6 rounded-full bg-slate-950 text-gold flex items-center justify-center shrink-0 shadow-sm">
                                  <Pause className="w-3 h-3 text-gold fill-current stroke-[2.5]" />
                                </span>
                              ) : isSelected && track.id !== "no-music" ? (
                                <span className="w-6 h-6 rounded-full bg-slate-950 text-gold flex items-center justify-center shrink-0 shadow-sm">
                                  <Play className="w-3 h-3 text-gold fill-current ml-0.5" />
                                </span>
                              ) : (
                                <span className="w-6 h-6 rounded-full bg-muted/60 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                                  <Music className="w-3 h-3 text-slate-400 group-hover:text-primary transition-colors" />
                                </span>
                              )}
                              <span className="truncate">{track.label}</span>
                            </div>

                            {isPlayingThis ? (
                              <span className="shrink-0 text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-slate-950/20 text-slate-950 font-bold flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-slate-950 animate-ping" />
                                Playing
                              </span>
                            ) : isSelected && track.id !== "no-music" ? (
                              <span className="shrink-0 text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-slate-950/15 text-slate-950 font-semibold">
                                Tap to play
                              </span>
                            ) : null}
                          </button>
                        );
                      })}
                    </div>

                    {/* Royal Plan Custom Audio Upload / URL */}
                    <div className="pt-2">
                      {flowData.selectedPlan === "royal" ? (
                        <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-primary/10 to-amber-500/10 border border-gold/40 space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Sparkles className="w-4 h-4 text-gold" />
                              <h3 className="text-xs font-bold text-gold uppercase tracking-wider">Royal Exclusive: Upload Custom Music</h3>
                            </div>
                            <Badge className="bg-gold/20 text-gold border-gold/30 text-[10px]">👑 VIP Feature</Badge>
                          </div>
                          <p className="text-xs text-slate-300">
                            Upload your favorite MP3 or custom song (up to 5MB) to play seamlessly as guests open your invitation.
                          </p>

                          <div className="flex flex-col sm:flex-row gap-3 items-center">
                            <input
                              type="file"
                              ref={audioInputRef}
                              accept="audio/mp3,audio/mpeg,audio/m4a,audio/wav"
                              className="hidden"
                              onChange={handleAudioUpload}
                            />
                            <Button
                              type="button"
                              onClick={() => audioInputRef.current?.click()}
                              disabled={isUploadingAudio}
                              className="w-full sm:w-auto bg-primary hover:bg-primary-light text-slate-950 font-black text-xs gap-2 px-5 shadow-md"
                            >
                              {isUploadingAudio ? (
                                <>
                                  <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-950" /> Uploading Audio...
                                </>
                              ) : (
                                <>
                                  <Upload className="w-3.5 h-3.5 text-slate-950 stroke-[2.5]" /> Upload Custom MP3 / Song
                                </>
                              )}
                            </Button>

                            {flowData.customMusicName && (
                              <div className="flex items-center gap-2 text-xs text-gold font-medium bg-background/80 px-3 py-2 rounded-xl border border-gold/30 truncate max-w-xs">
                                <Music className="w-3.5 h-3.5 shrink-0" />
                                <span className="truncate">{flowData.customMusicName}</span>
                                <Check className="w-3.5 h-3.5 text-emerald shrink-0" />
                              </div>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="p-3.5 rounded-2xl bg-muted/40 border border-border/50 flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <Lock className="w-4 h-4 text-slate-300" />
                            <div>
                              <p className="text-xs font-semibold text-foreground">Custom Song & MP3 Upload</p>
                              <p className="text-[10px] text-slate-300">Available exclusively on the Royal Plan</p>
                            </div>
                          </div>
                          <Badge variant="outline" className="text-[10px] text-primary border-primary/30">👑 Royal Plan</Badge>
                        </div>
                      )}
                    </div>
                  </section>

                  {/* Personal Host Voice Note / Audio Blessing Section */}
                  <section className="p-6 rounded-3xl bg-card/70 border border-border/60 shadow-xl backdrop-blur-xl space-y-4">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-primary/15 border border-gold/30 flex items-center justify-center text-primary">
                          <Mic className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h2 className="font-display text-lg font-bold text-foreground">Personal Voice Greeting</h2>
                            <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30 text-[10px] inline-flex items-center gap-1 font-bold">
                              <Crown className="w-3 h-3 text-amber-400" /> Royal Exclusive VIP
                            </Badge>
                          </div>
                          <p className="text-xs text-slate-300 mt-0.5">
                            Record a 15–30 sec personal voice blessing or greeting from the couple or parents.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Royal Plan Experience Banner for Classic users */}
                    {flowData.selectedPlan !== "royal" && (
                      <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-primary/5 to-amber-500/10 border border-gold/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-primary/20 border border-gold/40 flex items-center justify-center text-primary shrink-0">
                            <Crown className="w-4 h-4 text-amber-400" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-foreground flex items-center gap-1.5">
                              Experience the Royal Voice Feature
                              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">Free Trial in Builder</span>
                            </p>
                            <p className="text-[11px] text-slate-300">
                              Record your voice blessing and listen to the preview for free! Unlock it on your live invitation with Royal.
                            </p>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={playSampleBlessing}
                          className="shrink-0 h-8 text-xs border-gold/40 text-gold hover:bg-gold/10 gap-1.5 font-bold"
                        >
                          {isPlayingSampleBlessing ? (
                            <><Pause className="w-3.5 h-3.5 text-primary" /> Pause Sample</>
                          ) : (
                            <><Volume2 className="w-3.5 h-3.5 text-primary" /> 🎧 Listen to Sample</>
                          )}
                        </Button>
                      </div>
                    )}

                    {/* Sender Label & Title Inputs */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      <div className="space-y-1">
                        <label className="text-xs font-bold tracking-wider text-slate-200 uppercase">Greeting Title</label>
                        <Input
                          value={flowData.voiceNoteTitle || ""}
                          onChange={(e) => onUpdateData({ voiceNoteTitle: e.target.value })}
                          placeholder="e.g. A Warm Welcome & Blessings"
                          className="h-9 text-xs bg-background/80 placeholder:text-slate-400 text-foreground"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold tracking-wider text-slate-200 uppercase">Sender / Relation Label</label>
                        <Input
                          value={flowData.voiceNoteSender || ""}
                          onChange={(e) => onUpdateData({ voiceNoteSender: e.target.value })}
                          placeholder={isWedding ? "e.g. From the Bride & Groom" : "e.g. Message from the Host"}
                          className="h-9 text-xs bg-background/80 placeholder:text-slate-400 text-foreground"
                        />
                      </div>
                    </div>

                    {/* Active Voice Note Display */}
                    {flowData.voiceNoteUrl ? (
                      <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-primary/10 to-amber-500/10 border border-gold/40 flex flex-col sm:flex-row items-center justify-between gap-3">
                        <div className="flex items-center gap-3 w-full sm:w-auto">
                          <div className="w-10 h-10 rounded-full bg-primary/20 border border-gold/50 flex items-center justify-center text-primary shrink-0">
                            <Volume2 className="w-5 h-5 text-primary" />
                          </div>
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-foreground">
                                {flowData.voiceNoteTitle || "Personal Audio Greeting"}
                              </span>
                              <Badge className="bg-emerald/20 text-emerald-300 border-emerald-500/30 text-[9px]">Attached</Badge>
                            </div>
                            <span className="text-xs text-slate-300 font-medium block">
                              {flowData.voiceNoteSender || "From the Hosts"}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                          <audio
                            src={flowData.voiceNoteUrl}
                            controls
                            className="h-8 max-w-[200px] sm:max-w-[240px] opacity-90"
                          />
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => onUpdateData({ voiceNoteUrl: "", voiceNoteTitle: "", voiceNoteSender: "" })}
                            className="h-8 px-2 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10"
                            title="Remove audio greeting"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      /* Recording & Upload Controls */
                      <div className="p-4 rounded-2xl border border-border/60 bg-muted/20 space-y-4">
                        {isRecordingVoice ? (
                          <div className="flex flex-col items-center justify-center p-6 space-y-3 bg-red-500/5 border border-red-500/30 rounded-xl text-center">
                            <div className="flex items-center gap-2">
                              <span className="w-3 h-3 rounded-full bg-red-500 animate-ping" />
                              <span className="text-sm font-bold text-red-400">Recording Audio Memo...</span>
                            </div>
                            <span className="text-2xl font-mono font-bold text-foreground">
                              00:{voiceDuration.toString().padStart(2, "0")} <span className="text-xs text-slate-300 font-normal">/ 00:60</span>
                            </span>
                            <div className="flex items-center gap-2 pt-2">
                              <Button
                                onClick={stopVoiceRecording}
                                size="sm"
                                className="bg-red-600 hover:bg-red-500 text-white font-bold text-xs gap-1.5 shadow-md px-4"
                              >
                                <Square className="w-3.5 h-3.5" /> Stop Recording
                              </Button>
                              <Button
                                onClick={discardVoiceRecording}
                                size="sm"
                                variant="outline"
                                className="text-xs text-slate-300 hover:text-white"
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        ) : voiceAudioPreviewUrl ? (
                          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-xl bg-background/60 border border-gold/30">
                            <div className="flex items-center gap-2.5">
                              <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-primary shrink-0">
                                <Volume2 className="w-4 h-4" />
                              </div>
                              <div>
                                <p className="text-xs font-semibold text-foreground">Recorded Preview ({voiceDuration}s)</p>
                                <audio src={voiceAudioPreviewUrl} controls className="h-7 mt-1 max-w-[200px]" />
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                onClick={discardVoiceRecording}
                                size="sm"
                                variant="outline"
                                className="h-8 text-xs border-zinc-700 text-zinc-300 gap-1"
                              >
                                <RotateCcw className="w-3 h-3" /> Re-record
                              </Button>
                              <Button
                                onClick={uploadVoiceGreeting}
                                disabled={isUploadingVoice}
                                size="sm"
                                className="h-8 px-4 bg-primary hover:bg-primary-light text-slate-950 font-black text-xs gap-1.5 shadow-md"
                              >
                                {isUploadingVoice ? (
                                  <><Loader2 className="w-3.5 h-3.5 animate-spin text-slate-950" /> Saving...</>
                                ) : flowData.selectedPlan !== "royal" ? (
                                  <><Crown className="w-3.5 h-3.5 text-slate-950" /> Unlock with Royal</>
                                ) : (
                                  <><Check className="w-3.5 h-3.5 text-slate-950 stroke-[2.5]" /> Attach to Invitation</>
                                )}
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                            <Button
                              onClick={startVoiceRecording}
                              type="button"
                              className="w-full sm:w-auto h-10 px-5 bg-gradient-to-r from-red-600/90 to-amber-600/90 hover:from-red-500 hover:to-amber-500 text-white font-bold text-xs gap-2 shadow-md"
                            >
                              <Mic className="w-4 h-4" /> Record Voice Blessing (Microphone)
                            </Button>

                            <span className="text-xs text-slate-300 uppercase font-bold tracking-wider">or</span>

                            <Button
                              onClick={() => voiceFileInputRef.current?.click()}
                              type="button"
                              variant="outline"
                              disabled={isUploadingVoice}
                              className="w-full sm:w-auto h-10 px-4 border-gold/40 text-foreground text-xs font-semibold gap-1.5 hover:bg-primary/10"
                            >
                              {isUploadingVoice ? (
                                <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Uploading...</>
                              ) : (
                                <><Upload className="w-3.5 h-3.5 text-primary" /> Upload Audio File (.mp3, .m4a, .webm)</>
                              )}
                            </Button>
                            <input
                              ref={voiceFileInputRef}
                              type="file"
                              accept="audio/*"
                              onChange={handleVoiceFileUpload}
                              className="hidden"
                            />
                          </div>
                        )}
                      </div>
                    )}
                  </section>

                  <div className="flex justify-between pt-2 pb-4">
                    <Button variant="outline" onClick={() => goToStep(2)}>
                      <ArrowLeft className="w-4 h-4 mr-1" /> Previous
                    </Button>
                    <Button onClick={() => goToStep(4)} className="bg-primary hover:bg-primary-light text-slate-950 font-black gap-2 shadow-lg px-6">
                      Next: Details &amp; {isWedding ? 'Shagun' : isBirthday ? 'Gifts' : isSchool ? 'Contributions' : 'Notes'} <ArrowRight className="w-4 h-4 text-slate-950 stroke-[2.5]" />
                    </Button>
                  </div>
                </m.div>
              )}

              {/* STEP 4: Custom Details & Digital Shagun */}
              {currentStep === 4 && (
                <m.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  {/* Welcome Message & Contact Phone */}
                  <section className="p-6 rounded-3xl bg-card/70 border border-border/60 shadow-xl backdrop-blur-xl space-y-4">
                    <div className="flex items-center gap-2.5 mb-1">
                      <div className="w-8 h-8 rounded-xl bg-primary/15 border border-gold/30 flex items-center justify-center text-primary">
                        <MessageSquare className="w-4 h-4" />
                      </div>
                      <h2 className="font-display text-lg font-bold text-foreground">Welcome Message &amp; Contact</h2>
                    </div>
                    <div className="space-y-3">
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold tracking-wider text-slate-200 uppercase">Welcome Message to Guests</label>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setIsAICopywriterOpen(true)}
                            className="h-7 px-2.5 text-xs text-primary hover:text-primary-light hover:bg-primary/10 gap-1.5 font-semibold rounded-lg"
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                            AI Magic Writer
                          </Button>
                        </div>
                        <Textarea
                          value={flowData.welcomeMessage}
                          onChange={(e) => onUpdateData({ welcomeMessage: e.target.value })}
                          placeholder="With hearts full of love and joy, we warmly invite you..."
                          className="min-h-[90px] bg-background/80 placeholder:text-slate-400 text-foreground resize-none"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold tracking-wider text-slate-200 uppercase">Host Contact Phone Number (Optional)</label>
                        <Input
                          value={flowData.contactPhone || ""}
                          onChange={(e) => onUpdateData({ contactPhone: e.target.value })}
                          placeholder="e.g. +92 300 1234567"
                          className="h-11 bg-background/80 placeholder:text-slate-400 text-foreground"
                        />
                      </div>
                    </div>
                  </section>

                  {/* Royal Plan Extras (Dress Code, Transportation, Accommodation) */}
                  {flowData.selectedPlan === "royal" ? (
                    <section className="p-6 rounded-3xl bg-card/70 border border-border/60 shadow-xl backdrop-blur-xl space-y-4">
                      <div className="flex items-center gap-2.5 mb-1">
                        <div className="w-8 h-8 rounded-xl bg-primary/15 border border-gold/30 flex items-center justify-center text-primary">
                          <Shirt className="w-4 h-4" />
                        </div>
                        <h2 className="font-display text-lg font-bold text-foreground">Royal Plan Extras</h2>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <Input
                          value={flowData.dressCodeWomen || ""}
                          onChange={(e) => onUpdateData({ dressCodeWomen: e.target.value })}
                          placeholder="Women's Dress Code (e.g. Formal)"
                          className="h-10 bg-background/80 placeholder:text-slate-400 text-foreground"
                        />
                        <Input
                          value={flowData.dressCodeMen || ""}
                          onChange={(e) => onUpdateData({ dressCodeMen: e.target.value })}
                          placeholder="Men's Dress Code (e.g. Black Tie)"
                          className="h-10 bg-background/80 placeholder:text-slate-400 text-foreground"
                        />
                      </div>
                      <Textarea
                        value={flowData.transportation || ""}
                        onChange={(e) => onUpdateData({ transportation: e.target.value })}
                        placeholder="Transportation notes (e.g. Valet available)"
                        className="min-h-[60px] bg-background/80 placeholder:text-slate-400 text-foreground resize-none"
                      />
                      <Textarea
                        value={flowData.accommodation || ""}
                        onChange={(e) => onUpdateData({ accommodation: e.target.value })}
                        placeholder="Accommodation notes (e.g. Hotel rates)"
                        className="min-h-[60px] bg-background/80 placeholder:text-slate-400 text-foreground resize-none"
                      />
                    </section>
                  ) : (
                    /* Locked Royal Extras Banner */
                    <div className="p-6 rounded-3xl bg-card/40 border border-gold/30 backdrop-blur-md relative overflow-hidden space-y-4">
                      <div className="flex items-center justify-between gap-4 border-b border-border/40 pb-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-primary/15 border border-gold/30 flex items-center justify-center text-primary">
                            <Crown className="w-4 h-4" />
                          </div>
                          <h2 className="font-display text-base font-bold text-foreground">Dress Code, Transport &amp; Hotel Info</h2>
                        </div>
                        <Badge className="bg-primary/20 text-primary border-gold/30 text-[10px] font-bold">👑 Royal Plan</Badge>
                      </div>

                      <div className="space-y-3 opacity-50 pointer-events-none filter blur-[1px]">
                        <div className="grid grid-cols-2 gap-3">
                          <Input placeholder="Women's Dress Code" disabled className="h-10 bg-muted/40" />
                          <Input placeholder="Men's Dress Code" disabled className="h-10 bg-muted/40" />
                        </div>
                        <Textarea placeholder="Valet Parking & Transportation Details" disabled className="h-12 bg-muted/40" />
                      </div>

                      <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 bg-gradient-to-r from-gold/10 via-amber-500/10 to-transparent p-4 rounded-2xl border border-gold/30">
                        <p className="text-xs text-slate-300 font-medium">
                          Upgrade to the <strong className="text-primary">Royal Plan</strong> to include dress code guidelines, valet transport, and accommodation details.
                        </p>
                        <Button
                          size="sm"
                          onClick={() => {
                            onUpdateData({ selectedPlan: 'royal' });
                            toast.success("Switched to Royal Plan! Feature unlocked.");
                          }}
                          className="bg-primary hover:bg-primary-light text-slate-950 font-black text-xs gap-1.5 shrink-0 shadow-md px-4"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-slate-950 stroke-[2.5]" /> Upgrade to Royal
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Digital Shagun Registry */}
                  {flowData.selectedPlan === "royal" ? (
                    <section className="p-6 rounded-3xl bg-card/70 border border-border/60 shadow-xl backdrop-blur-xl space-y-4">
                      <div className="flex items-center gap-2.5 mb-1">
                        <div className="w-8 h-8 rounded-xl bg-primary/15 border border-gold/30 flex items-center justify-center text-primary">
                          <Gift className="w-4 h-4" />
                        </div>
                        <h2 className="font-display text-lg font-bold text-foreground">
                          {isBirthday
                            ? "Birthday Gift & Registry Details"
                            : isSchool
                            ? "Endowment & Contribution Details"
                            : isMeeting
                            ? "Organization / Honorarium Details"
                            : "Digital Shagun Registry"}
                        </h2>
                      </div>
                      <p className="text-xs text-slate-300 font-medium mb-4">
                        {isBirthday
                          ? "Add optional gift registry or digital cash gift details for guests."
                          : isSchool
                          ? "Add optional scholarship fund, alumni endowment, or contribution details."
                          : isMeeting
                          ? "Add optional organization bank details or conference contribution notes."
                          : "Add your bank and mobile wallet details so guests can send shagun digitally."}
                      </p>

                      {(() => {
                        const isShagunVisible = flowData.hideDigitalShagun !== true;
                        return (
                          <button
                            type="button"
                            role="switch"
                            aria-checked={isShagunVisible}
                            className="w-full flex items-center justify-between rounded-2xl border border-border/60 p-4 cursor-pointer hover:bg-muted/30 transition-colors text-left mb-4"
                            onClick={() => {
                              const newHide = isShagunVisible ? true : false;
                              onUpdateData({ hideDigitalShagun: newHide });
                              autoSaveDraft(currentStep, false, { hideDigitalShagun: newHide });
                            }}
                          >
                            <div className="flex-1 pr-4">
                              <p className="font-bold text-sm text-foreground flex items-center gap-2">
                                <span>Show on Invitation</span>
                                <Badge className={`text-[10px] px-2 py-0.5 border ${
                                  isShagunVisible 
                                    ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30" 
                                    : "bg-muted text-slate-400 border-border"
                                }`}>
                                  {isShagunVisible ? "Visible" : "Hidden"}
                                </Badge>
                              </p>
                              <p className="text-xs text-slate-400 mt-0.5">
                                {isShagunVisible 
                                  ? "Account & digital payment details will be visible to guests" 
                                  : "These account details will be hidden from guests"}
                              </p>
                            </div>
                            <div className={`relative w-12 h-6 rounded-full transition-colors shrink-0 ${isShagunVisible ? 'bg-primary' : 'bg-muted'}`}>
                              <div className={`absolute top-1 w-4 h-4 rounded-full ${isShagunVisible ? 'bg-slate-950' : 'bg-slate-300'} transition-transform ${isShagunVisible ? 'translate-x-7' : 'translate-x-1'}`} />
                            </div>
                          </button>
                        );
                      })()}

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <Input
                          value={(() => { const m = (flowData.gifts||'').match(/(?:Bank\s*(?:Name)?|Bank)\s*[:\-\s]+\s*([a-zA-Z\s.]+?)(?:,|\n|Account|Title|IBAN|$)/i); return m?.[1]?.trim()||''; })()}
                          onChange={(e) => updateGiftsField('bankName', e.target.value)}
                          placeholder={isBirthday ? "Bank / Wallet (e.g. Meezan / SadaPay)" : isSchool ? "Bank Name (e.g. HBL Endowment)" : "Bank Name (e.g. Meezan)"}
                          className="h-10 bg-background/80 placeholder:text-slate-400 text-foreground"
                        />
                        <Input
                          value={(() => { const m = (flowData.gifts||'').match(/(?:Account\s*Title|Acc\s*Title|Title)\s*[:\-\s]+\s*([a-zA-Z\s.()]+?)(?:,|Account|IBAN|Raast|$)/i); return m?.[1]?.trim()||''; })()}
                          onChange={(e) => updateGiftsField('accountTitle', e.target.value)}
                          placeholder="Account Title"
                          className="h-10 bg-background/80 placeholder:text-slate-400 text-foreground"
                        />
                        <Input
                          value={(() => { const m = (flowData.gifts||'').match(/(?:Account\s*(?:Number|No\.?)|Acc\s*(?:Number|No\.?))\s*[:\-\s]+\s*([0-9\-]+)/i); return m?.[1]?.trim()||''; })()}
                          onChange={(e) => updateGiftsField('accountNumber', e.target.value)}
                          placeholder="Account Number"
                          className="h-10 bg-background/80 font-mono placeholder:text-slate-400 text-foreground"
                        />
                        <Input
                          value={(() => { const m = (flowData.gifts||'').match(/IBAN\s*[:\-\s]+\s*([A-Z]{2}[0-9]{2}[A-Z0-9\s]{16,30})/i); return m?.[1]?.replace(/\s+/g,'').trim()||''; })()}
                          onChange={(e) => updateGiftsField('iban', e.target.value.toUpperCase().replace(/\s/g,''))}
                          placeholder="IBAN (e.g. PK45...)"
                          className="h-10 bg-background/80 font-mono placeholder:text-slate-400 text-foreground"
                        />
                        <Input
                          value={(() => { const m = (flowData.gifts||'').match(/(?:EasyPaisa|Easy\s*Paisa)\s*[:\-\s]+\s*([0-9+]+)/i); return m?.[1]?.trim()||''; })()}
                          onChange={(e) => updateGiftsField('easyPaisa', e.target.value)}
                          placeholder="EasyPaisa 03xxxxxxxxx"
                          className="h-10 bg-background/80 font-mono placeholder:text-slate-400 text-foreground"
                        />
                        <Input
                          value={(() => { const m = (flowData.gifts||'').match(/(?:JazzCash|Jazz\s*Cash)\s*[:\-\s]+\s*([0-9+]+)/i); return m?.[1]?.trim()||''; })()}
                          onChange={(e) => updateGiftsField('jazzCash', e.target.value)}
                          placeholder="JazzCash 03xxxxxxxxx"
                          className="h-10 bg-background/80 font-mono placeholder:text-slate-400 text-foreground"
                        />
                      </div>
                    </section>
                  ) : (
                    /* Locked Digital Shagun Registry Banner */
                    <div className="p-6 rounded-3xl bg-card/40 border border-gold/30 backdrop-blur-md relative overflow-hidden space-y-4">
                      <div className="flex items-center justify-between gap-4 border-b border-border/40 pb-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-primary/15 border border-gold/30 flex items-center justify-center text-primary">
                            <Gift className="w-4 h-4" />
                          </div>
                          <h2 className="font-display text-base font-bold text-foreground">Digital Shagun Registry</h2>
                        </div>
                        <Badge className="bg-primary/20 text-primary border-gold/30 text-[10px] font-bold">👑 Royal Plan</Badge>
                      </div>

                      <div className="space-y-3 opacity-50 pointer-events-none filter blur-[1px]">
                        <div className="grid grid-cols-2 gap-3">
                          <Input placeholder="Meezan Bank" disabled className="h-10 bg-muted/40" />
                          <Input placeholder="Account Title" disabled className="h-10 bg-muted/40" />
                          <Input placeholder="EasyPaisa 03xxxxxxxxx" disabled className="h-10 bg-muted/40" />
                          <Input placeholder="JazzCash 03xxxxxxxxx" disabled className="h-10 bg-muted/40" />
                        </div>
                      </div>

                      <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 bg-gradient-to-r from-gold/10 via-amber-500/10 to-transparent p-4 rounded-2xl border border-gold/30">
                        <p className="text-xs text-slate-300 font-medium">
                          Upgrade to the <strong className="text-primary">Royal Plan</strong> to allow guests to transfer Digital Shagun via Bank, EasyPaisa, JazzCash &amp; Raast.
                        </p>
                        <Button
                          size="sm"
                          onClick={() => {
                            onUpdateData({ selectedPlan: 'royal' });
                            toast.success("Switched to Royal Plan! Feature unlocked.");
                          }}
                          className="bg-primary hover:bg-primary-light text-slate-950 font-black text-xs gap-1.5 shrink-0 shadow-md px-4"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-slate-950 stroke-[2.5]" /> Upgrade to Royal
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Live Crowd Photo Wall (Royal Feature - Guest Uploads & Live Stream) */}
                  {flowData.selectedPlan === "royal" ? (
                    <section className="p-6 rounded-3xl bg-card/70 border border-border/60 shadow-xl backdrop-blur-xl space-y-4">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-primary/15 border border-gold/30 flex items-center justify-center text-primary">
                            <Camera className="w-4 h-4" />
                          </div>
                          <div>
                            <h2 className="font-display text-lg font-bold text-foreground">
                              Live Crowd Photo Wall
                            </h2>
                            <p className="text-[11px] text-slate-300">
                              Guest selfies &amp; live event photo uploads
                            </p>
                          </div>
                        </div>

                        <Badge className={`text-[10px] px-2.5 py-0.5 border ${
                          flowData.showCrowdPhotoWall !== false 
                            ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30" 
                            : "bg-muted text-slate-400 border-border"
                        }`}>
                          {flowData.showCrowdPhotoWall !== false ? "Enabled" : "Disabled"}
                        </Badge>
                      </div>

                      <p className="text-xs text-slate-300 font-medium leading-relaxed">
                        Allow guests to take live photos with their phones and upload them directly onto your invitation’s interactive photo wall. You can turn this off if you prefer a strictly private event without guest photo sharing.
                      </p>

                      <button
                        type="button"
                        role="switch"
                        aria-checked={flowData.showCrowdPhotoWall !== false}
                        className="w-full flex items-center justify-between rounded-2xl border border-border/60 p-4 cursor-pointer hover:bg-muted/30 transition-colors text-left"
                        onClick={() => {
                          const newShow = flowData.showCrowdPhotoWall === false ? true : false;
                          onUpdateData({ showCrowdPhotoWall: newShow });
                          autoSaveDraft(currentStep, false, { showCrowdPhotoWall: newShow });
                        }}
                      >
                        <div className="flex-1 pr-4">
                          <p className="text-sm font-semibold text-foreground">
                            {flowData.showCrowdPhotoWall !== false ? "Live Photo Wall Active" : "Live Photo Wall Disabled"}
                          </p>
                          <p className="text-xs text-slate-400 mt-0.5">
                            {flowData.showCrowdPhotoWall !== false 
                              ? "Guests can upload photos and view the crowd gallery" 
                              : "Photo wall and upload buttons are hidden from guests"}
                          </p>
                        </div>
                        <div className={`relative w-12 h-6 rounded-full transition-colors ${flowData.showCrowdPhotoWall !== false ? "bg-primary" : "bg-muted"}`}>
                          <div className={`absolute top-1 w-4 h-4 rounded-full ${flowData.showCrowdPhotoWall !== false ? "bg-slate-950" : "bg-slate-300"} transition-transform ${flowData.showCrowdPhotoWall !== false ? "translate-x-7" : "translate-x-1"}`} />
                        </div>
                      </button>
                    </section>
                  ) : (
                    /* Classic Teaser */
                    <div className="p-6 rounded-3xl bg-card/40 border border-border/60 shadow-lg backdrop-blur-sm space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-muted/60 border border-border flex items-center justify-center text-muted-foreground">
                            <Camera className="w-4 h-4" />
                          </div>
                          <div>
                            <h2 className="font-display text-lg font-bold text-slate-400 flex items-center gap-2">
                              Live Crowd Photo Wall
                              <Badge className="bg-primary/20 text-primary border-primary/30 text-[10px]">Royal</Badge>
                            </h2>
                            <p className="text-[11px] text-slate-300">
                              Guest selfies &amp; live event photo uploads
                            </p>
                          </div>
                        </div>
                        <Lock className="w-4 h-4 text-muted-foreground" />
                      </div>

                      <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 bg-gradient-to-r from-gold/10 via-amber-500/10 to-transparent p-4 rounded-2xl border border-gold/30">
                        <p className="text-xs text-slate-300 font-medium">
                          Upgrade to the <strong className="text-primary">Royal Plan</strong> to enable the Live Crowd Photo Wall so guests can capture &amp; share live memories during your event.
                        </p>
                        <Button
                          size="sm"
                          onClick={() => {
                            onUpdateData({ selectedPlan: 'royal' });
                            toast.success("Switched to Royal Plan! Feature unlocked.");
                          }}
                          className="bg-primary hover:bg-primary-light text-slate-950 font-black text-xs gap-1.5 shrink-0 shadow-md px-4"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-slate-950 stroke-[2.5]" /> Upgrade to Royal
                        </Button>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-4 pb-4">
                    <Button variant="outline" onClick={() => goToStep(3)}>
                      <ArrowLeft className="w-4 h-4 mr-1" /> Previous
                    </Button>

                    <Button
                      onClick={handleSubmit}
                      disabled={isSaving || isUploading}
                      size="lg"
                      className="bg-primary hover:bg-primary-light text-slate-950 font-black text-base gap-2 shadow-xl px-8"
                    >
                      {isSaving ? (
                        <><Loader2 className="w-5 h-5 animate-spin text-slate-950" /> Saving Details...</>
                      ) : flowData.paymentDone ? (
                        <>Save Changes <Check className="w-5 h-5 text-slate-950 stroke-[2.5]" /></>
                      ) : (
                        <>Continue to Payment <ArrowRight className="w-5 h-5 text-slate-950 stroke-[2.5]" /></>
                      )}
                    </Button>
                  </div>
                </m.div>
              )}

            </div>

            {/* Right Column: Live Mobile Mockup Preview */}
            <div className="hidden lg:block lg:col-span-5 sticky top-24">
              <div className="p-6 rounded-3xl bg-card/70 border border-border/60 backdrop-blur-xl shadow-2xl flex flex-col items-center">
                <div className="flex items-center justify-between w-full mb-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" /> Live Preview
                  </span>
                  <Badge className="bg-emerald/20 text-foreground border-0 text-[10px]">Real-Time Sync</Badge>
                </div>

                {/* Smartphone Container */}
                <div className="relative w-[320px] h-[640px] rounded-[38px] border-[5px] border-gold/40 shadow-2xl bg-background overflow-hidden flex flex-col items-center justify-between p-4 text-center">
                  {/* Camera Notch */}
                  <div className="absolute top-2 w-24 h-4 bg-foreground/15 rounded-full z-20" />
                  
                  {/* Mini Invitation Preview Content */}
                  <div className="w-full mt-6 space-y-3.5 overflow-y-auto max-h-[550px] pr-1.5 scrollbar-thin scrollbar-thumb-gold/30">
                    
                    {/* Bismillah Calligraphy Header (Weddings only) */}
                    {flowData.showBismillah && isWedding && (
                      <div className="py-1">
                        <p className="font-arabic text-sm text-primary leading-loose" dir="rtl">بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ</p>
                      </div>
                    )}

                    {/* Category-Specific Badge (Non-weddings) */}
                    {!isWedding && (
                      <div className="py-1">
                        <span className="inline-block px-3 py-1 rounded-full bg-primary/10 border border-primary/25 text-[9px] font-bold tracking-widest text-primary uppercase">
                          {isSchool ? "Academic Convocation" : isBirthday ? "Birthday Celebration" : "Executive Summit"}
                        </span>
                      </div>
                    )}

                    {/* Host Families / Organizers */}
                    {(flowData.primaryHostFamily || flowData.secondaryHostFamily) && (
                      <p className="text-[9px] text-slate-300 italic leading-tight">
                        {isWedding ? "Together with their families:" : isSchool ? "Presented by faculty & committee:" : isBirthday ? "Hosted with love by:" : "Organized & hosted by:"} <br />
                        <strong className="text-foreground font-semibold">
                          {flowData.primaryHostFamily} {flowData.secondaryHostFamily && `& ${flowData.secondaryHostFamily}`}
                        </strong>
                      </p>
                    )}
                    
                    <p className="text-[8px] tracking-[0.25em] uppercase text-amber-300 font-bold">
                      {isSchool ? "Cordially invites you to the" : isBirthday ? "Invites you to celebrate" : isMeeting ? "Requests the honor of your presence at" : "We invite you to celebrate"}
                    </p>
                    
                    {/* Names / Titles */}
                    <h3 className="font-display text-2xl font-extrabold text-foreground leading-tight">
                      {flowData.partner1Name || (isSchool ? "Oxford Academy" : isBirthday ? "Zara Khan" : isMeeting ? "TechCorp Global" : "Partner 1")}{" "}
                      {isWedding ? (
                        <>
                          <span className="text-primary font-serif italic">&amp;</span>{" "}
                          {flowData.partner2Name || "Partner 2"}
                        </>
                      ) : flowData.partner2Name ? (
                        <span className="block text-sm font-semibold text-slate-200 mt-0.5">{flowData.partner2Name}</span>
                      ) : (
                        <span className="block text-sm font-semibold text-slate-200 mt-0.5">
                          {isSchool ? "Class of 2027 Commencement" : isBirthday ? "Turns 21!" : "Annual Leadership Summit"}
                        </span>
                      )}
                    </h3>

                    {/* Custom Slug Badge */}
                    {flowData.slug && (
                      <span className="inline-block px-2.5 py-0.5 rounded-full bg-slate-900 border border-gold/40 text-amber-200 text-[8px] font-mono font-semibold">
                        smartinvites.com.pk/inv/{flowData.slug}
                      </span>
                    )}

                    {/* Hero Image */}
                    {flowData.heroImage && (
                      <div className="relative w-full h-36 rounded-2xl overflow-hidden my-1.5 border border-gold/30 shadow-md">
                        <Image src={flowData.heroImage} alt="Hero" fill className="object-cover" />
                      </div>
                    )}

                    {/* Quranic / Custom Verse */}
                    {flowData.showQuranVerse && isWedding && (
                      <div className="p-2.5 rounded-2xl bg-primary/10 border border-primary/20 text-[9px] space-y-1 text-center">
                        {flowData.customVerseText ? (
                          <>
                            <p className="text-xs text-primary leading-relaxed" dir="auto">{flowData.customVerseText.length > 80 ? flowData.customVerseText.slice(0, 80) + "..." : flowData.customVerseText}</p>
                            {flowData.customVerseSource && <p className="text-[8px] text-slate-300 italic">&mdash; {flowData.customVerseSource}</p>}
                          </>
                        ) : (
                          <p className="text-[8px] text-slate-300 italic">&ldquo;And He created for you mates that you may find tranquility in them... (Surah Al-Rum 30:21)&rdquo;</p>
                        )}
                      </div>
                    )}
                    {flowData.customVerseText && !isWedding && (
                      <div className="p-2.5 rounded-2xl bg-primary/10 border border-primary/20 text-[9px] space-y-1 text-center">
                        <p className="text-xs text-primary leading-relaxed" dir="auto">{flowData.customVerseText.length > 80 ? flowData.customVerseText.slice(0, 80) + "..." : flowData.customVerseText}</p>
                        {flowData.customVerseSource && <p className="text-[8px] text-slate-300 italic">&mdash; {flowData.customVerseSource}</p>}
                      </div>
                    )}

                    {/* Welcome Message */}
                    {flowData.welcomeMessage && (
                      <div className="p-3 rounded-2xl bg-muted/40 border border-border/50 text-[10px] text-slate-200 italic leading-relaxed text-left">
                        &ldquo;{flowData.welcomeMessage}&rdquo;
                      </div>
                    )}

                    {/* All Events List */}
                    <div className="space-y-2 text-left">
                      <p className="text-[9px] font-bold uppercase tracking-wider text-primary">Events Schedule ({flowData.events?.length || 1})</p>
                      {flowData.events?.map((ev, i) => (
                        <div key={i} className="p-2.5 rounded-2xl bg-card border border-border/60 text-[10px] flex items-center justify-between shadow-sm">
                          <div>
                            <p className="font-bold text-foreground">{ev.name || `Event ${i + 1}`}</p>
                            <p className="text-[9px] text-slate-300 font-medium">{ev.date || "Date TBA"} {ev.time && `at ${ev.time}`}</p>
                          </div>
                          <Badge className="bg-primary/15 text-primary border-gold/30 text-[8px]">Event {i + 1}</Badge>
                        </div>
                      ))}
                    </div>

                    {/* Main Venue & Address */}
                    <div className="p-3 rounded-2xl bg-card border border-border/60 text-[10px] text-left space-y-1 shadow-sm">
                      <div className="flex items-center gap-1.5 text-primary font-bold">
                        <MapPin className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{flowData.venue || "Venue Location Name"}</span>
                      </div>
                      {addressText && <p className="text-[9px] text-slate-300 leading-tight">{addressText}</p>}
                      {mapsUrl && (
                        <div className="pt-0.5 flex items-center gap-1 text-foreground text-[8px] font-semibold">
                          <Globe className="w-2.5 h-2.5" /> Google Maps Link Attached
                        </div>
                      )}
                    </div>

                    {/* Segregation & Nikah Notes */}
                    {flowData.isSegregated && (
                      <div className="p-2 rounded-xl bg-emerald/10 border border-primary/30 text-[9px] text-foreground font-medium">
                        ✨ Separate Ladies &amp; Gents Setup {flowData.venueDetailsSegregated && `(${flowData.venueDetailsSegregated})`}
                      </div>
                    )}

                    {flowData.showNikahRegistration && (
                      <div className="p-2 rounded-xl bg-primary/10 border border-primary/20 text-[9px] text-primary font-medium">
                        📜 Formal Nikah Registration Note
                      </div>
                    )}

                    {/* Royal Plan Dress Code & Accommodations */}
                    {flowData.selectedPlan === "royal" && (
                      <div className="p-3 rounded-2xl bg-card border border-border/60 text-[9px] text-left space-y-1 shadow-sm">
                        <p className="font-bold text-primary uppercase tracking-wider">Dress Code &amp; Info</p>
                        {flowData.dressCodeWomen && <p className="text-slate-300">👗 Women: {flowData.dressCodeWomen}</p>}
                        {flowData.dressCodeMen && <p className="text-slate-300">👔 Men: {flowData.dressCodeMen}</p>}
                        {flowData.transportation && <p className="text-slate-300">🚗 Transport: {flowData.transportation}</p>}
                        {flowData.accommodation && <p className="text-slate-300">🏨 Hotel: {flowData.accommodation}</p>}
                      </div>
                    )}

                    {/* Digital Shagun Details */}
                    {(flowData.gifts || "").trim() && (
                      <div className="p-3 rounded-2xl bg-card border border-gold/30 text-[9px] text-left space-y-1 shadow-sm">
                        <div className="flex items-center gap-1.5 text-primary font-bold">
                          <Gift className="w-3.5 h-3.5 shrink-0" />
                          <span>Digital Shagun Registry</span>
                        </div>
                        <p className="text-slate-300 leading-relaxed font-sans">{flowData.gifts}</p>
                      </div>
                    )}

                    {/* Host Contact Phone */}
                    {flowData.contactPhone && (
                      <p className="text-[9px] text-slate-300">📞 Contact Host: <strong className="text-foreground">{flowData.contactPhone}</strong></p>
                    )}

                    {/* Music Player Bar */}
                    {flowData.backgroundMusic && flowData.backgroundMusic !== "no-music" && (
                      <div className="flex items-center justify-center gap-2 p-2.5 rounded-2xl bg-gradient-to-r from-gold/20 via-amber-500/10 to-gold/20 border border-gold/40 text-primary text-[10px] font-bold shadow-md">
                        <Music className="w-3.5 h-3.5 animate-pulse" />
                        <span className="truncate">Music: {flowData.backgroundMusic}</span>
                      </div>
                    )}
                  </div>

                  <div className="w-full pt-2 border-t border-border/40 text-[9px] text-slate-300">
                    <span>Smart Invites Digital Invitation</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </m.div>
              {/* Mobile Floating Preview Trigger */}
        <div className="lg:hidden fixed bottom-[max(1.5rem,env(safe-area-inset-bottom))] inset-x-0 z-40 flex justify-center pointer-events-none px-4">
          <button
            type="button"
            onClick={() => setIsMobilePreviewOpen(true)}
            className="pointer-events-auto h-11 px-5 rounded-full bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 text-white font-bold text-xs shadow-2xl shadow-amber-500/40 border border-amber-300/40 flex items-center gap-2 hover:scale-105 active:scale-95 transition-all cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Preview Card</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          </button>
        </div>

        {/* Mobile Live Preview Modal Sheet */}
        <AnimatePresence>
          {isMobilePreviewOpen && (
            <m.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4"
            >
              <m.div
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="w-full max-w-sm max-h-[92vh] bg-card border-t sm:border border-border/80 rounded-t-3xl sm:rounded-3xl p-4 flex flex-col items-center shadow-2xl overflow-hidden"
              >
                <div className="w-full flex items-center justify-between pb-3 border-b border-border/40">
                  <span className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" /> Live Preview
                  </span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setIsMobilePreviewOpen(false)}
                    className="h-8 w-8 p-0 rounded-full hover:bg-white/10 text-slate-300 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                {/* Smartphone Container */}
                <div className="relative w-full max-w-[300px] h-[540px] mt-3 rounded-[32px] border-[4px] border-gold/40 shadow-2xl bg-background overflow-hidden flex flex-col items-center justify-between p-3 text-center">
                  <div className="absolute top-2 w-20 h-3.5 bg-foreground/15 rounded-full z-20" />
                  
                  <div className="w-full mt-5 space-y-3 overflow-y-auto max-h-[460px] pr-1 scrollbar-thin scrollbar-thumb-gold/30">
                    {/* Bismillah (Weddings only) */}
                    {flowData.showBismillah && isWedding && (
                      <div className="py-1">
                        <p className="font-arabic text-sm text-primary leading-loose" dir="rtl">بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ</p>
                      </div>
                    )}

                    {/* Category-Specific Badge (Non-weddings) */}
                    {!isWedding && (
                      <div className="py-1">
                        <span className="inline-block px-3 py-0.5 rounded-full bg-primary/10 border border-primary/25 text-[8px] font-bold tracking-widest text-primary uppercase">
                          {isSchool ? "Academic Convocation" : isBirthday ? "Birthday Celebration" : "Executive Summit"}
                        </span>
                      </div>
                    )}

                    {/* Host Families */}
                    {(flowData.primaryHostFamily || flowData.secondaryHostFamily) && (
                      <p className="text-[9px] text-slate-300 italic leading-tight">
                        {isWedding ? "Together with their families:" : isSchool ? "Presented by faculty & committee:" : isBirthday ? "Hosted with love by:" : "Organized & hosted by:"} <br />
                        <strong className="text-foreground font-semibold">
                          {flowData.primaryHostFamily} {flowData.secondaryHostFamily && `& ${flowData.secondaryHostFamily}`}
                        </strong>
                      </p>
                    )}

                    <p className="text-[8px] tracking-[0.25em] uppercase text-amber-300 font-bold">
                      {isSchool ? "Cordially invites you to the" : isBirthday ? "Invites you to celebrate" : isMeeting ? "Requests the honor of your presence at" : "We invite you to celebrate"}
                    </p>

                    {/* Names / Titles */}
                    <h3 className="font-display text-xl font-extrabold text-foreground leading-tight">
                      {flowData.partner1Name || (isSchool ? "Oxford Academy" : isBirthday ? "Zara Khan" : isMeeting ? "TechCorp Global" : "Partner 1")}{" "}
                      {isWedding ? (
                        <>
                          <span className="text-primary font-serif italic">&amp;</span>{" "}
                          {flowData.partner2Name || "Partner 2"}
                        </>
                      ) : flowData.partner2Name ? (
                        <span className="block text-xs font-semibold text-slate-200 mt-0.5">{flowData.partner2Name}</span>
                      ) : (
                        <span className="block text-xs font-semibold text-slate-200 mt-0.5">
                          {isSchool ? "Class of 2027 Commencement" : isBirthday ? "Turns 21!" : "Annual Leadership Summit"}
                        </span>
                      )}
                    </h3>

                    {/* Hero Image */}
                    {flowData.heroImage && (
                      <div className="relative w-full h-32 rounded-2xl overflow-hidden my-1 border border-gold/30 shadow-md">
                        <Image src={flowData.heroImage} alt="Hero" fill className="object-cover" />
                      </div>
                    )}

                    {/* Welcome Message */}
                    {flowData.welcomeMessage && (
                      <div className="p-2.5 rounded-2xl bg-muted/40 border border-border/50 text-[9.5px] text-slate-200 italic leading-relaxed text-left">
                        &ldquo;{flowData.welcomeMessage}&rdquo;
                      </div>
                    )}

                    {/* All Events List */}
                    <div className="space-y-1.5 text-left">
                      <p className="text-[8.5px] font-bold uppercase tracking-wider text-primary">Events Schedule ({flowData.events?.length || 1})</p>
                      {flowData.events?.map((ev, i) => (
                        <div key={i} className="p-2 rounded-xl bg-card border border-border/60 text-[9.5px] flex items-center justify-between shadow-sm">
                          <div>
                            <p className="font-bold text-foreground">{ev.name || `Event ${i + 1}`}</p>
                            <p className="text-[8.5px] text-slate-300 font-medium">{ev.date || "Date TBA"} {ev.time && `at ${ev.time}`}</p>
                          </div>
                          <Badge className="bg-primary/15 text-primary border-gold/30 text-[7.5px]">Event {i + 1}</Badge>
                        </div>
                      ))}
                    </div>

                    {/* Main Venue */}
                    <div className="p-2.5 rounded-2xl bg-card border border-border/60 text-[9.5px] text-left space-y-0.5 shadow-sm">
                      <div className="flex items-center gap-1.5 text-primary font-bold">
                        <MapPin className="w-3 h-3 shrink-0" />
                        <span className="truncate">{flowData.venue || "Venue Location Name"}</span>
                      </div>
                      {addressText && <p className="text-[8.5px] text-slate-300 leading-tight">{addressText}</p>}
                    </div>
                  </div>

                  <div className="w-full pt-1.5 border-t border-border/40 text-[8.5px] text-slate-300">
                    <span>Smart Invites Live Mobile Preview</span>
                  </div>
                </div>
              </m.div>
            </m.div>
          )}
        </AnimatePresence>

        <AICopywriterModal
          isOpen={isAICopywriterOpen}
          onClose={() => setIsAICopywriterOpen(false)}
          onApply={(text) => onUpdateData({ welcomeMessage: text })}
          category={flowData.category || category || "wedding"}
          context={{
            partner1Name: flowData.partner1Name,
            partner2Name: flowData.partner2Name,
            venue: flowData.venue,
          }}
        />

        {/* Royal Upgrade Modal for Voice Blessing */}
        <Dialog open={showVoiceRoyalModal} onOpenChange={setShowVoiceRoyalModal}>
          <DialogContent className="sm:max-w-[480px] p-6 bg-card/95 border-gold/40 backdrop-blur-xl shadow-2xl text-foreground">
            <DialogHeader className="text-left space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <Crown className="w-4 h-4" />
                </span>
                <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30 text-[10px] font-bold">
                  👑 Royal Exclusive Experience
                </Badge>
              </div>
              <DialogTitle className="text-xl font-display font-bold text-foreground">
                Unlock Personal Voice Greeting
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-300">
                Give your guests goosebumps! A personal voice note from the couple or parents plays automatically or upon tap when guests open your invitation.
              </DialogDescription>
            </DialogHeader>

            {voiceAudioPreviewUrl && (
              <div className="p-3.5 rounded-2xl bg-background/80 border border-gold/30 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary shrink-0">
                    <Volume2 className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-foreground">Your Recorded Voice</p>
                    <p className="text-[10px] text-slate-400">{voiceDuration ? `${voiceDuration} seconds duration` : "Ready to attach"}</p>
                  </div>
                </div>
                <audio src={voiceAudioPreviewUrl} controls className="h-7 max-w-[170px]" />
              </div>
            )}

            <div className="space-y-2 py-1">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-300">Everything Included in Royal Plan:</p>
              <div className="grid grid-cols-1 gap-2 text-xs text-slate-200">
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-primary shrink-0" />
                  <span><strong>Personal Voice Greeting:</strong> 60s host blessing for all guests</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-primary shrink-0" />
                  <span><strong>Custom MP3 Song Uploads:</strong> Pick your exact favorite song</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-primary shrink-0" />
                  <span><strong>Cinematic Video Reveal:</strong> Envelope animation + 4K video intro</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-primary shrink-0" />
                  <span><strong>Guest Pass &amp; QR Scanner:</strong> WhatsApp RSVP pass &amp; check-in</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <Button
                onClick={confirmRoyalVoiceUpgrade}
                disabled={isUploadingVoice}
                className="w-full h-11 bg-gradient-to-r from-amber-500 via-primary to-amber-600 hover:opacity-95 text-slate-950 font-black text-xs gap-2 shadow-lg"
              >
                {isUploadingVoice ? (
                  <><Loader2 className="w-4 h-4 animate-spin text-slate-950" /> Attaching to Invitation...</>
                ) : (
                  <><Crown className="w-4 h-4 text-slate-950" /> Upgrade to Royal &amp; Attach Greeting (Rs. 5,799)</>
                )}
              </Button>
              <Button
                variant="ghost"
                onClick={() => setShowVoiceRoyalModal(false)}
                className="w-full text-xs text-slate-400 hover:text-white"
              >
                Keep Classic Plan (Rs. 3,499) for now
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}

/* ---------- Helper Components ---------- */
function StepDot({ done, current, label, stepNumber }: { done?: boolean; current?: boolean; label: string; stepNumber: number }) {
  return (
    <div className="flex items-center gap-1">
      <div
        className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center ${
          done ? "bg-primary text-slate-950 font-black" : current ? "bg-emerald text-white font-bold" : "bg-muted text-slate-300 font-semibold"
        }`}
      >
        {done ? <Check className="w-3 h-3 text-slate-950 stroke-[2.5]" /> : current ? String(stepNumber) : ""}
      </div>
      <span className={`text-xs hidden sm:inline ${current ? "text-foreground font-semibold" : "text-slate-300 font-medium"}`}>
        {label}
      </span>
    </div>
  );
}

function StepLine({ active }: { active?: boolean }) {
  return <div className={`w-4 sm:w-6 h-px ${active ? "bg-primary/30" : "bg-border"}`} />;
}
