"use client";

export function Footer() {
  return (
    <footer className="border-t border-[#272727] py-8 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-[#71717a] text-sm">
            <span>Built by</span>
            <a
              href="https://x.com/nikhilbhima"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#c8ff00] hover:text-[#c8ff00]/80 transition-colors font-medium"
            >
              @nikhilbhima
            </a>
          </div>
          <a
              href="#nominate"
              className="text-[#71717a] text-sm hover:text-[#fafafa] transition-colors"
            >
              Nominate a spot
            </a>
        </div>
      </div>
    </footer>
  );
}
