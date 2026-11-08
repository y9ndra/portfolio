import Image from "next/image";

export default function Character() {
  const image = (src: string, className: string) => <Image src={`/assets/images/character/${src}`} alt="" fill sizes="140px" unoptimized className={className} />;
  return <div className="character-portrait"><div className="hero-avatar character-lab-avatar" role="img" aria-label="Illustrated character">
    {image("body.png", "character-body")}
    <div className="character-head">
      {image("head.png", "character-base")}
      {image("eyebrow.png", "character-eyebrow")}
      {image("mouth-normal.png", "character-mouth")}
      {image("pupil.png", "character-pupils")}
      {image("eyelid.png", "character-upper-lid")}
      {image("hair.png", "character-hair")}
    </div>
  </div></div>;
}
