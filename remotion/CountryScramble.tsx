import { Composition } from "remotion";
import { VideoComponent } from "@/components/VideoComponent";

const CountryScramble = () => {
  return (
    <Composition
      id="CountryScramble"
      component={VideoComponent}
      durationInFrames={300}
      fps={30}
      width={1080}
      height={1920}
    />
  );
};

export default CountryScramble;
