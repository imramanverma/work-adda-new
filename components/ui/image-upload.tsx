"use client";

import React, { useState, useRef } from "react";
import {
  UploadCloud,
  Camera,
  X,
  CheckCircle2,
  AlertCircle,
  Loader2,
  RefreshCw,
  Image as ImageIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface ImageUploadProps {
  value?: string | null;
  onChange: (value: string | null) => void;
  label: string;
  required?: boolean;
  aspectRatio?: "square" | "video" | "banner";
  description?: string;
  placeholderIcon?: "store" | "user";
  className?: string;
}

export function ImageUpload({
  value,
  onChange,
  label,
  required = false,
  aspectRatio = "square",
  description,
  placeholderIcon = "user",
  className = "",
}: ImageUploadProps) {
  const [compressing, setCompressing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file (JPG, PNG, WEBP).");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError("Image size exceeds 10MB limit. Please select a smaller photo.");
      return;
    }

    setError(null);
    setCompressing(true);

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        try {
          // Client-side Canvas compression to keep storage lightweight (~80-150KB)
          const canvas = document.createElement("canvas");
          const maxDim = 900;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > maxDim) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            }
          } else {
            if (height > maxDim) {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext("2d");
          if (!ctx) {
            onChange(e.target?.result as string);
            setCompressing(false);
            return;
          }

          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL("image/jpeg", 0.82);
          onChange(compressedDataUrl);
        } catch {
          onChange(e.target?.result as string);
        } finally {
          setCompressing(false);
        }
      };
      img.onerror = () => {
        setError("Failed to load image. Please try another photo.");
        setCompressing(false);
      };
      img.src = e.target?.result as string;
    };
    reader.onerror = () => {
      setError("Failed to read file.");
      setCompressing(false);
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const aspectRatioClasses = {
    square: "aspect-square max-w-[200px]",
    video: "aspect-video max-w-sm",
    banner: "aspect-[16/9] max-w-md",
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center justify-between">
        <label className="block text-xs font-bold text-slate-800">
          {label}
          {required ? (
            <span className="text-red-500 ml-1 font-extrabold">* (Compulsory)</span>
          ) : (
            <span className="text-slate-400 font-normal ml-1">(Optional)</span>
          )}
        </label>
        {value && (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
            <CheckCircle2 className="w-3.5 h-3.5" /> Uploaded
          </span>
        )}
      </div>

      {description && <p className="text-[11px] text-slate-500 -mt-1 leading-relaxed">{description}</p>}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/jpg"
        className="hidden"
        onChange={handleFileChange}
      />

      {value ? (
        // Preview State
        <div className="relative group w-fit">
          <div
            className={`rounded-2xl overflow-hidden border-2 border-slate-200 bg-slate-100 shadow-xs relative ${
              aspectRatio === "square" ? "w-36 h-36" : "w-full max-w-sm aspect-video"
            }`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={value}
              alt={label}
              className="w-full h-full object-cover"
            />
            {compressing && (
              <div className="absolute inset-0 bg-slate-900/60 flex items-center justify-center text-white text-xs gap-2">
                <Loader2 className="w-4 h-4 animate-spin" /> Compressing...
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 mt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              className="text-xs h-7 px-2.5"
            >
              <RefreshCw className="w-3 h-3 mr-1" /> Change
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                onChange(null);
                if (fileInputRef.current) fileInputRef.current.value = "";
              }}
              className="text-xs h-7 px-2.5 text-red-600 hover:bg-red-50 hover:border-red-200"
            >
              <X className="w-3 h-3 mr-1" /> Remove
            </Button>
          </div>
        </div>
      ) : (
        // Upload Dropzone State
        <div
          onClick={() => fileInputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`border-2 border-dashed rounded-2xl p-5 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center gap-2 select-none ${
            isDragging
              ? "border-brand-500 bg-brand-50/60 scale-[1.01]"
              : required
              ? "border-amber-300 bg-amber-50/40 hover:bg-amber-50/70 hover:border-amber-400"
              : "border-slate-200 bg-slate-50/70 hover:bg-slate-100/70 hover:border-slate-300"
          }`}
        >
          {compressing ? (
            <div className="py-4 flex flex-col items-center gap-2 text-slate-500">
              <Loader2 className="w-6 h-6 animate-spin text-brand-600" />
              <span className="text-xs font-medium">Processing & compressing photo...</span>
            </div>
          ) : (
            <>
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                  required
                    ? "bg-amber-100 text-amber-700"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                {placeholderIcon === "store" ? (
                  <Camera className="w-6 h-6" />
                ) : (
                  <UploadCloud className="w-6 h-6" />
                )}
              </div>

              <div>
                <p className="text-xs font-bold text-slate-800">
                  Click or tap to upload {label.toLowerCase()}
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Drag & drop, or select from gallery / camera (JPG, PNG, WEBP)
                </p>
              </div>

              <span
                className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                  required
                    ? "bg-amber-100 text-amber-800 border border-amber-200"
                    : "bg-slate-100 text-slate-600 border border-slate-200"
                }`}
              >
                {required ? "Compulsory Upload *" : "Optional"}
              </span>
            </>
          )}
        </div>
      )}

      {error && (
        <p className="text-xs text-red-600 flex items-center gap-1 mt-1">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}
