
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, Download } from "lucide-react";
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
          className="group overflow-hidden break-inside-avoid rounded-xl shadow-lg transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-2xl hover:shadow-primary/20 relative"
        >
            <Image
              src={image.src}
              alt={image.alt}
              width={500}
              height={500} // This will be overridden by inline styles but is required by Next/Image
              className="h-auto w-full object-cover"
              data-ai-hint="library image"
            />
            <div className="absolute bottom-0 left-0 right-0 flex items-center justify-end gap-2 bg-gradient-to-t from-black/60 to-transparent p-2 opacity-0 transition-opacity group-hover:opacity-100">
                <Button variant="ghost" size="icon" className="text-white hover:bg-white/20 hover:text-white">
                    <Heart className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" className="text-white hover:bg-white/20 hover:text-white">
                    <Download className="h-5 w-5" />
                </Button>
            </div>
        </Card>
      ))}
    </div>
  );
}
