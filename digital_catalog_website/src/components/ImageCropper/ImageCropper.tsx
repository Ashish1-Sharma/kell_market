import { useEffect, useRef, useState } from "react";
import ReactCrop, { Crop, PixelCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { toast } from "react-toastify";

interface ImageCropperProps {
  initialImage?: string | null;
  onCropped: (base64: string) => void;
  resetKey?: string | number| null;
    aspect?: number;
  onPreviewChange?: (preview: string | null) => void;
   showUpload?: boolean; 
}

export default function ImageCropper({
  initialImage = null,
  onCropped,
  resetKey,
  showUpload = true,
}: ImageCropperProps) {
  const imgRef = useRef<HTMLImageElement | null>(null);

  const [preview, setPreview] = useState<string | null>(initialImage);
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop | null>(null);

  /* 🔄 RESET */
  useEffect(() => {
    console.log("🔄 RESET ImageCropper", resetKey);
    setPreview(initialImage);
    setCrop(undefined);
    setCompletedCrop(null);
    imgRef.current = null;
  }, [resetKey, initialImage]);

  /* 📂 FILE SELECT */
  const handleFileChange = (file: File) => {
    console.log("📂 FILE SELECTED", file);

    if (!file.type.startsWith("image/")) {
      toast.error("Invalid image file");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setPreview(reader.result as string);
      setCrop(undefined);
      setCompletedCrop(null);
    };
    reader.readAsDataURL(file);
  };

  /* ✂️ CROP */
  const handleCrop = () => {
    console.log("✂️ CROP CLICK", {
      imgRef: imgRef.current,
      completedCrop,
    });

    if (!imgRef.current || !completedCrop) {
      toast.error("Please select crop area");
      return;
    }

    const image = imgRef.current;
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d")!;
    
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    const cropX = completedCrop.x * scaleX;
    const cropY = completedCrop.y * scaleY;
    const cropW = completedCrop.width * scaleX;
    const cropH = completedCrop.height * scaleY;

    canvas.width = cropW;
    canvas.height = cropH;

    ctx.drawImage(
      image,
      cropX,
      cropY,
      cropW,
      cropH,
      0,
      0,
      cropW,
      cropH
    );

    const base64 = canvas
      .toDataURL("image/jpeg", 0.8)
      .split(",")[1];

    onCropped(base64);
    toast.success("Image cropped");
  };

  return (
    <div className="space-y-4">
      {preview && (
        <ReactCrop
          crop={crop}
          onChange={(_, percentCrop) => setCrop(percentCrop)}
          onComplete={(c) => setCompletedCrop(c)}
          keepSelection
        >
          <img
            src={preview}
            onLoad={(e) => {
              const img = e.currentTarget;
              imgRef.current = img; // ✅ FIX HERE

              const initialCrop: PixelCrop = {
                unit: "px",
                x: 0,
                y: 0,
                width: img.width,
                height: img.height,
              };

              console.log("🖼 IMAGE READY", initialCrop);

              setCrop(initialCrop);
              setCompletedCrop(initialCrop);
            }}
            style={{ maxHeight: 300 }}
          />
        </ReactCrop>
      )}

      {showUpload && <input
        type="file"
        accept="image/*"
        onChange={(e) =>
          e.target.files && handleFileChange(e.target.files[0])
        }
      />}

      <button
        onClick={handleCrop}
        className="w-full bg-blue-600 text-white py-2 rounded"
      >
        Crop Image
      </button>
    </div>
  );
}
