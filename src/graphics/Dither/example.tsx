import DitherImage from "./DitherImage";

export default function DitherExample() {
  return (
    <div className="space-y-8 p-8">
      <h1 className="text-2xl font-bold mb-6">
        GPU-Accelerated Dithering Examples
      </h1>

      {/* Basic usage */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Basic Dithering</h2>
        <DitherImage
          src="/your-image.jpg"
          alt="Dithered image example"
          width={400}
          height={300}
          ditherPattern="4x4"
          ditherIntensity={1.0}
        />
      </div>

      {/* With theme colors */}
      <div>
        <h2 className="text-lg font-semibold mb-4">With Theme Colors</h2>
        <DitherImage
          src="/your-image.jpg"
          alt="Theme-colored dithered image"
          width={400}
          height={300}
          ditherPattern="8x8"
          ditherIntensity={0.8}
          useThemeColors={true}
        />
      </div>

      {/* Different patterns */}
      <div>
        <h2 className="text-lg font-semibold mb-4">
          Different Dither Patterns
        </h2>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <h3 className="text-sm font-medium mb-2">2x2 Pattern</h3>
            <DitherImage
              src="/your-image.jpg"
              alt="2x2 dither pattern"
              width={200}
              height={150}
              ditherPattern="2x2"
              ditherIntensity={1.0}
            />
          </div>
          <div>
            <h3 className="text-sm font-medium mb-2">4x4 Pattern</h3>
            <DitherImage
              src="/your-image.jpg"
              alt="4x4 dither pattern"
              width={200}
              height={150}
              ditherPattern="4x4"
              ditherIntensity={1.0}
            />
          </div>
          <div>
            <h3 className="text-sm font-medium mb-2">8x8 Pattern</h3>
            <DitherImage
              src="/your-image.jpg"
              alt="8x8 dither pattern"
              width={200}
              height={150}
              ditherPattern="8x8"
              ditherIntensity={1.0}
            />
          </div>
        </div>
      </div>

      {/* Intensity variations */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Intensity Variations</h2>
        <div className="grid grid-cols-4 gap-4">
          {[0.2, 0.5, 0.8, 1.0].map((intensity) => (
            <div key={intensity}>
              <h3 className="text-sm font-medium mb-2">
                {Math.round(intensity * 100)}% Intensity
              </h3>
              <DitherImage
                src="/your-image.jpg"
                alt={`${intensity * 100}% dither intensity`}
                width={150}
                height={112}
                ditherPattern="4x4"
                ditherIntensity={intensity}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// import DitherImage from
//   '@/graphics/Dither/DitherImage';

//   // Basic usage
//   <DitherImage
//     src="/my-image.jpg"
//     alt="Dithered image"
//     width={400}
//     height={300}
//     ditherPattern="4x4"
//     ditherIntensity={1.0}
//   />

//   // With theme colors
//   <DitherImage
//     src="/my-image.jpg"
//     alt="Theme-colored dithered image"
//     width={400}
//     height={300}
//     useThemeColors={true}
//   />
