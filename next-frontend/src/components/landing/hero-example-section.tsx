import Image from "next/image";
import type { LandingDictionary } from "@app/lib/i18n/server";
import kotcatImg from "@/shared/images/kotcat.png";
import { ExampleCardContent } from "./example-card-content";
import styles from "./landing.module.css";

type Props = {
  dict: LandingDictionary;
};

export function HeroExampleSection({ dict }: Props) {
  return (
    <div className={styles.imagesBox}>
      <ExampleCardContent dict={dict} />
      <Image
        src={kotcatImg}
        alt=""
        priority
        className={styles.heroImage}
        sizes="(max-width: 900px) 100vw, 50vw"
        style={{
          position: "absolute",
          right: 0,
          bottom: 0,
          width: "auto",
          height: "min(320px, 60%)",
          maxWidth: "100%",
        }}
      />
    </div>
  );
}
