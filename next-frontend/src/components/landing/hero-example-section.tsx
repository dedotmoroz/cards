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
    <div
        className={styles.imagesBox}
        style={{
            backgroundImage: `url(${kotcatImg.src})`,
        }}
    >
      <ExampleCardContent
          dict={dict}
      />
    </div>
  );
}
