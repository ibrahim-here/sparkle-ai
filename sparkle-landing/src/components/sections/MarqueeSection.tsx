export const MarqueeSection = () => {
  return (
    <section className="w-full h-[25vh] overflow-hidden flex items-center" style={{ backgroundColor: '#B2FF00' }}>
      <div className="flex whitespace-nowrap animate-marquee">
        <span className="text-4xl md:text-5xl font-bold text-black mx-8">
          AI-Powered ✦ Personalized Learning ✦ Adaptive Content ✦ Smart Progress ✦
        </span>
        <span className="text-4xl md:text-5xl font-bold text-black mx-8">
          AI-Powered ✦ Personalized Learning ✦ Adaptive Content ✦ Smart Progress ✦
        </span>
        <span className="text-4xl md:text-5xl font-bold text-black mx-8">
          AI-Powered ✦ Personalized Learning ✦ Adaptive Content ✦ Smart Progress ✦
        </span>
      </div>
    </section>
  );
};
