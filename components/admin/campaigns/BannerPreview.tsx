interface BannerPreviewProps {
  heading: string
  body: string
  ctaText: string
  primaryColor: string
  secondaryColor: string
  logoUrl?: string
  bgUrl?: string
}

export function BannerPreview({
  heading,
  body,
  ctaText,
  primaryColor,
  secondaryColor,
  logoUrl,
  bgUrl
}: BannerPreviewProps) {
  return (
    <div className="border border-[#333] rounded-xl overflow-hidden">
      {/* Desktop Preview */}
      <div className="hidden md:block">
        <div
          className="relative p-8"
          style={{
            background: bgUrl 
              ? `url(${bgUrl}) center/cover`
              : `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`
          }}
        >
          {/* Overlay if background image */}
          {bgUrl && (
            <div 
              className="absolute inset-0 bg-black/40"
              style={{ backdropFilter: 'blur(2px)' }}
            />
          )}
          
          <div className="relative flex items-center gap-6">
            {/* Logo */}
            {logoUrl && (
              <img 
                src={logoUrl} 
                alt="Partner logo"
                className="w-24 h-24 rounded-xl object-cover bg-white/90 p-2"
              />
            )}
            
            {/* Content */}
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-white mb-2">
                {heading || 'Banner Heading'}
              </h3>
              <p className="text-white/90 mb-4">
                {body || 'Banner body text goes here...'}
              </p>
              <button
                className="px-6 py-3 bg-white text-black font-bold rounded-lg shadow-lg"
                style={{ color: primaryColor }}
              >
                {ctaText || 'Start Challenge'}
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile Preview */}
      <div className="md:hidden">
        <div
          className="relative p-6"
          style={{
            background: bgUrl 
              ? `url(${bgUrl}) center/cover`
              : `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`
          }}
        >
          {bgUrl && (
            <div className="absolute inset-0 bg-black/40" />
          )}
          
          <div className="relative text-center">
            {logoUrl && (
              <img 
                src={logoUrl} 
                alt="Partner logo"
                className="w-16 h-16 mx-auto mb-4 rounded-lg object-cover bg-white/90 p-1"
              />
            )}
            <h3 className="text-xl font-bold text-white mb-2">
              {heading || 'Banner Heading'}
            </h3>
            <p className="text-white/90 text-sm mb-4">
              {body || 'Banner body text...'}
            </p>
            <button
              className="px-6 py-2 bg-white text-black font-bold rounded-lg text-sm"
              style={{ color: primaryColor }}
            >
              {ctaText || 'Start'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

