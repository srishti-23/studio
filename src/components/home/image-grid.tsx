import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";

interface ImageItem {
  id: number;
  src: string;
  alt: string;
  hint: string;
}

interface ImageGridProps {
  images: ImageItem[];
}

export default function ImageGrid({ images }: ImageGridProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {images.map((image) => (
        <Card
          key={image.id}
          className="overflow-hidden border-0 bg-transparent shadow-none transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-2xl hover:shadow-primary/10"
        >
          <CardContent className="p-0">
            <Image
              src={image.src}
              alt={image.alt}
              width={600}
              height={800}
              className="aspect-[3/4] h-auto w-full object-cover"
              data-ai-hint={image.hint}
            />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
