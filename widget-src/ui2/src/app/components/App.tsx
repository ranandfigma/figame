import * as React from 'react';
import '../styles/ui.css';
import {ScriptPanel} from './ScriptPanel';
import {PlayPanel} from './PlayPanel';

declare function require(path: string): any;

const App = ({}) => {
    const [view, setView] = React.useState<'script' | 'play'>('script');
    const [gameLoopId, setGameLoopId] = React.useState<number>();

    React.useMemo(() => {
        let keyCodeDown: string | undefined;

        addEventListener('message', (event) => {
            if (event.data.pluginMessage.type === 'script') {
                setView('script');
                document.onkeydown = () => {};
                document.onkeyup = () => {};
                clearInterval(gameLoopId);
                setGameLoopId(undefined);
            }
            if (event.data.pluginMessage.type === 'stop') {
                setView('script');
                document.onkeydown = () => {};
                document.onkeyup = () => {};
                clearInterval(gameLoopId);
                setGameLoopId(undefined);
            }
            if (event.data.pluginMessage.type === 'play') {
                setView('play');
                document.onkeydown = (e: KeyboardEvent) => {
                    keyCodeDown = e.key;
                };

                document.onkeyup = () => {
                    keyCodeDown = undefined;
                };

                parent.postMessage({pluginMessage: {type: 'gameInit'}}, '*');

                // TODO: send all keyup/ keydown events to the main thread to handle.
                // TODO: Use the widget state to define and render controls.
                // TODO: move the camera to the center of the "camera frame" on start.

                const gameLoop = setInterval(() => {
                    const message = {pluginMessage: {type: 'tick'}};
                    parent.postMessage(message, '*');

                    if (keyCodeDown) {
                        parent.postMessage({pluginMessage: {type: 'keydown', keyCode: keyCodeDown}}, '*');
                    }
                }, 1000 / 30);
                setGameLoopId(gameLoop);
            }
        });
    }, []);

    return (
        <div>
            {view === 'script' && <ScriptPanel />}
            {view === 'play' && <PlayPanel />}
        </div>
    );
};

export default App;
