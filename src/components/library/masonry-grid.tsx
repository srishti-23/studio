
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface ImageItem {
  id: number;
  src: string;
  alt: string;
}

interface MasonryGridProps {
  images: ImageItem[];
}

export default function MasonryGrid({ images }: MasonryGridProps) {
  return (
    <div
      className="columns-1 md:columns-2 lg:columns-3 gap-4 space-y-4 p-4"
    >
      {images.map((image) => (
        <Card
          key={image.id}
          className="overflow-hidden break-inside-avoid rounded-xl shadow-lg transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-2xl hover:shadow-primary/20"
        >
            <Image
              src={image.src}
              alt={image.alt}
              width={500}
              height={500} // This will be overridden by inline styles but is required by Next/Image
              className="h-auto w-full object-cover"
              data-ai-hint="library image"
            />
        </Card>
      ))}
    </div>
  );
}
