import React from "react";
import range from "lodash.range";

import styles from "@/graphics/Flag/Flag.module.css";

/***
 * A slight modification of the pride flag animation
 * from https://www.joshwcomeau.com/animation/pride-flags/
 * ***/

const Flag = ({ numOfColumns = 6, staggeredDelay = 150 }) => {
  return (
    <div className={styles.flag}>
      {range(numOfColumns).map((columnIndex: number) => (
        <div
          key={columnIndex}
          className={styles.column}
          style={{
            animationDelay: columnIndex * staggeredDelay + "ms",
          }}
        />
      ))}
    </div>
  );
};

export default Flag;
