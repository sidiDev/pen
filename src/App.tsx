import LayoutContainer from "@/components/LayoutContainer";
import { Application, extend } from "@pixi/react";
import { Container, Graphics, Sprite, Text } from "pixi.js";

extend({
  Container,
  Graphics,
  Sprite,
  Text,
});

function App() {
  return (
    <LayoutContainer>
      <Application
        width={window.innerWidth + 10000}
        height={window.innerHeight + 10000}
        backgroundColor="#FFF"
      >
        <pixiText
          text="Hello World"
          style={{
            fill: "red",
          }}
        />
      </Application>
    </LayoutContainer>
  );
}

export default App;
