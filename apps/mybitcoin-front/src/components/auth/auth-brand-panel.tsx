import waveBg from '@/assets/wave-haikei.svg'
import logoWhite from '@/assets/logo-text-horizontal-white.svg'

export function AuthBrandPanel() {
  return (
    <div className="relative flex h-[36vh] shrink-0 items-center justify-center overflow-hidden lg:h-auto">
      <img
        src={waveBg}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <img
        src={logoWhite}
        alt="mybitcoin"
        className="relative w-56 max-w-[60%]"
      />
    </div>
  )
}
