Below are the steps to get your widget running. You can also find instructions at:

https://www.figma.com/widget-docs/setup-guide/

This widget template uses Typescript and NPM, two standard tools in creating JavaScript applications.

First, download Node.js which comes with NPM. This will allow you to install TypeScript and other
libraries. You can find the download link here:

https://nodejs.org/en/download/

Next, install TypeScript, esbuild and the latest type definitions by running:

npm install

If you are familiar with JavaScript, TypeScript will look very familiar. In fact, valid JavaScript code
is already valid Typescript code.

TypeScript adds type annotations to variables. This allows code editors such as Visual Studio Code
to provide information about the Figma API while you are writing code, as well as help catch bugs
you previously didn't notice.

For more information, visit https://www.typescriptlang.org/

Using TypeScript requires a compiler to convert TypeScript (widget-src/code.tsx) into JavaScript (dist/code.js)
for the browser to run. We use esbuild to do this for us.

We recommend writing TypeScript code using Visual Studio code:

1. Download Visual Studio Code if you haven't already: https://code.visualstudio.com/.
2. Open this directory in Visual Studio Code.
3. Compile TypeScript to JavaScript: Run the "Terminal > Run Build Task..." menu item,
   then select "npm: watch". You will have to do this again every time
   you reopen Visual Studio Code.

That's it! Visual Studio Code will regenerate the JavaScript file every time you save.

## SVG generation utils

Run `npm run run-svg` to convert all the svg files in assets/ to code embeddable files in assets/svg with the same name. You can then import the files with `import down_arrow from "./assets/svg/down_arrow"; `

## Husky errors

Run `npx husky-init` (and revert any git related changes it makes). Then prettier will automatically run pre-commit.

## Build structure

Plugins are weird and have to be html/ typescript text to use `figma.showUI`
afaik. So the build process is a bit convoluted to allow us to modularly work
with individual embedded_uis as real HTML/ TS files, but still embed them into
the final code.ts. Most of the time you shouldn't have to think about this
since `build.mjs` (`npm run build`) takes care of this for you, but here is how it works in general:

- Compile all the index.ts files inside the `embedded_ui` folder to generate javascript
- Inject the javascript into raw script tags in the HTML file.
- Stringify the whole thing and place it in `embedded_ui/dist/{ui_name}/index.html.ts`.

## Sample scripts

The scripting logic is pretty rudimentary, but there are quite a few useful things that can be done with it. For example, to build pong, here is a good game-init script (to put in the custom javascript section)

```
(nodeId, context) => {
    // One of the drawbacks of the current scripting setup is lack of a cohesive dev story here (libraries, common files etc.).

    const world = context.world;
    function getRandomInt(min, max) {
      min = Math.ceil(min);
      max = Math.floor(max);
      return Math.floor(Math.random() * (max - min) + min); // The maximum is exclusive and the minimum is inclusive
    }
    const score = world.getNode('Scoreboard');
    const score2 = world.getNode('Scoreboard2');
    score.updateNodeState({
        key: 'text',
        value: 0,
    });
    score2.updateNodeState({
        key: 'text',
        value: 0,
    });
    const ball = world.getNode('Ball');
    ball.updateNodeState({
        key: 'velocityX',
        value: getRandomInt(50, 150),
    });
    ball.updateNodeState({
        key: 'velocityY',
        value: getRandomInt(50, 150),
    });
    const gameFrame = world.getNode('GameFrame');
    gameFrame.updateNodeState({
        key: 'focus',
        value: true,
    });
}

```

and a good collision script for the ball.

```

(nodeId, context) => {
    const otherNodeId = context.collisionContext?.otherNodeId;
    const otherNode = figma.getNodeById(otherNodeId);
    const gameNode = context.gameNode;
    const world = context.world;
    const score = world.getNode('Scoreboard');
    const score2 = world.getNode('Scoreboard2');

    switch (otherNode.name) {
        case 'Top':
        case 'Bottom':
            gameNode.updateNodeState({
                key: 'velocityY',
                value: -gameNode.nodeState.velocityY,
            });
            break;
        case 'P1_Paddle':
        case 'P2_Paddle':
            gameNode.updateNodeState({
                key: 'velocityX',
                value: -gameNode.nodeState.velocityX,
            });
            break;
        case 'Right':
            score.updateNodeState({
                key: 'text',
                value: (Number(score.nodeState.text) + 1),
            });
            gameNode.updateNodeState({
                key: 'velocityX',
                value: -gameNode.nodeState.velocityX,
            });
            break;
        case 'Left':
            score2.updateNodeState({
                key: 'text',
                value: (Number(score2.nodeState.text) + 1),
            });
            gameNode.updateNodeState({
                key: 'velocityX',
                value: -gameNode.nodeState.velocityX,
            });
            break;
    }
}
```

Note that frames are addressed by names which have to be unique, and error handling is pretty non-existent at the moment.

Here is another script that prevents paddles from going out of bounds of the walls.

```
(nodeId, context) => {
  const world = context.world;
  const node = world.getNodeById(nodeId);
  const nodeShape = node.nodeState.shape;
  const otherNodeId = context.collisionContext.otherNodeId;
  const otherNode = world.getNodeById(otherNodeId);
  const otherNodeShape = otherNode.nodeState.shape;
  console.log(otherNodeShape, nodeShape);
  if (otherNode.name === "Top") {
    node.updateNodeState({
      key: 'positionY',
      value: otherNodeShape.positionY + otherNodeShape.height,
    });
  } else if (otherNode.name === "Bottom") {
    node.updateNodeState({
      key: 'positionY',
      value: otherNodeShape.positionY - nodeShape.height,
    });
  }
}

```
